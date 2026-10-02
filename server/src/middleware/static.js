import express from 'express';
import { config } from '../config/env.js';

export function serveStaticUploads(app) {
  app.use(config.uploadPath, express.static(config.uploadDir, {
    maxAge: config.isProduction ? '30d' : '0',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      if (path.endsWith('.avif')) res.setHeader('Content-Type', 'image/avif');
    },
  }));
}