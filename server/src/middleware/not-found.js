import { AppError } from '../utils/app-error.js';

export function notFoundHandler(request, _response, next) {
  next(
    new AppError(`Route not found: ${request.method} ${request.originalUrl}`, {
      statusCode: 404,
      code: 'ROUTE_NOT_FOUND',
    }),
  );
}
