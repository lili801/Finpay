import { env } from '../config/env.js';
import { financialSchemas } from './financial.schemas.js';

const errorResponse = {
  description: 'Request failed',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/ErrorResponse' },
    },
  },
};

export const openApiSpecification = {
  openapi: '3.1.0',
  info: {
    title: 'FinPay API',
    version: '0.3.0',
    description:
      'Authentication API and financial domain contracts for the FinPay payment platform.',
  },
  servers: [{ url: `http://localhost:${env.PORT}/api/v1`, description: 'Local API' }],
  tags: [{ name: 'Authentication' }, { name: 'Wallets' }, { name: 'Notifications' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      refreshCookie: {
        type: 'apiKey',
        in: 'cookie',
        name: env.AUTH_COOKIE_NAME,
      },
    },
    schemas: {
      ...financialSchemas,
      User: {
        type: 'object',
        required: ['id', 'firstName', 'lastName', 'username', 'email', 'role'],
        properties: {
          id: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          username: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['USER', 'ADMIN'] },
          isEmailVerified: { type: 'boolean' },
          profileImage: { type: ['string', 'null'], format: 'uri' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', const: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              details: {},
            },
          },
          requestId: { type: 'string', format: 'uuid' },
        },
      },
      Notification: {
        type: 'object',
        required: ['id', 'title', 'message', 'type', 'status', 'createdAt'],
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          message: { type: 'string' },
          type: {
            type: 'string',
            enum: ['TOP_UP', 'TRANSFER_SENT', 'TRANSFER_RECEIVED'],
          },
          status: { type: 'string', enum: ['PENDING', 'SENT', 'READ', 'FAILED'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: [
                  'firstName',
                  'lastName',
                  'username',
                  'email',
                  'password',
                  'confirmPassword',
                ],
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  username: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password' },
                  confirmPassword: { type: 'string', format: 'password' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Registered' }, 409: errorResponse, 422: errorResponse },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login with username or email',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['identifier', 'password'],
                properties: {
                  identifier: { type: 'string' },
                  password: { type: 'string', format: 'password' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Authenticated' },
          401: errorResponse,
          403: errorResponse,
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Authentication'],
        summary: 'Rotate refresh token',
        security: [{ refreshCookie: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { refreshToken: { type: 'string' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Tokens rotated' }, 401: errorResponse },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Invalidate the active refresh token',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Logged out' }, 401: errorResponse },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get the authenticated user',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Current user' }, 401: errorResponse },
      },
    },
    '/auth/verify-email': {
      post: {
        tags: ['Authentication'],
        summary: 'Verify an email address',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token'],
                properties: { token: { type: 'string' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Email verified' }, 400: errorResponse },
      },
    },
    '/auth/forgot-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Request password reset instructions',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: { email: { type: 'string', format: 'email' } },
              },
            },
          },
        },
        responses: { 202: { description: 'Request accepted' }, 422: errorResponse },
      },
    },
    '/auth/reset-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Reset a password with an opaque token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'password', 'confirmPassword'],
                properties: {
                  token: { type: 'string' },
                  password: { type: 'string', format: 'password' },
                  confirmPassword: { type: 'string', format: 'password' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Password reset' }, 400: errorResponse },
      },
    },
    '/wallet/add-money': {
      post: {
        tags: ['Wallets'],
        summary: 'Add money to the authenticated wallet',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount'],
                properties: { amount: { type: ['string', 'integer'] } },
              },
            },
          },
        },
        responses: { 200: { description: 'Money added' }, 401: errorResponse, 422: errorResponse },
      },
    },
    '/wallet/transfer': {
      post: {
        tags: ['Wallets'],
        summary: 'Transfer money to another user wallet',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['receiverUserId', 'amount'],
                properties: {
                  receiverUserId: { type: 'string' },
                  amount: { type: ['string', 'integer'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Transfer completed' },
          400: errorResponse,
          401: errorResponse,
          404: errorResponse,
          422: errorResponse,
        },
      },
    },
    '/wallet/transactions': {
      get: {
        tags: ['Wallets'],
        summary: 'List authenticated wallet transactions',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          },
        ],
        responses: {
          200: { description: 'Wallet transactions retrieved' },
          401: errorResponse,
          404: errorResponse,
          422: errorResponse,
        },
      },
    },
    '/wallet': {
      get: {
        tags: ['Wallets'],
        summary: 'Get the authenticated wallet',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Wallet retrieved' }, 401: errorResponse, 404: errorResponse },
      },
    },
    '/wallet/balance': {
      get: {
        tags: ['Wallets'],
        summary: 'Get the authenticated wallet balance',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Wallet balance retrieved' }, 401: errorResponse, 404: errorResponse },
      },
    },
    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'List authenticated user notifications',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          },
        ],
        responses: {
          200: { description: 'Notifications retrieved' },
          401: errorResponse,
          422: errorResponse,
        },
      },
    },
    '/notifications/unread-count': {
      get: {
        tags: ['Notifications'],
        summary: 'Get unread notification count',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Unread notification count retrieved' },
          401: errorResponse,
        },
      },
    },
    '/notifications/{notificationId}/read': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark one notification as read',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'notificationId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Notification marked as read' },
          401: errorResponse,
          404: errorResponse,
          422: errorResponse,
        },
      },
    },
    '/notifications/read-all': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark all notifications as read',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Notifications marked as read' },
          401: errorResponse,
        },
      },
    },
  },
};
