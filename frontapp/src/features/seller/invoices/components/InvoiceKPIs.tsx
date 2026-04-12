'use client';

import React from 'react';
import { InvoiceKPIs } from '@/features/seller/invoices/types';
import BaseStatCard from '@/components/ui/BaseStatCard';

interface InvoiceKPIsProps {
    kpis: InvoiceKPIs | null;
}

export default function InvoiceKPIsDisplay({ kpis }: InvoiceKPIsProps) {
    if (!kpis) return null;

    const items = [
        {
            label: 'Total Facturado',
            value: `S/ ${kpis.totalFacturado.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: 'DollarSign',
            color: 'emerald' as const,
            description: 'Mes Actual'
        },
        {
            label: 'Tasa de Éxito',
            value: `${kpis.successRate.toFixed(1)}%`,
            icon: 'CheckCircle2',
            color: 'sky' as const,
            description: 'Sync Rate'
        },
        {
            label: 'Pendientes',
            value: kpis.pendingCount.toString(),
            icon: 'Clock',
            color: 'amber' as const,
            description: 'Waiting'
        },
        {
            label: 'Rechazados',
            value: kpis.rejectedCount.toString(),
            icon: 'XCircle',
            color: 'rose' as const,
            description: 'Error'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => (
                <BaseStatCard
                    key={item.label}
                    label={item.label}
                    value={item.value}
                    icon={item.icon}
                    color={item.color}
                    description={item.description}
                />
            ))}
        </div>
    );
}
