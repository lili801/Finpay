import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { AppError } from '../utils/app-error.js';

const INVALID_CREDENTIALS = Object.freeze({
  statusCode: 401,
  code: 'INVALID_CREDENTIALS',
});

export class AuthService {
  constructor({ userRepository, passwordHasher, tokenService, emailService, walletService }) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.tokenService = tokenService;
    this.emailService = emailService;
    this.walletService = walletService;
  }

  async register({ firstName, lastName, username, email, password }) {
    const conflict = await this.userRepository.findIdentityConflict({ email, username });

    if (conflict) {
      const field = conflict.email === email ? 'email' : 'username';
      throw new AppError(`An account with that ${field} already exists`, {
        statusCode: 409,
        code: `${field.toUpperCase()}_ALREADY_EXISTS`,
      });
    }

    const verificationToken = this.tokenService.createEmailVerificationToken(email);
    const passwordHash = await this.passwordHasher.hash(password);

    let user;
    try {
      user = await this.userRepository.create({
        firstName,
        lastName,
        username,
        email,
        password: passwordHash,
        emailVerificationTokenHash: this.tokenService.hashToken(verificationToken),
      });
    } catch (error) {
      if (error?.code === 11000) {
        throw new AppError('An account with that email or username already exists', {
          statusCode: 409,
          code: 'IDENTITY_ALREADY_EXISTS',
        });
      }
      throw error;
    }

    await this.#deliverVerificationEmail(user, verificationToken);
    if (this.walletService) {
      await this.walletService.getOrCreateWalletForUser(user.id);
    }

    logger.info('User registered', {
      event: 'auth.registration.succeeded',
      userId: user.id,
    });

    return this.#publicUser(user);
  }

  async login({ identifier, password }) {
    const user = await this.userRepository.findByIdentifier(identifier);
    const passwordMatches = user
      ? await this.passwordHasher.compare(password, user.password)
      : false;

    if (!user || !passwordMatches) {
      logger.warn('Login failed', {
        event: 'auth.login.failed',
        reason: 'invalid_credentials',
      });
      throw new AppError('Invalid username, email, or password', INVALID_CREDENTIALS);
    }

    if (!user.isEmailVerified) {
      logger.warn('Login failed', {
        event: 'auth.login.failed',
        reason: 'email_not_verified',
        userId: user.id,
      });
      throw new AppError('Verify your email address before signing in', {
        statusCode: 403,
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    const tokens = await this.#issueTokens(user);

    logger.info('User logged in', {
      event: 'auth.login.succeeded',
      userId: user.id,
    });

    return { user: this.#publicUser(user), ...tokens };
  }

  async refresh(refreshToken) {
    const payload = this.#verifyRefreshToken(refreshToken);
    const user = await this.userRepository.findByIdWithSecrets(payload.sub);

    if (!user || payload.type !== 'refresh') {
      throw this.#invalidRefreshToken();
    }

    const currentHash = this.tokenService.hashToken(refreshToken);
    const nextRefreshToken = this.tokenService.createRefreshToken(user);
    const nextHash = this.tokenService.hashToken(nextRefreshToken);
    const rotatedUser = await this.userRepository.rotateRefreshTokenHash(
      user.id,
      currentHash,
      nextHash,
    );

    if (!rotatedUser) {
      logger.warn('Refresh token reuse rejected', {
        event: 'auth.refresh.failed',
        userId: user.id,
      });
      throw this.#invalidRefreshToken();
    }

    logger.info('Refresh token rotated', {
      event: 'auth.refresh.succeeded',
      userId: user.id,
    });

    return {
      accessToken: this.tokenService.createAccessToken(user),
      refreshToken: nextRefreshToken,
    };
  }

  async logout(userId) {
    await this.userRepository.clearRefreshTokenHash(userId);

    logger.info('User logged out', {
      event: 'auth.logout.succeeded',
      userId,
    });
  }

  getCurrentUser(user) {
    return this.#publicUser(user);
  }

  async verifyEmail(token) {
    try {
      const payload = this.tokenService.verifyEmailVerificationToken(token);
      if (payload.type !== 'email_verification') {
        throw new Error('Unexpected token type');
      }
    } catch {
      throw new AppError('Verification token is invalid or expired', {
        statusCode: 400,
        code: 'INVALID_VERIFICATION_TOKEN',
      });
    }

    const tokenHash = this.tokenService.hashToken(token);
    const user = await this.userRepository.findByVerificationTokenHash(tokenHash);

    if (!user) {
      throw new AppError('Verification token is invalid or has already been used', {
        statusCode: 400,
        code: 'INVALID_VERIFICATION_TOKEN',
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationTokenHash = undefined;
    await this.userRepository.save(user);

    logger.info('Email verified', {
      event: 'auth.email_verification.succeeded',
      userId: user.id,
    });
  }

  async forgotPassword(email) {
    const user = await this.userRepository.findByIdentifier(email);

    if (user) {
      const resetToken = this.tokenService.createOpaqueToken();
      user.passwordResetTokenHash = this.tokenService.hashToken(resetToken);
      user.passwordResetExpiresAt = new Date(Date.now() + env.PASSWORD_RESET_TTL_MINUTES * 60_000);
      await this.userRepository.save(user);
      await this.#deliverPasswordResetEmail(user, resetToken);

      logger.info('Password reset requested', {
        event: 'auth.password_reset.requested',
        userId: user.id,
      });
    } else {
      logger.info('Password reset requested for unknown identity', {
        event: 'auth.password_reset.unknown_identity',
      });
    }
  }

  async resetPassword({ token, password }) {
    const tokenHash = this.tokenService.hashToken(token);
    const user = await this.userRepository.findByValidPasswordResetToken(tokenHash, new Date());

    if (!user) {
      throw new AppError('Password reset token is invalid or expired', {
        statusCode: 400,
        code: 'INVALID_PASSWORD_RESET_TOKEN',
      });
    }

    user.password = await this.passwordHasher.hash(password);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    user.refreshTokenHash = undefined;
    await this.userRepository.save(user);

    logger.info('Password reset completed', {
      event: 'auth.password_reset.succeeded',
      userId: user.id,
    });
  }

  async #issueTokens(user) {
    const accessToken = this.tokenService.createAccessToken(user);
    const refreshToken = this.tokenService.createRefreshToken(user);
    await this.userRepository.updateRefreshTokenHash(
      user.id,
      this.tokenService.hashToken(refreshToken),
    );
    return { accessToken, refreshToken };
  }

  #verifyRefreshToken(refreshToken) {
    try {
      return this.tokenService.verifyRefreshToken(refreshToken);
    } catch {
      throw this.#invalidRefreshToken();
    }
  }

  #invalidRefreshToken() {
    return new AppError('Refresh token is invalid, expired, or has already been used', {
      statusCode: 401,
      code: 'INVALID_REFRESH_TOKEN',
    });
  }

  async #deliverVerificationEmail(user, token) {
    const verificationUrl = `${env.PUBLIC_APP_URL}/verify-email?token=${encodeURIComponent(token)}`;
    try {
      await this.emailService.sendEmailVerification({ email: user.email, verificationUrl });
    } catch (error) {
      logger.error('Verification email delivery failed', {
        event: 'auth.email_verification.delivery_failed',
        userId: user.id,
        error,
      });
    }
  }

  async #deliverPasswordResetEmail(user, token) {
    const resetUrl = `${env.PUBLIC_APP_URL}/reset-password?token=${encodeURIComponent(token)}`;
    try {
      await this.emailService.sendPasswordReset({ email: user.email, resetUrl });
    } catch (error) {
      logger.error('Password reset email delivery failed', {
        event: 'auth.password_reset.delivery_failed',
        userId: user.id,
        error,
      });
    }
  }

  #publicUser(user) {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      profileImage: user.profileImage ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
