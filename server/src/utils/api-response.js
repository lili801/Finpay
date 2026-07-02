export function successResponse({
  data = null,
  message = 'Request completed successfully',
  meta,
} = {}) {
  return {
    success: true,
    message,
    data,
    ...(meta === undefined ? {} : { meta }),
  };
}

export function errorResponse({ code, message, details, requestId }) {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details === undefined ? {} : { details }),
    },
    requestId,
  };
}
