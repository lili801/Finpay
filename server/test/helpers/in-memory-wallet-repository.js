export class InMemoryWalletRepository {
  constructor(seedWallets = []) {
    this.wallets = new Map(seedWallets.map((wallet) => [wallet.userId, this.#entity(wallet)]));
  }

  async findByUserId(userId) {
    return this.wallets.get(String(userId)) ?? null;
  }

  async create(walletData) {
    const wallet = this.#entity({
      ...walletData,
      id: `wallet-${this.wallets.size + 1}`,
      balance: walletData.balance ?? 0,
      currency: walletData.currency ?? 'INR',
      status: walletData.status ?? 'ACTIVE',
    });
    this.wallets.set(String(wallet.userId), wallet);
    return wallet;
  }

  async save(wallet) {
    this.wallets.set(String(wallet.userId), wallet);
    return wallet;
  }

  async ensureForUser(userId) {
    const existing = await this.findByUserId(userId);
    if (existing) {
      return existing;
    }

    return this.create({ userId, balance: 0, currency: 'INR', status: 'ACTIVE' });
  }

  #entity(data) {
    return {
      ...data,
      async save() {
        return this;
      },
    };
  }
}
