import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MailCheck, MailWarning, Loader2 } from 'lucide-react';

import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../../components/ui/Button.jsx';

export const VerifyEmail = () => {
  const { verifyEmail } = useAuth();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const verifiedRef = useRef(false);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing. Please check your verification link.');
      return;
    }

    // React 19 double effect invocation prevention
    if (verifiedRef.current) return;
    verifiedRef.current = true;

    const performVerification = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
        setMessage('Your email address has been verified. You can now login.');
      } catch (error) {
        console.error(error);
        const errorMsg = error.response?.data?.error?.message || 'Invalid or expired verification token.';
        setStatus('error');
        setMessage(errorMsg);
      }
    };

    performVerification();
  }, [searchParams, verifyEmail]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-md border border-slate-100 text-center">
        {status === 'verifying' && (
          <div className="flex flex-col items-center justify-center gap-4 py-6">
            <Loader2 className="h-12 w-12 animate-spin text-brand-purple" />
            <h2 className="text-xl font-bold text-slate-900">Verifying your email</h2>
            <p className="text-sm text-slate-500">
              Please wait while we confirm your email verification...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center justify-center gap-4 py-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <MailCheck className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Email Verified!</h2>
            <p className="text-sm text-slate-500">{message}</p>
            <div className="pt-4 w-full">
              <Link to="/login">
                <Button className="w-full">Sign In to Continue</Button>
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center gap-4 py-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
              <MailWarning className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Verification Failed</h2>
            <p className="text-sm text-slate-500">{message}</p>
            <div className="pt-4 w-full">
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Return to Login
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default VerifyEmail;
