import { User } from '../models/user.model.js';

const SENSITIVE_FIELDS =
  '+password +emailVerificationTokenHash +passwordResetTokenHash +passwordResetExpiresAt +refreshTokenHash';

export class UserRepository {
  async create(userData) {
    return User.create(userData);
  }

  async findById(id, session) {
    const query = User.findById(id);
    return session ? query.session(session) : query;
  }

  async findByIdWithSecrets(id) {
    return User.findById(id).select(SENSITIVE_FIELDS);
  }

  async findByMobileNumber(mobileNumber, session) {
    const query = User.findOne({ mobileNumber });
    return session ? query.session(session) : query;
  }

  async findByIdentifier(identifier) {
    const query = /^\d{10}$/.test(identifier) ? { mobileNumber: identifier } : { email: identifier };
    return User.findOne(query).select(SENSITIVE_FIELDS);
  }

  async findIdentityConflict({ email, mobileNumber }) {
    return User.findOne({ $or: [{ email }, { mobileNumber }] })
      .select('email mobileNumber')
      .lean();
  }

  async findByVerificationTokenHash(tokenHash) {
    return User.findOne({ emailVerificationTokenHash: tokenHash }).select(
      '+emailVerificationTokenHash',
    );
  }

  async findByValidPasswordResetToken(tokenHash, now) {
    return User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: now },
    }).select(SENSITIVE_FIELDS);
  }

  async updateRefreshTokenHash(userId, refreshTokenHash) {
    return User.findByIdAndUpdate(userId, { refreshTokenHash }, { new: true });
  }

  async rotateRefreshTokenHash(userId, currentHash, nextHash) {
    return User.findOneAndUpdate(
      { _id: userId, refreshTokenHash: currentHash },
      { refreshTokenHash: nextHash },
      { new: true },
    );
  }

  async clearRefreshTokenHash(userId, expectedHash) {
    const filter = expectedHash ? { _id: userId, refreshTokenHash: expectedHash } : { _id: userId };
    return User.findOneAndUpdate(filter, { $unset: { refreshTokenHash: 1 } }, { new: true });
  }

  async save(user) {
    return user.save();
  }
}
