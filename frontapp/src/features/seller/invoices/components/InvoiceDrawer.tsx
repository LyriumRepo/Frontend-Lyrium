'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/ui/Icon';
import { Voucher, VoucherStatus } from '@/features/seller/invoices/types';
import { formatCurrency } from '@/shared/lib/utils/formatters';
import { getAuthHeaders } from '@/shared/lib/api/token-store';
import InvoiceOrderItemsSection from '@/shared/components/invoices/InvoiceOrderItemsSection';
import InvoiceStoreCommissionsSection from '@/shared/components/invoices/InvoiceStoreCommissionsSection';
import { toPercent } from '@/shared/components/invoices/types';

interface InvoiceDrawerProps {
    voucher: Voucher | null;
    isOpen: boolean;
    onClose: () => void;
}

const statusConfig: Record<VoucherStatus, { label: string; color: string; iconName: string }> = {
    ACCEPTED: { label: 'Aceptado', color: 'emerald', iconName: 'CheckCircle' },
    SENT_WAIT_CDR: { label: 'Pendiente CDR', color: 'sky', iconName: 'Clock' },
    REJECTED: { label: 'Rechazado', color: 'rose', iconName: 'XCircle' },
    OBSERVED: { label: 'Observado', color: 'amber', iconName: 'AlertCircle' },
    DRAFT: { label: 'Borrador', color: 'gray', iconName: 'FileText' },
};

const statusColorClasses: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    sky: 'bg-sky-50 text-sky-600 border-sky-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    gray: 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
};

export default function InvoiceDrawer({ voucher, isOpen, onClose }: InvoiceDrawerProps) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleDownloadPdf = useCallback(async (v: Voucher) => {
        if (isDownloading) return;
        setIsDownloading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';
            const response = await fetch(`${apiUrl}/invoices/${v.id}/pdf`, {
                headers: {
                    Accept: 'application/pdf',
                    ...(await getAuthHeaders()),
                },
            });
            if (!response.ok) throw new Error('Error al descargar la factura');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = `Factura-Lyrium-${v.series}-${v.number}.pdf`;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error al descargar la factura:', error);
        } finally {
            setIsDownloading(false);
        }
    }, [isDownloading]);

    const handleSharePdf = useCallback(async (v: Voucher) => {
        const text = `Comprobante Lyrium\n${v.series}-${v.number}\nTotal: ${formatCurrency(v.amount)}\nFecha: ${new Date(v.emission_date).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}`;
        const title = `Factura ${v.series}-${v.number}`;

        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({ title, text });
                return;
            } catch {
                // User cancelled — fall through to clipboard
            }
        }

        try {
            await navigator.clipboard.writeText(text);
            setShareStatus('copied');
            setTimeout(() => setShareStatus('idle'), 2000);
        } catch {
            // Both methods failed silently
        }
    }, []);

    if (!isOpen || !voucher || !mounted) return null;

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    const status = statusConfig[voucher.sunat_status] || statusConfig.DRAFT;
    const statusClasses = statusColorClasses[status.color] || statusColorClasses.gray;

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });

    const fmt = (v: number | null | undefined) => (v != null ? formatCurrency(v) : '—');
    // commission_rate llega como fracción (0.15) o como porcentaje entero (15)
    // según venga del fallback de tienda o de los ítems del pedido — normalizar siempre.
    const fmtPct = (v: number | null | undefined) => (v != null ? `${toPercent(v).toFixed(1)}%` : '—');
    // IGV de la comisión: si el invoice no trae igv_amount, se extrae del monto de
    // comisión (comisión × 0.18 ÷ 1.18), igual que en CommissionService/backend.
    const fmtCommissionIgv = (amount: number | null | undefined) =>
        amount != null ? formatCurrency(Math.round(((amount / 1.18) * 0.18) * 100) / 100) : '—';

    const orderItems = voucher.order?.items ?? [];
    const storeCommissions = voucher.store_commissions ?? [];
    // La card única de "Comisión" queda cubierta por el desglose por tienda
    const hasStoreCommissions = storeCommissions.length > 0 || orderItems.length > 0;

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                onClick={onClose}
                onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
                role="presentation"
                aria-hidden="true"
            />

            <div className="relative w-full max-w-[640px] max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col animate-fadeInScale dark:bg-[var(--bg-card)] overflow-hidden">

                {/* Header */}
                <div className="px-6 pt-6 pb-5 shrink-0 bg-gradient-to-r from-[var(--turquesa-500)] to-[var(--verde-500)] relative">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-all active:scale-90 shrink-0"
                    >
                        <Icon name="X" className="w-5 h-5" />
                    </button>
                    <div className="flex-1 min-w-0 pr-12">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest border border-white/30 px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md">
                                {voucher.type}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusClasses}`}>
                                <Icon name={status.iconName} className="w-3 h-3" /> {status.label}
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
                            {voucher.series}-{voucher.number}
                        </h2>
                        <p className="text-xs text-white/70 font-semibold mt-2">
                            ID #{voucher.id} · {voucher.order_id}
                        </p>
                    </div>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-5 green-scrollbar">

                    {/* Store chip */}
                    <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100 text-teal-700 rounded-full px-4 py-2 text-sm font-semibold dark:bg-teal-900/20 dark:border-teal-800 dark:text-teal-300">
                        <Icon name="Store" className="w-4 h-4" />
                        {voucher.store_name}
                    </div>

                    {/* Customer + Amount cards */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 border border-[var(--border-subtle)]">
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Cliente</p>
                            <p className="text-sm font-bold text-[var(--text-primary)] leading-snug">{voucher.customer_name}</p>
                            <p className="text-xs text-[var(--text-secondary)] mt-0.5">RUC: {voucher.customer_ruc}</p>
                        </div>
                        <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 border border-[var(--border-subtle)]">
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Monto Total</p>
                            <p className="text-xl font-black text-[var(--text-primary)] leading-none">{formatCurrency(voucher.amount)}</p>
                        </div>
                    </div>

                    {/* Products table */}
                    {voucher.items && voucher.items.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                                <Icon name="Package" className="w-4 h-4" /> Productos / Servicios
                            </h3>
                            <div className="border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)]">
                                            <th className="text-left px-4 py-2.5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Producto</th>
                                            <th className="text-center px-3 py-2.5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Cant.</th>
                                            <th className="text-right px-3 py-2.5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">P. Unit.</th>
                                            <th className="text-right px-4 py-2.5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {voucher.items.map((item, idx) => {
                                            const name = item.product_name || item.service_name || '—';
                                            const unitPrice = item.quantity > 0 ? item.line_total / item.quantity : 0;
                                            return (
                                                <tr key={idx} className="border-b border-[var(--border-subtle)] last:border-b-0">
                                                    <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{name}</td>
                                                    <td className="px-3 py-3 text-center text-[var(--text-secondary)]">{item.quantity}</td>
                                                    <td className="px-3 py-3 text-right text-[var(--text-secondary)]">{formatCurrency(unitPrice)}</td>
                                                    <td className="px-4 py-3 text-right font-bold text-[var(--text-primary)]">{formatCurrency(item.line_total)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Ítems de la orden original */}
                    <InvoiceOrderItemsSection items={orderItems} />

                    {/* Comisiones por tienda */}
                    <InvoiceStoreCommissionsSection
                        commissions={storeCommissions}
                        items={orderItems}
                        fallbackRate={voucher.commission_rate}
                    />

                    {/* Commission card */}
                    {!hasStoreCommissions && (
                    <div className="space-y-2">
                        <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                            <Icon name="DollarSign" className="w-4 h-4" /> Comisión
                        </h3>
                        <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 border border-[var(--border-subtle)] space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Tasa</p>
                                    <p className="text-sm font-bold text-[var(--text-primary)]">{fmtPct(voucher.commission_rate)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Comisión</p>
                                    <p className="text-sm font-bold text-[var(--text-primary)]">{fmt(voucher.commission_amount)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">IGV</p>
                                    <p className="text-sm font-bold text-[var(--text-primary)]">
                                        {voucher.igv_amount != null ? fmt(voucher.igv_amount) : fmtCommissionIgv(voucher.commission_amount)}
                                    </p>
                                </div>
                            </div>
                            <div className="border-t border-[var(--border-subtle)] pt-3 flex items-center justify-between">
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Total Comisión</p>
                                <p className="text-lg font-black text-[var(--text-primary)]">{fmt(voucher.commission_amount)}</p>
                            </div>
                        </div>
                    </div>
                    )}

                    {/* Ver PDF button */}
                    <button
                        onClick={() => handleDownloadPdf(voucher)}
                        disabled={isDownloading}
                        className="flex items-center gap-3 w-full p-4 bg-gradient-to-r from-[var(--turquesa-500)] to-[var(--brand-teal)] text-white rounded-2xl font-bold text-sm tracking-wide hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-teal-500/20"
                    >
                        <Icon name="FileText" className="w-5 h-5" />
                        <span className="flex-1 text-left">{isDownloading ? 'Descargando...' : 'Ver / Descargar Factura'}</span>
                        <Icon name="Download" className="w-5 h-5" />
                    </button>

                    {/* Emission date */}
                    <div className="text-right">
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Fecha de emisión</p>
                        <p className="text-xs font-bold text-[var(--text-secondary)]">{formatDate(voucher.emission_date)}</p>
                    </div>

                    {/* History (collapsed) */}
                    {voucher.history && voucher.history.length > 0 && (
                        <details className="group">
                            <summary className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2 cursor-pointer select-none hover:text-[var(--text-secondary)] transition-colors list-none">
                                <Icon name="Clock" className="w-4 h-4" />
                                Historial
                                <Icon name="ChevronDown" className="w-3.5 h-3.5 ml-auto transition-transform group-open:rotate-180" />
                            </summary>
                            <div className="mt-3 space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border-subtle)]">
                                {[...voucher.history].reverse().map((event, idx) => (
                                    <div key={`history-${event.timestamp}-${idx}`} className="relative pl-8">
                                        <div className="absolute left-1.5 top-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-white dark:border-[var(--bg-card)] shadow-sm" />
                                        <div>
                                            <p className="text-[10px] font-black text-[var(--text-primary)] leading-none mb-1 uppercase tracking-tight">{event.note}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase">{new Date(event.timestamp).toLocaleString()}</span>
                                                <span className="w-1 h-1 bg-[var(--border-subtle)] rounded-full" />
                                                <span className="text-[9px] font-bold text-indigo-500 uppercase">{event.user}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </details>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-card)]/80 backdrop-blur-xl flex gap-3 shrink-0 dark:bg-[var(--bg-secondary)]/80">
                    <button
                        onClick={() => handleSharePdf(voucher)}
                        className="flex items-center justify-center gap-2 flex-1 py-3 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-[var(--bg-hover)] transition-all dark:bg-white/10 dark:text-white/70"
                    >
                        <Icon name={shareStatus === 'copied' ? 'ClipboardCheck' : 'Share2'} className="w-4 h-4" />
                        {shareStatus === 'copied' ? 'Copiado' : 'Compartir'}
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-[var(--bg-hover)] transition-all dark:bg-white/10 dark:text-white/70"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>,
        modalRoot,
    );
}
