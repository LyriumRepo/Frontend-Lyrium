'use client';

import React, { useState } from 'react';
import BaseStatCard from '@/components/ui/BaseStatCard';
import BaseModal from '@/components/ui/BaseModal';
import Icon from '@/components/ui/Icon';
import { formatCurrency } from '@/shared/lib/utils/formatters';
import type { AdminInvoiceKPIs } from '../hooks/useAdminInvoices';

interface Props {
    kpis: AdminInvoiceKPIs | null;
}

interface DetailItem {
    label: string;
    value: string;
    description: string;
    color: string;
    icon: string;
}

export default function AdminInvoiceKPIsDisplay({ kpis }: Props) {
    const [detail, setDetail] = useState<DetailItem | null>(null);

    if (!kpis) return null;

    const crecimiento = kpis.porcentajeCrecimiento;
    const crecimientoPositivo = crecimiento >= 0;

    const items: DetailItem[] = [
        {
            label: 'Facturado (Mes Actual)',
            value: formatCurrency(kpis.totalFacturadoMesActual),
            icon: 'TrendingUp',
            color: 'lima',
            description: 'Monto total facturado en el mes en curso (comprobantes aceptados o pendientes CDR).',
        },
        {
            label: 'Facturado (Mes Anterior)',
            value: formatCurrency(kpis.totalFacturadoMesAnterior),
            icon: 'CalendarDays',
            color: 'verde',
            description: 'Monto total facturado el mes anterior, usado como base de comparación.',
        },
        {
            label: 'Crecimiento',
            value: `${crecimientoPositivo ? '+' : ''}${crecimiento.toFixed(1)}%`,
            icon: crecimientoPositivo ? 'TrendingUp' : 'TrendingDown',
            color: crecimientoPositivo ? 'turquesa' : 'turquesaClaro',
            description: 'Variación porcentual de facturación respecto al mes anterior.',
        },
        {
            label: 'Monto Promedio',
            value: formatCurrency(kpis.montoPromedio),
            icon: 'BarChart2',
            color: 'turquesa',
            description: 'Promedio de monto por comprobante electrónico emitido (aceptados y pendientes CDR).',
        },
    ];

    const totalTopSellers = kpis.topSellers.reduce((acc, s) => acc + s.totalVendido, 0);

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {items.map((item) => (
                    <BaseStatCard
                        key={item.label}
                        label={item.label}
                        value={item.value}
                        icon={item.icon}
                        color={item.color as 'lima' | 'verde' | 'turquesa' | 'turquesaClaro'}
                        description={item.description}
                        onClick={() => setDetail(item)}
                    />
                ))}
            </div>

            {kpis.topSellers.length > 0 && (
                <div className="glass-card overflow-hidden">
                    <div className="px-6 py-5 border-b border-[var(--border-subtle)] flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[var(--color-success)]/10 flex items-center justify-center text-[var(--color-success)]">
                            <Icon name="Trophy" className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-[var(--text-primary)]">Top 5 Sellers por Facturación</p>
                            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Mes actual · comprobantes aceptados</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[var(--bg-secondary)]/50 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest border-b border-[var(--border-subtle)]">
                                    <th className="px-6 py-4 w-10">#</th>
                                    <th className="px-6 py-4">Tienda</th>
                                    <th className="px-6 py-4 text-right">Monto</th>
                                    <th className="px-6 py-4 text-right">% del Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-subtle)]">
                                {kpis.topSellers.map((seller, i) => {
                                    const pct = totalTopSellers > 0
                                        ? ((seller.totalVendido / totalTopSellers) * 100).toFixed(1)
                                        : '0.0';
                                    return (
                                        <tr key={seller.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-black text-[var(--text-secondary)] bg-[var(--bg-secondary)] w-7 h-7 rounded-lg flex items-center justify-center">
                                                    {i + 1}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-[var(--text-primary)]">{seller.name}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="text-sm font-black text-[var(--text-primary)]">{formatCurrency(seller.totalVendido)}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="w-16 h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-[var(--color-success)] rounded-full"
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-black text-[var(--text-secondary)] w-10 text-right">{pct}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {detail && (
                <BaseModal
                    isOpen={true}
                    onClose={() => setDetail(null)}
                    title={detail.label}
                    subtitle="Detalle del indicador"
                    size="md"
                    headerBgColor={`var(--${detail.color}-500)`}
                >
                    <div className="space-y-6">
                        <div className="bg-gray-900 p-8 rounded-[2rem] text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: `var(--${detail.color}-500)` }} />
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ color: `var(--${detail.color}-500)` }}>
                                <Icon name={detail.icon} className="w-8 h-8" />
                            </div>
                            <p className="text-5xl font-black text-white">{detail.value}</p>
                            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mt-2">{detail.label}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-[var(--bg-secondary)]">
                            <p className="text-sm font-bold text-[var(--text-secondary)] text-center leading-relaxed">{detail.description}</p>
                        </div>
                    </div>
                </BaseModal>
            )}
        </>
    );
}
