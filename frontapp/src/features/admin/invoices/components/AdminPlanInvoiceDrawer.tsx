'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/ui/Icon';
import { formatCurrency } from '@/shared/lib/utils/formatters';
import { getAuthHeaders } from '@/shared/lib/api/token-store';
import type { PlanInvoiceRow } from '../hooks/usePlanInvoices';

interface Props {
    invoice: PlanInvoiceRow | null;
    isOpen: boolean;
    onClose: () => void;
}

const statusConfig: Record<string, { label: string; color: string; iconName: string }> = {
    ACCEPTED:      { label: 'Aceptado',      color: 'emerald', iconName: 'CheckCircle' },
    SENT_WAIT_CDR: { label: 'Pendiente CDR', color: 'sky',     iconName: 'Clock' },
    REJECTED:      { label: 'Rechazado',     color: 'rose',    iconName: 'XCircle' },
    OBSERVED:      { label: 'Observado',     color: 'amber',   iconName: 'AlertCircle' },
    DRAFT:         { label: 'Borrador',      color: 'gray',    iconName: 'FileText' },
};

const statusColorClasses: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    sky:     'bg-sky-50 text-sky-600 border-sky-100',
    rose:    'bg-rose-50 text-rose-600 border-rose-100',
    amber:   'bg-amber-50 text-amber-600 border-amber-100',
    gray:    'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
};

export default function AdminPlanInvoiceDrawer({ invoice, isOpen, onClose }: Props) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleDownloadPdf = useCallback(async (inv: PlanInvoiceRow) => {
        if (isDownloading) return;
        setIsDownloading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';
            const response = await fetch(`${apiUrl}/plan-invoices/${inv.id}/pdf`, {
                headers: { Accept: 'application/pdf', ...(await getAuthHeaders()) },
            });
            if (!response.ok) throw new Error('PDF no disponible');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = `Factura-Suscripcion-${inv.series}-${inv.number}.pdf`;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            window.URL.revokeObjectURL(url);
        } catch {
            if (inv.receipt_pdf_url) window.open(inv.receipt_pdf_url, '_blank', 'noopener');
        } finally {
            setIsDownloading(false);
        }
    }, [isDownloading]);

    if (!isOpen || !invoice || !mounted) return null;

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    const status = statusConfig[invoice.sunat_status] ?? statusConfig.DRAFT;
    const statusClasses = statusColorClasses[status.color] ?? statusColorClasses.gray;

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                onClick={onClose}
                onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
                role="presentation"
                aria-hidden="true"
            />

            <div className="relative w-full max-w-[640px] max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col animate-fadeInScale overflow-hidden dark:bg-[var(--bg-card)]">

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
                                {invoice.type}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusClasses}`}>
                                <Icon name={status.iconName} className="w-3 h-3" /> {status.label}
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
                            {invoice.series}-{invoice.number}
                        </h2>
                        <p className="text-xs text-white/70 font-semibold mt-2">
                            ID #{invoice.id} · Suscripción
                        </p>
                    </div>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6 space-y-5 green-scrollbar">

                    {/* Store chip */}
                    <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100 text-teal-700 rounded-full px-4 py-2 text-sm font-semibold dark:bg-teal-900/20 dark:border-teal-800 dark:text-teal-300">
                        <Icon name="Store" className="w-4 h-4" />
                        {invoice.store_name}
                    </div>

                    {/* Customer + Amount cards */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 border border-[var(--border-subtle)]">
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Cliente</p>
                            <p className="text-sm font-bold text-[var(--text-primary)] leading-snug">{invoice.customer_name}</p>
                            <p className="text-xs text-[var(--text-secondary)] mt-0.5">RUC: {invoice.customer_ruc}</p>
                        </div>
                        <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 border border-[var(--border-subtle)]">
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Monto Total</p>
                            <p className="text-xl font-black text-[var(--text-primary)] leading-none">{formatCurrency(invoice.total)}</p>
                        </div>
                    </div>

                    {/* Plan info card */}
                    <div className="space-y-2">
                        <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                            <Icon name="CreditCard" className="w-4 h-4" /> Detalle de Suscripción
                        </h3>
                        <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 border border-[var(--border-subtle)]">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Plan</p>
                                    <p className="text-sm font-bold text-[var(--text-primary)]">{invoice.plan_name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Duración</p>
                                    <p className="text-sm font-bold text-[var(--text-primary)]">
                                        {invoice.months > 0 ? `${invoice.months} ${invoice.months === 1 ? 'mes' : 'meses'}` : '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Método de Pago</p>
                                    <p className="text-sm font-bold text-[var(--text-primary)]">{invoice.payment_method}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* IGV Breakdown */}
                    <div className="space-y-2">
                        <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                            <Icon name="DollarSign" className="w-4 h-4" /> Desglose
                        </h3>
                        <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 border border-[var(--border-subtle)] space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Subtotal</p>
                                    <p className="text-sm font-bold text-[var(--text-primary)]">{formatCurrency(invoice.subtotal_sin_igv)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">IGV</p>
                                    <p className="text-sm font-bold text-[var(--text-primary)]">{formatCurrency(invoice.igv_amount)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Total</p>
                                    <p className="text-sm font-bold text-[var(--text-primary)]">{formatCurrency(invoice.total)}</p>
                                </div>
                            </div>
                            <div className="border-t border-[var(--border-subtle)] pt-3 flex items-center justify-between">
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Total Factura</p>
                                <p className="text-lg font-black text-[var(--text-primary)]">{formatCurrency(invoice.total)}</p>
                            </div>
                        </div>
                    </div>

                    {/* PDF button */}
                    <button
                        onClick={() => handleDownloadPdf(invoice)}
                        disabled={isDownloading}
                        className="flex items-center gap-3 w-full p-4 bg-gradient-to-r from-[var(--turquesa-500)] to-[var(--brand-teal)] text-white rounded-2xl font-bold text-sm tracking-wide hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-teal-500/20"
                    >
                        <Icon name="FileText" className="w-5 h-5" />
                        <span className="flex-1 text-left">{isDownloading ? 'Descargando…' : 'Ver / Descargar Factura'}</span>
                        <Icon name="Download" className="w-5 h-5" />
                    </button>

                    {/* Emission date */}
                    <div className="text-right">
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Fecha de emisión</p>
                        <p className="text-xs font-bold text-[var(--text-secondary)]">
                            {new Date(invoice.emission_date).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-card)]/80 backdrop-blur-xl shrink-0 dark:bg-[var(--bg-secondary)]/80">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-[var(--bg-hover)] transition-all dark:bg-white/10 dark:text-white/70"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>,
        modalRoot,
    );
}
