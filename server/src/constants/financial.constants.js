export const WalletStatus = Object.freeze({
  ACTIVE: 'ACTIVE',
  FROZEN: 'FROZEN',
  CLOSED: 'CLOSED',
});

export const TransactionStatus = Object.freeze({
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SUCCESS: 'SUCCESS',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
  REVERSED: 'REVERSED',
});

export const TransactionType = Object.freeze({
  ADD_MONEY: 'ADD_MONEY',
  TOP_UP: 'TOP_UP',
  TRANSFER: 'TRANSFER',
  REFUND: 'REFUND',
  REVERSAL: 'REVERSAL',
});

export const TransactionSource = Object.freeze({
  SELF: 'SELF',
});

export const Currency = Object.freeze({
  INR: 'INR',
});

export const NotificationStatus = Object.freeze({
  PENDING: 'PENDING',
  SENT: 'SENT',
  READ: 'READ',
  FAILED: 'FAILED',
});

export const NotificationType = Object.freeze({
  TOP_UP: 'TOP_UP',
  TRANSFER_SENT: 'TRANSFER_SENT',
  TRANSFER_RECEIVED: 'TRANSFER_RECEIVED',
});

export const LedgerEntryType = Object.freeze({
  FUNDING: 'FUNDING',
  TRANSFER: 'TRANSFER',
  REFUND: 'REFUND',
  REVERSAL: 'REVERSAL',
});

export const MONEY_LIMITS = Object.freeze({
  MINOR_UNITS_PER_RUPEE: 100,
  MAX_MINOR_UNITS: 9_000_000_000_000,
});
