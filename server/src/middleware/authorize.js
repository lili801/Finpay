import { AppError } from '../utils/app-error.js';

export function authorize(...allowedRoles) {
  return function authorizationMiddleware(request, _response, next) {
    if (!request.auth || !allowedRoles.includes(request.auth.role)) {
      next(
        new AppError('You do not have permission to perform this action', {
          statusCode: 403,
          code: 'FORBIDDEN',
        }),
      );
      return;
    }

    next();
  };
}
