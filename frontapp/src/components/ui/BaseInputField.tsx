'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';

interface BaseInputFieldProps {
  label?: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  className?: string;
  required?: boolean;
  icon?: string;
  inputClassName?: string;
}

export default function BaseInputField({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  type = 'text',
  className = '',
  required,
  icon,
  inputClassName = '',
}: BaseInputFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <Icon
            name={icon}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] w-4 h-4"
          />
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`
            w-full px-5 py-3 bg-[var(--bg-secondary)] border border-[var(--border-subtle)]
            rounded-2xl font-bold text-[var(--text-primary)]
            focus:ring-4 focus:ring-sky-500/10 focus:bg-[var(--bg-card)] focus:border-sky-500/30
            transition-all outline-none placeholder:text-[var(--text-muted)]
            ${icon ? 'pl-12' : ''}
            ${error ? 'border-red-500 ring-4 ring-red-500/10' : ''}
            ${inputClassName}
          `}
        />
      </div>
      {error && (
        <p className="text-[10px] font-bold text-red-500 ml-1 mt-1">{error}</p>
      )}
    </div>
  );
}
