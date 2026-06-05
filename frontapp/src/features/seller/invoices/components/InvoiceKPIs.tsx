'use client';

import React, { useState } from 'react';
import { InvoiceKPIs } from '@/features/seller/invoices/types';
import BaseStatCard from '@/components/ui/BaseStatCard';
import BaseModal from '@/components/ui/BaseModal';

interface InvoiceKPIsProps {
    kpis: InvoiceKPIs | null;
}

export default function InvoiceKPIsDisplay({ kpis }: InvoiceKPIsProps) {
    const [selectedKpiDetail, setSelectedKpiDetail] = useState<{ label: string; value: string; description: string } | null>(null);

    if (!kpis) return null;

    const items = [
        {
            label: 'Total Facturado',
            value: `S/ ${kpis.totalFacturado.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: 'DollarSign',
            color: 'lima' as const,
            description: 'Monto total emitido en comprobantes electrónicos durante el mes actual.'
        },
        {
            label: 'Tasa de Éxito',
            value: `${kpis.successRate.toFixed(1)}%`,
            icon: 'CheckCircle2',
            color: 'turquesaClaro' as const,
            description: 'Porcentaje de comprobantes aceptados por SUNAT sin observaciones.'
        },
        {
            label: 'Pendientes',
            value: kpis.pendingCount.toString(),
            icon: 'Clock',
            color: 'azulCeleste' as const,
            description: 'Comprobantes en espera de procesamiento o respuesta de SUNAT.'
        },
        {
            label: 'Rechazados',
            value: kpis.rejectedCount.toString(),
            icon: 'XCircle',
            color: 'turquesa' as const,
            description: 'Comprobantes que fueron rechazados por SUNAT y requieren corrección.'
        }
    ];

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {items.map((item) => (
                    <BaseStatCard
                        key={item.label}
                        label={item.label}
                        value={item.value}
                        icon={item.icon}
                        color={item.color}
                        description={item.description}
                        onClick={() => setSelectedKpiDetail({ label: item.label, value: item.value, description: item.description })}
                    />
                ))}
            </div>
            <BaseModal isOpen={!!selectedKpiDetail} onClose={() => setSelectedKpiDetail(null)}
                title={selectedKpiDetail?.label ?? ''} subtitle="Detalle del indicador" size="md">
                <div className="space-y-6">
                    <div className="bg-gray-900 p-6 rounded-[2rem] text-center">
                        <p className="text-5xl font-black text-white">{selectedKpiDetail?.value}</p>
                        <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mt-2">{selectedKpiDetail?.label}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[var(--bg-secondary)]">
                        <p className="text-sm font-bold text-[var(--text-secondary)] text-center leading-relaxed">{selectedKpiDetail?.description}</p>
                    </div>
                </div>
            </BaseModal>
        </>
    );
}
