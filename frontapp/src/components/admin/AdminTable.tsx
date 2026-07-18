'use client';

import React from 'react';
import BaseLoading from '@/components/ui/BaseLoading';
import BaseEmptyState from '@/components/ui/BaseEmptyState';
import BaseErrorState from '@/components/ui/BaseErrorState';
import Icon from '@/components/ui/Icon';

export interface Column<T> {
    key: string;
    header: string;
    render: (item: T) => React.ReactNode;
    align?: 'left' | 'center' | 'right';
    hideMobile?: boolean;
}

interface AdminTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyField?: string;
    onRowClick?: (item: T) => void;
    loading?: boolean;
    error?: string | null;
    onRetry?: () => void;
    emptyIcon?: string;
    emptyTitle?: string;
    emptyDescription?: string;
    countLabel?: string;
    mobileCardRender?: (item: T) => React.ReactNode;
    className?: string;
}

export default function AdminTable<T extends Record<string, any>>({
    data,
    columns,
    keyField = 'id',
    onRowClick,
    loading,
    error,
    onRetry,
    emptyIcon = 'Package',
    emptyTitle = 'Sin datos',
    emptyDescription,
    countLabel,
    mobileCardRender,
    className = '',
}: AdminTableProps<T>) {
    if (loading) {
        return <BaseLoading message="Cargando..." />;
    }

    if (error) {
        return (
            <BaseErrorState
                title="Error"
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
        <div className={`glass-card overflow-hidden animate-fadeIn ${className}`}>
            {countLabel && (
                <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
                    <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                        {data.length} {countLabel}
                    </p>
                </div>
            )}

            {/* Mobile: cards */}
            {mobileCardRender ? (
                <div className="sm:hidden divide-y divide-[var(--border-subtle)]">
                    {data.map((item, idx) => (
                        <div
                            key={item[keyField] ?? idx}
                            onClick={() => onRowClick?.(item)}
                            className={`${onRowClick ? 'cursor-pointer' : ''}`}
                        >
                            {mobileCardRender(item)}
                        </div>
                    ))}
                </div>
            ) : null}

            {/* Desktop: table */}
            <div className={`overflow-x-auto no-scrollbar ${mobileCardRender ? 'hidden sm:block' : ''}`}>
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-subtle)] text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={`px-6 py-5 ${col.hideMobile ? 'hidden md:table-cell' : ''} ${
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
                                className={`hover:bg-[var(--bg-secondary)]/50 transition-colors ${
                                    onRowClick ? 'cursor-pointer' : ''
                                }`}
                            >
                                {columns.map((col) => (
                                    <td
                                        key={col.key}
                                        className={`px-6 py-4 ${col.hideMobile ? 'hidden md:table-cell' : ''} ${
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
