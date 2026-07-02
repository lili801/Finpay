import mongoose from 'mongoose';

import { TransactionSource, TransactionStatus, TransactionType } from '../constants/financial.constants.js';
import { minorUnitField } from './financial-fields.js';

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      immutable: true,
      minlength: 10,
      maxlength: 64,
      match: /^TXN_[A-Z0-9]+$/,
    },
    senderWalletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
      immutable: true,
    },
    receiverWalletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
      immutable: true,
    },
    amount: minorUnitField({ immutable: true }),
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
      immutable: true,
    },
    source: {
      type: String,
      enum: Object.values(TransactionSource),
      default: TransactionSource.SELF,
      required: true,
      immutable: true,
    },
    idempotencyKey: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      maxlength: 128,
      immutable: true,
    },
  },
  {
    timestamps: true,
    versionKey: 'version',
    optimisticConcurrency: true,
  },
);

transactionSchema.index({ transactionId: 1 }, { unique: true, name: 'unique_transaction_id' });
transactionSchema.index(
  { senderWalletId: 1, idempotencyKey: 1 },
  { unique: true, name: 'unique_sender_idempotency_key' },
);
transactionSchema.index(
  { senderWalletId: 1, createdAt: -1 },
  { name: 'sender_transaction_history' },
);
transactionSchema.index(
  { receiverWalletId: 1, createdAt: -1 },
  { name: 'receiver_transaction_history' },
);
transactionSchema.index({ status: 1, createdAt: 1 }, { name: 'transaction_processing' });

export const Transaction = mongoose.model('Transaction', transactionSchema);
