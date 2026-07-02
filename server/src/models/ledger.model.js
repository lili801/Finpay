import mongoose from 'mongoose';

import { LedgerEntryType } from '../constants/financial.constants.js';
import { minorUnitField } from './financial-fields.js';

const ledgerSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      immutable: true,
      match: /^TXN_[A-Z0-9]+$/,
    },
    debitWalletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
      immutable: true,
    },
    creditWalletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
      immutable: true,
    },
    amount: minorUnitField({ immutable: true }),
    entryType: {
      type: String,
      enum: Object.values(LedgerEntryType),
      required: true,
      immutable: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

ledgerSchema.index({ transactionId: 1 }, { unique: true, name: 'unique_ledger_transaction' });
ledgerSchema.index({ debitWalletId: 1, createdAt: -1 }, { name: 'ledger_debit_history' });
ledgerSchema.index({ creditWalletId: 1, createdAt: -1 }, { name: 'ledger_credit_history' });

const immutableOperations = [
  'updateOne',
  'updateMany',
  'findOneAndUpdate',
  'replaceOne',
  'findOneAndReplace',
  'deleteOne',
  'deleteMany',
  'findOneAndDelete',
];

for (const operation of immutableOperations) {
  ledgerSchema.pre(operation, function rejectLedgerMutation() {
    throw new Error('Ledger entries are append-only and cannot be modified or deleted');
  });
}

ledgerSchema.pre('save', function rejectExistingLedgerSave() {
  if (!this.isNew) {
    throw new Error('Ledger entries are append-only and cannot be modified');
  }
});

ledgerSchema.pre(
  'deleteOne',
  { document: true, query: false },
  function rejectLedgerDocumentDelete() {
    throw new Error('Ledger entries are append-only and cannot be deleted');
  },
);

export const Ledger = mongoose.model('Ledger', ledgerSchema);
