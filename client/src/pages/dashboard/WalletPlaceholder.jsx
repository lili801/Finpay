import React from 'react';
import { ArrowLeftRight, Hourglass } from 'lucide-react';

export const WalletPlaceholder = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center border border-dashed border-slate-200 rounded-2xl p-12 bg-white">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-purple/10 text-brand-purple mb-4">
        <ArrowLeftRight className="h-6 w-6" />
      </div>
      <h2 className="text-xl font-bold text-slate-800">Wallet Operations</h2>
      <p className="text-slate-500 mt-2 max-w-sm text-sm">
        Add Money and Transfer Money features will be implemented in the next increment.
      </p>
      <div className="mt-6 flex items-center gap-2 text-xxs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-100">
        <Hourglass className="h-3.5 w-3.5" />
        Coming Soon
      </div>
    </div>
  );
};
export default WalletPlaceholder;
