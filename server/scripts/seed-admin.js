import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { User, USER_ROLES } from '../src/models/user.model.js';
import { PasswordHasher } from '../src/utils/password-hasher.js';
import { logger } from '../src/config/logger.js';

async function seedAdmin() {
  const {
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    ADMIN_FIRST_NAME,
    ADMIN_LAST_NAME,
    ADMIN_MOBILE,
  } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_FIRST_NAME || !ADMIN_LAST_NAME || !ADMIN_MOBILE) {
    logger.error('Missing required environment variables for seeding admin. Ensure ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_FIRST_NAME, ADMIN_LAST_NAME, and ADMIN_MOBILE are set.');
    process.exit(1);
  }

  try {
    await connectDatabase();

    const existingAdmin = await User.findOne({ role: USER_ROLES.ADMIN });
    if (existingAdmin) {
      logger.info(`Admin account already exists with email: ${existingAdmin.email}`);
      process.exit(0);
    }

    const passwordHasher = new PasswordHasher();
    const passwordHash = await passwordHasher.hash(ADMIN_PASSWORD);

    const admin = new User({
      firstName: ADMIN_FIRST_NAME,
      lastName: ADMIN_LAST_NAME,
      mobileNumber: ADMIN_MOBILE,
      email: ADMIN_EMAIL,
      password: passwordHash,
      role: USER_ROLES.ADMIN,
      isEmailVerified: true,
    });

    await admin.save();
    logger.info(`Admin account created successfully with email: ${admin.email}`);
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding admin', { error });
    console.error(error);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

seedAdmin();
