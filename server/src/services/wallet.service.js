import mongoose from 'mongoose';

import { logger } from '../config/logger.js';
import { TransactionSource, TransactionStatus, TransactionType } from '../constants/financial.constants.js';
import { Transaction } from '../models/transaction.model.js';
import { Ledger } from '../models/ledger.model.js';
import { AppError } from '../utils/app-error.js';
import { paiseToRupees } from '../utils/money.js';

export class WalletService {
  constructor({
    walletRepository,
    userRepository,
    transactionRepository,
    transactionModel = Transaction,
    ledgerModel = Ledger,
  }) {
    this.walletRepository = walletRepository;
    this.userRepository = userRepository;
    this.transactionRepository = transactionRepository;
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

  async transfer({ senderUserId, receiverUserId, amountInPaise }) {
    if (String(senderUserId) === String(receiverUserId)) {
      throw new AppError('Sender cannot transfer to self', {
        statusCode: 400,
        code: 'SELF_TRANSFER_NOT_ALLOWED',
      });
    }

    const transactionId = this.#createTransactionId();
    const idempotencyKey = `transfer-${senderUserId}-${receiverUserId}-${Date.now()}`;
    let transferResult;

    if (await this.#canUseTransactions()) {
      const session = await mongoose.startSession();

      try {
        await session.withTransaction(async () => {
          transferResult = await this.#persistTransfer({
            senderUserId,
            receiverUserId,
            amountInPaise,
            transactionId,
            idempotencyKey,
            session,
          });
        });
      } finally {
        await session.endSession();
      }
    } else {
      transferResult = await this.#persistTransfer({
        senderUserId,
        receiverUserId,
        amountInPaise,
        transactionId,
        idempotencyKey,
      });
    }

    logger.info('Wallet transfer completed', {
      event: 'wallet.transfer.succeeded',
      senderUserId,
      receiverUserId,
      transactionId,
    });

    return transferResult;
  }

  async getTransactionHistory(userId, { page, limit }) {
    const wallet = await this.walletRepository.findByUserId(userId);

    if (!wallet) {
      throw new AppError('Wallet not found', {
        statusCode: 404,
        code: 'WALLET_NOT_FOUND',
      });
    }

    const { transactions, total } = await this.transactionRepository.findByWalletId({
      walletId: wallet.id,
      page,
      limit,
    });

    logger.info('Wallet transaction history retrieved', {
      event: 'wallet.transactions.listed',
      userId,
      walletId: wallet.id,
      page,
      limit,
    });

    return {
      transactions: transactions.map((transaction) => this.#publicTransaction(transaction)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
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

  async #persistTransfer({
    senderUserId,
    receiverUserId,
    amountInPaise,
    transactionId,
    idempotencyKey,
    session,
  }) {
    const receiver = await this.userRepository.findById(receiverUserId, session);

    if (!receiver) {
      throw new AppError('Receiver user not found', {
        statusCode: 404,
        code: 'RECEIVER_NOT_FOUND',
      });
    }

    const senderWallet = await this.walletRepository.findByUserId(senderUserId, session);
    if (!senderWallet) {
      throw new AppError('Sender wallet not found', {
        statusCode: 404,
        code: 'SENDER_WALLET_NOT_FOUND',
      });
    }

    const receiverWallet = await this.walletRepository.findByUserId(receiverUserId, session);
    if (!receiverWallet) {
      throw new AppError('Receiver wallet not found', {
        statusCode: 404,
        code: 'RECEIVER_WALLET_NOT_FOUND',
      });
    }

    if (senderWallet.balance < amountInPaise) {
      throw new AppError('Insufficient wallet balance', {
        statusCode: 400,
        code: 'INSUFFICIENT_BALANCE',
      });
    }

    senderWallet.balance -= amountInPaise;
    receiverWallet.balance += amountInPaise;

    await this.walletRepository.save(senderWallet, session);
    await this.walletRepository.save(receiverWallet, session);

    await this.#createTransactionRecord(
      {
        transactionId,
        senderWalletId: senderWallet.id,
        receiverWalletId: receiverWallet.id,
        amount: amountInPaise,
        status: TransactionStatus.SUCCESS,
        type: TransactionType.TRANSFER,
        source: TransactionSource.SELF,
        idempotencyKey,
      },
      session,
    );

    await this.#createLedgerEntry(
      {
        transactionId,
        debitWalletId: senderWallet.id,
        creditWalletId: receiverWallet.id,
        amount: amountInPaise,
        entryType: 'TRANSFER',
      },
      session,
    );

    return {
      transactionId,
      amountTransferred: amountInPaise,
      currency: senderWallet.currency,
      sender: {
        walletId: senderWallet.id,
        balance: senderWallet.balance,
        balanceInRupees: paiseToRupees(senderWallet.balance),
      },
      receiver: {
        walletId: receiverWallet.id,
        userId: receiverUserId,
      },
    };
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

  #publicTransaction(transaction) {
    return {
      transactionId: transaction.transactionId,
      type: transaction.type,
      status: transaction.status,
      amount: transaction.amount,
      amountInRupees: paiseToRupees(transaction.amount),
      senderWalletId: transaction.senderWalletId.toString(),
      receiverWalletId: transaction.receiverWalletId.toString(),
      source: transaction.source,
      createdAt: transaction.createdAt,
    };
  }
}
