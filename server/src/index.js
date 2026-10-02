import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config, collectEnvProblems, collectEnvWarnings } from './config/env.js';
import { connectMongo, mongoState } from './config/db.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { apiLimiter, authLimiter } from './middleware/rateLimit.js';
import { ensureUploadDir } from './middleware/upload.js';
import { authRouter } from './routes/auth.routes.js';
import { productsRouter } from './routes/products.routes.js';
import { innovationsRouter } from './routes/innovations.routes.js';
import { storyRouter } from './routes/story.routes.js';
import { galleryRouter } from './routes/gallery.routes.js';
import { settingsRouter } from './routes/settings.routes.js';
import { mediaRouter } from './routes/media.routes.js';

import { dashboardRouter } from './routes/dashboard.routes.js';
import { healthRouter } from './routes/health.routes.js';
import { serveStaticUploads } from './middleware/static.js';

const app = express();

if (config.trustProxy) app.set('trust proxy', config.trustProxy);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: config.jsonLimit }));
app.use(express.urlencoded({ extended: true, limit: config.jsonLimit }));
app.use(apiLimiter);

ensureUploadDir();
serveStaticUploads(app);

app.use('/api/auth', authLimiter, authRouter);
app.use('/api/products', productsRouter);
app.use('/api/innovations', innovationsRouter);
app.use('/api/story', storyRouter);
app.use('/api/gallery', galleryRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/media', mediaRouter);

app.use('/api/dashboard', dashboardRouter);
app.use('/api/health', healthRouter);

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  const problems = collectEnvProblems();
  if (problems.length > 0) {
    console.error('\n' + problems.map(p => `  - ${p}`).join('\n') + '\n');
    if (config.isProduction) process.exit(1);
  }

  const warnings = collectEnvWarnings();
  if (warnings.length > 0) {
    console.warn('[warn] Environment warnings:');
    for (const w of warnings) console.warn(`  - ${w}`);
  }

  try {
    await connectMongo();
    console.log(`[mongo] connected (${mongoState()})`);

    const { ensureBootstrapAdmin } = await import('./services/auth.service.js');
    const bootstrap = await ensureBootstrapAdmin();
    if (bootstrap.created) {
      console.log('[bootstrap] Created admin:', bootstrap.admin.email);
      if (bootstrap.generatedPassword) {
        console.log('[bootstrap] Generated password:', bootstrap.generatedPassword);
      }
    } else if (bootstrap.reason) {
      console.log('[bootstrap] Skipped:', bootstrap.reason);
    }
  } catch (error) {
    if (error.code === 'MONGO_NOT_CONFIGURED') {
      console.error('\n[mongo] Cannot start: MongoDB is not configured.');
      console.error('Set MONGODB_URI in server/.env (see server/.env.example) and start again.\n');
      if (config.isProduction) process.exit(1);
    } else {
      throw error;
    }
  }

  app.listen(config.port, config.host, () => {
    console.log(`[server] ${config.name} v${config.version} listening on http://${config.host}:${config.port}`);
    console.log(`[server] Environment: ${config.env}`);
    console.log(`[server] API base: http://${config.host}:${config.port}/api`);
  });
}

start().catch((error) => {
  console.error('[fatal] Failed to start server:', error);
  process.exit(1);
});

export { app };