import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import mongoose from 'mongoose';

import {
  Currency,
  LedgerEntryType,
  NotificationStatus,
  NotificationType,
  TransactionStatus,
  TransactionType,
  WalletStatus,
} from '../src/constants/financial.constants.js';
import { Idempotency } from '../src/models/idempotency.model.js';
import { Ledger } from '../src/models/ledger.model.js';
import { Notification } from '../src/models/notification.model.js';
import { Transaction } from '../src/models/transaction.model.js';
import { Wallet } from '../src/models/wallet.model.js';

const userId = new mongoose.Types.ObjectId();
const senderWalletId = new mongoose.Types.ObjectId();
const receiverWalletId = new mongoose.Types.ObjectId();

describe('financial model validation', () => {
  it('applies safe wallet defaults', () => {
    const wallet = new Wallet({ userId });

    assert.equal(wallet.validateSync(), undefined);
    assert.equal(wallet.balance, 0);
    assert.equal(wallet.currency, Currency.INR);
    assert.equal(wallet.status, WalletStatus.ACTIVE);
  });

  it('rejects fractional, negative, and invalid-status wallet values', () => {
    const fractional = new Wallet({ userId, balance: 10.5 });
    const negative = new Wallet({ userId, balance: -1 });
    const invalidStatus = new Wallet({ userId, status: 'UNKNOWN' });

    assert.ok(fractional.validateSync().errors.balance);
    assert.ok(negative.validateSync().errors.balance);
    assert.ok(invalidStatus.validateSync().errors.status);
  });

  it('validates required transaction identity and positive integer amounts', () => {
    const validTransaction = new Transaction({
      transactionId: 'TXN_01JABCDEF123',
      senderWalletId,
      receiverWalletId,
      amount: 50_000,
      type: TransactionType.TRANSFER,
      idempotencyKey: 'transfer-request-001',
    });
    const invalidTransaction = new Transaction({
      transactionId: 'invalid id',
      senderWalletId,
      receiverWalletId,
      amount: 0,
      status: 'UNKNOWN',
      type: TransactionType.TRANSFER,
      idempotencyKey: 'short',
    });

    assert.equal(validTransaction.validateSync(), undefined);
    assert.equal(validTransaction.status, TransactionStatus.PENDING);

    const validationError = invalidTransaction.validateSync();
    assert.ok(validationError.errors.transactionId);
    assert.ok(validationError.errors.amount);
    assert.ok(validationError.errors.status);
    assert.ok(validationError.errors.idempotencyKey);
  });

  it('validates immutable ledger entry fields', () => {
    const ledger = new Ledger({
      transactionId: 'TXN_01JABCDEF123',
      debitWalletId: senderWalletId,
      creditWalletId: receiverWalletId,
      amount: 50_000,
      entryType: LedgerEntryType.TRANSFER,
    });
    const invalidLedger = new Ledger({
      transactionId: 'TXN_01JABCDEF123',
      debitWalletId: senderWalletId,
      creditWalletId: receiverWalletId,
      amount: 2.5,
      entryType: 'UNKNOWN',
    });

    assert.equal(ledger.validateSync(), undefined);
    assert.ok(invalidLedger.validateSync().errors.amount);
    assert.ok(invalidLedger.validateSync().errors.entryType);
  });

  it('validates idempotency fingerprints and expiry', () => {
    const validRecord = new Idempotency({
      key: 'transfer-request-001',
      userId,
      requestHash: 'a'.repeat(64),
      expiresAt: new Date(Date.now() + 60_000),
    });
    const invalidRecord = new Idempotency({
      key: 'short',
      userId,
      requestHash: 'not-a-sha256-hash',
    });

    assert.equal(validRecord.validateSync(), undefined);

    const validationError = invalidRecord.validateSync();
    assert.ok(validationError.errors.key);
    assert.ok(validationError.errors.requestHash);
    assert.ok(validationError.errors.expiresAt);
  });

  it('validates notification content and status defaults', () => {
    const notification = new Notification({
      userId,
      title: 'Transfer completed',
      message: 'Your transfer was completed successfully.',
      type: NotificationType.TRANSFER_RECEIVED,
    });
    const invalidNotification = new Notification({
      userId,
      title: ' ',
      message: '',
      type: 'UNKNOWN',
      status: 'UNKNOWN',
    });

    assert.equal(notification.validateSync(), undefined);
    assert.equal(notification.status, NotificationStatus.PENDING);

    const validationError = invalidNotification.validateSync();
    assert.ok(validationError.errors.title);
    assert.ok(validationError.errors.message);
    assert.ok(validationError.errors.type);
    assert.ok(validationError.errors.status);
  });
});
