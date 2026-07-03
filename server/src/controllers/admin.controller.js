import { successResponse } from '../utils/api-response.js';

export class AdminController {
  constructor(adminService) {
    this.adminService = adminService;
  }

  getSummary = async (_request, response) => {
    const summary = await this.adminService.getDashboardSummary();
    response.status(200).json(
      successResponse({
        message: 'Admin dashboard summary retrieved successfully',
        data: summary,
      }),
    );
  };

  listUsers = async (request, response) => {
    const { users, pagination } = await this.adminService.listUsers(request.validated.query);
    response.status(200).json(
      successResponse({
        message: 'Users retrieved successfully',
        data: { users },
        meta: { pagination },
      }),
    );
  };

  getUserDetails = async (request, response) => {
    const details = await this.adminService.getUserDetails(request.validated.params.userId);
    response.status(200).json(
      successResponse({
        message: 'User details retrieved successfully',
        data: details,
      }),
    );
  };

  getUserWallet = async (request, response) => {
    const wallet = await this.adminService.getUserWallet(request.validated.params.userId);
    response.status(200).json(
      successResponse({
        message: 'User wallet retrieved successfully',
        data: { wallet },
      }),
    );
  };

  getUserWalletBalance = async (request, response) => {
    const balance = await this.adminService.getUserWalletBalance(request.validated.params.userId);
    response.status(200).json(
      successResponse({
        message: 'User wallet balance retrieved successfully',
        data: { balance },
      }),
    );
  };

  getUserTransactionCount = async (request, response) => {
    const data = await this.adminService.getUserTransactionCount(request.validated.params.userId);
    response.status(200).json(
      successResponse({
        message: 'User transaction count retrieved successfully',
        data,
      }),
    );
  };

  freezeWallet = async (request, response) => {
    const wallet = await this.adminService.freezeWalletByUserId(request.validated.params.userId);
    response.status(200).json(
      successResponse({
        message: 'Wallet frozen successfully',
        data: { wallet },
      }),
    );
  };

  activateWallet = async (request, response) => {
    const wallet = await this.adminService.activateWalletByUserId(request.validated.params.userId);
    response.status(200).json(
      successResponse({
        message: 'Wallet activated successfully',
        data: { wallet },
      }),
    );
  };

  listTransactions = async (request, response) => {
    const { transactions, pagination } = await this.adminService.listTransactions(
      request.validated.query,
    );
    response.status(200).json(
      successResponse({
        message: 'Transactions retrieved successfully',
        data: { transactions },
        meta: { pagination },
      }),
    );
  };
}
