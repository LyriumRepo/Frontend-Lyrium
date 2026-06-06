'use client';

import React, { useState } from 'react';
import { InvoiceKPIs } from '@/features/seller/invoices/types';
import BaseStatCard from '@/components/ui/BaseStatCard';
import BaseModal from '@/components/ui/BaseModal';
import Icon from '@/components/ui/Icon';

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    title={selectedKpiDetail.label} subtitle="Detalle del indicador" size="md"
                    headerBgColor={`var(--${selectedKpiDetail.color}-500)`}>
                    <div className="space-y-6">
                        <div className="bg-gray-900 p-8 rounded-[2rem] text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1.5"
                                style={{ backgroundColor: `var(--${selectedKpiDetail.color}-500)` }} />
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                style={{ color: `var(--${selectedKpiDetail.color}-500)` }}>
                                <Icon name={selectedKpiDetail.icon} className="w-8 h-8" />
                            </div>
                            <p className="text-5xl font-black text-white">{selectedKpiDetail.value}</p>
                            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mt-2">{selectedKpiDetail.label}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-[var(--bg-secondary)]">
                            <p className="text-sm font-bold text-[var(--text-secondary)] text-center leading-relaxed">{selectedKpiDetail.description}</p>
                        </div>
                    </div>
                </BaseModal>
            )}
        </>
    );
}
