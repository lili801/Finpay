console.log('[TRACE] Loading env.js');

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../../../.env");

console.log('====================================');
console.log('PART 1 — VERIFY ENVIRONMENT LOADING');
console.log('====================================');
console.log('1. process.cwd():', process.cwd());
console.log('2. Resolved .env absolute path:', envPath);

const dotenvResult = dotenv.config({ path: envPath });

console.log('3. dotenv.config() return value:', Object.keys(dotenvResult.parsed || {}).includes('SMTP_USER') ? 'Parsed successfully containing SMTP_USER' : (dotenvResult.error ? dotenvResult.error.message : 'Parsed successfully but no SMTP_USER'));

console.log('4. process.env.SMTP_USER:', process.env.SMTP_USER ? process.env.SMTP_USER.substring(0, 3) + '***' : 'Missing');
console.log('5. process.env.SMTP_PASS:', process.env.SMTP_PASS ? 'Loaded' : 'Missing');

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
    SMTP_HOST: z.string().trim().default('smtp.gmail.com'),
    SMTP_PORT: z.coerce.number().int().default(587),
    SMTP_SECURE: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
    SMTP_USER: z.string().trim().optional(),
    SMTP_PASS: z.string().trim().optional(),
    SMTP_FROM: z.string().trim().default('"FinPay" <noreply@finpay.com>'),
    USE_MOCK_EMAIL: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
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

console.log('8. environmentSchema.safeParse() success:', parsedEnvironment.success);
if (parsedEnvironment.success) {
  console.log('   Parsed output contains SMTP_USER:', !!parsedEnvironment.data.SMTP_USER);
}

if (!parsedEnvironment.success) {
  const details = z.prettifyError(parsedEnvironment.error);
  throw new Error(`Invalid environment configuration:\n${details}`);
}

export const env = Object.freeze(parsedEnvironment.data);

console.log('6. env.SMTP_USER:', env.SMTP_USER ? env.SMTP_USER.substring(0, 3) + '***' : 'Missing');
console.log('7. env.SMTP_PASS:', env.SMTP_PASS ? 'Loaded' : 'Missing');
console.log('9. Object.freeze(parsedEnvironment.data) contains SMTP_USER:', !!env.SMTP_USER);
console.log('--------------------------------\n');

