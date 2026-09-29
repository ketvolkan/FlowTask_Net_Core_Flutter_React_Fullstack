import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, children, className, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            {label}
          </label>
        )}
        <div className="relative rounded-lg shadow-sm">
          <select
            id={selectId}
            ref={ref}
            className={twMerge(
              clsx(
                'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500',
                error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500',
                className
              )
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
        </div>
        {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
