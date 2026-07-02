import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import request from 'supertest';

import { app } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { Wallet } from '../src/models/wallet.model.js';
import { Transaction } from '../src/models/transaction.model.js';
import { Ledger } from '../src/models/ledger.model.js';
import { User } from '../src/models/user.model.js';
import { PasswordHasher } from '../src/utils/password-hasher.js';
import { TokenService } from '../src/utils/token-service.js';

let accessToken;
let senderId;
let receiverId;

before(async () => {
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error';
  await connectDatabase();

  await User.deleteMany({});
  await Wallet.deleteMany({});
  await Transaction.collection.deleteMany({});
  await Ledger.collection.deleteMany({});

  const passwordHasher = new PasswordHasher();
  const sender = await User.create({
    firstName: 'Ada',
    lastName: 'Lovelace',
    username: 'ada-transfer',
    email: 'ada-transfer@example.com',
    password: await passwordHasher.hash('Strong!Password123'),
    isEmailVerified: true,
  });
  const receiver = await User.create({
    firstName: 'Grace',
    lastName: 'Hopper',
    username: 'grace-transfer',
    email: 'grace-transfer@example.com',
    password: await passwordHasher.hash('Strong!Password123'),
    isEmailVerified: true,
  });

  senderId = sender.id;
  receiverId = receiver.id;
  accessToken = new TokenService().createAccessToken(sender);

  await Wallet.create({ userId: senderId, balance: 25_000, currency: 'INR', status: 'ACTIVE' });
  await Wallet.create({ userId: receiverId, balance: 5_000, currency: 'INR', status: 'ACTIVE' });
});

describe('wallet transfer', () => {
  it('transfers money between wallets and creates transaction and ledger records', async () => {
    const response = await request(app)
      .post('/api/v1/wallet/transfer')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ receiverId, amount: '125.50', idempotencyKey: 'transfer-001' })
      .expect(200);

    assert.equal(response.body.success, true);
    assert.equal(response.body.data.amountTransferred, 12_550);
    assert.equal(response.body.data.currency, 'INR');

    const senderWallet = await Wallet.findOne({ userId: senderId });
    const receiverWallet = await Wallet.findOne({ userId: receiverId });
    const transaction = await Transaction.findOne({ senderWalletId: senderWallet._id });
    const ledgerEntries = await Ledger.find({ transactionId: transaction.transactionId }).sort('createdAt');

    assert.equal(senderWallet.balance, 12_450);
    assert.equal(receiverWallet.balance, 17_550);
    assert.equal(transaction.type, 'TRANSFER');
    assert.equal(transaction.status, 'SUCCESS');
    assert.equal(ledgerEntries.length, 2);
    assert.equal(ledgerEntries[0].entryType, 'TRANSFER');
    assert.equal(ledgerEntries[1].entryType, 'TRANSFER');
  });

  it('rejects transfers with insufficient balance', async () => {
    const response = await request(app)
      .post('/api/v1/wallet/transfer')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ receiverId, amount: '200.00', idempotencyKey: 'transfer-002' })
      .expect(409);

    assert.equal(response.body.success, false);
  });
});

after(async () => {
  await disconnectDatabase();
});
