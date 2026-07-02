import { successResponse } from '../utils/api-response.js';

export class WalletController {
  constructor(walletService) {
    this.walletService = walletService;
  }

  addMoney = async (request, response) => {
    const result = await this.walletService.addMoney(request.auth.userId, request.validated.body.amount);
    response.status(200).json(
      successResponse({
        message: 'Money added to wallet successfully',
        data: result,
      }),
    );
  };

  transfer = async (request, response) => {
    const result = await this.walletService.transfer({
      senderUserId: request.auth.userId,
      receiverUserId: request.validated.body.receiverUserId,
      amountInPaise: request.validated.body.amount,
    });

    response.status(200).json(
      successResponse({
        message: 'Transfer completed successfully',
        data: result,
      }),
    );
  };

  getTransactions = async (request, response) => {
    const { transactions, pagination } = await this.walletService.getTransactionHistory(
      request.auth.userId,
      request.validated.query,
    );

    response.status(200).json(
      successResponse({
        message: 'Wallet transactions retrieved successfully',
        data: { transactions },
        meta: { pagination },
      }),
    );
  };

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
