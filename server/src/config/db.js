import mongoose from 'mongoose';
import { config, collectEnvProblems } from './env.js';

let connectionPromise = null;

export function mongoState() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] ?? 'unknown';
}

export async function connectMongo({ uri = config.mongoUri, dbName = config.mongoDbName || undefined } = {}) {
  if (!uri) {
    const mongoProblems = collectEnvProblems().filter((problem) => problem.includes('MONGODB_URI'));
    const error = new Error(
      `Cannot start: MongoDB is not configured.\n${mongoProblems.join('\n') || 'MONGODB_URI is missing'}\nSet MONGODB_URI in server/.env (see server/.env.example) and start again.`,
    );
    error.code = 'MONGO_NOT_CONFIGURED';
    throw error;
  }

  if (connectionPromise) return connectionPromise;

  mongoose.set('strictQuery', true);

  connectionPromise = mongoose
    .connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 10000,
      autoIndex: config.isProduction ? false : true,
    })
    .then((m) => {
      return m.connection;
    })
    .catch((error) => {
      connectionPromise = null;
      throw error;
    });

  return connectionPromise;
}

export async function disconnectMongo() {
  connectionPromise = null;
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

mongoose.connection.on('error', (error) => {
  console.error('[mongo] connection error:', error.message);
});

mongoose.connection.on('disconnected', () => {
  if (config.logLevel === 'debug') console.warn('[mongo] disconnected');
});
