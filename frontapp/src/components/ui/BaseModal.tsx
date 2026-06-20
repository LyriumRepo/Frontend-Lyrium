'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/ui/Icon';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
  accentColor?: string;
  headerBgColor?: string;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

const sizeStyles: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  'full': 'max-w-full',
};

export default function BaseModal({
  isOpen,
  onClose,
  title,
  subtitle,
  size = 'md',
  accentColor = 'from-[var(--turquesa-500)] to-[var(--verde-500)]',
  headerBgColor,
  children,
  className = '',
}: BaseModalProps) {
  const [mounted, setMounted] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!isOpen || !mounted) return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`
          relative w-full ${sizeStyles[size] || sizeStyles.md}
          bg-[var(--bg-card)] rounded-[2.5rem] shadow-2xl
          border border-[var(--border-subtle)]
          flex flex-col max-h-[90vh] animate-scaleIn
          ${className}
        `}
      >
        <div
          className={`relative shrink-0 px-8 pt-8 pb-6 -mx-0 -mt-0 rounded-t-[2.5rem] ${!headerBgColor ? `bg-gradient-to-r ${accentColor}` : ''}`}
          style={headerBgColor ? { background: `linear-gradient(to right, ${headerBgColor}, ${headerBgColor}dd)` } : undefined}
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-all active:scale-90"
          >
            <Icon name="X" className="w-5 h-5" />
          </button>
          <div className="pr-12">
            <h2 className="text-2xl font-black text-white tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-white/70 font-bold mt-1.5 max-w-md">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="p-8 overflow-y-auto">{children}</div>
      </div>
    </div>,
    modalRoot,
  );
}