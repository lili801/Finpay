import { Wallet } from '../models/wallet.model.js';

export class WalletRepository {
  async findByUserId(userId, session) {
    const query = Wallet.findOne({ userId });
    return session ? query.session(session) : query;
  }

  async create(walletData, session) {
    const wallet = new Wallet(walletData);
    await wallet.save({ session });
    return wallet;
  }

  async save(wallet, session) {
    return wallet.save({ session });
  }
}
