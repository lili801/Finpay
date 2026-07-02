import { UserRepository } from '../repositories/user.repository.js';
import { WalletRepository } from '../repositories/wallet.repository.js';
import { AuthService } from '../services/auth.service.js';
import { MockEmailService } from '../services/email.service.js';
import { WalletService } from '../services/wallet.service.js';
import { PasswordHasher } from '../utils/password-hasher.js';
import { TokenService } from '../utils/token-service.js';

const userRepository = new UserRepository();
const walletRepository = new WalletRepository();
const passwordHasher = new PasswordHasher();
const tokenService = new TokenService();
const emailService = new MockEmailService();

export const container = Object.freeze({
  authService: new AuthService({
    userRepository,
    passwordHasher,
    tokenService,
    emailService,
    walletService: new WalletService({ walletRepository }),
  }),
  walletService: new WalletService({ walletRepository }),
  tokenService,
  userRepository,
  walletRepository,
});
