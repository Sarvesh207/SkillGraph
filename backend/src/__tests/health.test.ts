import request from 'supertest';
import express from 'express';
import { verifyConnection } from '../db/neo4j';

// Mock the database helper module
jest.mock('../db/neo4j', () => ({
  verifyConnection: jest.fn(),
  getDriver: jest.fn(),
  closeDriver: jest.fn(),
}));

import candidateRoutes from '../routes/candidate.routes';
import jobRoutes from '../routes/job.routes';
import graphRoutes from '../routes/graph.routes';
import { errorHandler } from '../middleware/errorHandler';

// Initialize express instance for testing routing setup
const app = express();
app.use(express.json());
app.use('/api/candidates', candidateRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/graph', graphRoutes);

app.get('/api/health', async (req, res) => {
  try {
    await verifyConnection();
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: 'CONNECTED',
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'DEGRADED',
      timestamp: new Date().toISOString(),
      database: 'DISCONNECTED',
      error: 'DATABASE_UNAVAILABLE',
    });
  }
});
app.use(errorHandler);

describe('GET /api/health', () => {
  it('should return 200 OK when database verify connectivity succeeds', async () => {
    (verifyConnection as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
    expect(response.body.database).toBe('CONNECTED');
  });

  it('should return 503 degraded when database connectivity fails', async () => {
    (verifyConnection as jest.Mock).mockRejectedValue(new Error('Failed to connect to server'));

    const response = await request(app).get('/api/health');
    expect(response.status).toBe(503);
    expect(response.body.status).toBe('DEGRADED');
    expect(response.body.database).toBe('DISCONNECTED');
    expect(response.body.error).toBe('DATABASE_UNAVAILABLE');
  });
});
