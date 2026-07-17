import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User as UserIcon, Mail, Lock, Eye, EyeOff, ShieldCheck, Phone } from 'lucide-react';

import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';

const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, 'First name is required')
      .max(50, 'First name must not exceed 50 characters')
      .regex(/^[\p{L}\p{M}' -]+$/u, 'First name contains unsupported characters'),
    lastName: z
      .string()
      .trim()
      .min(1, 'Last name is required')
      .max(50, 'Last name must not exceed 50 characters')
      .regex(/^[\p{L}\p{M}' -]+$/u, 'Last name contains unsupported characters'),
    mobileNumber: z
      .string()
      .trim()
      .regex(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits'),
    email: z.string().trim().toLowerCase().email('Please type a valid email address').max(254),
    password: z
      .string()
      .min(12, 'Password must be at least 12 characters')
      .max(128, 'Password must not exceed 128 characters')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const Register = ({ onSwitchToLogin, isModal }) => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await registerUser(data);
      toast.success('Registration successful! Please check your email to verify your account.');
      if (onSwitchToLogin) {
        onSwitchToLogin();
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error(error);
      const backendError = error.response?.data?.error;
      if (backendError?.details && Array.isArray(backendError.details)) {
        backendError.details.forEach((detail) => {
          const fieldPath = detail.path.replace(/^body\./, '');
          setError(fieldPath, {
            type: 'server',
            message: detail.message,
          });
        });
        toast.error(backendError.message || 'Validation failed.');
      } else {
        const message = backendError?.message || 'Registration failed. Try again.';
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const content = (
    <div className={isModal ? "space-y-4" : "w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-md border border-slate-100"}>
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-purple/10 text-brand-purple">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900">
          Create an Account
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Already have an account?{' '}
          {onSwitchToLogin ? (
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-semibold text-brand-purple hover:text-brand-purple-dark cursor-pointer bg-transparent border-0 p-0"
            >
              Sign in
            </button>
          ) : (
            <Link
              to="/login"
              className="font-semibold text-brand-purple hover:text-brand-purple-dark"
            >
              Sign in
            </Link>
          )}
        </p>
      </div>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            type="text"
            placeholder="Mae"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Last Name"
            type="text"
            placeholder="Jemison"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <div className="relative">
          <Input
            label="Mobile Number"
            type="text"
            placeholder="9876543210"
            error={errors.mobileNumber?.message}
            {...register('mobileNumber')}
            className="pl-10"
          />
          <Phone className="absolute left-3.5 top-[38px] h-4 w-4 text-slate-400" />
        </div>

        <div className="relative">
          <Input
            label="Email Address"
            type="email"
            placeholder="mae@example.com"
            error={errors.email?.message}
            {...register('email')}
            className="pl-10"
          />
          <Mail className="absolute left-3.5 top-[38px] h-4 w-4 text-slate-400" />
        </div>

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
            className="pl-10 pr-10"
            helperText="Must be 12+ chars with uppercase, lowercase, number, and special char."
          />
          <Lock className="absolute left-3.5 top-[38px] h-4 w-4 text-slate-400" />
          <button
            type="button"
            className="absolute right-3.5 top-[38px] text-slate-400 hover:text-slate-600 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
          </button>
        </div>

        <div className="relative">
          <Input
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
            className="pl-10 pr-10"
          />
          <Lock className="absolute left-3.5 top-[38px] h-4 w-4 text-slate-400" />
        </div>

        <div className="pt-2">
          <Button type="submit" isLoading={isLoading} className="w-full">
            Register Account
          </Button>
        </div>
      </form>
    </div>
  );

  if (isModal) {
    return <div className="p-8">{content}</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      {content}
    </div>
  );
};
export default Register;
