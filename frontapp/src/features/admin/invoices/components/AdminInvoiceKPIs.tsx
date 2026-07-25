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
