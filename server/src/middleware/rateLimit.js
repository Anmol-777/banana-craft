import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';

const handler = (message, code) => (_req, res) => {
  res.status(429).json({
    success: false,
    error: { code, message },
  });
};

const base = {
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  validate: { trustProxy: false },
};

export const apiLimiter = rateLimit({
  ...base,
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.max,
  handler: handler('Too many requests, please slow down', 'RATE_LIMITED'),
});

export const authLimiter = rateLimit({
  ...base,
  windowMs: config.authRateLimit.windowMs,
  limit: config.authRateLimit.max,
  skipSuccessfulRequests: true,
  handler: handler('Too many authentication attempts, try again later', 'AUTH_RATE_LIMITED'),
});
