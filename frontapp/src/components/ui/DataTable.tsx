'use client';

import React from 'react';
import Icon from './Icon';
import BaseLoading from './BaseLoading';
import BaseErrorState from './BaseErrorState';
import BaseEmptyState from './BaseEmptyState';

export interface Column<T> {
    key: string;
    header: string;
    render?: (item: T) => React.ReactNode;
    className?: string;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
}

export interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    error?: string | null;
    loadingMessage?: string;
    errorTitle?: string;
    emptyTitle?: string;
    emptyDescription?: string;
    emptyIcon?: string;
    emptySuggestion?: string;
    onRetry?: () => void;
    onRowClick?: (item: T) => void;
    keyField: keyof T;
    countLabel?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    onSort?: (key: string) => void;
}

export default function DataTable<T>({
    data,
    columns,
    loading = false,
    error = null,
    loadingMessage = 'Cargando datos...',
    errorTitle = 'Error',
    emptyTitle = 'Sin datos',
    emptyDescription = 'No hay elementos para mostrar',
    emptyIcon = 'Inbox',
    emptySuggestion,
    onRetry,
    onRowClick,
    keyField,
    countLabel = 'Items',
    sortBy,
    sortOrder,
    onSort
}: DataTableProps<T>) {
    if (loading) {
        return <BaseLoading message={loadingMessage} variant="card" />;
    }

    if (error) {
        return (
            <BaseErrorState
                title={errorTitle}
                message={error}
                icon="AlertCircle"
                onRetry={onRetry}
            />
        );
    }

    if (data.length === 0) {
        return (
            <BaseEmptyState
                title={emptyTitle}
                description={emptyDescription}
                icon={emptyIcon}
                suggestion={emptySuggestion}
            />
        );
    }

    const getAlignClass = (align?: 'left' | 'center' | 'right') => {
        switch (align) {
            case 'center': return 'text-center';
            case 'right': return 'text-right';
            default: return 'text-left';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, item: T) => {
        if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onRowClick(item);
        }
    };

    return (
        <div className="bg-[var(--bg-card)] rounded-3xl overflow-hidden border border-[var(--border-subtle)] shadow-sm transition-all hover:shadow-md">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[var(--bg-secondary)]">
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    scope="col"
                                    className={`px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest border-b border-[var(--border-subtle)] ${getAlignClass(column.align)} ${column.className || ''}`}
                                >
                                    {column.sortable && onSort ? (
                                        <button
                                            onClick={() => onSort(column.key)}
                                            className="inline-flex items-center gap-2 hover:text-[var(--brand-sky)] transition-colors"
                                            aria-sort={sortBy === column.key ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                                        >
                                            {column.header}
                                            <Icon 
                                                name={sortBy === column.key ? (sortOrder === 'asc' ? 'ArrowUp' : 'ArrowDown') : 'ArrowUpDown'} 
                                                className="w-4 h-4" 
                                            />
                                        </button>
                                    ) : (
                                        column.header
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                        {data.map((item) => (
                            <tr
                                key={String(item[keyField])}
                                className={`group hover:bg-[var(--bg-secondary)] transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                                onClick={() => onRowClick?.(item)}
                                onKeyDown={(e) => handleKeyDown(e, item)}
                                tabIndex={onRowClick ? 0 : undefined}
                                role={onRowClick ? 'button' : undefined}
                            >
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className={`px-8 py-5 ${getAlignClass(column.align)} ${column.className || ''}`}
                                    >
                                        {column.render
                                            ? column.render(item)
                                            : String((item as Record<string, unknown>)[column.key] ?? '')}
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
