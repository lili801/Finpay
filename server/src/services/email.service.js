console.log('[TRACE] Loading email.service.js');
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export class NodemailerEmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: (env.SMTP_USER && env.SMTP_PASS) ? {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      } : undefined,
    });
    
    console.log('\n====================================');
    console.log('PART 3 — SMTP CONNECTION TEST');
    console.log('====================================');
    this.transporter.verify((error, success) => {
      if (error) {
        console.error("❌ SMTP Connection Failed");
        console.error(error);
      } else {
        console.log("✅ SMTP Connection Successful");
      }
      console.log('--------------------------------\n');
    });
  }

  async sendEmailVerification({ email, otp }) {
    console.log('\n====================================');
    console.log('PART 4 — EMAIL DELIVERY TEST');
    console.log('====================================');
    console.log(`Sending OTP to:\n${email}`);
    console.log(`\nOTP:\n${otp}`);
    
    logger.info('Sending email verification via SMTP', {
      event: 'auth.email_verification.sending',
      email,
    });

    const mailOptions = {
      from: env.SMTP_FROM,
      to: email,
      subject: 'FinPay - Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #4F46E5; margin-bottom: 16px;">Verify Your FinPay Account</h2>
          <p>Thank you for signing up for FinPay. Please use the following 6-digit One-Time Password (OTP) to complete your registration:</p>
          <div style="background-color: #F3F4F6; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #111827;">${otp}</span>
          </div>
          <p>This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #6B7280; text-align: center;">&copy; FinPay. All rights reserved.</p>
        </div>
      `,
      text: `Your FinPay verification OTP is: ${otp}. This code expires in 10 minutes.`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('\n✅ Email sent successfully');
      console.log('Message ID:\n' + info.messageId);
      console.log('\nAccepted recipients:\n' + (info.accepted?.join(', ') || 'None'));
      console.log('\nRejected recipients:\n' + (info.rejected?.join(', ') || 'None'));
      console.log('\nSMTP response:\n' + info.response);
      console.log('--------------------------------\n');
      
      logger.info('Email verification delivered', {
        event: 'auth.email_verification.sent',
        email,
        messageId: info.messageId,
      });
      return info;
    } catch (error) {
      console.log('\n❌ Delivery failure');
      console.error(error);
      console.log('--------------------------------\n');
      
      logger.error('Nodemailer SMTP transport error', {
        event: 'auth.email_verification.failed',
        email,
        error: error.message,
      });
      throw error;
    }
  }

  async sendPasswordReset({ email, resetUrl }) {
    logger.info('Sending password reset email via SMTP', {
      event: 'auth.password_reset.sending',
      email,
    });

    const mailOptions = {
      from: env.SMTP_FROM,
      to: email,
      subject: 'FinPay - Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #4F46E5; margin-bottom: 16px;">Reset Your Password</h2>
          <p>You requested a password reset for your FinPay account. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p>If you did not request a password reset, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #6B7280; text-align: center;">&copy; FinPay. All rights reserved.</p>
        </div>
      `,
      text: `Reset your password by following this link: ${resetUrl}`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info('Password reset email delivered', {
        event: 'auth.password_reset.sent',
        email,
        messageId: info.messageId,
      });
      return info;
    } catch (error) {
      logger.error('Nodemailer SMTP transport error', {
        event: 'auth.password_reset.failed',
        email,
        error: error.message,
      });
      throw error;
    }
  }
}

export class MockEmailService {
  async sendEmailVerification({ email, otp }) {
    console.log('Inside MockEmailService.sendEmailVerification');
    logger.info('Email verification delivery mocked', {
      event: 'auth.email_verification.requested',
      email,
      otp,
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

