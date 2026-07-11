'use client';
import { ShieldCheck, X } from 'lucide-react';
import Image from 'next/image';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  error?: string | null;
}

export default function IzipayModal({ isOpen, onClose, error }: Props) {
  const modalRef = useFocusTrap<HTMLDivElement>(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[30000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Pago seguro con Izipay"
        tabIndex={-1}
        className="relative bg-white dark:bg-[var(--bg-card)] w-full max-w-sm rounded-2xl shadow-2xl border border-gray-100 dark:border-[var(--border-subtle)] overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative w-14 h-7">
              <Image
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS82g5FrC0YFl2vLYDBioVuYkTPKSMR9qyqHQ&s"
                alt="Izipay"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <span className="text-[10px] font-bold text-gray-400 dark:text-[var(--text-muted)] uppercase tracking-widest">
              Secure Checkout
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-[var(--bg-muted)] flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-[var(--bg-secondary)] transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs leading-relaxed">
              {error}
            </div>
          )}

          {/* Solución: Contenedor flex separado y el formulario con mx-auto */}
          <div className="w-full flex justify-center items-center">
            <div
              className="kr-smart-form w-full mx-auto"
              kr-card-form-expanded="true"
            >
              <button className="kr-payment-button" />
              <div className="kr-form-error" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-[10px] font-semibold text-gray-400 dark:text-[var(--text-muted)] tracking-wide">
              Pago 100% seguro — respaldado por BCP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
