'use client';

import React, { useState } from 'react';
import BaseStatCard from '@/components/ui/BaseStatCard';
import BaseModal from '@/components/ui/BaseModal';
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
                >
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 dark:bg-gradient-to-br dark:from-emerald-950/50 dark:to-teal-950/50 dark:border dark:border-emerald-800/30 p-6 rounded-[2rem] text-center">
                            <p className="text-5xl font-black text-emerald-800 dark:text-emerald-200">{detail.value}</p>
                            <p className="text-[10px] font-black text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-widest mt-2">{detail.label}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-[var(--bg-secondary)]">
                            <p className="text-xs font-bold text-[var(--text-secondary)] text-center">{detail.description}</p>
                        </div>
                    </div>
                </BaseModal>
            )}
        </>
    );
}
