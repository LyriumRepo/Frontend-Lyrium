'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/ui/Icon';
import { Voucher, VoucherStatus } from '@/features/seller/invoices/types';
import { formatCurrency } from '@/shared/lib/utils/formatters';
import { getAuthHeaders } from '@/shared/lib/api/token-store';

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

    return createPortal(
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
                            <Icon name="Store" className="w-4 h-4" /> Datos de la Tienda
                        </h3>
                        <div className="bg-[var(--bg-secondary)] p-5 rounded-[2rem]">
                            <p className="text-lg font-black text-[var(--text-primary)]">{voucher.store_name}</p>
                            <p className="text-sm font-bold text-[var(--text-secondary)]">RUC: {voucher.store_ruc}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                            <Icon name="DollarSign" className="w-4 h-4" /> Comisión
                        </h3>
                        <div className="bg-[var(--bg-secondary)] rounded-2xl p-5 border border-[var(--border-subtle)]">
                            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">Desglose</p>
                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                El desglose exacto (Base Imponible, IGV y Total) se encuentra en la <span className="font-black text-[var(--text-primary)]">Factura PDF</span>. Descárgala abajo.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Orden</p>
                        <p className="text-sm font-bold text-[var(--text-secondary)]">{voucher.order_id}</p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                            <Icon name="FileText" className="w-4 h-4" /> Comprobante Digital
                        </h3>
                        <button
                            onClick={() => handleDownloadPdf(voucher)}
                            disabled={isDownloading}
                            className="flex items-center justify-center gap-3 p-6 bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] shadow-xl shadow-[var(--border-subtle)]/50 hover:bg-emerald-500/5 transition-all group w-full text-left disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-rose-50 text-rose-500 group-hover:scale-110 transition-all shadow-lg shadow-rose-100/50">
                                <Icon name="FileText" className="w-8 h-8" />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                                    {isDownloading ? 'Descargando...' : 'Descargar Factura Electrónica'}
                                </p>
                                <p className="text-xs text-[var(--text-muted)] mt-1">Comprobante Lyrium</p>
                            </div>
                            <Icon name="Download" className="w-5 h-5 text-[var(--text-muted)] ml-auto" />
                        </button>
                    </div>


                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-2">
                            <Icon name="Clock" className="w-4 h-4" /> Historial
                        </h3>
                        {voucher.history && voucher.history.length > 0 ? (
                            <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border-subtle)]">
                                {[...voucher.history].reverse().map((event, idx) => (
                                    <div key={`history-${event.timestamp}-${idx}`} className="relative pl-10">
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
                    <button
                        onClick={() => handleSharePdf(voucher)}
                        className="flex items-center justify-center gap-2 flex-1 py-4 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[var(--bg-hover)] transition-all"
                    >
                        <Icon name={shareStatus === 'copied' ? 'ClipboardCheck' : 'Share2'} className="w-4 h-4" />
                        {shareStatus === 'copied' ? 'Copiado' : 'Compartir'}
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[var(--bg-hover)] transition-all"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>,
        modalRoot,
    );
}