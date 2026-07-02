import mongoose from 'mongoose';
import { z } from 'zod';

import { Currency, MONEY_LIMITS } from '../constants/financial.constants.js';
import { validateAmount } from '../utils/money.js';

export const positivePaiseSchema = z
  .number()
  .int()
  .refine((value) => validateAmount(value), {
    message: `Amount must be between 1 and ${MONEY_LIMITS.MAX_MINOR_UNITS} paise`,
  });

export const nonNegativePaiseSchema = z
  .number()
  .int()
  .refine((value) => validateAmount(value, { allowZero: true }), {
    message: `Amount must be between 0 and ${MONEY_LIMITS.MAX_MINOR_UNITS} paise`,
  });

export const currencySchema = z.enum(Object.values(Currency));

export const mongoIdSchema = z
  .string()
  .trim()
  .refine((value) => mongoose.isObjectIdOrHexString(value), {
    message: 'Invalid MongoDB identifier',
  });

export const idempotencyKeySchema = z
  .string()
  .trim()
  .min(8)
  .max(128)
  .regex(/^[A-Za-z0-9._:-]+$/, 'Idempotency key contains unsupported characters');

export const requestHashSchema = z.string().regex(/^[a-f0-9]{64}$/, 'Invalid SHA-256 request hash');
