'use client';

import { useState } from 'react';
import Icon from '@/components/ui/Icon';

export interface KpiBadgeProps {
  label: string;
  level: 'regular' | 'good' | 'excellent';
  scale?: string | null;
}

export default function KpiBadge({ label, level, scale }: KpiBadgeProps) {
  const [open, setOpen] = useState(false);

  const toggle = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setOpen((o) => !o);
  };

  return (
    <div className="mt-2 flex items-center gap-2">
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
          level === 'excellent'
            ? 'bg-[var(--color-info)]/15 text-[var(--color-info)] border-[var(--color-info)]/25 dark:bg-[var(--icons-green)]/15 dark:text-[var(--icons-green)] dark:border-[var(--icons-green)]/25'
            : level === 'good'
              ? 'bg-[var(--color-info)]/10 text-[var(--color-info)]/80 border-[var(--color-info)]/20 dark:bg-[var(--icons-green)]/10 dark:text-[var(--icons-green)]/80 dark:border-[var(--icons-green)]/20'
              : 'bg-[var(--color-info)]/5 text-[var(--color-info)]/60 border-[var(--color-info)]/15 dark:bg-[var(--icons-green)]/5 dark:text-[var(--icons-green)]/60 dark:border-[var(--icons-green)]/15'
        }`}
      >
        {level === 'excellent' && <span>★</span>}
        {level === 'good' && <span>✓</span>}
        {level === 'regular' && <span>!</span>}
        {label}
      </div>

      {scale && (
        <div className="relative group/info">
          <span
            role="button"
            tabIndex={0}
            onClick={toggle}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle(e);
              }
            }}
            aria-label="Ver rangos del indicador"
            className="inline-flex items-center justify-center cursor-pointer text-[var(--icons-green)]/70 hover:text-[var(--icons-green)] transition-colors"
          >
            <Icon name="Info" className="w-3.5 h-3.5" />
          </span>

          <div
            className={`absolute bottom-full left-0 mb-2 bg-[var(--bg-card)] p-3 rounded-xl shadow-2xl border border-[var(--border-subtle)] w-56 transition-all z-[100] text-left pointer-events-none group-hover/info:opacity-100 group-hover/info:visible ${
              open ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}
          >
            <p className="text-[9px] font-black text-[var(--icons-green)] uppercase tracking-widest mb-1">
              Rangos del indicador
            </p>
            <p className="text-[9px] text-[var(--text-secondary)] font-medium leading-relaxed">
              {scale}
            </p>
            <div className="absolute bottom-[-6px] left-3 w-2.5 h-2.5 bg-[var(--bg-card)] border-r border-b border-[var(--border-subtle)] rotate-45" />
          </div>
        </div>
      )}
    </div>
  );
}
