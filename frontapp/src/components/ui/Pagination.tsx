'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemLabel?: string;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  totalItems,
  itemLabel,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 pt-1">
      <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
        Página {page} de {totalPages}
        {totalItems !== undefined &&
          ` · ${totalItems} ${itemLabel ?? 'registros'}`}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Icon name="ChevronLeft" className="w-3.5 h-3.5" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
          <button
            key={pg}
            onClick={() => onPageChange(pg)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-black transition-colors
                            ${
                              page === pg
                                ? 'bg-sky-500/20 dark:bg-[#8FC3A1]/20 text-sky-500 dark:text-[#8FC3A1] border border-sky-500/30 dark:border-[#8FC3A1]/30'
                                : 'border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
                            }`}
          >
            {pg}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Icon name="ChevronRight" className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
