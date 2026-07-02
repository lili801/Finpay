import mongoose from 'mongoose';

import { NotificationStatus } from '../constants/financial.constants.js';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 120,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 1_000,
    },
    status: {
      type: String,
      enum: Object.values(NotificationStatus),
      default: NotificationStatus.PENDING,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: 'version',
    optimisticConcurrency: true,
  },
);

notificationSchema.index({ userId: 1, createdAt: -1 }, { name: 'user_notifications' });
notificationSchema.index({ status: 1, createdAt: 1 }, { name: 'notification_delivery' });

export const Notification = mongoose.model('Notification', notificationSchema);
