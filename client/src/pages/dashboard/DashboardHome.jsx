import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Sparkles, ShieldCheck, CheckCircle2, User, Wallet } from 'lucide-react';

export const DashboardHome = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand-purple">
              <Sparkles className="h-4 w-4" />
              Onboarding Complete
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl">
              Welcome to FinPay, {user?.firstName ?? 'User'}!
            </h1>
            <p className="text-slate-500 text-sm md:text-base">
              Your digital wallet and instant transfer account is fully active and secured.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-2 text-emerald-800 text-sm font-semibold">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
            Verified Profile
          </div>
        </div>

        {/* Purple glow backdrop */}
        <div className="absolute right-0 top-0 h-40 w-40 bg-brand-purple/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Grid status overview (Skeleton-like but finished design) */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Wallet status card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs flex flex-col justify-between h-44 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Wallet Balance</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-slate-950">₹0.00</span>
            <p className="text-xxs font-semibold uppercase tracking-wider text-slate-400 mt-1">Wallet ACTIVE</p>
          </div>
        </div>

        {/* User status card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs flex flex-col justify-between h-44 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">User Profile</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-purple/10 text-brand-purple">
              <User className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-lg font-bold text-slate-800">@{user?.username}</span>
            <p className="text-xxs font-semibold uppercase tracking-wider text-slate-400 mt-1">{user?.email}</p>
          </div>
        </div>

        {/* System security card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs flex flex-col justify-between h-44 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Security State</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <span className="text-lg font-bold text-slate-800">Session Secure</span>
            <p className="text-xxs font-semibold uppercase tracking-wider text-slate-400 mt-1">Automatic Token Rotation Active</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardHome;
