import mongoose from 'mongoose';

export const USER_ROLES = Object.freeze({
  USER: 'USER',
  ADMIN: 'ADMIN',
});

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[0-9]{10}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid 10-digit mobile number!`,
      },
    },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER,
      required: true,
    },
    isEmailVerified: { type: Boolean, default: false, required: true },
    emailVerificationOtpHash: { type: String, select: false },
    emailVerificationOtpExpiresAt: { type: Date, select: false },
    emailVerificationOtpResends: { type: Number, default: 0, select: false },
    emailVerificationOtpAttempts: { type: Number, default: 0, select: false },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpiresAt: { type: Date, select: false },
    refreshTokenHash: { type: String, select: false },
    profileImage: { type: String, trim: true },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(_document, returnedObject) {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.password;
        delete returnedObject.emailVerificationOtpHash;
        delete returnedObject.emailVerificationOtpExpiresAt;
        delete returnedObject.emailVerificationOtpResends;
        delete returnedObject.emailVerificationOtpAttempts;
        delete returnedObject.passwordResetTokenHash;
        delete returnedObject.passwordResetExpiresAt;
        delete returnedObject.refreshTokenHash;
        return returnedObject;
      },
    },
  },
);

userSchema.index({ email: 1 }, { unique: true, name: 'unique_user_email' });
userSchema.index({ mobileNumber: 1 }, { unique: true, name: 'unique_mobileNumber' });
userSchema.index(
  { passwordResetTokenHash: 1, passwordResetExpiresAt: 1 },
  { sparse: true, name: 'password_reset_token' },
);

export const User = mongoose.model('User', userSchema);
