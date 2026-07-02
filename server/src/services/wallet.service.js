import { AppError } from '../utils/app-error.js';
import { paiseToRupees } from '../utils/money.js';

export class WalletService {
  constructor({ walletRepository }) {
    this.walletRepository = walletRepository;
  }

  async getOrCreateWalletForUser(userId) {
    const existingWallet = await this.walletRepository.findByUserId(userId);
    if (existingWallet) {
      return existingWallet;
    }

    return this.walletRepository.create({
      userId,
      balance: 0,
      currency: 'INR',
      status: 'ACTIVE',
    });
  }

  async getBalance(userId) {
    const wallet = await this.walletRepository.findByUserId(userId);

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

  async getWallet(userId) {
    const wallet = await this.walletRepository.findByUserId(userId);

    if (!wallet) {
      throw new AppError('Wallet not found', {
        statusCode: 404,
        code: 'WALLET_NOT_FOUND',
      });
    }

    return {
      id: wallet.id,
      userId: wallet.userId,
      balance: wallet.balance,
      balanceInRupees: paiseToRupees(wallet.balance),
      currency: wallet.currency,
      status: wallet.status,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  }
}
