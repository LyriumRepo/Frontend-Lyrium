'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';
import type { RecentInvoice } from '../types';
import { formatCurrency } from '@/shared/lib/utils/formatters';

interface ComprobantesSectionProps {
    invoices: RecentInvoice[];
}

const statusColors: Record<string, string> = {
    ACCEPTED: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    SENT_WAIT_CDR: 'text-sky-600 bg-sky-50 border-sky-200',
    DRAFT: 'text-gray-600 bg-gray-50 border-gray-200',
    REJECTED: 'text-rose-600 bg-rose-50 border-rose-200',
    OBSERVED: 'text-amber-600 bg-amber-50 border-amber-200',
};

const statusIcons: Record<string, string> = {
    ACCEPTED: 'CheckCircle',
    SENT_WAIT_CDR: 'Clock',
    DRAFT: 'FileText',
    REJECTED: 'XCircle',
    OBSERVED: 'AlertCircle',
};

const statusLabels: Record<string, string> = {
    ACCEPTED: 'Aceptado',
    SENT_WAIT_CDR: 'Pendiente CDR',
    DRAFT: 'Borrador',
    REJECTED: 'Rechazado',
    OBSERVED: 'Observado',
};

export default function ComprobantesSection({ invoices }: ComprobantesSectionProps) {
    return (
        <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-violet-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-violet-100">
                        <Icon name="FileText" className="w-6 h-6 stroke-[2.5px]" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">Últimos Comprobantes</h3>
                        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Emitidos vía NubeFact</p>
                    </div>
                </div>
                <a
                    href="/seller/invoices"
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-xl hover:bg-indigo-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                >
                    <Icon name="ExternalLink" className="w-3.5 h-3.5" />
                    Ver Todos
                </a>
            </div>

            {invoices.length === 0 ? (
                <div className="p-10 text-center border-2 border-dashed border-[var(--border-subtle)] rounded-[2rem]">
                    <Icon name="FileText" className="w-10 h-10 text-[var(--text-secondary)] mb-2 mx-auto" />
                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Sin comprobantes emitidos</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {invoices.map((inv) => {
                        const colorClass = statusColors[inv.sunat_status] || statusColors.DRAFT;
                        const iconName = statusIcons[inv.sunat_status] || 'FileText';
                        const label = statusLabels[inv.sunat_status] || inv.sunat_status;
                        return (
                            <div
                                key={inv.id}
                                className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-2xl hover:bg-[var(--bg-secondary)]/80 transition-all"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-10 h-10 bg-[var(--bg-card)] rounded-xl flex items-center justify-center text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                                        <Icon name="Receipt" className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-[var(--text-primary)] truncate">
                                            {inv.series}-{inv.number}
                                        </p>
                                        <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                                            {inv.type} · {new Date(inv.emission_date).toLocaleDateString('es-PE')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 flex-shrink-0">
                                    <span className="text-sm font-black text-[var(--text-primary)]">{formatCurrency(inv.total)}</span>
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${colorClass}`}>
                                        <Icon name={iconName} className="w-3 h-3" />
                                        {label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
