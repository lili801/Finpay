import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { env } from './config/env.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found.js';
import { apiRateLimiter } from './middleware/rate-limiter.js';
import { requestContext } from './middleware/request-context.js';
import { requestLogger } from './middleware/request-logger.js';
import { createHealthRouter } from './routes/health.routes.js';
import { createDocsRouter } from './routes/docs.routes.js';
import { createApiRouter } from './routes/index.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(requestContext);
  app.use(requestLogger);
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || env.CORS_ORIGINS.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(null, false);
      },
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: false, limit: '100kb' }));

  app.use('/health', createHealthRouter());
  app.use('/docs', createDocsRouter());
  app.use('/api/v1', apiRateLimiter, createApiRouter());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
