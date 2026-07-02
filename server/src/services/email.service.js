import { logger } from '../config/logger.js';

export class MockEmailService {
  async sendEmailVerification({ email, verificationUrl }) {
    logger.info('Email verification delivery mocked', {
      event: 'auth.email_verification.requested',
      email,
      verificationUrlConfigured: Boolean(verificationUrl),
    });
  }

  async sendPasswordReset({ email, resetUrl }) {
    logger.info('Password reset delivery mocked', {
      event: 'auth.password_reset.requested',
      email,
      resetUrlConfigured: Boolean(resetUrl),
    });
  }
}
