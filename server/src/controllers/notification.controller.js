import { successResponse } from '../utils/api-response.js';

export class NotificationController {
  constructor(notificationService) {
    this.notificationService = notificationService;
  }

  listNotifications = async (request, response) => {
    const { notifications, pagination } = await this.notificationService.listNotifications(
      request.auth.userId,
      request.validated.query,
    );

    response.status(200).json(
      successResponse({
        message: 'Notifications retrieved successfully',
        data: { notifications },
        meta: { pagination },
      }),
    );
  };

  getUnreadCount = async (request, response) => {
    const result = await this.notificationService.getUnreadCount(request.auth.userId);

    response.status(200).json(
      successResponse({
        message: 'Unread notification count retrieved successfully',
        data: result,
      }),
    );
  };

  markAsRead = async (request, response) => {
    const notification = await this.notificationService.markAsRead({
      userId: request.auth.userId,
      notificationId: request.validated.params.notificationId,
    });

    response.status(200).json(
      successResponse({
        message: 'Notification marked as read',
        data: { notification },
      }),
    );
  };

  markAllAsRead = async (request, response) => {
    const result = await this.notificationService.markAllAsRead(request.auth.userId);

    response.status(200).json(
      successResponse({
        message: 'Notifications marked as read',
        data: result,
      }),
    );
  };
}
