'use client';

import React, { useMemo } from 'react';
import Icon from '@/components/ui/Icon';
import { formatCurrency } from '@/shared/lib/utils/formatters';
import { buildStoreCommissions, toPercent, type InvoiceOrderItem, type InvoiceStoreCommission } from './types';

interface Props {
    /** Comisiones ya calculadas por el backend (`storeCommissions`). Tienen prioridad. */
    commissions?: InvoiceStoreCommission[] | null;
    /** Ítems del pedido — se usan para derivar las comisiones si el backend no las envía. */
    items?: InvoiceOrderItem[] | null;
    /** Tasa del comprobante, usada solo si los ítems no traen `commissionRate`. */
    fallbackRate?: number | null;
}

/**
 * "Comisiones por Tienda" — una card por tienda con su subtotal, tasa,
 * comisión e IGV. Se oculta si no hay datos de comisión.
 */
export default function InvoiceStoreCommissionsSection({ commissions, items, fallbackRate }: Props) {
    const rows = useMemo<InvoiceStoreCommission[]>(() => {
        if (commissions && commissions.length > 0) {
            return commissions.map(c => ({ ...c, commissionRate: toPercent(c.commissionRate) }));
        }
        if (items && items.length > 0) {
            return buildStoreCommissions(items, fallbackRate);
        }
        return [];
    }, [commissions, items, fallbackRate]);

    if (rows.length === 0) return null;

    return (
        <div className="space-y-2">
            <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                <Icon name="TrendingUp" className="w-4 h-4" /> Comisiones por Tienda
            </h3>
            <div className="bg-[var(--bg-secondary)] rounded-2xl p-3 border border-[var(--border-subtle)] space-y-3">
                {rows.map((row, idx) => (
                    <div
                        key={`${row.storeId}-${idx}`}
                        className="bg-[var(--bg-card)] rounded-2xl p-4 border border-[var(--border-subtle)] space-y-3"
                    >
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <p className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <Icon name="Store" className="w-4 h-4 text-teal-500" />
                                {row.storeName}
                            </p>
                            <p className="text-[11px] font-semibold text-[var(--text-secondary)]">
                                Subtotal: {formatCurrency(row.subtotal)}
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-[var(--bg-secondary)] rounded-xl p-3 border border-[var(--border-subtle)]">
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Tasa</p>
                                <p className="text-sm font-bold text-[var(--text-primary)]">{row.commissionRate.toFixed(0)}%</p>
                            </div>
                            <div className="bg-[var(--bg-secondary)] rounded-xl p-3 border border-[var(--border-subtle)]">
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Comisión</p>
                                <p className="text-sm font-bold text-[var(--text-primary)]">{formatCurrency(row.commissionAmount)}</p>
                            </div>
                            <div className="bg-[var(--bg-secondary)] rounded-xl p-3 border border-[var(--border-subtle)]">
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">IGV</p>
                                <p className="text-sm font-bold text-[var(--text-primary)]">{formatCurrency(row.commissionIgv)}</p>
                            </div>
                        </div>

                        <div className="border-t border-[var(--border-subtle)] pt-3 flex items-center justify-between">
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Total Comisión</p>
                            <p className="text-base font-black text-[var(--text-primary)]">{formatCurrency(row.commissionTotal)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
