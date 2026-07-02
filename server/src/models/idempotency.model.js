import mongoose from 'mongoose';

const idempotencySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      maxlength: 128,
      immutable: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
    requestHash: {
      type: String,
      required: true,
      immutable: true,
      match: /^[a-f0-9]{64}$/,
    },
    responseSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
      immutable: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

idempotencySchema.index(
  { userId: 1, key: 1 },
  { unique: true, name: 'unique_user_idempotency_key' },
);
idempotencySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, name: 'idempotency_ttl' });

export const Idempotency = mongoose.model('Idempotency', idempotencySchema);
