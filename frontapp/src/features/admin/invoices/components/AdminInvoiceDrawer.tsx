'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';
import { formatCurrency } from '@/shared/lib/utils/formatters';
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
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    sky:     'bg-sky-50 text-sky-600 border-sky-100',
    rose:    'bg-rose-50 text-rose-600 border-rose-100',
    amber:   'bg-amber-50 text-amber-600 border-amber-100',
    gray:    'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
};

export default function AdminInvoiceDrawer({ invoice, isOpen, onClose }: Props) {
    if (!isOpen || !invoice) return null;

    const status = statusConfig[invoice.sunat_status] ?? statusConfig.DRAFT;
    const statusClasses = statusColorClasses[status.color] ?? statusColorClasses.gray;

    const handleOpenPdf = () => {
        if (invoice.pdf_url) {
            window.open(invoice.pdf_url, '_blank', 'noopener');
        }
    };

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-end">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={onClose} role="presentation" aria-hidden="true" />

            <div className="relative h-full bg-[var(--bg-card)] shadow-[-40px_0_80px_-20px_rgba(0,0,0,0.15)] w-full md:w-[600px] flex flex-col animate-slideInRight">
                {/* Header */}
                <div className="p-4 sm:p-8 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-card)]/80 backdrop-blur-xl">
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
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 custom-scrollbar">
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
                            <span className="text-xs font-black text-sky-600 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100 inline-block">{invoice.order_id}</span>
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
                            disabled={!invoice.pdf_url}
                            className="flex items-center justify-center gap-3 p-6 bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] shadow-xl hover:bg-emerald-500/5 transition-all group w-full text-left disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-rose-50 text-rose-500 group-hover:scale-110 transition-all shadow-lg shadow-rose-100/50">
                                <Icon name="FileText" className="w-8 h-8" />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                                    {invoice.pdf_url ? 'Ver Comprobante PDF' : 'PDF no disponible'}
                                </p>
                                <p className="text-xs text-[var(--text-muted)] mt-1">Nubefact — SUNAT</p>
                            </div>
                            <Icon name="ExternalLink" className="w-5 h-5 text-[var(--text-muted)] ml-auto" />
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-[var(--border-subtle)] bg-[var(--bg-card)]/80 backdrop-blur-xl">
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
