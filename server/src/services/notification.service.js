import { logger } from '../config/logger.js';
import { NotificationStatus, NotificationType } from '../constants/financial.constants.js';
import { AppError } from '../utils/app-error.js';
import { paiseToRupees } from '../utils/money.js';

export class NotificationService {
  constructor({ notificationRepository }) {
    this.notificationRepository = notificationRepository;
  }

  async createTopUpNotification({ userId, amountInPaise, session }) {
    return this.notificationRepository.create(
      {
        userId,
        title: 'Money Added Successfully',
        message: `${this.#formatRupees(amountInPaise)} has been successfully added to your wallet.`,
        type: NotificationType.TOP_UP,
        status: NotificationStatus.PENDING,
      },
      session,
    );
  }

  async createTransferNotifications({
    senderUser,
    receiverUser,
    amountInPaise,
    session,
  }) {
    const amount = this.#formatRupees(amountInPaise);
    const senderName = this.#fullName(senderUser);
    const receiverName = this.#fullName(receiverUser);

    await this.notificationRepository.create(
      {
        userId: senderUser.id,
        title: 'Money Sent',
        message: `You sent ${amount} to ${receiverName}.`,
        type: NotificationType.TRANSFER_SENT,
        status: NotificationStatus.PENDING,
      },
      session,
    );

    await this.notificationRepository.create(
      {
        userId: receiverUser.id,
        title: 'Money Received',
        message: `You received ${amount} from ${senderName}.`,
        type: NotificationType.TRANSFER_RECEIVED,
        status: NotificationStatus.PENDING,
      },
      session,
    );
  }

  async listNotifications(userId, { page, limit }) {
    const { notifications, total } = await this.notificationRepository.findByUserId({
      userId,
      page,
      limit,
    });

    logger.info('Notifications retrieved', {
      event: 'notifications.listed',
      userId,
      page,
      limit,
    });

    return {
      notifications: notifications.map((notification) => this.#publicNotification(notification)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUnreadCount(userId) {
    const unreadCount = await this.notificationRepository.countUnread(userId);
    return { unreadCount };
  }

  async markAsRead({ userId, notificationId }) {
    const notification = await this.notificationRepository.markAsRead({ userId, notificationId });

    if (!notification) {
      throw new AppError('Notification not found', {
        statusCode: 404,
        code: 'NOTIFICATION_NOT_FOUND',
      });
    }

    logger.info('Notification marked as read', {
      event: 'notifications.read',
      userId,
      notificationId,
    });

    return this.#publicNotification(notification);
  }

  async markAllAsRead(userId) {
    const result = await this.notificationRepository.markAllAsRead(userId);

    logger.info('All notifications marked as read', {
      event: 'notifications.read_all',
      userId,
      modifiedCount: result.modifiedCount,
    });

    return { modifiedCount: result.modifiedCount };
  }

  #publicNotification(notification) {
    return {
      id: notification._id?.toString() ?? notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      status: notification.status,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }

  #formatRupees(amountInPaise) {
    const amount = paiseToRupees(amountInPaise);
    return `₹${amount.endsWith('.00') ? amount.slice(0, -3) : amount}`;
  }

  #fullName(user) {
    return `${user.firstName} ${user.lastName}`.trim();
  }
}
