import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, ChevronLeft, ShieldAlert } from 'lucide-react';

import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address')
    .max(254, 'Email must not exceed 254 characters'),
});

export const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await forgotPassword(data.email);
      setIsSubmitted(true);
      toast.success('Instructions sent to your email.');
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.error?.message || 'Failed to submit password reset request.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-md border border-slate-100">
        {!isSubmitted ? (
          <>
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-purple/10 text-brand-purple">
                <ShieldAlert className="h-7 w-7" />
              </div>
              <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900">
                Reset Password
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Enter your email address and we'll send you instructions to reset your password.
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="relative">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                  className="pl-10"
                />
                <Mail className="absolute left-3.5 top-[38px] h-4 w-4 text-slate-400" />
              </div>

              <div>
                <Button type="submit" isLoading={isLoading} className="w-full">
                  Send Instructions
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center gap-4 py-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <Mail className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Check your Email</h2>
            <p className="text-sm text-slate-500">
              If an account exists with that email, we have sent instructions to reset your password.
            </p>
          </div>
        )}

        <div className="flex justify-center border-t border-slate-100 pt-4">
          <Link
            to="/login"
            className="flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
export default ForgotPassword;
