import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import { AuthService } from '../src/services/auth.service.js';
import { FakeEmailService, FakePasswordHasher, FakeTokenService } from './helpers/auth-fakes.js';
import { InMemoryUserRepository } from './helpers/in-memory-user-repository.js';

const registration = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  username: 'ada_lovelace',
  email: 'ada@example.com',
  password: 'Strong!Password123',
};

describe('AuthService', () => {
  let repository;
  let tokenService;
  let emailService;
  let service;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    tokenService = new FakeTokenService();
    emailService = new FakeEmailService();
    service = new AuthService({
      userRepository: repository,
      passwordHasher: new FakePasswordHasher(),
      tokenService,
      emailService,
    });
  });

  it('registers a user with hashed secrets and a safe response', async () => {
    const result = await service.register(registration);
    const storedUser = await repository.findByIdentifier(registration.email);
    const verificationUrl = new URL(emailService.verificationMessages[0].verificationUrl);
    const rawToken = verificationUrl.searchParams.get('token');

    assert.equal(storedUser.password, `password-hash:${registration.password}`);
    assert.equal(storedUser.emailVerificationTokenHash, `token-hash:${rawToken}`);
    assert.notEqual(storedUser.emailVerificationTokenHash, rawToken);
    assert.equal(result.password, undefined);
    assert.equal(result.emailVerificationTokenHash, undefined);
    assert.equal(result.email, registration.email);
  });

  it('logs in a verified user and stores only the refresh-token hash', async () => {
    await service.register(registration);
    const storedUser = await repository.findByIdentifier(registration.email);
    storedUser.isEmailVerified = true;

    const result = await service.login({
      identifier: registration.username,
      password: registration.password,
    });

    assert.match(result.accessToken, /^access-token:/);
    assert.match(result.refreshToken, /^refresh-token:/);
    assert.equal(storedUser.refreshTokenHash, `token-hash:${result.refreshToken}`);
    assert.notEqual(storedUser.refreshTokenHash, result.refreshToken);
    assert.equal(result.user.password, undefined);
  });

  it('rotates a refresh token atomically and rejects reuse', async () => {
    await service.register(registration);
    const storedUser = await repository.findByIdentifier(registration.email);
    storedUser.isEmailVerified = true;
    const login = await service.login({
      identifier: registration.email,
      password: registration.password,
    });

    const refreshed = await service.refresh(login.refreshToken);

    assert.notEqual(refreshed.refreshToken, login.refreshToken);
    assert.equal(storedUser.refreshTokenHash, `token-hash:${refreshed.refreshToken}`);
    await assert.rejects(
      () => service.refresh(login.refreshToken),
      (error) => error.code === 'INVALID_REFRESH_TOKEN' && error.statusCode === 401,
    );
  });

  it('invalidates the refresh token on logout', async () => {
    await service.register(registration);
    const storedUser = await repository.findByIdentifier(registration.email);
    storedUser.isEmailVerified = true;
    const login = await service.login({
      identifier: registration.username,
      password: registration.password,
    });

    await service.logout(storedUser.id);

    assert.equal(storedUser.refreshTokenHash, undefined);
    await assert.rejects(
      () => service.refresh(login.refreshToken),
      (error) => error.code === 'INVALID_REFRESH_TOKEN',
    );
  });
});
