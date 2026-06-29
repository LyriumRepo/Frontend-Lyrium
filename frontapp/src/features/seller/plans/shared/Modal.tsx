'use client';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`bg-white dark:bg-[var(--bg-card)] backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/10 max-h-[90vh] overflow-y-auto relative max-w-lg w-full border border-gray-200/50 dark:border-[var(--border-subtle)] ${className}`}
          >
            {showClose && (
              <button
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-xl bg-gray-100 dark:bg-[var(--bg-muted)] hover:bg-teal-100 dark:hover:bg-teal-900/30 text-gray-400 hover:text-teal-500 dark:text-gray-500 transition-all flex items-center justify-center"
                onClick={onClose}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
            <div className="p-6 sm:p-8">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
