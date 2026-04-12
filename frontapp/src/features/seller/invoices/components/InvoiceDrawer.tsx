'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';
import { Voucher, VoucherStatus } from '@/features/seller/invoices/types';
import { formatCurrency } from '@/shared/lib/utils/formatters';

interface InvoiceDrawerProps {
    voucher: Voucher | null;
    isOpen: boolean;
    onClose: () => void;
    onRetry: (id: string) => void | Promise<void>;
}

const fileColorClasses: Record<string, { bg: string; bgIcon: string; textIcon: string; shadow: string }> = {
    PDF: { bg: 'hover:bg-rose-500/5', bgIcon: 'bg-rose-50', textIcon: 'text-rose-500', shadow: 'shadow-rose-100/50' },
    XML: { bg: 'hover:bg-emerald-500/5', bgIcon: 'bg-emerald-50', textIcon: 'text-emerald-500', shadow: 'shadow-emerald-100/50' },
    CDR: { bg: 'hover:bg-sky-500/5', bgIcon: 'bg-sky-50', textIcon: 'text-sky-500', shadow: 'shadow-sky-100/50' },
};

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

export default function InvoiceDrawer({ voucher, isOpen, onClose, onRetry }: InvoiceDrawerProps) {
    if (!isOpen || !voucher) return null;

    const status = statusConfig[voucher.sunat_status] || statusConfig.DRAFT;
    const statusClasses = statusColorClasses[status.color] || statusColorClasses.gray;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-end">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={onClose} role="presentation" aria-hidden="true"></div>

            <div className="relative h-full bg-[var(--bg-card)] shadow-[-40px_0_80px_-20px_rgba(0,0,0,0.15)] w-full md:w-[600px] flex flex-col animate-slideInRight">
                <div className="p-8 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-card)]/80 backdrop-blur-xl">
                    <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest border border-[var(--border-default)] px-2 py-1 rounded-lg bg-[var(--bg-secondary)]">
                                {voucher.type}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusClasses}`}>
                                <Icon name={status.iconName} className="w-3.5 h-3.5" /> {status.label}
                            </span>
                        </div>
                        <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter leading-none">
                            {voucher.series}-{voucher.number}
                        </h2>
                        <p className="text-xs text-[var(--text-secondary)] font-bold mt-2 uppercase tracking-widest">
                            {new Date(voucher.emission_date).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-2xl hover:bg-[var(--bg-danger)] hover:text-[var(--text-danger)] transition-all">
                        <Icon name="X" className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                            <Icon name="User" className="w-4 h-4" /> Datos del Cliente
                        </h3>
                        <div className="bg-[var(--bg-secondary)] p-5 rounded-[2rem]">
                            <p className="text-lg font-black text-[var(--text-primary)]">{voucher.customer_name}</p>
                            <p className="text-sm font-bold text-[var(--text-secondary)]">RUC: {voucher.customer_ruc}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                            <Icon name="DollarSign" className="w-4 h-4" /> Monto Total
                        </h3>
                        <div className="bg-gray-900 p-6 rounded-[2rem]">
                            <p className="text-3xl font-black text-white">{formatCurrency(voucher.amount)}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Orden</p>
                        <p className="text-sm font-bold text-[var(--text-secondary)]">{voucher.order_id}</p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                            <Icon name="Archive" className="w-4 h-4" /> Archivos Adjuntos
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: 'PDF', icon: 'FileText', color: 'PDF', path: voucher.pdf_path },
                                { label: 'XML', icon: 'FileCode', color: 'XML', path: voucher.xml_path },
                                { label: 'CDR', icon: 'Archive', color: 'CDR', path: voucher.cdr_path }
                            ].map((file) => (
                                <button
                                    key={file.label}
                                    disabled={!file.path}
                                    className={`p-6 bg-[var(--bg-card)] rounded-[2.5rem] transition-all flex flex-col items-center gap-3 border border-[var(--border-subtle)] shadow-xl shadow-[var(--border-subtle)]/50 group/file ${file.path ? `${fileColorClasses[file.label].bg} active:scale-95` : 'opacity-30 grayscale cursor-not-allowed'}`}
                                >
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${file.path ? `${fileColorClasses[file.label].bgIcon} ${fileColorClasses[file.label].textIcon} group-hover/file:scale-110 ${fileColorClasses[file.label].shadow}` : 'bg-[var(--bg-secondary)] text-gray-300'}`}>
                                        <Icon name={file.icon} className="w-8 h-8" />
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${file.path ? 'text-[var(--text-secondary)] group-hover/file:text-[var(--text-primary)]' : 'text-gray-300'}`}>{file.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                            <Icon name="Clock" className="w-4 h-4" /> Historial
                        </h3>
                        {voucher.history && voucher.history.length > 0 ? (
                            <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border-subtle)]">
                                {[...voucher.history].reverse().map((event, idx) => (
                                    <div key={`history-${event.timestamp}`} className="relative pl-10">
                                        <div className="absolute left-2.5 top-1 w-3 h-3 bg-indigo-500 rounded-full border-4 border-[var(--bg-card)] shadow-sm -ml-0.5"></div>
                                        <div>
                                            <p className="text-[10px] font-black text-[var(--text-primary)] leading-none mb-1 uppercase tracking-tight">{event.note}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase">{new Date(event.timestamp).toLocaleString()}</span>
                                                <span className="w-1 h-1 bg-[var(--border-subtle)] rounded-full"></span>
                                                <span className="text-[9px] font-bold text-indigo-500 uppercase">{event.user}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-10 text-center border-2 border-dashed border-[var(--border-subtle)] rounded-[2rem]">
                                <Icon name="Clock" className="w-10 h-10 text-[var(--text-secondary)] mb-2 mx-auto" />
                                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Sin historial registrado</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-8 border-t border-[var(--border-subtle)] bg-[var(--bg-card)]/80 backdrop-blur-xl flex gap-4">
                    {voucher.sunat_status === 'REJECTED' || voucher.sunat_status === 'OBSERVED' ? (
                        <button
                            onClick={() => onRetry(voucher.id)}
                            className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl flex items-center justify-center gap-2"
                        >
                            <Icon name="RefreshCw" className="w-4 h-4" /> Reintentar Envío
                        </button>
                    ) : null}
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[var(--bg-hover)] transition-all"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
