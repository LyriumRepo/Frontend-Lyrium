import React from 'react';
import Icon from '@/components/ui/Icon';

interface BaseLoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  variant?: 'default' | 'card';
}

const sizeMap: Record<string, { icon: number; text: string }> = {
  sm: { icon: 20, text: 'text-xs' },
  md: { icon: 32, text: 'text-sm' },
  lg: { icon: 40, text: 'text-base' },
};

export default function BaseLoading({
  className = '',
  size = 'md',
  message,
  variant = 'default',
}: BaseLoadingProps) {
  const s = sizeMap[size] || sizeMap.md;

  if (variant === 'card') {
    return (
      <div
        className={`flex flex-col items-center justify-center py-16 text-center ${className}`}
      >
        <div className="w-16 h-16 rounded-[2rem] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center mb-4 shadow-inner">
          <Icon
            name="Loader"
            className={`w-8 h-8 text-[var(--celeste-500)] animate-spin`}
          />
        </div>
        {message && (
          <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">
            {message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
    >
      <Icon
        name="Loader"
        className={`text-[var(--celeste-500)] animate-spin`}
        size={s.icon}
      />
      {message && (
        <p
          className={`${s.text} font-black text-[var(--text-secondary)] uppercase tracking-widest`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
