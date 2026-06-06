'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  disabled = false,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = value || placeholder;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={`w-full px-4 py-2.5 rounded-xl border text-sm text-left flex items-center justify-between gap-2 transition
          bg-white dark:bg-[var(--bg-card)]
          border-gray-200 dark:border-[var(--border-subtle)]
          text-gray-900 dark:text-[var(--text-primary)]
          focus:ring-2 focus:ring-[var(--brand-sky)]/30 focus:border-[var(--brand-sky)] outline-none
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-300 dark:hover:border-[var(--border-default)]'}
        `}
      >
        <span className={value ? '' : 'text-gray-400 dark:text-[var(--text-placeholder)]'}>
          {selectedLabel}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 dark:text-[var(--text-muted)] transition-transform shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && !disabled && (
        <div
          className="absolute z-50 mt-1 w-full rounded-xl border shadow-lg overflow-hidden
            bg-white dark:bg-[var(--bg-card)]
            border-gray-200 dark:border-[var(--border-subtle)]
            max-h-60 overflow-y-auto"
        >
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400 dark:text-[var(--text-muted)] text-center">
              Sin opciones
            </div>
          ) : (
            options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-sm text-left transition
                  ${opt === value
                    ? 'bg-[var(--brand-sky)]/10 text-[var(--brand-sky)] font-semibold'
                    : 'text-gray-900 dark:text-[var(--text-primary)] hover:bg-gray-50 dark:hover:bg-[var(--bg-secondary)]'
                  }
                `}
              >
                {opt}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
