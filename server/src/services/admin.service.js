import { AppError } from '../utils/app-error.js';
import { paiseToRupees } from '../utils/money.js';
import { WalletStatus } from '../constants/financial.constants.js';

export class AdminService {
  constructor({ adminRepository }) {
    this.adminRepository = adminRepository;
  }

  async getDashboardSummary() {
    const stats = await this.adminRepository.getStats();
    return {
      totalUsers: stats.totalUsers,
      totalWallets: stats.totalWallets,
      totalTransactions: stats.totalTransactions,
      totalWalletBalance: stats.totalWalletBalance,
      totalWalletBalanceInRupees: paiseToRupees(stats.totalWalletBalance),
      todayTransactions: stats.todayTransactions,
      todayTransferVolume: stats.todayTransferVolume,
      todayTransferVolumeInRupees: paiseToRupees(stats.todayTransferVolume),
      unreadNotificationsCount: stats.unreadNotificationsCount,
    };
  }

  async listUsers({ page, limit, search }) {
    const { users, total } = await this.adminRepository.findUsers({ page, limit, search });
    return {
      users: users.map((u) => u.toJSON()),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserDetails(userId) {
    const user = await this.adminRepository.findUserById(userId);
    if (!user) {
      throw new AppError('User not found', {
        statusCode: 404,
        code: 'USER_NOT_FOUND',
      });
    }

    const wallet = await this.adminRepository.findWalletByUserId(userId);
    let transactionCount = 0;
    if (wallet) {
      transactionCount = await this.adminRepository.countTransactionsByWalletId(wallet._id);
    }

    return {
      user: user.toJSON(),
      wallet: wallet
        ? {
            id: wallet.id,
            balance: wallet.balance,
            balanceInRupees: paiseToRupees(wallet.balance),
            currency: wallet.currency,
            status: wallet.status,
            createdAt: wallet.createdAt,
            updatedAt: wallet.updatedAt,
          }
        : null,
      transactionCount,
    };
  }

  async getUserWallet(userId) {
    const user = await this.adminRepository.findUserById(userId);
    if (!user) {
      throw new AppError('User not found', {
        statusCode: 404,
        code: 'USER_NOT_FOUND',
      });
    }

    const wallet = await this.adminRepository.findWalletByUserId(userId);
    if (!wallet) {
      throw new AppError('Wallet not found', {
        statusCode: 404,
        code: 'WALLET_NOT_FOUND',
      });
    }

    return {
      id: wallet.id,
      userId: wallet.userId.toString(),
      balance: wallet.balance,
      balanceInRupees: paiseToRupees(wallet.balance),
      currency: wallet.currency,
      status: wallet.status,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  }

  async getUserWalletBalance(userId) {
    const user = await this.adminRepository.findUserById(userId);
    if (!user) {
      throw new AppError('User not found', {
        statusCode: 404,
        code: 'USER_NOT_FOUND',
      });
    }

    const wallet = await this.adminRepository.findWalletByUserId(userId);
    if (!wallet) {
      throw new AppError('Wallet not found', {
        statusCode: 404,
        code: 'WALLET_NOT_FOUND',
      });
    }

    return {
      walletId: wallet.id,
      balance: wallet.balance,
      balanceInRupees: paiseToRupees(wallet.balance),
      currency: wallet.currency,
      status: wallet.status,
    };
  }

  async getUserTransactionCount(userId) {
    const user = await this.adminRepository.findUserById(userId);
    if (!user) {
      throw new AppError('User not found', {
        statusCode: 404,
        code: 'USER_NOT_FOUND',
      });
    }

    const wallet = await this.adminRepository.findWalletByUserId(userId);
    if (!wallet) {
      return { count: 0 };
    }

    const count = await this.adminRepository.countTransactionsByWalletId(wallet._id);
    return { count };
  }

  async freezeWalletByUserId(userId) {
    const user = await this.adminRepository.findUserById(userId);
    if (!user) {
      throw new AppError('User not found', {
        statusCode: 404,
        code: 'USER_NOT_FOUND',
      });
    }

    const wallet = await this.adminRepository.updateWalletStatusByUserId(userId, WalletStatus.FROZEN);
    if (!wallet) {
      throw new AppError('Wallet not found', {
        statusCode: 404,
        code: 'WALLET_NOT_FOUND',
      });
    }

    return {
      id: wallet.id,
      userId: wallet.userId.toString(),
      balance: wallet.balance,
      balanceInRupees: paiseToRupees(wallet.balance),
      currency: wallet.currency,
      status: wallet.status,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  }

  async activateWalletByUserId(userId) {
    const user = await this.adminRepository.findUserById(userId);
    if (!user) {
      throw new AppError('User not found', {
        statusCode: 404,
        code: 'USER_NOT_FOUND',
      });
    }

    const wallet = await this.adminRepository.updateWalletStatusByUserId(userId, WalletStatus.ACTIVE);
    if (!wallet) {
      throw new AppError('Wallet not found', {
        statusCode: 404,
        code: 'WALLET_NOT_FOUND',
      });
    }

    return {
      id: wallet.id,
      userId: wallet.userId.toString(),
      balance: wallet.balance,
      balanceInRupees: paiseToRupees(wallet.balance),
      currency: wallet.currency,
      status: wallet.status,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  }

  async listTransactions(filters) {
    const { transactions, total } = await this.adminRepository.findTransactions(filters);
    return {
      transactions: transactions.map((t) => ({
        id: t._id.toString(),
        transactionId: t.transactionId,
        senderWalletId: t.senderWalletId.toString(),
        receiverWalletId: t.receiverWalletId.toString(),
        amount: t.amount,
        amountInRupees: paiseToRupees(t.amount),
        status: t.status,
        type: t.type,
        source: t.source,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  }
}
