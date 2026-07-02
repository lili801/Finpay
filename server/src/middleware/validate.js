import { AppError } from '../utils/app-error.js';

export function validate(schema) {
  return async function validationMiddleware(request, _response, next) {
    const result = await schema.safeParseAsync({
      body: request.body,
      params: request.params,
      query: request.query,
    });

    if (!result.success) {
      next(
        new AppError('Request validation failed', {
          statusCode: 422,
          code: 'VALIDATION_ERROR',
          details: result.error.issues.map(({ path, message, code }) => ({
            field: path.join('.'),
            message,
            code,
          })),
        }),
      );
      return;
    }

    request.validated = result.data;
    next();
  };
}
