import { successResponse } from '../utils/api-response.js';

export class WalletController {
  constructor(walletService) {
    this.walletService = walletService;
  }

  getWallet = async (request, response) => {
    const wallet = await this.walletService.getWallet(request.auth.userId);
    response.status(200).json(
      successResponse({
        message: 'Wallet retrieved successfully',
        data: { wallet },
      }),
    );
  };

  getBalance = async (request, response) => {
    const balance = await this.walletService.getBalance(request.auth.userId);
    response.status(200).json(
      successResponse({
        message: 'Wallet balance retrieved successfully',
        data: { balance },
      }),
    );
  };
}
