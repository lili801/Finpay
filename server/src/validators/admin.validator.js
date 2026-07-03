import { z } from 'zod';

import { mongoIdSchema } from './financial.validator.js';
import { TransactionStatus, TransactionType } from '../constants/financial.constants.js';

const paginationQueryNumber = ({ defaultValue, maxValue }) =>
  z.preprocess(
    (value) => (value === undefined ? defaultValue : value),
    z.coerce.number().int().min(1).max(maxValue),
  );

export const adminUserListSchema = z.object({
  query: z
    .object({
      page: paginationQueryNumber({ defaultValue: 1, maxValue: 10_000 }),
      limit: paginationQueryNumber({ defaultValue: 20, maxValue: 100 }),
      search: z.string().optional(),
    })
    .strict(),
});

export const adminUserIdParamSchema = z.object({
  params: z
    .object({
      userId: mongoIdSchema,
    })
    .strict(),
});

export const adminTransactionListSchema = z.object({
  query: z
    .object({
      page: paginationQueryNumber({ defaultValue: 1, maxValue: 10_000 }),
      limit: paginationQueryNumber({ defaultValue: 20, maxValue: 100 }),
      transactionId: z.string().optional(),
      status: z.enum(Object.values(TransactionStatus)).optional(),
      type: z.enum(Object.values(TransactionType)).optional(),
      userId: mongoIdSchema.optional(),
      date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (use YYYY-MM-DD)')
        .optional(),
      startDate: z
        .string()
        .datetime()
        .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
        .optional(),
      endDate: z
        .string()
        .datetime()
        .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
        .optional(),
    })
    .strict(),
});
