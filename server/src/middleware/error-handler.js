import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { AppError } from '../utils/app-error.js';
import { errorResponse } from '../utils/api-response.js';

export function errorHandler(error, request, response, _next) {
  const normalizedError =
    error instanceof AppError
      ? error
      : new AppError('An unexpected error occurred', {
          statusCode: 500,
          code: 'INTERNAL_ERROR',
          cause: error,
        });

  const logMethod = normalizedError.statusCode >= 500 ? 'error' : 'warn';

  logger.log(logMethod, normalizedError.message, {
    error: normalizedError,
    requestId: request.id,
    method: request.method,
    path: request.originalUrl,
  });

  const details =
    normalizedError.details ??
    (env.NODE_ENV === 'development' && !normalizedError.isOperational
      ? { stack: normalizedError.stack }
      : undefined);

  response.status(normalizedError.statusCode).json(
    errorResponse({
      code: normalizedError.code,
      message: normalizedError.message,
      details,
      requestId: request.id,
    }),
  );
}
