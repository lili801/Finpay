import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import request from 'supertest';

import { app } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { Ledger } from '../src/models/ledger.model.js';
import { Transaction } from '../src/models/transaction.model.js';
import { User } from '../src/models/user.model.js';
import { Wallet } from '../src/models/wallet.model.js';
import { PasswordHasher } from '../src/utils/password-hasher.js';
import { TokenService } from '../src/utils/token-service.js';

let sender;
let receiver;
let outsider;
let senderWallet;
let receiverWallet;
let outsiderWallet;
let senderAccessToken;
let noWalletAccessToken;
let passwordHash;

before(async () => {
  await connectDatabase();

  await User.deleteMany({});
  await Wallet.deleteMany({});
  await Transaction.collection.deleteMany({});
  await Ledger.collection.deleteMany({});

  passwordHash = await new PasswordHasher().hash('Strong!Password123');

  sender = await User.create({
    firstName: 'Mary',
    lastName: 'Jackson',
    username: 'mary',
    email: 'mary@example.com',
    password: passwordHash,
    isEmailVerified: true,
  });

  receiver = await User.create({
    firstName: 'Dorothy',
    lastName: 'Vaughan',
    username: 'dorothy',
    email: 'dorothy@example.com',
    password: passwordHash,
    isEmailVerified: true,
  });

  outsider = await User.create({
    firstName: 'Annie',
    lastName: 'Easley',
    username: 'annie',
    email: 'annie@example.com',
    password: passwordHash,
    isEmailVerified: true,
  });

  const noWalletUser = await User.create({
    firstName: 'Evelyn',
    lastName: 'Boyd',
    username: 'evelyn',
    email: 'evelyn@example.com',
    password: passwordHash,
    isEmailVerified: true,
  });

  senderWallet = await Wallet.create({ userId: sender.id, balance: 20_000 });
  receiverWallet = await Wallet.create({ userId: receiver.id, balance: 5_000 });
  outsiderWallet = await Wallet.create({ userId: outsider.id, balance: 9_000 });

  senderAccessToken = new TokenService().createAccessToken(sender);
  noWalletAccessToken = new TokenService().createAccessToken(noWalletUser);

  await Transaction.create([
    {
      transactionId: 'TXN_HISTORY001',
      senderWalletId: senderWallet.id,
      receiverWalletId: senderWallet.id,
      amount: 10_000,
      status: 'SUCCESS',
      type: 'TOP_UP',
      source: 'SELF',
      idempotencyKey: 'history-topup-001',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    },
    {
      transactionId: 'TXN_HISTORY002',
      senderWalletId: senderWallet.id,
      receiverWalletId: receiverWallet.id,
      amount: 2_500,
      status: 'SUCCESS',
      type: 'TRANSFER',
      source: 'SELF',
      idempotencyKey: 'history-transfer-002',
      createdAt: new Date('2026-01-02T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    },
    {
      transactionId: 'TXN_HISTORY003',
      senderWalletId: receiverWallet.id,
      receiverWalletId: senderWallet.id,
      amount: 1_250,
      status: 'SUCCESS',
      type: 'TRANSFER',
      source: 'SELF',
      idempotencyKey: 'history-transfer-003',
      createdAt: new Date('2026-01-03T00:00:00.000Z'),
      updatedAt: new Date('2026-01-03T00:00:00.000Z'),
    },
    {
      transactionId: 'TXN_HISTORY004',
      senderWalletId: outsiderWallet.id,
      receiverWalletId: outsiderWallet.id,
      amount: 5_000,
      status: 'SUCCESS',
      type: 'TOP_UP',
      source: 'SELF',
      idempotencyKey: 'history-topup-004',
      createdAt: new Date('2026-01-04T00:00:00.000Z'),
      updatedAt: new Date('2026-01-04T00:00:00.000Z'),
    },
  ]);
});

describe('wallet transaction history', () => {
  it('returns authenticated wallet transactions newest first with pagination metadata', async () => {
    const response = await request(app)
      .get('/api/v1/wallet/transactions?page=1&limit=2')
      .set('Authorization', `Bearer ${senderAccessToken}`)
      .expect(200);

    assert.equal(response.body.success, true);
    assert.deepEqual(
      response.body.data.transactions.map((transaction) => transaction.transactionId),
      ['TXN_HISTORY003', 'TXN_HISTORY002'],
    );
    assert.deepEqual(response.body.meta.pagination, {
      page: 1,
      limit: 2,
      total: 3,
      totalPages: 2,
    });

    const [latestTransaction] = response.body.data.transactions;
    assert.equal(latestTransaction.type, 'TRANSFER');
    assert.equal(latestTransaction.status, 'SUCCESS');
    assert.equal(latestTransaction.amount, 1_250);
    assert.equal(latestTransaction.amountInRupees, '12.50');
    assert.equal(latestTransaction.senderWalletId, receiverWallet.id);
    assert.equal(latestTransaction.receiverWalletId, senderWallet.id);
    assert.equal(latestTransaction.source, 'SELF');
    assert.equal(typeof latestTransaction.createdAt, 'string');
  });

  it('returns the next transaction page without unrelated wallet records', async () => {
    const response = await request(app)
      .get('/api/v1/wallet/transactions?page=2&limit=2')
      .set('Authorization', `Bearer ${senderAccessToken}`)
      .expect(200);

    assert.deepEqual(
      response.body.data.transactions.map((transaction) => transaction.transactionId),
      ['TXN_HISTORY001'],
    );
  });

  it('uses default pagination values', async () => {
    const response = await request(app)
      .get('/api/v1/wallet/transactions')
      .set('Authorization', `Bearer ${senderAccessToken}`)
      .expect(200);

    assert.equal(response.body.data.transactions.length, 3);
    assert.equal(response.body.meta.pagination.page, 1);
    assert.equal(response.body.meta.pagination.limit, 20);
  });

  it('rejects invalid pagination values', async () => {
    const response = await request(app)
      .get('/api/v1/wallet/transactions?page=0&limit=101')
      .set('Authorization', `Bearer ${senderAccessToken}`)
      .expect(422);

    assert.equal(response.body.error.code, 'VALIDATION_ERROR');
  });

  it('returns not found when the authenticated user has no wallet', async () => {
    const response = await request(app)
      .get('/api/v1/wallet/transactions')
      .set('Authorization', `Bearer ${noWalletAccessToken}`)
      .expect(404);

    assert.equal(response.body.error.code, 'WALLET_NOT_FOUND');
  });
});

after(async () => {
  await disconnectDatabase();
});
