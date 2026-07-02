import { createHash, randomBytes } from 'node:crypto';

import jwt from 'jsonwebtoken';

import { authConfig } from '../config/auth.js';
import { env } from '../config/env.js';

export class TokenService {
  createAccessToken(user) {
    return jwt.sign(
      { role: user.role, type: 'access' },
      env.JWT_ACCESS_SECRET,
      this.#signOptions(user.id, authConfig.accessTokenTtl, 'finpay-access'),
    );
  }

  createRefreshToken(user) {
    return jwt.sign(
      { type: 'refresh' },
      env.JWT_REFRESH_SECRET,
      this.#signOptions(user.id, authConfig.refreshTokenTtl, 'finpay-refresh'),
    );
  }

  createEmailVerificationToken(email) {
    return jwt.sign({ type: 'email_verification', email }, env.JWT_ACCESS_SECRET, {
      algorithm: 'HS256',
      issuer: authConfig.issuer,
      audience: authConfig.audience,
      expiresIn: env.EMAIL_VERIFICATION_TOKEN_TTL,
      jwtid: `finpay-email-${randomBytes(16).toString('hex')}`,
    });
  }

  verifyAccessToken(token) {
    return jwt.verify(token, env.JWT_ACCESS_SECRET, {
      issuer: authConfig.issuer,
      audience: authConfig.audience,
      algorithms: ['HS256'],
    });
  }

  verifyRefreshToken(token) {
    return jwt.verify(token, env.JWT_REFRESH_SECRET, {
      issuer: authConfig.issuer,
      audience: authConfig.audience,
      algorithms: ['HS256'],
    });
  }

  verifyEmailVerificationToken(token) {
    return jwt.verify(token, env.JWT_ACCESS_SECRET, {
      issuer: authConfig.issuer,
      audience: authConfig.audience,
      algorithms: ['HS256'],
    });
  }

  createOpaqueToken() {
    return randomBytes(32).toString('base64url');
  }

  hashToken(token) {
    return createHash('sha256').update(token).digest('hex');
  }

  #signOptions(userId, expiresIn, jwtIdPrefix) {
    return {
      algorithm: 'HS256',
      subject: userId.toString(),
      issuer: authConfig.issuer,
      audience: authConfig.audience,
      expiresIn,
      jwtid: `${jwtIdPrefix}-${randomBytes(16).toString('hex')}`,
    };
  }
}
