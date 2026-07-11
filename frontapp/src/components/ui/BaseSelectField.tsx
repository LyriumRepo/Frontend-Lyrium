'use client';

import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface BaseSelectFieldProps {
  label?: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
  className?: string;
}

export default function BaseSelectField({
  label,
  name,
  value,
  onChange,
  options,
  error,
  placeholder,
  className = '',
}: BaseSelectFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1"
        >
          {label}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full px-5 py-3 bg-[var(--bg-secondary)] border border-[var(--border-subtle)]
          rounded-2xl font-bold text-[var(--text-primary)]
          focus:ring-4 focus:ring-sky-500/10 focus:bg-[var(--bg-card)] focus:border-sky-500/30
          dark:focus:ring-[var(--brand-green)]/10 dark:focus:border-[var(--brand-green)]/30
          transition-all outline-none cursor-pointer
          ${error ? 'border-red-500 ring-4 ring-red-500/10' : ''}
        `}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-[10px] font-bold text-red-500 ml-1 mt-1">{error}</p>
      )}
    </div>
  );
}
