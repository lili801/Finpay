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

let sender;
let receiver;
let senderAccessToken;
let receiverAccessToken;
let topUpNotificationId;
let senderNotificationId;

before(async () => {
  await connectDatabase();

  await User.deleteMany({});
  await Wallet.deleteMany({});
  await Transaction.collection.deleteMany({});
  await Ledger.collection.deleteMany({});
  await Notification.deleteMany({});

  const passwordHash = await new PasswordHasher().hash('Strong!Password123');

  sender = await User.create({
    firstName: 'Mae',
    lastName: 'Jemison',
    username: 'mae',
    email: 'mae@example.com',
    password: passwordHash,
    isEmailVerified: true,
  });

  receiver = await User.create({
    firstName: 'Sally',
    lastName: 'Ride',
    username: 'sally',
    email: 'sally@example.com',
    password: passwordHash,
    isEmailVerified: true,
  });

  senderAccessToken = new TokenService().createAccessToken(sender);
  receiverAccessToken = new TokenService().createAccessToken(receiver);
});

describe('notifications', () => {
  it('creates a notification after wallet top-up', async () => {
    await request(app)
      .post('/api/v1/wallet/add-money')
      .set('Authorization', `Bearer ${senderAccessToken}`)
      .send({ amount: '500.00' })
      .expect(200);

    const notification = await Notification.findOne({ userId: sender.id, type: 'TOP_UP' });

    assert.equal(notification.title, 'Money Added Successfully');
    assert.equal(notification.message, '₹500 has been successfully added to your wallet.');
    assert.equal(notification.status, 'PENDING');
    topUpNotificationId = notification.id;
  });

  it('creates sender and receiver notifications after wallet transfer', async () => {
    await Wallet.create({ userId: receiver.id, balance: 0 });

    await request(app)
      .post('/api/v1/wallet/transfer')
      .set('Authorization', `Bearer ${senderAccessToken}`)
      .send({ receiverUserId: receiver.id, amount: '250.00' })
      .expect(200);

    const senderNotification = await Notification.findOne({
      userId: sender.id,
      type: 'TRANSFER_SENT',
    });
    const receiverNotification = await Notification.findOne({
      userId: receiver.id,
      type: 'TRANSFER_RECEIVED',
    });

    assert.equal(senderNotification.title, 'Money Sent');
    assert.equal(senderNotification.message, 'You sent ₹250 to Sally Ride.');
    assert.equal(receiverNotification.title, 'Money Received');
    assert.equal(receiverNotification.message, 'You received ₹250 from Mae Jemison.');
    senderNotificationId = senderNotification.id;
  });

  it('lists notifications newest first with pagination', async () => {
    const response = await request(app)
      .get('/api/v1/notifications?page=1&limit=1')
      .set('Authorization', `Bearer ${senderAccessToken}`)
      .expect(200);

    assert.equal(response.body.success, true);
    assert.equal(response.body.data.notifications.length, 1);
    assert.equal(response.body.data.notifications[0].type, 'TRANSFER_SENT');
    assert.equal(response.body.meta.pagination.page, 1);
    assert.equal(response.body.meta.pagination.limit, 1);
    assert.equal(response.body.meta.pagination.total, 2);
    assert.equal(response.body.meta.pagination.totalPages, 2);
  });

  it('returns unread notification count', async () => {
    const response = await request(app)
      .get('/api/v1/notifications/unread-count')
      .set('Authorization', `Bearer ${senderAccessToken}`)
      .expect(200);

    assert.equal(response.body.data.unreadCount, 2);
  });

  it('marks one notification as read', async () => {
    const response = await request(app)
      .patch(`/api/v1/notifications/${topUpNotificationId}/read`)
      .set('Authorization', `Bearer ${senderAccessToken}`)
      .expect(200);

    assert.equal(response.body.data.notification.status, 'READ');

    const unreadResponse = await request(app)
      .get('/api/v1/notifications/unread-count')
      .set('Authorization', `Bearer ${senderAccessToken}`)
      .expect(200);

    assert.equal(unreadResponse.body.data.unreadCount, 1);
  });

  it('marks all notifications as read', async () => {
    const response = await request(app)
      .patch('/api/v1/notifications/read-all')
      .set('Authorization', `Bearer ${senderAccessToken}`)
      .expect(200);

    assert.equal(response.body.data.modifiedCount, 1);

    const unreadResponse = await request(app)
      .get('/api/v1/notifications/unread-count')
      .set('Authorization', `Bearer ${senderAccessToken}`)
      .expect(200);

    assert.equal(unreadResponse.body.data.unreadCount, 0);
  });

  it('rejects unauthorized notification access', async () => {
    await request(app).get('/api/v1/notifications').expect(401);
  });

  it('rejects invalid notification ids', async () => {
    const response = await request(app)
      .patch('/api/v1/notifications/not-a-valid-id/read')
      .set('Authorization', `Bearer ${senderAccessToken}`)
      .expect(422);

    assert.equal(response.body.error.code, 'VALIDATION_ERROR');
  });

  it('does not allow users to mark another user notification as read', async () => {
    const response = await request(app)
      .patch(`/api/v1/notifications/${senderNotificationId}/read`)
      .set('Authorization', `Bearer ${receiverAccessToken}`)
      .expect(404);

    assert.equal(response.body.error.code, 'NOTIFICATION_NOT_FOUND');
  });
});

after(async () => {
  await disconnectDatabase();
});
