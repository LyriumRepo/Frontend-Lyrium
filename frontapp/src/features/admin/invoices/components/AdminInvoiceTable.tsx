'use client';

import React, { useState, useRef } from 'react';
import Icon from '@/components/ui/Icon';
import BaseStatusBadge, { VOUCHER_STATUS_MAPPINGS } from '@/components/ui/BaseStatusBadge';
import { formatCurrency } from '@/shared/lib/utils/formatters';
import type { AdminInvoiceRow } from '../hooks/useAdminInvoices';

interface Props {
    invoices: AdminInvoiceRow[];
    onViewDetail: (invoice: AdminInvoiceRow) => void;
}

const typeConfig: Record<string, { icon: string; bg: string; text: string }> = {
    FACTURA:      { icon: 'FileText', bg: 'bg-[var(--color-info)]/10',    text: 'text-[var(--color-info)]' },
    BOLETA:       { icon: 'Receipt',  bg: 'bg-[var(--color-success)]/10', text: 'text-[var(--color-success)]' },
    NOTA_CREDITO: { icon: 'Undo',     bg: 'bg-[var(--color-error)]/10',   text: 'text-[var(--color-error)]' },
};

function formatCommission(_rate: number | null, amount: number | null): string {
    if (amount === null) return '—';
    return `S/ ${amount.toFixed(2)}`;
}

export default function AdminInvoiceTable({ invoices, onViewDetail }: Props) {
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const iconRef = useRef<HTMLSpanElement>(null);

    const iconRect = iconRef.current?.getBoundingClientRect();
    const tooltipStyle: React.CSSProperties = tooltipVisible && iconRect ? {
        position: 'fixed',
        top: iconRect.bottom + 8,
        left: iconRect.left + iconRect.width / 2,
        transform: 'translateX(-50%)',
        zIndex: 9999,
    } : { display: 'none' };

    const emptyState = (
        <div className="flex flex-col items-center gap-4 text-[var(--text-secondary)] py-20">
            <Icon name="FileX" className="w-12 h-12 opacity-30" />
            <div className="font-black uppercase text-xs tracking-widest">
                No se encontraron comprobantes
            </div>
        </div>
    );

    return (
        <>
        <div className="glass-card overflow-hidden animate-fadeIn">
            {/* ── Vista mobile: cards ── */}
            <div className="sm:hidden divide-y divide-[var(--border-subtle)]">
                {invoices.length === 0 ? emptyState : invoices.map((inv) => {
                    const type = typeConfig[inv.type] ?? typeConfig.FACTURA;
                    const storeName = inv.stores[0]?.name ?? '—';
                    return (
                        <div key={inv.id} className="p-4 flex items-start gap-3">
                            <div className={`w-10 h-10 ${type.bg} rounded-2xl flex items-center justify-center ${type.text} shrink-0 mt-0.5`}>
                                <Icon name={type.icon} className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-black text-[var(--text-primary)] truncate">{inv.seller_name || '—'}</p>
                                    <BaseStatusBadge
                                        status={inv.sunat_status}
                                        mappings={VOUCHER_STATUS_MAPPINGS}
                                        variant="default"
                                        customClass="shrink-0"
                                    />
                                </div>
                                <p className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5">{storeName}</p>
                                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                    <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md ${type.bg} ${type.text}`}>{inv.type}</span>
                                    <span className="text-xs font-mono text-[var(--text-secondary)]">{inv.series}-{inv.number}</span>
                                    <span className="text-xs font-black text-[var(--text-primary)]">{formatCurrency(inv.store_amount ?? inv.order_total)}</span>
                                    <span className="text-[10px] text-[var(--color-warning)] font-bold">{formatCommission(inv.commission_rate, inv.commission_amount)}</span>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-[10px] text-[var(--text-secondary)]">{new Date(inv.emission_date).toLocaleDateString('es-PE')}</span>
                                    <button
                                        onClick={() => onViewDetail(inv)}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--icons-green)] text-[10px] font-black transition-colors border border-[var(--border-subtle)]"
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

            {/* ── Vista desktop: tabla ── */}
            <div className="hidden sm:block overflow-x-auto no-scrollbar">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-subtle)] text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                            <th className="px-6 py-5">Vendedor</th>
                            <th className="px-6 py-5">Comprobante</th>
                            <th className="px-6 py-5">Serie-Código</th>
                            <th className="px-6 py-5">
                                <span className="flex items-center gap-1.5">
                                    Monto
                                    <span
                                        ref={iconRef}
                                        onMouseEnter={() => setTooltipVisible(true)}
                                        onMouseLeave={() => setTooltipVisible(false)}
                                        className="cursor-help"
                                    >
                                        <Icon name="Info" className="w-3 h-3 text-[var(--text-secondary)] opacity-60" />
                                    </span>
                                </span>
                            </th>
                            <th className="hidden md:table-cell px-6 py-5">Comisión</th>
                            <th className="hidden md:table-cell px-6 py-5">Fecha</th>
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
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-[var(--text-primary)] truncate max-w-[160px]">{inv.seller_name || '—'}</p>
                                            <p className="text-[10px] text-[var(--text-secondary)] truncate max-w-[160px]">{storeName}</p>
                                        </td>
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
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-[var(--text-primary)] font-mono tracking-tight">{inv.series}-{inv.number}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-black text-[var(--text-primary)]">{formatCurrency(inv.store_amount ?? inv.order_total)}</p>
                                        </td>
                                        <td className="hidden md:table-cell px-6 py-4">
                                            <p className="text-sm font-bold text-[var(--color-warning)]">
                                                {formatCommission(inv.commission_rate, inv.commission_amount)}
                                            </p>
                                        </td>
                                        <td className="hidden md:table-cell px-6 py-4">
                                            <p className="text-xs font-bold text-[var(--text-secondary)]">
                                                {new Date(inv.emission_date).toLocaleDateString('es-PE')}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <BaseStatusBadge
                                                status={inv.sunat_status}
                                                mappings={VOUCHER_STATUS_MAPPINGS}
                                                variant="large"
                                                customClass="gap-2 rounded-xl font-black"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => onViewDetail(inv)}
                                                className="w-10 h-10 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--icons-green)] hover:border-[var(--border-focus)] rounded-xl transition-all shadow-sm active:scale-90 flex items-center justify-center ml-auto"
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

        <div style={tooltipStyle} className="w-64 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-3 shadow-2xl pointer-events-none">
            <p className="text-[11px] font-black text-[var(--text-primary)] mb-1">¿Qué es el Monto?</p>
            <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                Subtotal de <span className="text-[var(--color-success)] font-bold">productos/servicios con IGV</span>, sin incluir el costo de envío.
            </p>
            <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed mt-1.5 pt-1.5 border-t border-[var(--border-subtle)]">
                El comprobante electrónico emitido a SUNAT incluye también el envío en el total.
            </p>
        </div>
        </>
    );
}
