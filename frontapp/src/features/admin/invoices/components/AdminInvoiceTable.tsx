'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';
import BaseStatusBadge, { VOUCHER_STATUS_MAPPINGS } from '@/components/ui/BaseStatusBadge';
import { formatCurrency } from '@/shared/lib/utils/formatters';
import type { AdminInvoiceRow } from '../hooks/useAdminInvoices';

interface Props {
    invoices: AdminInvoiceRow[];
    onViewDetail: (invoice: AdminInvoiceRow) => void;
}

const typeConfig: Record<string, { icon: string; bg: string; text: string }> = {
    FACTURA:      { icon: 'FileText', bg: 'bg-sky-100 dark:bg-sky-950/40',     text: 'text-sky-600 dark:text-sky-400' },
    BOLETA:       { icon: 'Receipt',  bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400' },
    NOTA_CREDITO: { icon: 'Undo',     bg: 'bg-red-100 dark:bg-red-950/40',     text: 'text-red-600 dark:text-red-400' },
};

function formatCommission(_rate: number | null, amount: number | null): string {
    if (amount === null) return '—';
    return `S/ ${amount.toFixed(2)}`;
}

export default function AdminInvoiceTable({ invoices, onViewDetail }: Props) {
    const emptyState = (
        <div className="flex flex-col items-center gap-4 text-[var(--text-secondary)] py-20">
            <Icon name="FileX" className="w-12 h-12 opacity-30" />
            <div className="font-black uppercase text-xs tracking-widest">
                No se encontraron comprobantes
            </div>
        </div>
    );

    return (
        <div className="glass-card overflow-hidden animate-fadeIn">
            {/* ── Vista mobile: cards (oculta en sm+) ── */}
            <div className="sm:hidden divide-y divide-[var(--border-subtle)]">
                {invoices.length === 0 ? emptyState : invoices.map((inv) => {
                    const type = typeConfig[inv.type] ?? typeConfig.FACTURA;
                    const storeName = inv.stores[0]?.name ?? '—';
                    return (
                        <div key={inv.id} className="p-4 flex items-start gap-3">
                            <div className={`w-10 h-10 ${type.bg} rounded-xl flex items-center justify-center ${type.text} shrink-0 mt-0.5`}>
                                <Icon name={type.icon} className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-bold text-[var(--text-primary)] truncate">{inv.seller_name || '—'}</p>
                                    <BaseStatusBadge
                                        status={inv.sunat_status}
                                        mappings={VOUCHER_STATUS_MAPPINGS}
                                        variant="default"
                                        customClass="shrink-0"
                                    />
                                </div>
                                <p className="text-[10px] text-[var(--text-secondary)] truncate">{storeName}</p>
                                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                    <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md ${type.bg} ${type.text}`}>{inv.type}</span>
                                    <span className="text-xs font-mono text-[var(--text-secondary)]">{inv.series}-{inv.number}</span>
                                    <span className="text-xs font-black text-[var(--text-primary)]">{formatCurrency(inv.order_total)}</span>
                                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">{formatCommission(inv.commission_rate, inv.commission_amount)}</span>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-[10px] text-[var(--text-secondary)]">{new Date(inv.emission_date).toLocaleDateString('es-PE')}</span>
                                    <button
                                        onClick={() => onViewDetail(inv)}
                                        className="flex items-center gap-1 text-[10px] font-black text-[var(--text-secondary)] hover:text-emerald-600 transition-colors"
                                    >
                                        <Icon name="Eye" className="w-3.5 h-3.5" />
                                        Ver
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Vista desktop: tabla (oculta en mobile) ── */}
            <div className="hidden sm:block overflow-x-auto no-scrollbar">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-subtle)] text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                            <th className="px-6 py-5">Vendedor</th>
                            <th className="px-6 py-5">Comprobante</th>
                            <th className="px-6 py-5">Serie-Código</th>
                            <th className="px-6 py-5">Monto</th>
                            <th className="px-6 py-5">Comisión</th>
                            <th className="px-6 py-5">Fecha</th>
                            <th className="px-6 py-5 text-center">Estado</th>
                            <th className="px-6 py-5 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
                        {invoices.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6">
                                    {emptyState}
                                </td>
                            </tr>
                        ) : (
                            invoices.map((inv) => {
                                const type = typeConfig[inv.type] ?? typeConfig.FACTURA;
                                const storeName = inv.stores[0]?.name ?? '—';
                                return (
                                    <tr key={inv.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors group">
                                        {/* Vendedor */}
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-[var(--text-primary)] truncate max-w-[160px]">{inv.seller_name || '—'}</p>
                                            <p className="text-[10px] text-[var(--text-secondary)] truncate max-w-[160px]">{storeName}</p>
                                        </td>
                                        {/* Comprobante: badge + tienda */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-9 h-9 ${type.bg} rounded-xl flex items-center justify-center ${type.text} group-hover:scale-110 transition-transform shrink-0`}>
                                                    <Icon name={type.icon} className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md ${type.bg} ${type.text}`}>{inv.type}</span>
                                                    <p className="text-xs text-[var(--text-secondary)] truncate max-w-[130px] mt-0.5">{storeName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Serie-Código */}
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-[var(--text-primary)] font-mono tracking-tight">{inv.series}-{inv.number}</span>
                                        </td>
                                        {/* Monto (total con envío) */}
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-black text-[var(--text-primary)]">{formatCurrency(inv.order_total)}</p>
                                        </td>
                                        {/* Comisión */}
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
                                                {formatCommission(inv.commission_rate, inv.commission_amount)}
                                            </p>
                                        </td>
                                        {/* Fecha */}
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-bold text-[var(--text-secondary)]">
                                                {new Date(inv.emission_date).toLocaleDateString('es-PE')}
                                            </p>
                                        </td>
                                        {/* Estado */}
                                        <td className="px-6 py-4 text-center">
                                            <BaseStatusBadge
                                                status={inv.sunat_status}
                                                mappings={VOUCHER_STATUS_MAPPINGS}
                                                variant="large"
                                                customClass="gap-2 rounded-xl font-black"
                                            />
                                        </td>
                                        {/* Acciones */}
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => onViewDetail(inv)}
                                                className="w-10 h-10 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-emerald-600 hover:border-emerald-200 rounded-xl transition-all shadow-sm active:scale-90 flex items-center justify-center ml-auto"
                                            >
                                                <Icon name="Eye" className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
