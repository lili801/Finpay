import {
  Currency,
  LedgerEntryType,
  MONEY_LIMITS,
  NotificationStatus,
  TransactionStatus,
  TransactionType,
  WalletStatus,
} from '../constants/financial.constants.js';

const objectId = {
  type: 'string',
  pattern: '^[a-fA-F0-9]{24}$',
  example: '6650f83f7e1f3c0012ab34cd',
};

const timestamps = {
  createdAt: { type: 'string', format: 'date-time' },
  updatedAt: { type: 'string', format: 'date-time' },
};

export const financialSchemas = {
  MoneyMinorUnits: {
    type: 'integer',
    minimum: 0,
    maximum: MONEY_LIMITS.MAX_MINOR_UNITS,
    description: 'Monetary value in integer minor units. For INR, one unit is one paise.',
    example: 12550,
  },
  Wallet: {
    type: 'object',
    required: ['userId', 'balance', 'currency', 'status'],
    properties: {
      userId: objectId,
      balance: { $ref: '#/components/schemas/MoneyMinorUnits' },
      currency: { type: 'string', enum: Object.values(Currency) },
      status: { type: 'string', enum: Object.values(WalletStatus) },
      ...timestamps,
    },
  },
  Transaction: {
    type: 'object',
    required: [
      'transactionId',
      'senderWalletId',
      'receiverWalletId',
      'amount',
      'status',
      'type',
      'idempotencyKey',
    ],
    properties: {
      transactionId: { type: 'string', pattern: '^TXN_[A-Z0-9]+$' },
      senderWalletId: objectId,
      receiverWalletId: objectId,
      amount: {
        allOf: [{ $ref: '#/components/schemas/MoneyMinorUnits' }],
        minimum: 1,
      },
      status: { type: 'string', enum: Object.values(TransactionStatus) },
      type: { type: 'string', enum: Object.values(TransactionType) },
      idempotencyKey: { type: 'string', minLength: 8, maxLength: 128 },
      ...timestamps,
    },
  },
  Ledger: {
    type: 'object',
    description: 'Immutable double-sided movement record.',
    required: ['transactionId', 'debitWalletId', 'creditWalletId', 'amount', 'entryType'],
    properties: {
      transactionId: { type: 'string', pattern: '^TXN_[A-Z0-9]+$' },
      debitWalletId: objectId,
      creditWalletId: objectId,
      amount: {
        allOf: [{ $ref: '#/components/schemas/MoneyMinorUnits' }],
        minimum: 1,
      },
      entryType: { type: 'string', enum: Object.values(LedgerEntryType) },
      ...timestamps,
    },
  },
  Idempotency: {
    type: 'object',
    required: ['key', 'userId', 'requestHash', 'expiresAt'],
    properties: {
      key: { type: 'string', minLength: 8, maxLength: 128 },
      userId: objectId,
      requestHash: { type: 'string', pattern: '^[a-f0-9]{64}$' },
      responseSnapshot: { type: ['object', 'null'], additionalProperties: true },
      expiresAt: { type: 'string', format: 'date-time' },
      ...timestamps,
    },
  },
  Notification: {
    type: 'object',
    required: ['userId', 'title', 'message', 'status'],
    properties: {
      userId: objectId,
      title: { type: 'string', minLength: 1, maxLength: 120 },
      message: { type: 'string', minLength: 1, maxLength: 1000 },
      status: { type: 'string', enum: Object.values(NotificationStatus) },
      ...timestamps,
    },
  },
};
