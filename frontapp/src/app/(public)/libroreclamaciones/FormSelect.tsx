'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface FormSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

export default function FormSelect({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
}: FormSelectProps) {
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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-gray-50 dark:bg-[#e8e8e8] border-2 border-gray-100 dark:border-gray-200 rounded-2xl px-5 py-3.5
          focus:border-sky-500 dark:focus:border-[var(--brand-green)]
          focus:bg-white dark:focus:bg-white
          outline-none transition-all font-semibold text-left
          flex items-center justify-between gap-2
          text-gray-700 dark:text-gray-900
          cursor-pointer hover:border-gray-200 dark:hover:border-gray-300"
      >
        <span className={value ? '' : 'text-gray-400'}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1 w-full rounded-2xl border-2 border-gray-100 dark:border-gray-200 shadow-lg overflow-hidden
            bg-white dark:bg-[#e8e8e8]
            max-h-60 overflow-y-auto"
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`w-full px-5 py-3 text-sm text-left transition-all
                ${opt === value
                  ? 'bg-sky-50 dark:bg-[var(--brand-green)]/20 text-sky-700 dark:text-[#1A3A32] font-bold'
                  : 'text-gray-700 dark:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-200'
                }
              `}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}