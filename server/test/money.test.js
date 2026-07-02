import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { MONEY_LIMITS } from '../src/constants/financial.constants.js';
import { compareMoney, paiseToRupees, rupeesToPaise, validateAmount } from '../src/utils/money.js';

describe('money utilities', () => {
  it('converts decimal rupee strings to exact integer paise', () => {
    assert.equal(rupeesToPaise('0'), 0);
    assert.equal(rupeesToPaise('1'), 100);
    assert.equal(rupeesToPaise('1.2'), 120);
    assert.equal(rupeesToPaise('125.50'), 12_550);
    assert.equal(rupeesToPaise(' 999.99 '), 99_999);
    assert.equal(rupeesToPaise(25), 2_500);
  });

  it('rejects floating-point and malformed rupee inputs', () => {
    assert.throws(() => rupeesToPaise(0.1), TypeError);
    assert.throws(() => rupeesToPaise('1.234'), TypeError);
    assert.throws(() => rupeesToPaise('-1.00'), TypeError);
    assert.throws(() => rupeesToPaise('01.00'), TypeError);
    assert.throws(() => rupeesToPaise('1,000.00'), TypeError);
    assert.throws(() => rupeesToPaise(null), TypeError);
  });

  it('rejects values above the supported ceiling', () => {
    const excessiveRupees = String(
      Math.floor(MONEY_LIMITS.MAX_MINOR_UNITS / MONEY_LIMITS.MINOR_UNITS_PER_RUPEE) + 1,
    );

    assert.throws(() => rupeesToPaise(excessiveRupees), RangeError);
  });

  it('formats paise as fixed two-decimal rupee strings', () => {
    assert.equal(paiseToRupees(0), '0.00');
    assert.equal(paiseToRupees(1), '0.01');
    assert.equal(paiseToRupees(120), '1.20');
    assert.equal(paiseToRupees(12_550), '125.50');
  });

  it('validates integer minor-unit amounts', () => {
    assert.equal(validateAmount(1), true);
    assert.equal(validateAmount(0), false);
    assert.equal(validateAmount(0, { allowZero: true }), true);
    assert.equal(validateAmount(-1), false);
    assert.equal(validateAmount(1.5), false);
    assert.equal(validateAmount('100'), false);
    assert.equal(validateAmount(Number.MAX_SAFE_INTEGER + 1), false);
    assert.equal(validateAmount(MONEY_LIMITS.MAX_MINOR_UNITS + 1), false);
  });

  it('compares valid minor-unit values without coercion', () => {
    assert.equal(compareMoney(100, 200), -1);
    assert.equal(compareMoney(200, 100), 1);
    assert.equal(compareMoney(100, 100), 0);
    assert.throws(() => compareMoney('100', 100), TypeError);
  });
});
