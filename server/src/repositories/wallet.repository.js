import { Wallet } from '../models/wallet.model.js';

export class WalletRepository {
  async findByUserId(userId) {
    return Wallet.findOne({ userId });
  }

  async create(walletData) {
    return Wallet.create(walletData);
  }

  async save(wallet) {
    return wallet.save();
  }
}
