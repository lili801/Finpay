import { logger } from '../config/logger.js';

export class MockEmailService {
  async sendEmailVerification({ email, verificationUrl }) {
    console.log('Inside MockEmailService.sendEmailVerification');
    logger.info('Email verification delivery mocked', {
      event: 'auth.email_verification.requested',
      email,
      verificationUrl,
    });
  }

  async sendPasswordReset({ email, resetUrl }) {
    logger.info('Password reset delivery mocked', {
      event: 'auth.password_reset.requested',
      email,
      resetUrl,
    });
  }
}
