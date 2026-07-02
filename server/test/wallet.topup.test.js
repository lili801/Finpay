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
let userId;

before(async () => {
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error';
  await connectDatabase();

  await User.deleteMany({});
  await Wallet.deleteMany({});
  await Transaction.collection.deleteMany({});
  await Ledger.collection.deleteMany({});

  const passwordHasher = new PasswordHasher();
  const user = await User.create({
    firstName: 'Ada',
    lastName: 'Lovelace',
    username: 'ada',
    email: 'ada@example.com',
    password: await passwordHasher.hash('Strong!Password123'),
    isEmailVerified: true,
  });

  userId = user.id;
  accessToken = new TokenService().createAccessToken(user);
});

describe('wallet top-up', () => {
  it('adds money to a wallet and creates transaction and ledger records', async () => {
    const response = await request(app)
      .post('/api/v1/wallet/add-money')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ amount: '125.50' })
      .expect(200);

    assert.equal(response.body.success, true);
    assert.equal(response.body.data.amountCredited, 12_550);
    assert.equal(response.body.data.currency, 'INR');

    const wallet = await Wallet.findOne({ userId });
    const transaction = await Transaction.findOne({ senderWalletId: wallet._id });
    const ledger = await Ledger.findOne({ transactionId: transaction.transactionId });

    assert.equal(wallet.balance, 12_550);
    assert.equal(transaction.type, 'TOP_UP');
    assert.equal(transaction.status, 'SUCCESS');
    assert.equal(ledger.amount, 12_550);
    assert.equal(ledger.entryType, 'FUNDING');
  });

  it('rejects invalid top-up amounts', async () => {
    const response = await request(app)
      .post('/api/v1/wallet/add-money')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ amount: '0.01' })
      .expect(422);

    assert.equal(response.body.success, false);
  });
});

after(async () => {
  await disconnectDatabase();
});
