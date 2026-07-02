import { Transaction } from '../models/transaction.model.js';

export class TransactionRepository {
  async findByWalletId({ walletId, page, limit }) {
    const filter = {
      $or: [{ senderWalletId: walletId }, { receiverWalletId: walletId }],
    };
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit).lean(),
      Transaction.countDocuments(filter),
    ]);

    return { transactions, total };
  }
}
