'use client';

import React, { useEffect, useCallback } from 'react';
import Icon from '@/components/ui/Icon';

interface BaseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  badge?: string;
  width?: string;
  accentColor?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export default function BaseDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  width,
  accentColor = 'from-sky-500/10 via-indigo-500/5',
  footer,
  children,
  size,
}: BaseDrawerProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const widthClass = width || (size ? sizeMap[size] || sizeMap.md : 'md:w-[500px]');

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={title || 'Panel lateral'}>
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`
          relative w-full ${widthClass} bg-[var(--bg-card)]
          h-full shadow-2xl border-l border-[var(--border-subtle)]
          overflow-y-auto animate-slideInRight
        `}
      >
        <div
          className={`sticky top-0 z-10 bg-gradient-to-r ${accentColor} backdrop-blur-md border-b border-[var(--border-subtle)] p-6`}
        >
          <div className="flex items-start justify-between">
            <div className="pr-8">
              {badge && (
                <span className="inline-block text-[9px] font-black text-sky-500 uppercase tracking-widest bg-sky-500/10 px-2.5 py-1 rounded-lg mb-2 border border-sky-500/20">
                  {badge}
                </span>
              )}
              {title && (
                <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-xs font-bold text-[var(--text-secondary)] mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-all active:scale-90 flex-shrink-0"
            >
              <Icon name="X" className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">{children}</div>

        {footer && (
          <div className="sticky bottom-0 bg-[var(--bg-card)]/95 backdrop-blur-md border-t border-[var(--border-subtle)] p-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
