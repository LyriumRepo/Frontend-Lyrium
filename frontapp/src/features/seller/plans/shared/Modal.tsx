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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 transition-opacity duration-300"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      onKeyDown={e => { if (e.key === 'Escape') onClose(); }}
    >
      <div className={`bg-white dark:bg-[var(--bg-card)] rounded-2xl p-6 max-h-[90vh] overflow-y-auto relative animate-[slideUp_0.3s_ease] ${className}`}>
        {showClose && (
          <button className="absolute top-4 right-4 w-9 h-9 bg-gray-100 dark:bg-[var(--bg-muted)] border-none rounded-lg text-gray-500 dark:text-[var(--text-muted)] text-xl cursor-pointer flex items-center justify-center transition-colors hover:bg-red-500 hover:text-white"
            onClick={onClose}>×</button>
        )}
        {children}
      </div>
    </div>
  );
}
