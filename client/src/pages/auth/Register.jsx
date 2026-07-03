import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User as UserIcon, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please type a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await registerUser(data);
      toast.success('Registration successful! Please check your email to verify your account.');
      navigate('/login');
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.error?.message || 'Registration failed. Try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-md border border-slate-100">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-purple/10 text-brand-purple">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900">
            Create an Account
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-brand-purple hover:text-brand-purple-dark"
            >
              Sign in
            </Link>
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
              label="Username"
              type="text"
              placeholder="mae"
              error={errors.username?.message}
              {...register('username')}
              className="pl-10"
            />
            <UserIcon className="absolute left-3.5 top-[38px] h-4 w-4 text-slate-400" />
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
              helperText="Must be 8+ chars with uppercase, lowercase, number, and special char."
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

          <div className="pt-2">
            <Button type="submit" isLoading={isLoading} className="w-full">
              Register Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default Register;
