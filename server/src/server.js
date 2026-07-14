import { createServer } from 'node:http';

import { app } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

const httpServer = createServer(app);
let isShuttingDown = false;

async function shutdown(signal) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  logger.info('Graceful shutdown started', { signal });

  if (env.NODE_ENV !== 'production' && typeof httpServer.closeAllConnections === 'function') {
    httpServer.closeAllConnections();
  }

  const forceShutdownTimer = setTimeout(() => {
    logger.error('Graceful shutdown timed out');
    process.exit(1);
  }, env.SHUTDOWN_TIMEOUT_MS);
  forceShutdownTimer.unref();

  httpServer.close(async (error) => {
    clearTimeout(forceShutdownTimer);

    if (error) {
      logger.error('HTTP server failed to close', { error });
      process.exit(1);
    }

    try {
      await disconnectDatabase();
      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (disconnectError) {
      logger.error('Infrastructure shutdown failed', { error: disconnectError });
      process.exit(1);
    }
  });
}

async function startServer() {
  await connectDatabase();

  httpServer.on('error', (error) => {
    logger.error('HTTP server error', { error });
    process.exit(1);
  });

  httpServer.listen(env.PORT, env.HOST, () => {
    logger.info('FinPay API started', {
      host: env.HOST,
      port: env.PORT,
      nodeEnvironment: env.NODE_ENV,
    });
  });
}

startServer().catch((error) => {
  logger.error('Server startup failed', { error });
  process.exit(1);
});

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error });
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason });
  shutdown('unhandledRejection');
});
