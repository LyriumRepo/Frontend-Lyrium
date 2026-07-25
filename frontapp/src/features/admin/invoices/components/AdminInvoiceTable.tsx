'use client';

import React, { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import BaseStatusBadge, { VOUCHER_STATUS_MAPPINGS } from '@/components/ui/BaseStatusBadge';
import { formatCurrency } from '@/shared/lib/utils/formatters';
import Pagination from '@/components/ui/Pagination';
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

// ─── Mobile accordion card ────────────────────────────────────────────────────

interface MobileCardProps {
    invoice: AdminInvoiceRow;
    onViewDetail: (invoice: AdminInvoiceRow) => void;
}

function MobileInvoiceCard({ invoice: inv, onViewDetail }: MobileCardProps) {
    const [expanded, setExpanded] = useState(false);
    const type = typeConfig[inv.type] ?? typeConfig.FACTURA;
    const storeName = inv.stores[0]?.name ?? '—';

    return (
        <div className={`rounded-2xl border bg-[var(--bg-card)] overflow-hidden transition-colors ${
            expanded ? 'border-sky-400/40' : 'border-[var(--border-subtle)]'
        }`}>
            <button
                onClick={() => setExpanded(s => !s)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-[var(--bg-secondary)]/60 transition-colors"
            >
                <div className={`w-9 h-9 ${type.bg} rounded-xl flex items-center justify-center ${type.text} flex-shrink-0 transition-transform ${expanded ? 'scale-110' : ''}`}>
                    <Icon name={type.icon} className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-[var(--text-primary)] font-mono tracking-tight leading-tight">
                        {inv.series}-{inv.number}
                    </p>
                    <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded-md inline-block mt-0.5">
                        {inv.type}
                    </span>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <BaseStatusBadge
                        status={inv.sunat_status}
                        mappings={VOUCHER_STATUS_MAPPINGS}
                        variant="large"
                        customClass="gap-1.5 rounded-xl font-black text-[10px]"
                    />
                    <span className="text-sm font-black text-[var(--text-primary)]">
                        {formatCurrency(inv.store_amount ?? inv.order_total)}
                    </span>
                </div>

                <Icon
                    name={expanded ? 'ChevronUp' : 'ChevronDown'}
                    className="w-4 h-4 flex-shrink-0 text-[var(--text-secondary)]"
                />
            </button>

            {expanded && (
                <div className="border-t border-[var(--border-subtle)] px-4 py-3 space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] pt-0.5 flex-shrink-0">Tienda</span>
                        <div className="text-right">
                            <p className="text-xs font-bold text-[var(--text-primary)] leading-tight">{storeName}</p>
                            <p className="text-[10px] font-black text-[var(--text-secondary)]">{inv.seller_name || '—'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1">Pedido</p>
                            <span className="text-[10px] font-black text-sky-600 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-100 inline-block">
                                {inv.order_id}
                            </span>
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1">Emisión</p>
                            <p className="text-[10px] font-bold text-[var(--text-secondary)]">
                                {new Date(inv.emission_date).toLocaleDateString('es-PE')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Monto</span>
                        <span className="text-sm font-black text-[var(--text-primary)]">
                            {formatCurrency(inv.store_amount ?? inv.order_total)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Comisión</span>
                        <span className="text-sm font-bold text-sky-500">
                            {formatCommission(inv.commission_rate, inv.commission_amount)}
                        </span>
                    </div>

                    <div className="pt-1">
                        <button
                            onClick={() => onViewDetail(inv)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[var(--border-subtle)] text-[11px] font-black text-[var(--text-secondary)] hover:border-emerald-200 hover:text-emerald-600 hover:bg-emerald-50/30 transition-colors"
                        >
                            <Icon name="Eye" className="w-3.5 h-3.5" />
                            Ver comprobante
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── AdminInvoiceTable ───────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export default function AdminInvoiceTable({ invoices, onViewDetail }: Props) {
    const [page, setPage] = useState(1);
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const iconRef = useRef<HTMLSpanElement>(null);

    useEffect(() => { setPage(1); }, [invoices.length]);

    const totalPages = Math.ceil(invoices.length / PAGE_SIZE);
    const pageInvoices = invoices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const iconRect = iconRef.current?.getBoundingClientRect();
    const tooltipStyle: React.CSSProperties = tooltipVisible && iconRect ? {
        position: 'fixed',
        top: iconRect.bottom + 8,
        left: iconRect.left + iconRect.width / 2,
        transform: 'translateX(-50%)',
        zIndex: 9999,
    } : { display: 'none' };

    if (invoices.length === 0) {
        return (
            <div className="w-full py-16 sm:py-24 flex flex-col items-center justify-center text-center px-6 bg-[var(--bg-card)] rounded-[2rem] sm:rounded-[3rem] border border-[var(--border-subtle)] shadow-sm">
                <div className="relative inline-block">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[var(--bg-muted)] rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center shadow-inner border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                        <Icon name="FileX" className="w-10 h-10 sm:w-12 sm:h-12 stroke-[1.5px]" />
                    </div>
                </div>
                <div className="space-y-3 mt-6 sm:mt-8">
                    <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tighter">
                        No se encontraron comprobantes
                    </h3>
                    <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest leading-relaxed">
                        No hay registros que coincidan con los filtros aplicados actualmente.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* ══ MÓVIL: accordion cards (sm:hidden) ════════════════════════ */}
            <div className="sm:hidden space-y-2 animate-fadeIn">
                {pageInvoices.map((inv) => (
                    <MobileInvoiceCard
                        key={inv.id}
                        invoice={inv}
                        onViewDetail={onViewDetail}
                    />
                ))}
            </div>

            {/* ══ DESKTOP: tabla completa (hidden sm:block) ════════════════ */}
            <div className="hidden sm:block rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-visible animate-fadeIn">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full border-separate border-spacing-0">
                        <thead>
                            <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                                <th className="px-4 py-2.5 text-left text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] whitespace-nowrap rounded-tl-2xl">Vendedor</th>
                                <th className="px-4 py-2.5 text-left text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] whitespace-nowrap">Comprobante</th>
                                <th className="px-4 py-2.5 text-left text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] whitespace-nowrap">Serie-Código</th>
                                <th className="px-4 py-2.5 text-left text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] whitespace-nowrap">
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
                                <th className="hidden md:table-cell px-4 py-2.5 text-left text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] whitespace-nowrap">Comisión</th>
                                <th className="hidden md:table-cell px-4 py-2.5 text-left text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] whitespace-nowrap">Fecha</th>
                                <th className="px-4 py-2.5 text-center text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] whitespace-nowrap">Estado</th>
                                <th className="px-4 py-2.5 text-right text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] whitespace-nowrap rounded-tr-2xl">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageInvoices.map((inv) => {
                                const type = typeConfig[inv.type] ?? typeConfig.FACTURA;
                                const storeName = inv.stores[0]?.name ?? '—';
                                return (
                                    <tr key={inv.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors group border-b border-[var(--border-subtle)] last:border-b-0">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <p className="text-sm font-bold text-[var(--text-primary)]">{inv.seller_name || '—'}</p>
                                            <p className="text-[10px] text-[var(--text-secondary)] whitespace-nowrap">{storeName}</p>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-9 h-9 ${type.bg} rounded-xl flex items-center justify-center ${type.text} group-hover:scale-110 transition-transform shrink-0`}>
                                                    <Icon name={type.icon} className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md ${type.bg} ${type.text}`}>{inv.type}</span>
                                                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{storeName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="text-sm font-black text-[var(--text-primary)] font-mono tracking-tight">{inv.series}-{inv.number}</span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <p className="text-sm font-black text-[var(--text-primary)]">
                                                {formatCurrency(inv.store_amount ?? inv.order_total)}
                                            </p>
                                        </td>
                                        <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap">
                                            <p className="text-sm font-bold text-sky-500">
                                                {formatCommission(inv.commission_rate, inv.commission_amount)}
                                            </p>
                                        </td>
                                        <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap">
                                            <p className="text-xs font-bold text-[var(--text-secondary)]">
                                                {new Date(inv.emission_date).toLocaleDateString('es-PE')}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-center whitespace-nowrap">
                                            <BaseStatusBadge
                                                status={inv.sunat_status}
                                                mappings={VOUCHER_STATUS_MAPPINGS}
                                                variant="large"
                                                customClass="gap-2 rounded-xl font-black"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-right whitespace-nowrap">
                                            <button
                                                onClick={() => onViewDetail(inv)}
                                                className="w-10 h-10 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-emerald-600 hover:border-emerald-200 rounded-xl transition-all shadow-sm active:scale-90 flex items-center justify-center m-auto mr-0"
                                            >
                                                <Icon name="Eye" className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tooltip Monto */}
            <div style={tooltipStyle} className="w-64 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-3 shadow-2xl pointer-events-none">
                <p className="text-[11px] font-black text-[var(--text-primary)] mb-1">¿Qué es el Monto?</p>
                <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                    Subtotal de <span className="text-[var(--color-success)] font-bold">productos/servicios con IGV</span>, sin incluir el costo de envío.
                </p>
                <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed mt-1.5 pt-1.5 border-t border-[var(--border-subtle)]">
                    El comprobante electrónico emitido a SUNAT incluye también el envío en el total.
                </p>
            </div>

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
    );
}
