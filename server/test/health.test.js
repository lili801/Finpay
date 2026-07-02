import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';

import request from 'supertest';

let app;

before(async () => {
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error';
  ({ app } = await import('../src/app.js'));
});

describe('operational health endpoints', () => {
  it('returns the liveness contract', async () => {
    const response = await request(app).get('/health/live').expect(200);

    assert.equal(response.body.success, true);
    assert.equal(response.body.data.status, 'ok');
    assert.equal(response.body.data.service, 'finpay-api');
    assert.ok(response.headers['x-request-id']);
  });

  it('reports unavailable dependencies as not ready', async () => {
    const response = await request(app).get('/health/ready').expect(503);

    assert.equal(response.body.success, true);
    assert.equal(response.body.data.status, 'not_ready');
    assert.equal(response.body.data.checks.mongodb.healthy, false);
  });

  it('returns a consistent error for an unknown route', async () => {
    const response = await request(app).get('/does-not-exist').expect(404);

    assert.equal(response.body.success, false);
    assert.equal(response.body.error.code, 'ROUTE_NOT_FOUND');
    assert.equal(response.body.requestId, response.headers['x-request-id']);
  });
});
