import mongoose from 'mongoose';
import { z } from 'zod';

import { Currency, MONEY_LIMITS } from '../constants/financial.constants.js';
import { rupeesToPaise, validateAmount } from '../utils/money.js';

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

export const addMoneyAmountSchema = z
  .union([z.string().trim().min(1), z.number().int()])
  .superRefine((value, context) => {
    try {
      const paise = rupeesToPaise(value);
      if (paise < 100 || paise > 10_000_000) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Amount must be between ₹1 and ₹100,000',
        });
      }
    } catch {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Amount must be a valid rupee amount',
      });
    }
  })
  .transform((value) => rupeesToPaise(value));

export const addMoneySchema = z.object({
  body: z
    .object({
      amount: addMoneyAmountSchema,
    })
    .strict(),
});

export const transferAmountSchema = z
  .union([z.string().trim().min(1), z.number().int()])
  .superRefine((value, context) => {
    try {
      const paise = rupeesToPaise(value);
      if (!validateAmount(paise)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Amount must be between 1 and ${MONEY_LIMITS.MAX_MINOR_UNITS} paise`,
        });
      }
    } catch {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Amount must be a valid rupee amount',
      });
    }
  })
  .transform((value) => rupeesToPaise(value));

export const transferSchema = z.object({
  body: z
    .object({
      receiverUserId: mongoIdSchema,
      amount: transferAmountSchema,
    })
    .strict(),
});
