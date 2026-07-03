import React from 'react';
import { cn } from '../../utils/cn.js';

export const Button = React.forwardRef(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
          // Variants
          variant === 'primary' &&
            'bg-brand-purple text-white hover:bg-brand-purple-dark focus:ring-brand-purple shadow-sm',
          variant === 'secondary' &&
            'bg-brand-purple-light text-brand-purple-dark hover:bg-indigo-100 focus:ring-brand-purple',
          variant === 'outline' &&
            'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-brand-purple',
          variant === 'ghost' &&
            'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400',
          variant === 'danger' &&
            'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
          // Sizes
          size === 'sm' && 'h-9 px-3 text-xs',
          size === 'md' && 'h-11 px-5 text-sm',
          size === 'lg' && 'h-13 px-8 text-base',
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin text-current"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
