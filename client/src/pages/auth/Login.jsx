import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';

const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Email or mobile number is required')
    .max(254, 'Email or mobile number must not exceed 254 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(128, 'Password must not exceed 128 characters'),
});

export const Login = ({ onSwitchToRegister, onSuccess, isModal }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const userData = await login(data);
      toast.success(`Welcome back, ${userData.firstName}!`);
      
      if (onSuccess) {
        onSuccess(userData);
      }
      
      const target = userData?.role === 'ADMIN' ? '/dashboard/admin' : (location.state?.from?.pathname && !location.state?.from?.pathname.startsWith('/dashboard/admin') ? location.state.from.pathname : '/dashboard');
      setTimeout(() => {
        navigate(target, { replace: true });
      }, 600);
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.error?.message || 'Invalid email or password';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const content = (
    <div className={isModal ? "space-y-6" : "w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-md border border-slate-100"}>
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-purple/10 text-brand-purple">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900">
          Sign in to FinPay
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Or{' '}
          {onSwitchToRegister ? (
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="font-semibold text-brand-purple hover:text-brand-purple-dark cursor-pointer bg-transparent border-0 p-0"
            >
              create a new account
            </button>
          ) : (
            <Link
              to="/register"
              className="font-semibold text-brand-purple hover:text-brand-purple-dark"
            >
              create a new account
            </Link>
          )}
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div className="relative">
            <Input
              label="Email or Mobile Number"
              type="text"
              placeholder="Enter your email or mobile number"
              error={errors.identifier?.message}
              {...register('identifier')}
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
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded-sm border-slate-300 text-brand-purple focus:ring-brand-purple"
            />
            <label htmlFor="remember-me" className="ml-2 block text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <Link
              to="/forgot-password"
              className="font-semibold text-brand-purple hover:text-brand-purple-dark"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        <div>
          <Button type="submit" isLoading={isLoading} className="w-full">
            Sign In
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
export default Login;
