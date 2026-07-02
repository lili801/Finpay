import mongoose from 'mongoose';

import { env } from './env.js';
import { logger } from './logger.js';

mongoose.set('strictQuery', true);

export async function connectDatabase() {
  await mongoose.connect(env.MONGODB_URI, {
    autoIndex: env.NODE_ENV !== 'production',
    serverSelectionTimeoutMS: 10_000,
  });

  logger.info('MongoDB connection established');
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
  logger.info('MongoDB connection closed');
}

export function getDatabaseHealth() {
  const state = mongoose.connection.readyState;

  return {
    healthy: state === 1,
    state: ['disconnected', 'connected', 'connecting', 'disconnecting'][state] ?? 'unknown',
  };
}
