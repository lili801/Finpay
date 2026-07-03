import React from 'react';
import { cn } from '../../utils/cn.js';

export const Input = React.forwardRef(
  ({ className, type = 'text', label, error, helperText, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            'flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 shadow-xs transition-all placeholder:text-slate-400 focus:border-brand-purple focus:outline-hidden focus:ring-1 focus:ring-brand-purple disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-50',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className,
          )}
          {...props}
        />
        {error && <span className="text-xs font-medium text-red-500">{error}</span>}
        {!error && helperText && <span className="text-xs text-slate-400">{helperText}</span>}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
