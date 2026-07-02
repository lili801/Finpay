import { Router } from 'express';

import { container } from '../config/container.js';
import { WalletController } from '../controllers/wallet.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../utils/async-handler.js';

export function createWalletRouter() {
  const router = Router();
  const controller = new WalletController(container.walletService);

  router.get('/', authenticate, asyncHandler(controller.getWallet));
  router.get('/balance', authenticate, asyncHandler(controller.getBalance));

  return router;
}
