import { Router } from 'express';

import { container } from '../config/container.js';
import { NotificationController } from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/async-handler.js';
import {
  notificationIdSchema,
  notificationListSchema,
} from '../validators/notification.validator.js';

export function createNotificationRouter() {
  const router = Router();
  const controller = new NotificationController(container.notificationService);

  router.get('/', authenticate, validate(notificationListSchema), asyncHandler(controller.listNotifications));
  router.get('/unread-count', authenticate, asyncHandler(controller.getUnreadCount));
  router.patch('/read-all', authenticate, asyncHandler(controller.markAllAsRead));
  router.patch(
    '/:notificationId/read',
    authenticate,
    validate(notificationIdSchema),
    asyncHandler(controller.markAsRead),
  );

  return router;
}
