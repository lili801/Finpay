import { NotificationStatus } from '../constants/financial.constants.js';
import { Notification } from '../models/notification.model.js';

export class NotificationRepository {
  async create(notificationData, session) {
    const notification = new Notification(notificationData);
    await notification.save({ session });
    return notification;
  }

  async findByUserId({ userId, page, limit }) {
    const filter = { userId };
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit).lean(),
      Notification.countDocuments(filter),
    ]);

    return { notifications, total };
  }

  async findUnreadByUserId(userId) {
    return Notification.find({
      userId,
      status: { $ne: NotificationStatus.READ },
    })
      .sort({ createdAt: -1, _id: -1 })
      .lean();
  }

  async countUnread(userId) {
    return Notification.countDocuments({
      userId,
      status: { $ne: NotificationStatus.READ },
    });
  }

  async markAsRead({ userId, notificationId }) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { status: NotificationStatus.READ },
      { new: true },
    );
  }

  async markAllAsRead(userId) {
    return Notification.updateMany(
      { userId, status: { $ne: NotificationStatus.READ } },
      { status: NotificationStatus.READ },
    );
  }
}
