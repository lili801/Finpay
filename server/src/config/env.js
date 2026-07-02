import 'dotenv/config';
import { z } from 'zod';

const environmentSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    HOST: z.string().trim().min(1).default('0.0.0.0'),
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
    LOG_FORMAT: z.enum(['json', 'pretty']).default('json'),
    CORS_ORIGINS: z
      .string()
      .default('http://localhost:5173')
      .transform((value) =>
        value
          .split(',')
          .map((origin) => origin.trim())
          .filter(Boolean),
      ),
    SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
    MONGODB_URI: z.string().trim().min(1).default('mongodb://127.0.0.1:27017/finpay'),
    JWT_ACCESS_SECRET: z.string().min(32).default('development-access-secret-change-me-now'),
    JWT_REFRESH_SECRET: z.string().min(32).default('development-refresh-secret-change-me-now'),
    JWT_ISSUER: z.string().trim().min(1).default('finpay-api'),
    JWT_AUDIENCE: z.string().trim().min(1).default('finpay-client'),
    ACCESS_TOKEN_TTL: z
      .string()
      .regex(/^\d+[smhd]$/)
      .default('15m'),
    REFRESH_TOKEN_TTL: z
      .string()
      .regex(/^\d+[smhd]$/)
      .default('7d'),
    EMAIL_VERIFICATION_TOKEN_TTL: z
      .string()
      .regex(/^\d+[smhd]$/)
      .default('24h'),
    BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
    PASSWORD_RESET_TTL_MINUTES: z.coerce.number().int().positive().default(15),
    AUTH_COOKIE_NAME: z.string().trim().min(1).default('finpay_refresh'),
    AUTH_COOKIE_SECURE: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
    PUBLIC_APP_URL: z.url().default('http://localhost:5173'),
  })
  .superRefine((value, context) => {
    if (value.NODE_ENV !== 'production') {
      return;
    }

    const developmentSecrets = [
      'development-access-secret-change-me-now',
      'development-refresh-secret-change-me-now',
    ];

    if (
      developmentSecrets.includes(value.JWT_ACCESS_SECRET) ||
      developmentSecrets.includes(value.JWT_REFRESH_SECRET)
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Production JWT secrets must be explicitly configured',
        path: ['JWT_ACCESS_SECRET'],
      });
    }
  });

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  const details = z.prettifyError(parsedEnvironment.error);
  throw new Error(`Invalid environment configuration:\n${details}`);
}

export const env = Object.freeze(parsedEnvironment.data);
