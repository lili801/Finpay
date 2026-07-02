import { z } from 'zod';

import { mongoIdSchema } from './financial.validator.js';

const paginationQueryNumber = ({ defaultValue, maxValue }) =>
  z.preprocess(
    (value) => (value === undefined ? defaultValue : value),
    z.coerce.number().int().min(1).max(maxValue),
  );

export const notificationListSchema = z.object({
  query: z
    .object({
      page: paginationQueryNumber({ defaultValue: 1, maxValue: 10_000 }),
      limit: paginationQueryNumber({ defaultValue: 20, maxValue: 100 }),
    })
    .strict(),
});

export const notificationIdSchema = z.object({
  params: z
    .object({
      notificationId: mongoIdSchema,
    })
    .strict(),
});
