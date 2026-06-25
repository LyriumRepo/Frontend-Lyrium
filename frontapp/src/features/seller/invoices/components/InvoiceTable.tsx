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
    'FACTURA': { icon: 'FileText', bg: 'bg-sky-100', text: 'text-sky-600' },
    'BOLETA': { icon: 'Receipt', bg: 'bg-emerald-100', text: 'text-emerald-600' },
    'NOTA_CREDITO': { icon: 'Undo', bg: 'bg-red-100', text: 'text-red-600' }
};

function formatCommission(_rate: number | null | undefined, amount: number | null | undefined): string {
    if (amount == null) return '—';
    return `S/ ${amount.toFixed(2)}`;
}

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

    return (
        <>
        <div className="glass-card overflow-hidden animate-fadeIn">
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
                        {vouchers.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-4 text-[var(--text-secondary)]">
                                        <Icon name="FileX" className="w-12 h-12 opacity-30" />
                                        <div className="font-black uppercase text-xs tracking-widest">
                                            No se encontraron comprobantes
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            vouchers.map((v) => {
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
                                                    <p className="text-xs text-[var(--text-secondary)] truncate max-w-[150px] mt-0.5">{v.store_name || '—'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Serie-Código */}
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-[var(--text-primary)] font-mono tracking-tight">{v.series}-{v.number}</span>
                                        </td>
                                        {/* Monto (productos del vendedor, sin envío) */}
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-black text-[var(--text-primary)]">
                                                S/ {(v.store_amount ?? v.amount).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
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
            })
                        )}
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
