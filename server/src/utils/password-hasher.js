import bcrypt from 'bcrypt';

import { env } from '../config/env.js';

export class PasswordHasher {
  async hash(value) {
    return bcrypt.hash(value, env.BCRYPT_ROUNDS);
  }

  async compare(value, hash) {
    return bcrypt.compare(value, hash);
  }
}
