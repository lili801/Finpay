# FinPay

FinPay is a production-oriented payment platform built as a Node.js monorepo.

## Current scope

Increment 3 provides production-oriented registration, email verification, login, JWT access and
rotating refresh tokens, logout, authenticated profiles, forgot-password, and password-reset
workflows. MongoDB persistence, bcrypt hashing, Zod validation, structured security events, and
OpenAPI documentation are included. It also defines the financial domain contracts, schemas, and
money value utilities that future wallet and payment features will use.

Wallet and payment APIs, repositories, queue processing, Redis, and balance mutation logic remain
intentionally deferred.

## Requirements

- Node.js 22 or newer
- npm 10 or newer
- Docker with Docker Compose (optional for this increment)
- MongoDB 8

## Local development

```bash
npm install
cp server/.env.example server/.env
npm run start --workspace server
```

Generate independent JWT secrets with a password manager or cryptographically secure random
generator before running in production. Development defaults are accepted locally but explicitly
rejected when `NODE_ENV=production`.

To run MongoDB with Docker while developing the API locally:

```bash
docker compose up -d mongo
npm run dev
```

The API listens on `http://localhost:4000` by default.

## Authentication API

| Method | Path                           | Authentication | Purpose                         |
| ------ | ------------------------------ | -------------- | ------------------------------- |
| POST   | `/api/v1/auth/register`        | Public         | Create an unverified account    |
| POST   | `/api/v1/auth/verify-email`    | Public         | Consume an email token          |
| POST   | `/api/v1/auth/login`           | Public         | Login by email or username      |
| POST   | `/api/v1/auth/refresh`         | Refresh token  | Rotate access and refresh token |
| POST   | `/api/v1/auth/logout`          | Bearer token   | Invalidate the active session   |
| GET    | `/api/v1/auth/me`              | Bearer token   | Return the current profile      |
| POST   | `/api/v1/auth/forgot-password` | Public         | Request reset instructions      |
| POST   | `/api/v1/auth/reset-password`  | Public         | Consume a password-reset token  |

Swagger UI is available at `http://localhost:4000/docs`. The OpenAPI document is available at
`http://localhost:4000/docs/openapi.json`.

Login and refresh responses return the refresh token in the response data for non-browser clients
and also set it as an HTTP-only cookie. Browser applications should use the cookie and keep access
tokens in memory.

Email delivery is currently represented by a mock adapter. It logs delivery metadata without
logging raw verification or reset tokens. Replace this adapter with a transactional email
provider before deployment.

## Quality checks

```bash
npm run lint
npm run format:check
npm test
```

## Architectural boundaries

- Controllers translate HTTP requests and responses.
- Services orchestrate use cases and contain business rules.
- Repositories isolate persistence.
- Validators define input and environment contracts.
- Middleware handles cross-cutting HTTP concerns.
- Queue modules own broker integration; jobs own background processing.
- Configuration modules own infrastructure construction.

Business logic must not be placed in controllers, routes, or middleware.

## Financial domain

All INR values are represented as integer paise. MongoDB monetary fields reject fractional,
negative, unsafe, and over-limit values. The supported ceiling is
`9,000,000,000,000` paise, deliberately below JavaScript's maximum safe integer.

`rupeesToPaise()` accepts decimal strings such as `"125.50"` or whole-number JavaScript integers.
Fractional JavaScript numbers are rejected because values such as `0.1` are binary floating-point
approximations. `paiseToRupees()` returns a fixed two-decimal string rather than a floating-point
number.

The domain currently defines:

- One versioned wallet per user with `ACTIVE`, `FROZEN`, or `CLOSED` lifecycle state.
- Transaction identity, participant, amount, type, status, and idempotency invariants.
- Append-only ledger records linking one debit wallet to one credit wallet.
- User-scoped idempotency keys with SHA-256 request fingerprints and TTL expiration.
- Durable notification delivery/read states.

These models are not mounted behind API routes in Increment 3.

## Authentication security

- Passwords are hashed with configurable bcrypt work factor 12 by default.
- Passwords must be 12-128 characters and include upper/lowercase letters, a number, and a symbol.
- Credential, verification, reset, and refresh hashes are excluded from normal Mongoose queries.
- Expiring, purpose-bound email-verification tokens and opaque reset tokens are stored only as
  SHA-256 hashes.
- Access and refresh JWTs use separate secrets and purpose claims.
- Refresh tokens are rotated with a compare-and-swap database update to reject replay.
- Password reset invalidates every active refresh session.
- Forgot-password responses do not reveal whether an email exists.
