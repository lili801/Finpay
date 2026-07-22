console.log('[TRACE] Loading container.js');
import { UserRepository } from '../repositories/user.repository.js';
import { NotificationRepository } from '../repositories/notification.repository.js';
import { TransactionRepository } from '../repositories/transaction.repository.js';
import { WalletRepository } from '../repositories/wallet.repository.js';
import { AuthService } from '../services/auth.service.js';
import { NodemailerEmailService, MockEmailService } from '../services/email.service.js';
import { NotificationService } from '../services/notification.service.js';
import { WalletService } from '../services/wallet.service.js';
import { PasswordHasher } from '../utils/password-hasher.js';
import { TokenService } from '../utils/token-service.js';
import { AdminRepository } from '../repositories/admin.repository.js';
import { AdminService } from '../services/admin.service.js';
import { env } from './env.js';

const userRepository = new UserRepository();
const notificationRepository = new NotificationRepository();
const transactionRepository = new TransactionRepository();
const walletRepository = new WalletRepository();
const passwordHasher = new PasswordHasher();
const tokenService = new TokenService();
const emailService = env.USE_MOCK_EMAIL ? new MockEmailService() : new NodemailerEmailService();

console.log('====================================');
console.log('PART 2 — VERIFY DEPENDENCY INJECTION');
console.log('====================================');
console.log(`✅ ${emailService.constructor.name} Loaded`);
console.log('--------------------------------\n');
const notificationService = new NotificationService({ notificationRepository });
const adminRepository = new AdminRepository();
const adminService = new AdminService({ adminRepository });

export const container = Object.freeze({
  authService: new AuthService({
    userRepository,
    passwordHasher,
    tokenService,
    emailService,
    walletService: new WalletService({
      walletRepository,
      userRepository,
      transactionRepository,
      notificationService,
    }),
  }),
  walletService: new WalletService({
    walletRepository,
    userRepository,
    transactionRepository,
    notificationService,
  }),
  notificationService,
  tokenService,
  userRepository,
  notificationRepository,
  transactionRepository,
  walletRepository,
  adminRepository,
  adminService,
});
