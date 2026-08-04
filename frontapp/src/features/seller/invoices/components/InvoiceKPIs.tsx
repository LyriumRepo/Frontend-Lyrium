'use client';

import React, { useState } from 'react';
import { InvoiceKPIs } from '@/features/seller/invoices/types';
import BaseStatCard from '@/components/ui/BaseStatCard';
import BaseModal from '@/components/ui/BaseModal';

interface InvoiceKPIsProps {
    kpis: InvoiceKPIs | null;
}

export default function InvoiceKPIsDisplay({ kpis }: InvoiceKPIsProps) {
    const [selectedKpiDetail, setSelectedKpiDetail] = useState<{ label: string; value: string; description: string; color: string; icon: string } | null>(null);

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
            icon: 'CheckCircle',
            color: 'turquesaClaro' as const,
            description: 'Porcentaje de comprobantes aceptados por SUNAT sin observaciones.'
        },
        {
            label: 'Pendientes',
            value: kpis.pendingCount.toString(),
            icon: 'Clock',
            color: 'turquesa' as const,
            description: 'Comprobantes en espera de procesamiento o respuesta de SUNAT.'
        },
        {
            label: 'Comprobantes Emitidos',
            value: kpis.totalComprobantes.toString(),
            icon: 'Receipt',
            color: 'verde' as const,
            description: 'Total de comprobantes electrónicos aceptados por SUNAT.'
        }
    ];

    return (
        <>
            <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
                {items.map((item) => (
                    <BaseStatCard
                        key={item.label}
                        label={item.label}
                        value={item.value}
                        icon={item.icon}
                        color={item.color}
                        description={item.description}
                        onClick={() => setSelectedKpiDetail({ label: item.label, value: item.value, description: item.description, color: item.color, icon: item.icon })}
                    />
                ))}
            </div>
            {selectedKpiDetail && (
                <BaseModal isOpen={true} onClose={() => setSelectedKpiDetail(null)}
                    title={selectedKpiDetail.label} subtitle="Detalle del indicador" size="md">
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 dark:bg-gradient-to-br dark:from-emerald-950/50 dark:to-teal-950/50 dark:border dark:border-emerald-800/30 p-6 rounded-[2rem] text-center">
                            <p className="text-5xl font-black text-emerald-800 dark:text-emerald-200">{selectedKpiDetail.value}</p>
                            <p className="text-[10px] font-black text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-widest mt-2">{selectedKpiDetail.label}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-[var(--bg-secondary)]">
                            <p className="text-xs font-bold text-[var(--text-secondary)] text-center">{selectedKpiDetail.description}</p>
                        </div>
                    </div>
                </BaseModal>
            )}
        </>
    );
}
