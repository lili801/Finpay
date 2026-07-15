import { User } from '../models/user.model.js';
import { Wallet } from '../models/wallet.model.js';
import { Transaction } from '../models/transaction.model.js';
import { Notification } from '../models/notification.model.js';
import { TransactionType, TransactionStatus, NotificationStatus } from '../constants/financial.constants.js';

export class AdminRepository {
  async getStats() {
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalWallets,
      totalTransactions,
      unreadNotificationsCount,
      walletBalanceResult,
      todayTransactionsCount,
      todayTransferVolumeResult
    ] = await Promise.all([
      User.countDocuments(),
      Wallet.countDocuments(),
      Transaction.countDocuments(),
      Notification.countDocuments({ status: { $ne: NotificationStatus.READ } }),
      Wallet.aggregate([
        { $group: { _id: null, total: { $sum: '$balance' } } }
      ]),
      Transaction.countDocuments({ createdAt: { $gte: startOfToday } }),
      Transaction.aggregate([
        {
          $match: {
            type: TransactionType.TRANSFER,
            status: { $in: [TransactionStatus.SUCCESS, TransactionStatus.SUCCEEDED] },
            createdAt: { $gte: startOfToday }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const totalWalletBalance = walletBalanceResult[0]?.total ?? 0;
    const todayTransferVolume = todayTransferVolumeResult[0]?.total ?? 0;

    return {
      totalUsers,
      totalWallets,
      totalTransactions,
      totalWalletBalance,
      todayTransactions: todayTransactionsCount,
      todayTransferVolume,
      unreadNotificationsCount,
    };
  }

  async findUsers({ page, limit, search }) {
    const query = {};
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { mobileNumber: regex },
        { email: regex },
        { firstName: regex },
        { lastName: regex }
      ];
    }
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query)
    ]);

    return { users, total };
  }

  async findUserById(userId) {
    return User.findById(userId);
  }

  async findWalletByUserId(userId) {
    return Wallet.findOne({ userId });
  }

  async countTransactionsByWalletId(walletId) {
    return Transaction.countDocuments({
      $or: [{ senderWalletId: walletId }, { receiverWalletId: walletId }]
    });
  }

  async updateWalletStatusByUserId(userId, status) {
    return Wallet.findOneAndUpdate({ userId }, { status }, { new: true });
  }

  async findTransactions(filters) {
    const { page, limit, transactionId, status, type, userId, date, startDate, endDate } = filters;
    const query = {};

    if (transactionId) {
      query.transactionId = transactionId;
    }
    if (status) {
      query.status = status;
    }
    if (type) {
      query.type = type;
    }
    if (userId) {
      const wallet = await Wallet.findOne({ userId });
      if (wallet) {
        query.$or = [
          { senderWalletId: wallet._id },
          { receiverWalletId: wallet._id }
        ];
      } else {
        query._id = null; // force empty result
      }
    }

    if (date) {
      const start = new Date(date);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setUTCHours(23, 59, 59, 999);
      query.createdAt = { $gte: start, $lte: end };
    } else if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      Transaction.find(query).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit),
      Transaction.countDocuments(query)
    ]);

    return { transactions, total };
  }
}
