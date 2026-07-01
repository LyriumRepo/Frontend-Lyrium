'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';

interface BaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'action' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: string;
  fullWidth?: boolean;
  isLoading?: boolean;
}

const variantStyles: Record<string, string> = {
  primary:
    'bg-gradient-to-r from-sky-500 to-indigo-500 dark:from-[var(--brand-green)] dark:via-[var(--icons-green)] dark:to-[var(--brand-green)] text-white border border-white/20 shadow-lg shadow-sky-500/25 dark:shadow-[#8FC3A1]/25 hover:shadow-xl hover:shadow-sky-500/30 dark:hover:shadow-[#8FC3A1]/30 hover:-translate-y-0.5',
  secondary:
    'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)] hover:border-[var(--border-default)]',
  ghost:
    'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]',
  danger:
    'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/30 hover:-translate-y-0.5',
  action:
    'bg-gradient-to-r from-emerald-400 via-sky-500 to-indigo-500 dark:from-[var(--brand-green)] dark:via-[var(--icons-green)] dark:to-[var(--brand-green)] text-white border border-white/20 shadow-lg shadow-sky-500/25 dark:shadow-[#8FC3A1]/70 hover:shadow-xl hover:shadow-sky-500/30 dark:hover:shadow-[#8FC3A1]/50 hover:-translate-y-0.5',
  outline:
    'bg-transparent border-2 border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-sky-500/50 hover:text-sky-500',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-4 py-2 text-[10px]',
  md: 'px-5 py-2.5 text-[10px] sm:px-6 sm:py-3 sm:text-xs md:px-7 md:py-3.5 md:text-sm',
  lg: 'px-8 py-4 text-sm',
};

export default function BaseButton({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  fullWidth,
  isLoading,
  disabled,
  className = '',
  ...props
}: BaseButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest rounded-2xl
        transition-all duration-200 active:scale-[0.97]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:translate-y-0
        ${variantStyles[variant] || variantStyles.primary}
        ${sizeStyles[size] || sizeStyles.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : leftIcon ? (
        <Icon name={leftIcon} className="w-4 h-4 md:w-5 md:h-5" />
      ) : null}
      {children}
    </button>
  );
}