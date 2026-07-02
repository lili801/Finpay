import { Router } from 'express';

import { container } from '../config/container.js';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/async-handler.js';
import {
  forgotPasswordSchema,
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../validators/auth.validator.js';

export function createAuthRouter() {
  const router = Router();
  const controller = new AuthController(container.authService);

  router.post('/register', validate(registerSchema), asyncHandler(controller.register));
  router.post('/login', validate(loginSchema), asyncHandler(controller.login));
  router.post('/refresh', validate(refreshSchema), asyncHandler(controller.refresh));
  router.post('/logout', authenticate, validate(logoutSchema), asyncHandler(controller.logout));
  router.get('/me', authenticate, asyncHandler(controller.me));
  router.post('/verify-email', validate(verifyEmailSchema), asyncHandler(controller.verifyEmail));
  router.post(
    '/forgot-password',
    validate(forgotPasswordSchema),
    asyncHandler(controller.forgotPassword),
  );
  router.post(
    '/reset-password',
    validate(resetPasswordSchema),
    asyncHandler(controller.resetPassword),
  );

  return router;
}
