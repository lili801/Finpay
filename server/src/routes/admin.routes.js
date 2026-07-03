import { Router } from 'express';

import { container } from '../config/container.js';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/async-handler.js';
import { USER_ROLES } from '../models/user.model.js';
import {
  adminUserListSchema,
  adminUserIdParamSchema,
  adminTransactionListSchema,
} from '../validators/admin.validator.js';

export function createAdminRouter() {
  const router = Router();
  const controller = new AdminController(container.adminService);

  // Apply authorization and authentication to all administrative endpoints
  router.use(authenticate);
  router.use(authorize(USER_ROLES.ADMIN));

  router.get('/summary', asyncHandler(controller.getSummary));

  router.get('/users', validate(adminUserListSchema), asyncHandler(controller.listUsers));
  router.get(
    '/users/:userId',
    validate(adminUserIdParamSchema),
    asyncHandler(controller.getUserDetails),
  );
  router.get(
    '/users/:userId/wallet',
    validate(adminUserIdParamSchema),
    asyncHandler(controller.getUserWallet),
  );
  router.get(
    '/users/:userId/wallet/balance',
    validate(adminUserIdParamSchema),
    asyncHandler(controller.getUserWalletBalance),
  );
  router.get(
    '/users/:userId/transactions/count',
    validate(adminUserIdParamSchema),
    asyncHandler(controller.getUserTransactionCount),
  );

  router.patch(
    '/users/:userId/wallet/freeze',
    validate(adminUserIdParamSchema),
    asyncHandler(controller.freezeWallet),
  );
  router.patch(
    '/users/:userId/wallet/activate',
    validate(adminUserIdParamSchema),
    asyncHandler(controller.activateWallet),
  );

  router.get(
    '/transactions',
    validate(adminTransactionListSchema),
    asyncHandler(controller.listTransactions),
  );

  return router;
}
export default createAdminRouter;
