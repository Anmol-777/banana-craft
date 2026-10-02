import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { randomBytes } from 'node:crypto';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

export const SERVER_ROOT = path.resolve(moduleDir, '..', '..');

const dotenvPath = process.env.DOTENV_CONFIG_PATH
  ? path.resolve(process.env.DOTENV_CONFIG_PATH)
  : path.join(SERVER_ROOT, '.env');

const dotenvLoaded = fs.existsSync(dotenvPath) ? dotenv.config({ path: dotenvPath }) : null;

const toBool = (value, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toList = (value, fallback) => {
  if (value === undefined || value === null || String(value).trim() === '') return fallback;
  return String(value)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const raw = process.env;

const nodeEnv = raw.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';
const isTest = nodeEnv === 'test';

const ephemeralJwtSecret = randomBytes(48).toString('hex');

const uploadDir = path.resolve(SERVER_ROOT, raw.UPLOAD_DIR || 'uploads');

const clientPublicDir = raw.CLIENT_PUBLIC_DIR
  ? path.resolve(SERVER_ROOT, raw.CLIENT_PUBLIC_DIR)
  : null;

export const config = {
  env: nodeEnv,
  isProduction,
  isTest,
  dotenvPath: dotenvLoaded ? dotenvPath : null,
  serverRoot: SERVER_ROOT,
  name: raw.APP_NAME || 'om-banana-crafts-api',
  version: raw.APP_VERSION || '1.0.0',
  port: toInt(raw.PORT, 4000),
  host: raw.HOST || '0.0.0.0',
  trustProxy: raw.TRUST_PROXY ? toInt(raw.TRUST_PROXY, raw.TRUST_PROXY === 'true' ? 1 : 0) : false,
  mongoUri: (raw.MONGODB_URI || '').trim(),
  mongoDbName: (raw.MONGODB_DB_NAME || '').trim(),
  jwtSecret: raw.JWT_SECRET && raw.JWT_SECRET.length > 0 ? raw.JWT_SECRET : (isProduction ? null : ephemeralJwtSecret),
  jwtSecretProvided: Boolean(raw.JWT_SECRET && raw.JWT_SECRET.length > 0),
  jwtIssuer: raw.JWT_ISSUER || 'om-banana-crafts-api',
  jwtAudience: raw.JWT_AUDIENCE || 'om-banana-crafts-admin',
  jwtExpiresIn: raw.JWT_EXPIRES_IN || '7d',
  bcryptRounds: Math.min(Math.max(toInt(raw.BCRYPT_ROUNDS, 12), 4), 15),
  corsOrigins: toList(raw.CORS_ORIGINS || raw.CLIENT_ORIGIN, [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
  ]),
  jsonLimit: raw.JSON_LIMIT || '1mb',
  publicUrl: (raw.PUBLIC_URL || '').replace(/\/+$/, ''),
  uploadDir,
  uploadPath: '/uploads',
  maxUploadBytes: toInt(raw.MAX_UPLOAD_MB, 5) * 1024 * 1024,
  maxUploadMb: toInt(raw.MAX_UPLOAD_MB, 5),
  clientPublicDir,
  serveClientImages: toBool(raw.SERVE_CLIENT_IMAGES, false),
  rateLimit: {
    windowMs: toInt(raw.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: toInt(raw.RATE_LIMIT_MAX, 300),
  },
  authRateLimit: {
    windowMs: toInt(raw.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: toInt(raw.AUTH_RATE_LIMIT_MAX, 10),
  },
  bootstrapAdmin: {
    email: (raw.ADMIN_EMAIL || '').trim().toLowerCase(),
    username: (raw.ADMIN_USERNAME || '').trim(),
    name: (raw.ADMIN_NAME || 'Site Admin').trim(),
    password: raw.ADMIN_PASSWORD || '',
    autoCreate: toBool(raw.ADMIN_AUTO_CREATE, !isProduction),
  },
  seedMode: (raw.SEED_MODE || 'overwrite').trim().toLowerCase(),
  logLevel: raw.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
};

export const REQUIRED_VARS = {
  MONGODB_URI: 'MongoDB connection string, e.g. mongodb://127.0.0.1:27017/om_banana_crafts',
  JWT_SECRET: 'Random string of at least 32 characters used to sign admin tokens',
};

export function collectEnvProblems() {
  const problems = [];

  if (!config.mongoUri) {
    problems.push(`MONGODB_URI is missing (${REQUIRED_VARS.MONGODB_URI})`);
  } else if (!/^mongodb(\+srv)?:\/\//.test(config.mongoUri)) {
    problems.push('MONGODB_URI must start with mongodb:// or mongodb+srv://');
  }

  if (!raw.JWT_SECRET) {
    problems.push(
      config.isProduction
        ? `JWT_SECRET is missing (${REQUIRED_VARS.JWT_SECRET})`
        : 'JWT_SECRET is not set; a random per-process secret is used so tokens expire on every restart',
    );
  } else if (raw.JWT_SECRET.length < 32) {
    problems.push('JWT_SECRET must be at least 32 characters long');
  }

  if (config.corsOrigins.includes('*') && config.isProduction) {
    problems.push('CORS_ORIGINS must not be "*" in production; list allowed origins explicitly');
  }

  return problems;
}

export function collectEnvWarnings() {
  const warnings = [];

  if (config.corsOrigins.length === 0) warnings.push('CORS_ORIGINS is empty; browser requests will be blocked');
  if (!config.jwtSecretProvided && !config.isProduction) {
    warnings.push('JWT_SECRET not provided; using an ephemeral random secret (set it in .env for stable sessions)');
  }
  if (config.maxUploadMb <= 0) warnings.push('MAX_UPLOAD_MB must be greater than 0');
  if (config.clientPublicDir && !fs.existsSync(config.clientPublicDir)) {
    warnings.push(`CLIENT_PUBLIC_DIR does not exist: ${config.clientPublicDir}`);
  }

  return warnings;
}

export function formatEnvReport() {
  const lines = ['Invalid environment configuration:', ''];
  for (const problem of collectEnvProblems()) lines.push(`  - ${problem}`);
  lines.push('');
  lines.push(`Copy ${path.join(SERVER_ROOT, '.env.example')} to ${path.join(SERVER_ROOT, '.env')} and fill in the values.`);
  return lines.join('\n');
}

export function assertEnv() {
  const problems = collectEnvProblems().filter((problem) => problem.startsWith('MONGODB_URI') || problem.startsWith('JWT_SECRET must') || (config.isProduction && problem.startsWith('JWT_SECRET')));
  if (problems.length > 0) {
    const error = new Error(problems.join('\n'));
    error.code = 'ENV_INVALID';
    error.problems = problems;
    throw error;
  }
}
