import { rateLimit } from 'express-rate-limit';

import { errorResponse } from '../utils/api-response.js';

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler(request, response) {
    response.status(429).json(
      errorResponse({
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        requestId: request.id,
      }),
    );
  },
});
