import { MONEY_LIMITS } from '../constants/financial.constants.js';

export function minorUnitField({ allowZero = false, immutable = false, defaultValue } = {}) {
  const minimum = allowZero ? 0 : 1;

  return {
    type: Number,
    required: true,
    min: minimum,
    max: MONEY_LIMITS.MAX_MINOR_UNITS,
    immutable,
    ...(defaultValue === undefined ? {} : { default: defaultValue }),
    validate: {
      validator: Number.isSafeInteger,
      message: 'Monetary values must be safe integers expressed in minor units',
    },
  };
}
