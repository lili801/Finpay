import { authConfig } from '../config/auth.js';
import { successResponse } from '../utils/api-response.js';

export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  register = async (request, response) => {
    console.log('Entered AuthController.register');
    const user = await this.authService.register(request.validated.body);
    response.status(201).json(
      successResponse({
        message: 'Registration successful. Check your email to verify your account.',
        data: { user },
      }),
    );
  };

  login = async (request, response) => {
    const result = await this.authService.login(request.validated.body);
    this.#setRefreshCookie(response, result.refreshToken);
    response.status(200).json(
      successResponse({
        message: 'Login successful',
        data: result,
      }),
    );
  };

  refresh = async (request, response) => {
    const refreshToken = this.#getRefreshToken(request);
    const tokens = await this.authService.refresh(refreshToken);
    this.#setRefreshCookie(response, tokens.refreshToken);
    response.status(200).json(
      successResponse({
        message: 'Tokens refreshed successfully',
        data: tokens,
      }),
    );
  };

  logout = async (request, response) => {
    await this.authService.logout(request.auth.userId);
    response.clearCookie(authConfig.refreshCookie.name, authConfig.refreshCookie.options);
    response.status(200).json(successResponse({ message: 'Logout successful' }));
  };

  me = async (request, response) => {
    response.status(200).json(
      successResponse({
        message: 'Profile retrieved successfully',
        data: { user: this.authService.getCurrentUser(request.auth.user) },
      }),
    );
  };

  verifyEmail = async (request, response) => {
    await this.authService.verifyEmail(request.validated.body);
    response.status(200).json(successResponse({ message: 'Email verified successfully' }));
  };

  resendOtp = async (request, response) => {
    await this.authService.resendOtp(request.validated.body);
    response
      .status(200)
      .json(
        successResponse({ message: 'A new verification code has been sent to your email.' }),
      );
  };

  forgotPassword = async (request, response) => {
    await this.authService.forgotPassword(request.validated.body.email);
    response.status(202).json(
      successResponse({
        message: 'If an account exists for that email, password reset instructions were sent.',
      }),
    );
  };

  resetPassword = async (request, response) => {
    await this.authService.resetPassword(request.validated.body);
    response.clearCookie(authConfig.refreshCookie.name, authConfig.refreshCookie.options);
    response.status(200).json(successResponse({ message: 'Password reset successfully' }));
  };

  #getRefreshToken(request, required = true) {
    const token =
      request.validated?.body?.refreshToken ?? request.cookies?.[authConfig.refreshCookie.name];

    if (!token && required) {
      return '';
    }

    return token;
  }

  #setRefreshCookie(response, refreshToken) {
    response.cookie(authConfig.refreshCookie.name, refreshToken, authConfig.refreshCookie.options);
  }
}
