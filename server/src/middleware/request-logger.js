import { performance } from 'node:perf_hooks';

import { logger } from '../config/logger.js';

export function requestLogger(request, response, next) {
  const startedAt = performance.now();

  response.on('finish', () => {
    const durationMs = Number((performance.now() - startedAt).toFixed(2));
    const logMethod = response.statusCode >= 500 ? 'error' : 'http';

    logger.log(logMethod, 'HTTP request completed', {
      requestId: request.id,
      method: request.method,
      path: request.originalUrl,
      statusCode: response.statusCode,
      durationMs,
      userAgent: request.get('user-agent'),
      remoteAddress: request.ip,
    });
  });

  next();
}
