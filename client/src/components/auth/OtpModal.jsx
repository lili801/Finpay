import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../ui/Button.jsx';

export const OtpModal = ({ email, onSuccess, onClose }) => {
  const { verifyEmail, resendOtp } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Auto focus first input box on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (index, value) => {
    setErrorMsg('');
    if (!/^\d*$/.test(value)) return; // Numeric only

    const newOtp = [...otp];
    // Take last entered character if multiple typed
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto move to next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0 && inputRefs.current[index - 1]) {
        // Move to previous input on backspace if current is empty
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
      }
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) return;

    setIsLoading(true);
    setErrorMsg('');
    try {
      await verifyEmail({ email, otp: fullOtp });
      onSuccess();
    } catch (error) {
      console.error(error);
      const message =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        'Invalid verification code.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    setErrorMsg('');
    try {
      await resendOtp(email);
      toast.success('A new verification code has been sent.');
      setCountdown(30);
    } catch (error) {
      console.error(error);
      const message =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        'Failed to resend verification code.';
      setErrorMsg(message);
    } finally {
      setIsResending(false);
    }
  };

  const isComplete = otp.join('').length === 6;

  return (
    <div className="p-6 text-center space-y-5">
      <div className="flex flex-col items-center justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-purple/10 text-brand-purple">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          🎉 Registration Successful
        </h2>
        <p className="mt-1 text-sm font-medium text-slate-600">
          Your account has been created successfully.
        </p>
        <p className="mt-3 text-xs text-slate-500 max-w-sm leading-relaxed">
          We've sent a 6-digit verification code to{' '}
          <span className="font-semibold text-slate-800 break-all">{email}</span>.
          Please enter the verification code below to activate your account.
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        {/* OTP 6 Box Input */}
        <div className="flex justify-center items-center gap-2 pt-2" onPaste={handlePaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className={`h-12 w-12 text-center text-xl font-bold rounded-xl border transition-all duration-150 outline-none ${
                errorMsg
                  ? 'border-red-400 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-400'
                  : digit
                  ? 'border-brand-purple bg-purple-50/40 text-slate-900 focus:ring-2 focus:ring-brand-purple'
                  : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-brand-purple focus:bg-white focus:ring-2 focus:ring-brand-purple/20'
              }`}
            />
          ))}
        </div>

        {/* Inline Error Message */}
        {errorMsg && (
          <p className="text-xs font-medium text-red-600 bg-red-50 py-1.5 px-3 rounded-lg border border-red-100">
            {errorMsg}
          </p>
        )}

        {/* Action Buttons */}
        <div className="pt-2 space-y-3">
          <Button
            type="submit"
            disabled={!isComplete || isLoading}
            isLoading={isLoading}
            className="w-full py-2.5"
          >
            Verify OTP
          </Button>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0 || isResending}
              className={`font-medium transition-colors cursor-pointer border-0 bg-transparent p-0 ${
                countdown > 0 || isResending
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'text-brand-purple hover:text-brand-purple-dark underline'
              }`}
            >
              {isResending ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Sending...
                </span>
              ) : countdown > 0 ? (
                `Resend OTP in ${countdown}s`
              ) : (
                'Resend OTP'
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 font-medium cursor-pointer border-0 bg-transparent p-0"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default OtpModal;
