import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  status?: number;
  code?: string;
}

/**
 * Global Express Error Handler.
 * Intercepts database errors, bad requests, and generic exceptions.
 * Prevents leakage of database credentials, connection strings, or full stack traces.
 */
export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  console.error('API Error Intercepted:', err.stack || err);

  // Database Connection Issues
  const message = err.message || '';
  const isDatabaseError =
    message.includes('Failed to connect to server') ||
    message.includes('driver') ||
    message.includes('Bolt') ||
    err.code === 'ServiceUnavailable' ||
    err.name === 'Neo4jError';

  if (isDatabaseError) {
    res.status(503).json({
      error: 'DATABASE_UNAVAILABLE',
      message: 'Unable to connect to the graph database. Please try again later.',
    });
    return;
  }

  // Handle client errors
  const statusCode = err.status || 500;
  if (statusCode >= 400 && statusCode < 500) {
    res.status(statusCode).json({
      error: err.code || 'BAD_REQUEST',
      message: err.message,
    });
    return;
  }

  // Fallback server error
  res.status(500).json({
    error: 'SERVER_ERROR',
    message: 'An unexpected server error occurred.',
  });
}
