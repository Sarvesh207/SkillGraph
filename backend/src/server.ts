import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { verifyConnection } from './db/neo4j';
import candidateRoutes from './routes/candidate.routes';
import jobRoutes from './routes/job.routes';
import graphRoutes from './routes/graph.routes';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging (simple)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/candidates', candidateRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/graph', graphRoutes);

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Basic database ping
    await verifyConnection();
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: 'CONNECTED',
    });
  } catch (error: any) {
    console.error('Health check database check failed:', error.message);
    res.status(503).json({
      status: 'DEGRADED',
      timestamp: new Date().toISOString(),
      database: 'DISCONNECTED',
      error: 'DATABASE_UNAVAILABLE',
    });
  }
});

// Global Error Handler
app.use(errorHandler);

// Initialize database connection and start server
async function startServer() {
  console.log('Starting SkillGraph backend server...');
  try {
    // Verify connection to CognoDB
    await verifyConnection();
  } catch (err: any) {
    console.error('CRITICAL: Failed to connect to CognoDB on startup.');
    console.error('Error message:', err.message);
    console.log('Starting API server anyway in degraded mode (endpoints will return 503 DATABASE_UNAVAILABLE until resolved)...');
  }

  // Only start the server locally if not in a serverless environment like Vercel
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`SkillGraph backend running at http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`=================================================`);
    });
  }
}

startServer();

// Export the Express API for Vercel Serverless Functions
export default app;
