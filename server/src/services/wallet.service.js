import mongoose from 'mongoose';

import { TransactionSource, TransactionStatus, TransactionType } from '../constants/financial.constants.js';
import { Transaction } from '../models/transaction.model.js';
import { Ledger } from '../models/ledger.model.js';
import { AppError } from '../utils/app-error.js';
import { paiseToRupees } from '../utils/money.js';

export class WalletService {
  constructor({ walletRepository, transactionModel = Transaction, ledgerModel = Ledger }) {
    this.walletRepository = walletRepository;
    this.transactionModel = transactionModel;
    this.ledgerModel = ledgerModel;
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

  async addMoney(userId, amountInPaise) {
    const wallet = await this.walletRepository.findByUserId(userId);
    const existingWallet = wallet ?? (await this.getOrCreateWalletForUser(userId));

    if (!existingWallet) {
      throw new AppError('Wallet not found', {
        statusCode: 404,
        code: 'WALLET_NOT_FOUND',
      });
    }

    const targetWallet = existingWallet;
    let updatedWallet = targetWallet;
    const transactionId = this.#createTransactionId();
    const idempotencyKey = `topup-${userId}-${Date.now()}`;

    if (await this.#canUseTransactions()) {
      const session = await mongoose.startSession();

      try {
        await session.withTransaction(async () => {
          const walletForTransaction = await this.walletRepository.findByUserId(userId, session);
          const walletToUpdate = walletForTransaction ?? (await this.walletRepository.create({
            userId,
            balance: 0,
            currency: 'INR',
            status: 'ACTIVE',
          }, session));

          updatedWallet = await this.#persistTopUp(walletToUpdate, amountInPaise, transactionId, idempotencyKey, session);
        });
      } finally {
        await session.endSession();
      }
    } else {
      updatedWallet = await this.#persistTopUp(targetWallet, amountInPaise, transactionId, idempotencyKey);
    }

    return {
      updatedBalance: updatedWallet.balance,
      amountCredited: amountInPaise,
      transactionId,
      currency: updatedWallet.currency,
    };
  }

  async #persistTopUp(wallet, amountInPaise, transactionId, idempotencyKey, session) {
    const walletToUpdate = wallet;
    walletToUpdate.balance += amountInPaise;
    await this.walletRepository.save(walletToUpdate, session);

    await this.#createTransactionRecord(
      {
        transactionId,
        senderWalletId: walletToUpdate.id,
        receiverWalletId: walletToUpdate.id,
        amount: amountInPaise,
        status: TransactionStatus.SUCCESS,
        type: TransactionType.TOP_UP,
        source: TransactionSource.SELF,
        idempotencyKey,
      },
      session,
    );

    await this.#createLedgerEntry(
      {
        transactionId,
        debitWalletId: walletToUpdate.id,
        creditWalletId: walletToUpdate.id,
        amount: amountInPaise,
        entryType: 'FUNDING',
      },
      session,
    );

    return walletToUpdate;
  }

  async #canUseTransactions() {
    if (mongoose.connection.readyState !== 1) {
      return false;
    }

    try {
      const admin = mongoose.connection.db.admin();
      const { hosts } = await admin.command({ hello: 1 });
      return Array.isArray(hosts) && hosts.length > 1;
    } catch {
      return false;
    }
  }

  #createTransactionId() {
    return `TXN_${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  }

  async #createTransactionRecord(record, session) {
    return this.#createDocument(this.transactionModel, record, session);
  }

  async #createLedgerEntry(record, session) {
    return this.#createDocument(this.ledgerModel, record, session);
  }

  async #createDocument(model, record, session) {
    const document = new model(record);
    await document.save({ session });
    return document;
  }
}
