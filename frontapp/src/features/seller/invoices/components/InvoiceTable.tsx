'use client';

import React, { useState, useRef } from 'react';
import { Voucher, VoucherStatus, VoucherType } from '@/features/seller/invoices/types';
import { formatDate } from '@/shared/lib/utils/formatters';
import Icon from '@/components/ui/Icon';
import BaseStatusBadge, { VOUCHER_STATUS_MAPPINGS } from '@/components/ui/BaseStatusBadge';

interface InvoiceTableProps {
    vouchers: Voucher[];
    onViewDetail: (voucher: Voucher) => void;
}

const typeConfig: Record<VoucherType, { icon: string; bg: string; text: string }> = {
    'FACTURA':      { icon: 'FileText', bg: 'bg-sky-100',     text: 'text-sky-600'     },
    'BOLETA':       { icon: 'Receipt',  bg: 'bg-emerald-100', text: 'text-emerald-600' },
    'NOTA_CREDITO': { icon: 'Undo',     bg: 'bg-red-100',     text: 'text-red-600'     },
};

function formatCommission(_rate: number | null | undefined, amount: number | null | undefined): string {
    if (amount == null) return '—';
    return `S/ ${amount.toFixed(2)}`;
}

function orderTypeStyles(orderType: Voucher['order_type']): { bg: string; text: string } {
    switch (orderType) {
        case 'Servicio':
            return { bg: 'bg-violet-100', text: 'text-violet-600' };
        case 'Producto y Servicio':
            return { bg: 'bg-amber-100', text: 'text-amber-600' };
        default:
            return { bg: 'bg-gray-100', text: 'text-gray-500' };
    }
}

function resolveMonto(v: Voucher): number {
    return (
        v.store_amount ??
        (v.items && v.items.length > 0
            ? v.items.reduce((s, i) => s + i.line_total, 0)
            : null) ??
        v.amount
    );
}

// ─── Mobile accordion card ────────────────────────────────────────────────────

interface MobileInvoiceCardProps {
    voucher:      Voucher;
    onViewDetail: (voucher: Voucher) => void;
}

function MobileInvoiceCard({ voucher: v, onViewDetail }: MobileInvoiceCardProps) {
    const [expanded, setExpanded] = useState(false);
    const type = typeConfig[v.type] || typeConfig.FACTURA;
    const monto = resolveMonto(v);

    return (
        <div className={`rounded-2xl border bg-[var(--bg-card)] overflow-hidden transition-colors ${
            expanded ? 'border-sky-400/40' : 'border-[var(--border-subtle)]'
        }`}>

            {/* ── Fila colapsada ── */}
            <button
                onClick={() => setExpanded(s => !s)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-[var(--bg-secondary)]/60 transition-colors"
            >
                {/* Ícono de tipo */}
                <div className={`w-9 h-9 ${type.bg} rounded-xl flex items-center justify-center ${type.text} flex-shrink-0 transition-transform ${expanded ? 'scale-110' : ''}`}>
                    <Icon name={type.icon} className="w-4 h-4" />
                </div>

                {/* Serie-número + tipo */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-[var(--text-primary)] font-mono tracking-tight leading-tight">
                        {v.series}-{v.number}
                    </p>
                    <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded-md inline-block mt-0.5">
                        {v.type}
                    </span>
                    {v.order_type && (
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md inline-block mt-0.5 ml-1 ${orderTypeStyles(v.order_type).bg} ${orderTypeStyles(v.order_type).text}`}>
                            {v.order_type}
                        </span>
                    )}
                </div>

                {/* Estado + monto */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <BaseStatusBadge
                        status={v.sunat_status}
                        mappings={VOUCHER_STATUS_MAPPINGS}
                        variant="large"
                        customClass="gap-1.5 rounded-xl font-black text-[10px]"
                    />
                    <span className="text-sm font-black text-[var(--text-primary)]">
                        S/ {monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </span>
                </div>

                <Icon
                    name={expanded ? 'ChevronUp' : 'ChevronDown'}
                    className="w-4 h-4 flex-shrink-0 text-[var(--text-secondary)]"
                />
            </button>

            {/* ── Panel expandido ── */}
            {expanded && (
                <div className="border-t border-[var(--border-subtle)] px-4 py-3 space-y-2.5">

                    {/* Tienda */}
                    <div className="flex items-start justify-between gap-3">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] pt-0.5 flex-shrink-0">Tienda</span>
                        <div className="text-right">
                            <p className="text-xs font-bold text-[var(--text-primary)] leading-tight">{v.store_name}</p>
                            <p className="text-[10px] font-black text-[var(--text-secondary)] font-mono">{v.store_ruc}</p>
                        </div>
                    </div>

                    {/* Pedido + Fecha en fila */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1">Pedido</p>
                            <span className="text-[10px] font-black text-sky-600 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-100 inline-block">
                                {v.order_id}
                            </span>
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1">Emisión</p>
                            <p className="text-[10px] font-bold text-[var(--text-secondary)]">{formatDate(v.emission_date)}</p>
                        </div>
                    </div>

                    {/* Monto */}
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Monto</span>
                        <span className="text-sm font-black text-[var(--text-primary)]">
                            S/ {monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </span>
                    </div>

                    {/* Comisión */}
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Comisión</span>
                        <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                            {formatCommission(v.commission_rate, v.commission_amount)}
                        </span>
                    </div>

                    {/* Acción */}
                    <div className="pt-1">
                        <button
                            onClick={() => onViewDetail(v)}
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

// ─── InvoiceTable ─────────────────────────────────────────────────────────────

export default function InvoiceTable({ vouchers, onViewDetail }: InvoiceTableProps) {
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const iconRef = useRef<HTMLSpanElement>(null);

    const handleMouseEnter = () => setTooltipVisible(true);
    const handleMouseLeave = () => setTooltipVisible(false);

    const iconRect = iconRef.current?.getBoundingClientRect();
    const tooltipStyle: React.CSSProperties = tooltipVisible && iconRect ? {
        position: 'fixed',
        top: iconRect.bottom + 8,
        left: iconRect.left + iconRect.width / 2,
        transform: 'translateX(-50%)',
        zIndex: 9999,
    } : { display: 'none' };

    /* ── Estado vacío compartido ── */
    if (vouchers.length === 0) {
        return (
            <div className="glass-card px-6 py-16 sm:py-24 flex flex-col items-center gap-4 text-[var(--text-secondary)] animate-fadeIn">
                <Icon name="FileX" className="w-10 h-10 sm:w-12 sm:h-12 opacity-30" />
                <p className="font-black uppercase text-xs tracking-widest text-center">
                    No se encontraron comprobantes
                </p>
            </div>
        );
    }

    return (
        <>
            {/* ══ MÓVIL: accordion cards (sm:hidden) ════════════════════════ */}
            <div className="sm:hidden space-y-2 animate-fadeIn">
                {vouchers.map((v) => (
                    <MobileInvoiceCard
                        key={v.id}
                        voucher={v}
                        onViewDetail={onViewDetail}
                    />
                ))}
            </div>

            {/* ══ DESKTOP: tabla completa (hidden sm:block) ════════════════ */}
            <div className="hidden sm:block glass-card overflow-hidden animate-fadeIn">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-subtle)] text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                                <th className="px-6 py-5">Comprobante</th>
                                <th className="px-6 py-5">Serie-Código</th>
                                <th className="px-6 py-5">
                                    <span className="flex items-center gap-1.5">
                                        Monto
                                        <span
                                            ref={iconRef}
                                            onMouseEnter={handleMouseEnter}
                                            onMouseLeave={handleMouseLeave}
                                            className="cursor-help"
                                        >
                                            <Icon name="Info" className="w-3 h-3 text-[var(--text-secondary)] opacity-60" />
                                        </span>
                                    </span>
                                </th>
                                <th className="px-6 py-5">Comisión</th>
                                <th className="px-6 py-5">Fecha</th>
                                <th className="px-6 py-5 text-center">Estado</th>
                                <th className="px-6 py-5 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
                            {vouchers.map((v) => {
                                const type = typeConfig[v.type] || typeConfig.FACTURA;
                                return (
                                    <tr key={v.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors group">
                                        {/* Comprobante: badge tipo + nombre tienda */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-9 h-9 ${type.bg} rounded-xl flex items-center justify-center ${type.text} group-hover:scale-110 transition-transform shrink-0`}>
                                                    <Icon name={type.icon} className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md ${type.bg} ${type.text}`}>{v.type}</span>
                                                    {v.order_type && (
                                                        <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md ml-1 ${orderTypeStyles(v.order_type).bg} ${orderTypeStyles(v.order_type).text}`}>
                                                            {v.order_type}
                                                        </span>
                                                    )}
                                                    <p className="text-xs text-[var(--text-secondary)] truncate max-w-[150px] mt-0.5">{v.store_name || '—'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Serie-Código */}
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-[var(--text-primary)] font-mono tracking-tight">{v.series}-{v.number}</span>
                                        </td>
                                        {/* Monto — subtotal productos/servicios sin envío */}
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-black text-[var(--text-primary)]">
                                                S/ {resolveMonto(v).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                            </p>
                                        </td>
                                        {/* Comisión */}
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
                                                {formatCommission(v.commission_rate, v.commission_amount)}
                                            </p>
                                        </td>
                                        {/* Fecha */}
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-bold text-[var(--text-secondary)]">{formatDate(v.emission_date)}</p>
                                        </td>
                                        {/* Estado */}
                                        <td className="px-6 py-4 text-center">
                                            <BaseStatusBadge
                                                status={v.sunat_status}
                                                mappings={VOUCHER_STATUS_MAPPINGS}
                                                variant="large"
                                                customClass="gap-2 rounded-xl font-black"
                                            />
                                        </td>
                                        {/* Acciones — sin cambios */}
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => onViewDetail(v)}
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

            {/* Tooltip Monto — position:fixed para no ser recortado por overflow de la tabla */}
            <div style={tooltipStyle} className="w-64 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-3 shadow-2xl pointer-events-none">
                <p className="text-[11px] font-black text-[var(--text-primary)] mb-1">¿Qué es el Monto?</p>
                <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                    Subtotal de tus <span className="text-emerald-500 font-bold">productos con IGV</span>, sin incluir el costo de envío.
                </p>
                <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed mt-1.5 pt-1.5 border-t border-[var(--border-subtle)]">
                    El comprobante electrónico emitido a SUNAT incluye también el envío en el total.
                </p>
            </div>
        </>
    );
}
