'use client';

import React from 'react';
import BaseLoading from '@/components/ui/BaseLoading';
import BaseErrorState from '@/components/ui/BaseErrorState';
import BaseEmptyState from '@/components/ui/BaseEmptyState';
import Icon from '@/components/ui/Icon';

export interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  onRowClick?: (item: T) => void;
  keyField?: string;
  loading?: boolean;
  error?: string | null;
  loadingMessage?: string;
  errorTitle?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: string;
  emptySuggestion?: string;
  onRetry?: () => void;
  countLabel?: string;
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  className = '',
  onRowClick,
  keyField = 'id',
  loading,
  error,
  loadingMessage = 'Cargando...',
  errorTitle = 'Error',
  emptyTitle = 'Sin datos',
  emptyDescription,
  emptyIcon = 'Package',
  onRetry,
  countLabel,
}: DataTableProps<T>) {
  if (loading) {
    return <BaseLoading message={loadingMessage} />;
  }

  if (error) {
    return (
      <BaseErrorState
        title={errorTitle}
        message={error}
        onRetry={onRetry}
        icon={emptyIcon}
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <BaseEmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon={emptyIcon}
      />
    );
  }

  return (
    <div className={`overflow-hidden animate-fadeIn ${className}`}>
      {countLabel && (
        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-3 px-1">
          {data.length} {countLabel}
        </p>
      )}
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-subtle)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {data.map((item, idx) => (
              <tr
                key={item[keyField] ?? idx}
                onClick={() => onRowClick?.(item)}
                className={`hover:bg-[var(--bg-secondary)]/30 transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-6 py-4 ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                    }`}
                  >
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
