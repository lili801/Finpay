import { Router } from 'express';

import { successResponse } from '../utils/api-response.js';
import { createAuthRouter } from './auth.routes.js';
import { createNotificationRouter } from './notification.routes.js';
import { createWalletRouter } from './wallet.routes.js';
import { createAdminRouter } from './admin.routes.js';

export function createApiRouter() {
  const router = Router();

  router.get('/', (_request, response) => {
    response.status(200).json(
      successResponse({
        message: 'FinPay API v1',
        data: { version: 'v1' },
      }),
    );
  });
  router.use('/auth', createAuthRouter());
  router.use('/wallet', createWalletRouter());
  router.use('/notifications', createNotificationRouter());
  router.use('/admin', createAdminRouter());

  return router;
}
