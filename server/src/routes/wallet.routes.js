import { Router } from 'express';

import { container } from '../config/container.js';
import { WalletController } from '../controllers/wallet.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/async-handler.js';
import { addMoneySchema, transferSchema } from '../validators/financial.validator.js';

export function createWalletRouter() {
  const router = Router();
  const controller = new WalletController(container.walletService);

  router.post('/add-money', authenticate, validate(addMoneySchema), asyncHandler(controller.addMoney));
  router.post('/transfer', authenticate, validate(transferSchema), asyncHandler(controller.transfer));
  router.get('/', authenticate, asyncHandler(controller.getWallet));
  router.get('/balance', authenticate, asyncHandler(controller.getBalance));

  return router;
}
