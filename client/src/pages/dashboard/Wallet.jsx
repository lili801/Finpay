import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet as WalletIcon,
  PlusCircle,
  ArrowUpRight,
  ShieldCheck,
  ShieldAlert,
  Info,
  DollarSign,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Smartphone,
} from 'lucide-react';
import toast from 'react-hot-toast';

import api from '../../services/api.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';

// Schemas
const addMoneySchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, 'Amount is required')
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 1 && num <= 100000;
      },
      { message: 'Amount must be between ₹1 and ₹100,000' },
    ),
});

const transferSchema = z.object({
  receiverMobileNumber: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, 'Receiver Mobile Number must be exactly 10 digits'),
  amount: z
    .string()
    .trim()
    .min(1, 'Amount is required')
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
      },
      { message: 'Amount must be greater than ₹0' },
    ),
});

export const Wallet = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'add';

  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  // Forms
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    setValue: setAddValue,
    reset: resetAdd,
    formState: { errors: errorsAdd, isSubmitting: isSubmittingAdd },
  } = useForm({
    resolver: zodResolver(addMoneySchema),
  });

  const {
    register: registerTransfer,
    handleSubmit: handleSubmitTransfer,
    reset: resetTransfer,
    formState: { errors: errorsTransfer },
  } = useForm({
    resolver: zodResolver(transferSchema),
  });

  // Transfer State Machine: 'input', 'confirm', 'success', 'error'
  const [transferStep, setTransferStep] = useState('input');
  const [transferData, setTransferData] = useState(null);
  const [transferResult, setTransferResult] = useState(null);
  const [transferError, setTransferError] = useState('');
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);

  const fetchWalletDetails = async () => {
    try {
      const [walletRes, balanceRes] = await Promise.all([
        api.get('/wallet'),
        api.get('/wallet/balance'),
      ]);
      setWallet(walletRes.data.data.wallet);
      setBalance(balanceRes.data.data.balance);
    } catch (error) {
      console.error('Error fetching wallet info:', error);
      toast.error('Failed to retrieve wallet information');
    }
  };

  useEffect(() => {
    fetchWalletDetails().finally(() => setLoading(false));
  }, []);

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
    if (tab === 'transfer') {
      setTransferStep('input');
    }
  };

  // 1. Add Money Handler
  const onAddMoneySubmit = async (data) => {
    try {
      const response = await api.post('/wallet/add-money', { amount: data.amount });
      toast.success(`Successfully added ₹${parseFloat(data.amount).toFixed(2)} to wallet!`);
      resetAdd();
      await fetchWalletDetails();
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.error?.message || 'Failed to add money to wallet.';
      toast.error(message);
    }
  };

  // Preset values for Top-up
  const addPreset = (val) => {
    setAddValue('amount', String(val), { shouldValidate: true });
  };

  // 2. Transfer Handlers
  const onTransferInitiate = (data) => {
    // Check sender balance first
    const sendPaise = Math.round(parseFloat(data.amount) * 100);
    if (balance && balance.balance < sendPaise) {
      toast.error('Insufficient wallet balance to perform this transfer.');
      return;
    }
    setTransferData(data);
    setTransferStep('confirm');
  };

  const onTransferConfirm = async () => {
    if (!transferData) return;
    setIsSubmittingTransfer(true);
    setTransferError('');

    try {
      const response = await api.post('/wallet/transfer', {
        receiverMobileNumber: transferData.receiverMobileNumber,
        amount: transferData.amount,
      });

      setTransferResult(response.data.data);
      setTransferStep('success');
      toast.success('Transfer completed successfully!');
      resetTransfer();
      await fetchWalletDetails();
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.error?.message || 'Transfer failed. Please check user details.';
      setTransferError(message);
      setTransferStep('error');
      toast.error(message);
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

  const handleResetTransferFlow = () => {
    setTransferStep('input');
    setTransferData(null);
    setTransferResult(null);
    setTransferError('');
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500">Loading wallet operations...</p>
        </div>
      </div>
    );
  }

  const balanceInRupees = balance ? (balance.balance / 100).toFixed(2) : '0.00';

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 text-left">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Wallet Operations</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your wallet balance or transfer funds securely.</p>
      </div>

      {/* Wallet Status Header Card */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-purple/10 text-brand-purple shrink-0">
            <WalletIcon className="h-6 w-6" />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Wallet Balance</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900">₹{balanceInRupees}</span>
              <span className="text-xs font-semibold text-slate-500">{balance?.currency || 'INR'}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:items-end justify-center gap-1.5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Status</span>
          {wallet?.status === 'ACTIVE' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-100 px-3 py-1 text-xs font-bold text-rose-800">
              <ShieldAlert className="h-4 w-4 text-rose-600" />
              Frozen
            </span>
          )}
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-100">
        <button
          onClick={() => handleTabChange('add')}
          className={`flex-1 py-3 text-center text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'add'
              ? 'border-brand-purple text-brand-purple-dark'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Add Money
        </button>
        <button
          onClick={() => handleTabChange('transfer')}
          className={`flex-1 py-3 text-center text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'transfer'
              ? 'border-brand-purple text-brand-purple-dark'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Transfer Funds
        </button>
      </div>

      {/* Tabs Views */}
      <div className="mt-6">
        {activeTab === 'add' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm space-y-6"
          >
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Add Money to Wallet</h3>
              <p className="text-slate-500 text-xs">Top-up your balance using mock external payment gateway integration.</p>
            </div>

            {wallet?.status !== 'ACTIVE' && (
              <div className="flex gap-3 rounded-xl bg-rose-50 border border-rose-100 p-4 text-rose-800 text-sm">
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                <div>
                  <span className="font-semibold block">Wallet Inactive</span>
                  Your wallet is currently frozen by administrator. Top-up operations are disabled.
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitAdd(onAddMoneySubmit)} className="space-y-6">
              <div className="relative">
                <Input
                  label="Top-up Amount (Rupees)"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  error={errorsAdd.amount?.message}
                  disabled={wallet?.status !== 'ACTIVE'}
                  {...registerAdd('amount')}
                  className="pl-9 pr-12 text-lg font-semibold"
                />
                <span className="absolute left-3.5 top-[39px] text-lg font-bold text-slate-400">₹</span>
                <span className="absolute right-3.5 top-[39px] text-sm font-bold text-slate-400">INR</span>
              </div>

              {/* Preset Amounts */}
              <div className="space-y-2">
                <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Quick Presets</span>
                <div className="flex flex-wrap gap-2">
                  {[100, 500, 1000, 5000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      disabled={wallet?.status !== 'ACTIVE'}
                      onClick={() => addPreset(preset)}
                      className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 hover:border-brand-purple hover:bg-brand-purple-light text-slate-700 hover:text-brand-purple-dark disabled:opacity-50 cursor-pointer"
                    >
                      +₹{preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50">
                <Button
                  type="submit"
                  isLoading={isSubmittingAdd}
                  disabled={wallet?.status !== 'ACTIVE'}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <PlusCircle className="h-4.5 w-4.5" />
                  Proceed to Top-up
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {activeTab === 'transfer' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm"
          >
            {/* Step 1: Input Form */}
            {transferStep === 'input' && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">Transfer Funds</h3>
                  <p className="text-slate-500 text-xs">Instantly send funds directly to another user's wallet via their Mobile Number.</p>
                </div>

                {wallet?.status !== 'ACTIVE' && (
                  <div className="flex gap-3 rounded-xl bg-rose-50 border border-rose-100 p-4 text-rose-800 text-sm">
                    <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                    <div>
                      <span className="font-semibold block">Wallet Inactive</span>
                      Your wallet is frozen. Transfer operations are disabled.
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmitTransfer(onTransferInitiate)} className="space-y-6">
                  <div className="relative">
                    <Input
                      label="Receiver Mobile Number"
                      type="text"
                      placeholder="e.g. 9876543210"
                      error={errorsTransfer.receiverMobileNumber?.message}
                      disabled={wallet?.status !== 'ACTIVE'}
                      {...registerTransfer('receiverMobileNumber')}
                      className="pl-10"
                    />
                    <Smartphone className="absolute left-3.5 top-[38px] h-4 w-4 text-slate-400" />
                  </div>

                  <div className="relative">
                    <Input
                      label="Transfer Amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      error={errorsTransfer.amount?.message}
                      disabled={wallet?.status !== 'ACTIVE'}
                      {...registerTransfer('amount')}
                      className="pl-9 pr-12 text-lg font-semibold"
                    />
                    <span className="absolute left-3.5 top-[39px] text-lg font-bold text-slate-400">₹</span>
                    <span className="absolute right-3.5 top-[39px] text-sm font-bold text-slate-400">INR</span>
                  </div>

                  <div className="pt-4 border-t border-slate-50">
                    <Button
                      type="submit"
                      disabled={wallet?.status !== 'ACTIVE'}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <ArrowUpRight className="h-4.5 w-4.5" />
                      Initiate Transfer
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 2: Confirmation Dialog */}
            {transferStep === 'confirm' && transferData && (
              <div className="space-y-6 py-4">
                <div className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-100 p-4 text-amber-800 text-sm">
                  <Info className="h-5 w-5 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-semibold block">Confirm Your Transfer</span>
                    Please verify the receiver ID and amount. Once confirmed, transfers cannot be cancelled or reversed.
                  </div>
                </div>

                <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 bg-slate-50">
                  <div className="p-4 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-500">Receiver Mobile Number</span>
                    <span className="font-semibold text-slate-800 font-mono">{transferData.receiverMobileNumber}</span>
                  </div>
                  <div className="p-4 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-500">Transfer Amount</span>
                    <span className="text-lg font-black text-slate-900">₹{parseFloat(transferData.amount).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setTransferStep('input')}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    isLoading={isSubmittingTransfer}
                    onClick={onTransferConfirm}
                  >
                    Confirm & Send
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Success Screen */}
            {transferStep === 'success' && transferResult && (
              <div className="text-center py-10 space-y-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-900">Transfer Successful!</h3>
                  <p className="text-sm text-slate-500">The receiver's wallet has been credited instantly.</p>
                </div>

                <div className="max-w-md mx-auto border border-slate-100 rounded-2xl p-6 bg-slate-50 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Transaction ID</span>
                    <span className="font-bold text-slate-800 font-mono">{transferResult.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Amount Debited</span>
                    <span className="font-black text-slate-900">₹{(transferResult.amountTransferred / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Remaining Balance</span>
                    <span className="font-bold text-slate-800">₹{(transferResult.sender.balance / 100).toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-6">
                  <Button className="px-8" onClick={handleResetTransferFlow}>
                    Make Another Transfer
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Error Screen */}
            {transferStep === 'error' && (
              <div className="text-center py-10 space-y-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <XCircle className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-900">Transfer Failed</h3>
                  <p className="text-sm text-slate-500">We were unable to complete this transaction.</p>
                </div>

                <div className="max-w-md mx-auto border border-red-100 rounded-2xl p-6 bg-red-50 text-red-800 text-sm">
                  <span className="font-semibold block mb-1">Reason for failure:</span>
                  {transferError}
                </div>

                <div className="pt-6">
                  <Button variant="outline" className="px-8" onClick={handleResetTransferFlow}>
                    Try Again
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
