'use client';

import React from 'react';
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

export default function InvoiceTable({ vouchers, onViewDetail }: InvoiceTableProps) {
    return (
        <div className="glass-card overflow-hidden animate-fadeIn">
            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-subtle)] text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                            <th className="px-6 py-5">Comprobante</th>
                            <th className="px-6 py-5">Cliente / RUC</th>
                            <th className="px-6 py-5">Pedido</th>
                            <th className="px-6 py-5">Monto</th>
                            <th className="px-6 py-5">Fecha Emisión</th>
                            <th className="px-6 py-5 text-center">Estado SUNAT</th>
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
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-10 h-10 ${type.bg} rounded-xl flex items-center justify-center ${type.text} group-hover:scale-110 transition-transform`}>
                                                    <Icon name={type.icon} className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-[var(--text-primary)] font-mono tracking-tight">{v.series}-{v.number}</p>
                                                    <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase bg-[var(--bg-secondary)] w-fit px-1.5 rounded-md">{v.type}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-[var(--text-primary)] truncate max-w-[200px]">{v.customer_name}</p>
                                            <p className="text-[10px] text-[var(--text-secondary)] font-black font-mono">{v.customer_ruc}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-black text-sky-600 bg-sky-50 px-2 py-1 rounded-lg border border-sky-100">{v.order_id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-black text-[var(--text-primary)]">S/ {v.amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-bold text-[var(--text-secondary)]">{formatDate(v.emission_date)}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <BaseStatusBadge 
                                                status={v.sunat_status} 
                                                mappings={VOUCHER_STATUS_MAPPINGS}
                                                variant="large"
                                                customClass="gap-2 rounded-xl font-black"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => onViewDetail(v)}
                                                className="w-10 h-10 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-emerald-600 hover:border-emerald-200 rounded-xl transition-all shadow-sm active:scale-90 flex items-center justify-center m-auto mr-0"
                                            >
                                                <Icon name="Eye" className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
