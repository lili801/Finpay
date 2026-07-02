import winston from 'winston';

import { env } from './env.js';

const { combine, errors, json, timestamp, colorize, simple } = winston.format;

const selectedFormat =
  env.LOG_FORMAT === 'pretty'
    ? combine(colorize(), timestamp(), errors({ stack: true }), simple())
    : combine(timestamp(), errors({ stack: true }), json());

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  defaultMeta: {
    service: 'finpay-api',
    environment: env.NODE_ENV,
  },
  format: selectedFormat,
  transports: [new winston.transports.Console()],
  exitOnError: false,
});
