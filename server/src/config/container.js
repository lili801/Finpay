import { UserRepository } from '../repositories/user.repository.js';
import { TransactionRepository } from '../repositories/transaction.repository.js';
import { WalletRepository } from '../repositories/wallet.repository.js';
import { AuthService } from '../services/auth.service.js';
import { MockEmailService } from '../services/email.service.js';
import { WalletService } from '../services/wallet.service.js';
import { PasswordHasher } from '../utils/password-hasher.js';
import { TokenService } from '../utils/token-service.js';

const userRepository = new UserRepository();
const transactionRepository = new TransactionRepository();
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
    walletService: new WalletService({ walletRepository, userRepository, transactionRepository }),
  }),
  walletService: new WalletService({ walletRepository, userRepository, transactionRepository }),
  tokenService,
  userRepository,
  transactionRepository,
  walletRepository,
});
