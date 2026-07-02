import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { WalletService } from '../src/services/wallet.service.js';
import { InMemoryWalletRepository } from './helpers/in-memory-wallet-repository.js';

describe('WalletService', () => {
  it('creates a wallet for a user when one does not exist', async () => {
    const repository = new InMemoryWalletRepository();
    const service = new WalletService({ walletRepository: repository });

    const wallet = await service.getOrCreateWalletForUser('user-1');

    assert.equal(wallet.userId, 'user-1');
    assert.equal(wallet.balance, 0);
  });

  it('returns the existing wallet without creating a duplicate', async () => {
    const repository = new InMemoryWalletRepository();
    const service = new WalletService({ walletRepository: repository });

    await service.getOrCreateWalletForUser('user-1');
    const wallet = await service.getOrCreateWalletForUser('user-1');

    assert.equal(wallet.userId, 'user-1');
    assert.equal(wallet.balance, 0);
  });

  it('returns wallet balance information for an existing wallet', async () => {
    const repository = new InMemoryWalletRepository();
    const service = new WalletService({ walletRepository: repository });

    const wallet = await service.getOrCreateWalletForUser('user-1');
    wallet.balance = 12550;
    await repository.save(wallet);

    const balance = await service.getBalance('user-1');

    assert.equal(balance.balance, 12550);
    assert.equal(balance.balanceInRupees, '125.50');
  });
});
