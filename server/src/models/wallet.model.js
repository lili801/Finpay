import mongoose from 'mongoose';

import { Currency, WalletStatus } from '../constants/financial.constants.js';
import { minorUnitField } from './financial-fields.js';

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
    balance: minorUnitField({ allowZero: true, defaultValue: 0 }),
    currency: {
      type: String,
      enum: Object.values(Currency),
      default: Currency.INR,
      required: true,
      immutable: true,
    },
    status: {
      type: String,
      enum: Object.values(WalletStatus),
      default: WalletStatus.ACTIVE,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: 'version',
    optimisticConcurrency: true,
  },
);

walletSchema.index({ userId: 1 }, { unique: true, name: 'unique_wallet_user' });
walletSchema.index({ status: 1 }, { name: 'wallet_status' });

export const Wallet = mongoose.model('Wallet', walletSchema);
