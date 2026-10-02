import { Router } from 'express';
import { config } from '../config/env.js';
import { mongoState } from '../config/db.js';

export const healthRouter = Router();

healthRouter.get('/', async (req, res) => {
  const state = mongoState();
  const ok = state === 'connected';
  res.status(ok ? 200 : 503).json({
    success: ok,
    status: ok ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: config.version,
    environment: config.env,
    database: state,
    uptime: process.uptime(),
  });
});

healthRouter.get('/ready', async (req, res) => {
  const state = mongoState();
  const ok = state === 'connected';
  res.status(ok ? 200 : 503).json({ ready: ok, database: state });
});