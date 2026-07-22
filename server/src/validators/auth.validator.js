import { z } from 'zod';

const nameSchema = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(50, 'Name must not exceed 50 characters')
  .regex(/^[\p{L}\p{M}' -]+$/u, 'Name contains unsupported characters');

const mobileNumberSchema = z
  .string()
  .trim()
  .regex(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits');

const emailSchema = z.string().trim().toLowerCase().email().max(254);

const passwordSchema = z
  .string()
  .min(12, 'Password must contain at least 12 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain a special character');

function matchingPasswords(schema) {
  return schema.refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
}

export const registerSchema = z.object({
  body: matchingPasswords(
    z
      .object({
        firstName: nameSchema,
        lastName: nameSchema,
        mobileNumber: mobileNumberSchema,
        email: emailSchema,
        password: passwordSchema,
        confirmPassword: z.string(),
      })
      .strict(),
  ),
});

export const loginSchema = z.object({
  body: z
    .object({
      identifier: z
        .string()
        .trim()
        .min(1, 'Email or mobile number is required')
        .max(254, 'Email or mobile number must not exceed 254 characters')
        .refine(
          (val) => {
            const isEmail = z.string().email().safeParse(val).success;
            const isMobile = /^[0-9]{10}$/.test(val);
            return isEmail || isMobile;
          },
          { message: 'Identifier must be a valid email or a 10-digit mobile number' }
        )
        .transform((value) => value.toLowerCase()),
      password: z.string().min(1).max(128),
    })
    .strict(),
});

export const refreshSchema = z.object({
  body: z
    .object({
      refreshToken: z.string().trim().min(1).optional(),
    })
    .strict(),
});

export const logoutSchema = z.object({
  body: z.object({}).strict(),
});

export const verifyEmailSchema = z.object({
  body: z
    .object({
      email: emailSchema,
      otp: z.string().trim().regex(/^[0-9]{6}$/, 'OTP must be a 6-digit number'),
    })
    .strict(),
});

export const resendOtpSchema = z.object({
  body: z.object({ email: emailSchema }).strict(),
});

export const forgotPasswordSchema = z.object({
  body: z.object({ email: emailSchema }).strict(),
});

export const resetPasswordSchema = z.object({
  body: matchingPasswords(
    z
      .object({
        token: z.string().trim().min(32).max(512),
        password: passwordSchema,
        confirmPassword: z.string(),
      })
      .strict(),
  ),
});
