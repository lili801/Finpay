export class FakePasswordHasher {
  async hash(value) {
    return `password-hash:${value}`;
  }

  async compare(value, hash) {
    return hash === `password-hash:${value}`;
  }
}

export class FakeTokenService {
  constructor() {
    this.sequence = 0;
    this.refreshPayloads = new Map();
    this.emailVerificationPayloads = new Map();
  }

  createOpaqueToken() {
    return `opaque-token-${++this.sequence}`;
  }

  createEmailVerificationToken(email) {
    const token = `email-verification-token:${email}:${++this.sequence}`;
    this.emailVerificationPayloads.set(token, { type: 'email_verification', email });
    return token;
  }

  hashToken(value) {
    return `token-hash:${value}`;
  }

  createAccessToken(user) {
    return `access-token:${user.id}:${++this.sequence}`;
  }

  createRefreshToken(user) {
    const token = `refresh-token:${user.id}:${++this.sequence}`;
    this.refreshPayloads.set(token, { sub: user.id, type: 'refresh' });
    return token;
  }

  verifyRefreshToken(token) {
    const payload = this.refreshPayloads.get(token);
    if (!payload) {
      throw new Error('Invalid token');
    }
    return payload;
  }

  verifyEmailVerificationToken(token) {
    const payload = this.emailVerificationPayloads.get(token);
    if (!payload) {
      throw new Error('Invalid token');
    }
    return payload;
  }
}

export class FakeEmailService {
  verificationMessages = [];
  passwordResetMessages = [];

  async sendEmailVerification(message) {
    this.verificationMessages.push(message);
  }

  async sendPasswordReset(message) {
    this.passwordResetMessages.push(message);
  }
}
