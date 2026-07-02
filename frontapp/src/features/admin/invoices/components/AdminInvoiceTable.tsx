'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';
import BaseStatusBadge, { VOUCHER_STATUS_MAPPINGS } from '@/components/ui/BaseStatusBadge';
import { formatCurrency } from '@/shared/lib/utils/formatters';
import type { AdminInvoiceRow } from '../hooks/useAdminInvoices';

interface Props {
    invoices: AdminInvoiceRow[];
    onViewDetail: (invoice: AdminInvoiceRow) => void;
}

const typeConfig: Record<string, { icon: string; bg: string; text: string }> = {
    FACTURA:      { icon: 'FileText', bg: 'bg-sky-100 dark:bg-sky-950/40',     text: 'text-sky-600 dark:text-sky-400' },
    BOLETA:       { icon: 'Receipt',  bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400' },
    NOTA_CREDITO: { icon: 'Undo',     bg: 'bg-red-100 dark:bg-red-950/40',     text: 'text-red-600 dark:text-red-400' },
};

export default function AdminInvoiceTable({ invoices, onViewDetail }: Props) {
    return (
        <div className="glass-card overflow-hidden animate-fadeIn">
            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-subtle)] text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                            <th className="px-6 py-5">Documento</th>
                            <th className="px-6 py-5">Serie-Nro</th>
                            <th className="px-6 py-5">Cliente</th>
                            <th className="px-6 py-5 text-right">Base Imp.</th>
                            <th className="px-6 py-5 text-right">IGV (18%)</th>
                            <th className="px-6 py-5 text-right">Monto</th>
                            <th className="px-6 py-5">Fecha Emisión</th>
                            <th className="px-6 py-5 text-center">Estado</th>
                            <th className="px-6 py-5 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
                        {invoices.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-4 text-[var(--text-secondary)]">
                                        <Icon name="FileX" className="w-12 h-12 opacity-30" />
                                        <div className="font-black uppercase text-xs tracking-widest">
                                            No se encontraron comprobantes
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            invoices.map((inv) => {
                                const type = typeConfig[inv.type] ?? typeConfig.FACTURA;
                                const storeName = inv.stores[0]?.name ?? '—';
                                return (
                                    <tr key={inv.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-10 h-10 ${type.bg} rounded-xl flex items-center justify-center ${type.text} group-hover:scale-110 transition-transform`}>
                                                    <Icon name={type.icon} className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase bg-[var(--bg-secondary)] w-fit px-1.5 rounded-md">{inv.type}</p>
                                                    <p className="text-sm font-bold text-[var(--text-primary)] truncate max-w-[180px]">{storeName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-[var(--text-primary)] font-mono tracking-tight">{inv.series}-{inv.number}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-[var(--text-primary)] truncate max-w-[200px]">{inv.customer_name}</p>
                                            <p className="text-[10px] text-[var(--text-secondary)] font-black font-mono">{inv.customer_ruc}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="text-sm font-medium text-[var(--text-secondary)]">{formatCurrency(inv.subtotal_sin_igv ?? (inv.amount / 1.18))}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="text-sm font-medium text-[var(--text-secondary)]">{formatCurrency(inv.igv_amount ?? (inv.amount - (inv.amount / 1.18)))}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="text-sm font-black text-[var(--text-primary)]">{formatCurrency(inv.amount)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-bold text-[var(--text-secondary)]">
                                                {new Date(inv.emission_date).toLocaleDateString('es-PE')}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <BaseStatusBadge
                                                status={inv.sunat_status}
                                                mappings={VOUCHER_STATUS_MAPPINGS}
                                                variant="large"
                                                customClass="gap-2 rounded-xl font-black"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => onViewDetail(inv)}
                                                className="w-10 h-10 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-emerald-600 hover:border-emerald-200 rounded-xl transition-all shadow-sm active:scale-90 flex items-center justify-center ml-auto"
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
    );
}
