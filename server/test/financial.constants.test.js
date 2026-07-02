import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  Currency,
  LedgerEntryType,
  MONEY_LIMITS,
  NotificationStatus,
  TransactionStatus,
  TransactionType,
  WalletStatus,
} from '../src/constants/financial.constants.js';

const expectedConstants = [
  [WalletStatus, ['ACTIVE', 'FROZEN', 'CLOSED']],
  [TransactionStatus, ['PENDING', 'PROCESSING', 'SUCCESS', 'SUCCEEDED', 'FAILED', 'REVERSED']],
  [TransactionType, ['ADD_MONEY', 'TOP_UP', 'TRANSFER', 'REFUND', 'REVERSAL']],
  [Currency, ['INR']],
  [NotificationStatus, ['PENDING', 'SENT', 'READ', 'FAILED']],
  [LedgerEntryType, ['FUNDING', 'TRANSFER', 'REFUND', 'REVERSAL']],
];

describe('financial constants', () => {
  it('exposes complete, unique, frozen enum values', () => {
    for (const [constant, expectedValues] of expectedConstants) {
      const values = Object.values(constant);

      assert.deepEqual(values, expectedValues);
      assert.equal(new Set(values).size, values.length);
      assert.equal(Object.isFrozen(constant), true);
    }
  });

  it('keeps the maximum amount inside JavaScript safe-integer precision', () => {
    assert.equal(Object.isFrozen(MONEY_LIMITS), true);
    assert.equal(Number.isSafeInteger(MONEY_LIMITS.MAX_MINOR_UNITS), true);
    assert.ok(MONEY_LIMITS.MAX_MINOR_UNITS < Number.MAX_SAFE_INTEGER);
    assert.equal(MONEY_LIMITS.MINOR_UNITS_PER_RUPEE, 100);
  });
});
