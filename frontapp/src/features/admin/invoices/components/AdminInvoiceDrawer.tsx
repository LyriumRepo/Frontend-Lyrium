'use client';

import React, { useCallback, useState } from 'react';
import Icon from '@/components/ui/Icon';
import { formatCurrency } from '@/shared/lib/utils/formatters';
import { getAuthHeaders } from '@/shared/lib/api/token-store';
import type { AdminInvoiceRow } from '../hooks/useAdminInvoices';

interface Props {
    invoice: AdminInvoiceRow | null;
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
    emerald: 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20',
    sky:     'bg-[var(--color-info)]/10 text-[var(--color-info)] border-[var(--color-info)]/20',
    rose:    'bg-[var(--color-error)]/10 text-[var(--color-error)] border-[var(--color-error)]/20',
    amber:   'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20',
    gray:    'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
};

export default function AdminInvoiceDrawer({ invoice, isOpen, onClose }: Props) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleOpenPdf = useCallback(async () => {
        if (!invoice?.id || isDownloading) return;
        setIsDownloading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';
            const response = await fetch(`${apiUrl}/invoices/${invoice.id}/pdf`, {
                headers: { Accept: 'application/pdf', ...(await getAuthHeaders()) },
            });
            if (!response.ok) throw new Error('PDF no disponible');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = `Factura-Lyrium-${invoice.series}-${invoice.number}.pdf`;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            window.URL.revokeObjectURL(url);
        } catch {
            if (invoice?.pdf_url) window.open(invoice.pdf_url, '_blank', 'noopener');
        } finally {
            setIsDownloading(false);
        }
    }, [invoice, isDownloading]);

    if (!isOpen || !invoice) return null;

    const status = statusConfig[invoice.sunat_status] ?? statusConfig.DRAFT;
    const statusClasses = statusColorClasses[status.color] ?? statusColorClasses.gray;

    return (
        <div className="fixed inset-0 md:top-[60px] z-50 flex items-end md:items-stretch justify-end">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={onClose} role="presentation" aria-hidden="true" />

            <div className="relative bg-[var(--bg-card)] shadow-[-20px_0_60px_-10px_rgba(0,0,0,0.25)] flex flex-col animate-slideInRight
                w-full md:w-[420px] lg:w-[480px]
                max-h-[88dvh] md:max-h-none md:h-full
                rounded-t-[2rem] md:rounded-tl-2xl md:rounded-bl-none md:rounded-r-none
                pb-safe">
                {/* Header */}
                <div className="p-4 sm:p-6 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-card)]/80 backdrop-blur-xl">
                    <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest border border-[var(--border-default)] px-2 py-1 rounded-lg bg-[var(--bg-secondary)]">
                                {invoice.type}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusClasses}`}>
                                <Icon name={status.iconName} className="w-3.5 h-3.5" /> {status.label}
                            </span>
                        </div>
                        <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter leading-none">
                            {invoice.series}-{invoice.number}
                        </h2>
                        <p className="text-xs text-[var(--text-secondary)] font-bold mt-2 uppercase tracking-widest">
                            {new Date(invoice.emission_date).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-2xl hover:bg-[var(--bg-danger)] hover:text-[var(--text-danger)] transition-all">
                        <Icon name="X" className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
                    {/* Tienda */}
                    {invoice.stores.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                                <Icon name="Store" className="w-4 h-4" /> Tienda
                            </h3>
                            <div className="bg-[var(--bg-secondary)] p-5 rounded-[2rem] space-y-1">
                                {invoice.stores.map(s => (
                                    <p key={s.id} className="text-lg font-black text-[var(--text-primary)]">{s.name}</p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Cliente */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                            <Icon name="User" className="w-4 h-4" /> Cliente
                        </h3>
                        <div className="bg-[var(--bg-secondary)] p-5 rounded-[2rem]">
                            <p className="text-lg font-black text-[var(--text-primary)]">{invoice.customer_name}</p>
                            <p className="text-sm font-bold text-[var(--text-secondary)]">RUC / DNI: {invoice.customer_ruc}</p>
                        </div>
                    </div>

                    {/* Monto */}
                    <div className="space-y-2">
                        <h3 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                            <Icon name="DollarSign" className="w-4 h-4" /> Monto Total
                        </h3>
                        <p className="text-4xl font-black text-[var(--text-primary)] tracking-tighter">
                            {formatCurrency(invoice.amount)}
                        </p>
                    </div>

                    {/* Orden */}
                    {invoice.order_id && (
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Pedido</p>
                            <span className="text-xs font-black text-[var(--color-info)] bg-[var(--color-info)]/10 px-3 py-1.5 rounded-lg border border-[var(--color-info)]/20 inline-block">{invoice.order_id}</span>
                        </div>
                    )}

                    {/* Items */}
                    {invoice.items && invoice.items.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                                <Icon name="List" className="w-4 h-4" /> Ítems
                            </h3>
                            <div className="space-y-2">
                                {invoice.items.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center p-4 bg-[var(--bg-secondary)] rounded-2xl">
                                        <div>
                                            <p className="text-sm font-bold text-[var(--text-primary)]">{item.descripcion}</p>
                                            <p className="text-[10px] text-[var(--text-secondary)] font-black">
                                                Cant: {item.cantidad} × {formatCurrency(item.precio_unitario)}
                                            </p>
                                        </div>
                                        <p className="text-sm font-black text-[var(--text-primary)]">{formatCurrency(item.total)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PDF */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                            <Icon name="FileText" className="w-4 h-4" /> Comprobante Digital
                        </h3>
                        <button
                            onClick={handleOpenPdf}
                            disabled={!invoice.pdf_url || isDownloading}
                            className="flex items-center justify-center gap-3 p-6 bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] shadow-xl hover:bg-[var(--icons-green)]/5 transition-all group w-full text-left disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[var(--color-error)]/10 text-[var(--color-error)] group-hover:scale-110 transition-all shadow-lg shadow-[var(--color-error)]/10">
                                <Icon name={isDownloading ? 'Loader' : 'FileText'} className={`w-8 h-8 ${isDownloading ? 'animate-spin' : ''}`} />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                                    {isDownloading ? 'Descargando…' : invoice.pdf_url ? 'Descargar Comprobante PDF' : 'PDF no disponible'}
                                </p>
                                <p className="text-xs text-[var(--text-muted)] mt-1">SUNAT · Nubefact</p>
                            </div>
                            <Icon name="Download" className="w-5 h-5 text-[var(--text-muted)] ml-auto" />
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 sm:p-6 border-t border-[var(--border-subtle)] bg-[var(--bg-card)]/80 backdrop-blur-xl">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[var(--bg-hover)] transition-all"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
