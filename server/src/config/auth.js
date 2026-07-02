import { env } from './env.js';

const durationPattern = /^(\d+)([smhd])$/;
const durationMultipliers = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

export function durationToMilliseconds(duration) {
  const [, amount, unit] = duration.match(durationPattern);
  return Number(amount) * durationMultipliers[unit];
}

export const authConfig = Object.freeze({
  accessTokenTtl: env.ACCESS_TOKEN_TTL,
  refreshTokenTtl: env.REFRESH_TOKEN_TTL,
  issuer: env.JWT_ISSUER,
  audience: env.JWT_AUDIENCE,
  refreshCookie: {
    name: env.AUTH_COOKIE_NAME,
    options: {
      httpOnly: true,
      secure: env.AUTH_COOKIE_SECURE,
      sameSite: 'strict',
      path: '/api/v1/auth',
      maxAge: durationToMilliseconds(env.REFRESH_TOKEN_TTL),
    },
  },
});
