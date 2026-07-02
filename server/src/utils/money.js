import { MONEY_LIMITS } from '../constants/financial.constants.js';

const RUPEE_PATTERN = /^(0|[1-9]\d*)(?:\.(\d{1,2}))?$/;

export function validateAmount(
  amount,
  { allowZero = false, max = MONEY_LIMITS.MAX_MINOR_UNITS } = {},
) {
  return (
    typeof amount === 'number' &&
    Number.isSafeInteger(amount) &&
    amount <= max &&
    (allowZero ? amount >= 0 : amount > 0)
  );
}

export function rupeesToPaise(rupees) {
  if (typeof rupees === 'number') {
    if (!Number.isSafeInteger(rupees) || rupees < 0) {
      throw new TypeError('Rupee numbers must be non-negative safe integers');
    }
    return ensureValidPaise(BigInt(rupees) * BigInt(MONEY_LIMITS.MINOR_UNITS_PER_RUPEE));
  }

  if (typeof rupees !== 'string') {
    throw new TypeError('Rupees must be supplied as a decimal string or whole-number integer');
  }

  const normalizedRupees = rupees.trim();
  const match = RUPEE_PATTERN.exec(normalizedRupees);

  if (!match) {
    throw new TypeError('Rupees must be a non-negative decimal with no more than two places');
  }

  const wholeRupees = BigInt(match[1]);
  const fractionalPaise = BigInt((match[2] ?? '').padEnd(2, '0') || '0');
  const paise = wholeRupees * BigInt(MONEY_LIMITS.MINOR_UNITS_PER_RUPEE) + fractionalPaise;

  return ensureValidPaise(paise);
}

export function paiseToRupees(paise) {
  assertValidPaise(paise, true);

  const wholeRupees = Math.floor(paise / MONEY_LIMITS.MINOR_UNITS_PER_RUPEE);
  const fractionalPaise = paise % MONEY_LIMITS.MINOR_UNITS_PER_RUPEE;

  return `${wholeRupees}.${String(fractionalPaise).padStart(2, '0')}`;
}

export function compareMoney(leftPaise, rightPaise) {
  assertValidPaise(leftPaise, true);
  assertValidPaise(rightPaise, true);

  if (leftPaise === rightPaise) {
    return 0;
  }

  return leftPaise < rightPaise ? -1 : 1;
}

function ensureValidPaise(paise) {
  if (paise > BigInt(MONEY_LIMITS.MAX_MINOR_UNITS)) {
    throw new RangeError('Amount exceeds the supported monetary limit');
  }

  return Number(paise);
}

function assertValidPaise(paise, allowZero) {
  if (!validateAmount(paise, { allowZero })) {
    throw new TypeError('Paise must be a supported non-negative safe integer');
  }
}
