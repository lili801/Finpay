import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import request from 'supertest';

import { app } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { Ledger } from '../src/models/ledger.model.js';
import { Notification } from '../src/models/notification.model.js';
import { Transaction } from '../src/models/transaction.model.js';
import { User } from '../src/models/user.model.js';
import { Wallet } from '../src/models/wallet.model.js';
import { PasswordHasher } from '../src/utils/password-hasher.js';
import { TokenService } from '../src/utils/token-service.js';

let adminUser;
let regularUser;
let adminAccessToken;
let regularAccessToken;

before(async () => {
  await connectDatabase();

  await User.deleteMany({});
  await Wallet.deleteMany({});
  await Transaction.collection.deleteMany({});
  await Ledger.collection.deleteMany({});
  await Notification.deleteMany({});

  const passwordHash = await new PasswordHasher().hash('Strong!Password123');

  adminUser = await User.create({
    firstName: 'System',
    lastName: 'Admin',
    mobileNumber: '9000000010',
    email: 'admin@example.com',
    password: passwordHash,
    role: 'ADMIN',
    isEmailVerified: true,
  });

  regularUser = await User.create({
    firstName: 'Mae',
    lastName: 'Jemison',
    mobileNumber: '9000000011',
    email: 'mae-admin@example.com',
    password: passwordHash,
    role: 'USER',
    isEmailVerified: true,
  });

  adminAccessToken = new TokenService().createAccessToken(adminUser);
  regularAccessToken = new TokenService().createAccessToken(regularUser);
});

describe('admin panel features', () => {
  it('protects admin routes from non-admins', async () => {
    // Try without token
    await request(app).get('/api/v1/admin/summary').expect(401);

    // Try with USER token
    const forbiddenResponse = await request(app)
      .get('/api/v1/admin/summary')
      .set('Authorization', `Bearer ${regularAccessToken}`)
      .expect(403);

    assert.equal(forbiddenResponse.body.success, false);
    assert.equal(forbiddenResponse.body.error.code, 'FORBIDDEN');
  });

  it('allows authenticated admins to view the dashboard stats', async () => {
    // Create a wallet and top-up to populate stats
    const wallet = await Wallet.create({ userId: regularUser.id, balance: 10000 });

    // Today's transaction
    await Transaction.create({
      transactionId: 'TXN_01JABCDEF111',
      senderWalletId: wallet._id,
      receiverWalletId: wallet._id,
      amount: 10000,
      status: 'SUCCESS',
      type: 'TOP_UP',
      idempotencyKey: 'idemp-111',
    });

    const response = await request(app)
      .get('/api/v1/admin/summary')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    assert.equal(response.body.success, true);
    assert.equal(response.body.data.totalUsers, 2);
    assert.equal(response.body.data.totalWallets, 1);
    assert.equal(response.body.data.totalTransactions, 1);
    assert.equal(response.body.data.totalWalletBalance, 10000);
    assert.equal(response.body.data.totalWalletBalanceInRupees, '100.00');
    assert.equal(response.body.data.todayTransactions, 1);
  });

  it('lists and searches users', async () => {
    // List all
    const listRes = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    assert.equal(listRes.body.data.users.length, 2);
    assert.ok(listRes.body.meta.pagination);

    // Search by mobile number
    const searchRes = await request(app)
      .get('/api/v1/admin/users?search=9000000011')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    assert.equal(searchRes.body.data.users.length, 1);
    assert.equal(searchRes.body.data.users[0].mobileNumber, '9000000011');
  });

  it('shows user details, wallet and transaction count', async () => {
    const detailsRes = await request(app)
      .get(`/api/v1/admin/users/${regularUser.id}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    assert.equal(detailsRes.body.data.user.mobileNumber, '9000000011');
    assert.equal(detailsRes.body.data.wallet.balance, 10000);
    assert.equal(detailsRes.body.data.transactionCount, 1);

    // Single wallet endpoint
    const walletRes = await request(app)
      .get(`/api/v1/admin/users/${regularUser.id}/wallet`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    assert.equal(walletRes.body.data.wallet.balance, 10000);

    // Wallet balance endpoint
    const balanceRes = await request(app)
      .get(`/api/v1/admin/users/${regularUser.id}/wallet/balance`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    assert.equal(balanceRes.body.data.balance.balance, 10000);

    // Transaction count endpoint
    const countRes = await request(app)
      .get(`/api/v1/admin/users/${regularUser.id}/transactions/count`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    assert.equal(countRes.body.data.count, 1);
  });

  it('freezes a wallet and prevents future transfers/top-ups', async () => {
    // Freeze the regular user's wallet
    const freezeRes = await request(app)
      .patch(`/api/v1/admin/users/${regularUser.id}/wallet/freeze`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    assert.equal(freezeRes.body.data.wallet.status, 'FROZEN');

    // Attempt top-up on frozen wallet (should fail)
    const topupRes = await request(app)
      .post('/api/v1/wallet/add-money')
      .set('Authorization', `Bearer ${regularAccessToken}`)
      .send({ amount: '50.00' })
      .expect(400);

    assert.equal(topupRes.body.error.code, 'WALLET_INACTIVE');

    // Setup another active user for transfer tests
    const sender2 = await User.create({
      firstName: 'Sally',
      lastName: 'Ride',
      mobileNumber: '9000000012',
      email: 'sally-admin@example.com',
      password: regularUser.password,
      role: 'USER',
      isEmailVerified: true,
    });
    const sender2Wallet = await Wallet.create({ userId: sender2.id, balance: 50000 });
    const sender2AccessToken = new TokenService().createAccessToken(sender2);

    // Attempt transfer from frozen wallet (should fail)
    const transferFromRes = await request(app)
      .post('/api/v1/wallet/transfer')
      .set('Authorization', `Bearer ${regularAccessToken}`)
      .send({ receiverMobileNumber: sender2.mobileNumber, amount: '10.00' })
      .expect(400);

    assert.equal(transferFromRes.body.error.code, 'SENDER_WALLET_INACTIVE');

    // Attempt transfer to frozen wallet (should fail)
    const transferToRes = await request(app)
      .post('/api/v1/wallet/transfer')
      .set('Authorization', `Bearer ${sender2AccessToken}`)
      .send({ receiverMobileNumber: regularUser.mobileNumber, amount: '10.00' })
      .expect(400);

    assert.equal(transferToRes.body.error.code, 'RECEIVER_WALLET_INACTIVE');

    // Reactivate the wallet
    const activateRes = await request(app)
      .patch(`/api/v1/admin/users/${regularUser.id}/wallet/activate`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    assert.equal(activateRes.body.data.wallet.status, 'ACTIVE');

    // Now top-up should work again
    await request(app)
      .post('/api/v1/wallet/add-money')
      .set('Authorization', `Bearer ${regularAccessToken}`)
      .send({ amount: '50.00' })
      .expect(200);
  });

  it('lists and audits transactions with filters', async () => {
    // List all
    const allRes = await request(app)
      .get('/api/v1/admin/transactions')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    assert.ok(allRes.body.data.transactions.length >= 1);

    // Filter by type
    const topupFilterRes = await request(app)
      .get('/api/v1/admin/transactions?type=TOP_UP')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    assert.ok(topupFilterRes.body.data.transactions.every((t) => t.type === 'TOP_UP'));

    // Filter by invalid user id format (should return validation error)
    await request(app)
      .get('/api/v1/admin/transactions?userId=not-a-mongo-id')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(422);
  });
});

after(async () => {
  await disconnectDatabase();
});
