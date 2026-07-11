'use client';
import { useEffect } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
  showClose?: boolean;
}

export default function Modal({ open, onClose, className = '', children, showClose = true }: Props) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] grid place-items-center px-4 pb-8 pt-[8vh] md:pt-[12vh] transition-opacity duration-300"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      onKeyDown={e => { if (e.key === 'Escape') onClose(); }}
    >
      <div className={`bg-white dark:bg-[var(--bg-card)] rounded-2xl p-5 md:p-6 max-h-[75vh] overflow-y-auto scrollbar-hide relative animate-[slideUp_0.3s_ease] w-full ${className}`}>
        {showClose && (
          <button className="absolute top-4 right-4 w-9 h-9 bg-gray-100 dark:bg-[var(--bg-muted)] border-none rounded-lg text-gray-500 dark:text-[var(--text-muted)] text-xl cursor-pointer flex items-center justify-center transition-colors hover:bg-red-500 hover:text-white"
            onClick={onClose}>×</button>
        )}
        {children}
      </div>
    </div>
  );
}
