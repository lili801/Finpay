import { container } from '../config/container.js';
import { AppError } from '../utils/app-error.js';

export async function authenticate(request, _response, next) {
  try {
    const authorizationHeader = request.get('authorization');
    const [scheme, token] = authorizationHeader?.split(' ') ?? [];

    if (scheme !== 'Bearer' || !token) {
      throw new AppError('Authentication is required', {
        statusCode: 401,
        code: 'AUTHENTICATION_REQUIRED',
      });
    }

    const payload = container.tokenService.verifyAccessToken(token);

    if (payload.type !== 'access') {
      throw new Error('Unexpected token type');
    }

    const user = await container.userRepository.findById(payload.sub);

    if (!user) {
      throw new Error('Token subject no longer exists');
    }

    request.auth = {
      user,
      userId: user.id,
      role: user.role,
    };
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(
      new AppError('Access token is invalid or expired', {
        statusCode: 401,
        code: 'INVALID_ACCESS_TOKEN',
      }),
    );
  }
}
