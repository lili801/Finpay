export class InMemoryUserRepository {
  constructor(seedUsers = []) {
    this.users = new Map(seedUsers.map((user) => [user.id, this.#entity(user)]));
    this.nextId = seedUsers.length + 1;
  }

  async create(userData) {
    const user = this.#entity({
      ...userData,
      id: String(this.nextId++),
      role: userData.role ?? 'USER',
      isEmailVerified: userData.isEmailVerified ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.users.set(user.id, user);
    return user;
  }

  async findById(id) {
    return this.users.get(String(id)) ?? null;
  }

  async findByIdWithSecrets(id) {
    return this.findById(id);
  }

  async findByIdentifier(identifier) {
    return (
      [...this.users.values()].find(
        (user) => user.email === identifier || user.username === identifier,
      ) ?? null
    );
  }

  async findIdentityConflict({ email, username }) {
    return (
      [...this.users.values()].find((user) => user.email === email || user.username === username) ??
      null
    );
  }

  async findByVerificationTokenHash(tokenHash) {
    return (
      [...this.users.values()].find((user) => user.emailVerificationTokenHash === tokenHash) ?? null
    );
  }

  async findByValidPasswordResetToken(tokenHash, now) {
    return (
      [...this.users.values()].find(
        (user) => user.passwordResetTokenHash === tokenHash && user.passwordResetExpiresAt > now,
      ) ?? null
    );
  }

  async updateRefreshTokenHash(userId, refreshTokenHash) {
    const user = await this.findById(userId);
    user.refreshTokenHash = refreshTokenHash;
    return user;
  }

  async rotateRefreshTokenHash(userId, currentHash, nextHash) {
    const user = await this.findById(userId);
    if (!user || user.refreshTokenHash !== currentHash) {
      return null;
    }
    user.refreshTokenHash = nextHash;
    return user;
  }

  async clearRefreshTokenHash(userId, expectedHash) {
    const user = await this.findById(userId);
    if (!user || (expectedHash && user.refreshTokenHash !== expectedHash)) {
      return null;
    }
    user.refreshTokenHash = undefined;
    return user;
  }

  async save(user) {
    user.updatedAt = new Date();
    this.users.set(user.id, user);
    return user;
  }

  #entity(data) {
    return {
      profileImage: null,
      ...data,
      async save() {
        return this;
      },
    };
  }
}
