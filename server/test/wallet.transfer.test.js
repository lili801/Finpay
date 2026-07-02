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
let senderAccessToken;
let passwordHash;

before(async () => {
  await connectDatabase();

  await User.deleteMany({});
  await Wallet.deleteMany({});
  await Transaction.collection.deleteMany({});
  await Ledger.collection.deleteMany({});

  passwordHash = await new PasswordHasher().hash('Strong!Password123');

  sender = await User.create({
    firstName: 'Grace',
    lastName: 'Hopper',
    username: 'grace',
    email: 'grace@example.com',
    password: passwordHash,
    isEmailVerified: true,
  });

  receiver = await User.create({
    firstName: 'Katherine',
    lastName: 'Johnson',
    username: 'katherine',
    email: 'katherine@example.com',
    password: passwordHash,
    isEmailVerified: true,
  });

  senderAccessToken = new TokenService().createAccessToken(sender);
});

describe('wallet transfer', () => {
  it('transfers money between wallets and records transaction and ledger data', async () => {
    const senderWallet = await Wallet.create({ userId: sender.id, balance: 20_000 });
    const receiverWallet = await Wallet.create({ userId: receiver.id, balance: 5_000 });

    const response = await request(app)
      .post('/api/v1/wallet/transfer')
      .set('Authorization', `Bearer ${senderAccessToken}`)
      .send({ receiverUserId: receiver.id, amount: '75.50' })
      .expect(200);

    assert.equal(response.body.success, true);
    assert.equal(response.body.data.amountTransferred, 7_550);
    assert.equal(response.body.data.sender.balance, 12_450);
    assert.equal(response.body.data.sender.balanceInRupees, '124.50');

    const updatedSenderWallet = await Wallet.findById(senderWallet.id);
    const updatedReceiverWallet = await Wallet.findById(receiverWallet.id);
    const transaction = await Transaction.findOne({ senderWalletId: senderWallet.id });
    const ledger = await Ledger.findOne({ transactionId: transaction.transactionId });

    assert.equal(updatedSenderWallet.balance, 12_450);
    assert.equal(updatedReceiverWallet.balance, 12_550);
    assert.equal(transaction.receiverWalletId.toString(), receiverWallet.id);
    assert.equal(transaction.amount, 7_550);
    assert.equal(transaction.type, 'TRANSFER');
    assert.equal(transaction.status, 'SUCCESS');
    assert.equal(ledger.debitWalletId.toString(), senderWallet.id);
    assert.equal(ledger.creditWalletId.toString(), receiverWallet.id);
    assert.equal(ledger.amount, 7_550);
    assert.equal(ledger.entryType, 'TRANSFER');
  });

  it('rejects self transfers', async () => {
    const response = await request(app)
      .post('/api/v1/wallet/transfer')
      .set('Authorization', `Bearer ${senderAccessToken}`)
      .send({ receiverUserId: sender.id, amount: '10.00' })
      .expect(400);

    assert.equal(response.body.error.code, 'SELF_TRANSFER_NOT_ALLOWED');
  });

  it('rejects transfers when the sender balance is insufficient', async () => {
    await Wallet.deleteMany({});
    await Wallet.create({ userId: sender.id, balance: 500 });
    await Wallet.create({ userId: receiver.id, balance: 0 });

    const response = await request(app)
      .post('/api/v1/wallet/transfer')
      .set('Authorization', `Bearer ${senderAccessToken}`)
      .send({ receiverUserId: receiver.id, amount: '10.00' })
      .expect(400);

    assert.equal(response.body.error.code, 'INSUFFICIENT_BALANCE');
  });

  it('rejects transfers to a missing receiver user', async () => {
    const missingReceiverId = '64f000000000000000000001';

    const response = await request(app)
      .post('/api/v1/wallet/transfer')
      .set('Authorization', `Bearer ${senderAccessToken}`)
      .send({ receiverUserId: missingReceiverId, amount: '1.00' })
      .expect(404);

    assert.equal(response.body.error.code, 'RECEIVER_NOT_FOUND');
  });

  it('rejects transfers when the receiver wallet does not exist', async () => {
    await Wallet.deleteMany({});
    await Wallet.create({ userId: sender.id, balance: 1_000 });

    const response = await request(app)
      .post('/api/v1/wallet/transfer')
      .set('Authorization', `Bearer ${senderAccessToken}`)
      .send({ receiverUserId: receiver.id, amount: '1.00' })
      .expect(404);

    assert.equal(response.body.error.code, 'RECEIVER_WALLET_NOT_FOUND');
  });

  it('rejects non-positive transfer amounts', async () => {
    const response = await request(app)
      .post('/api/v1/wallet/transfer')
      .set('Authorization', `Bearer ${senderAccessToken}`)
      .send({ receiverUserId: receiver.id, amount: '0.00' })
      .expect(422);

    assert.equal(response.body.success, false);
  });
});

after(async () => {
  await disconnectDatabase();
});
