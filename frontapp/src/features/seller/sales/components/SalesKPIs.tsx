import React from 'react';
import { SalesKPI } from '@/features/seller/sales/types';
import BaseStatCard from '@/components/ui/BaseStatCard';

interface SalesKPIsProps {
    kpis: SalesKPI[];
}

export default function SalesKPIs({ kpis }: SalesKPIsProps) {
    type ColorType = 'sky' | 'indigo' | 'amber' | 'rose' | 'emerald' | 'violet';

    const mapColor = (color: string): ColorType => {
        const mapping: Record<string, ColorType> = {
            'sky': 'sky',
            'indigo': 'indigo',
            'cyan': 'sky',
            'amber': 'amber',
            'red': 'rose'
        };
        return mapping[color] || 'sky';
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {kpis.map((kpi) => (
                <BaseStatCard
                    key={kpi.label}
                    label={kpi.label}
                    value={kpi.label === 'Ingresos Mensuales' ? `S/ ${kpi.count.toLocaleString()}` : kpi.count}
                    icon={kpi.icon}
                    color={mapColor(kpi.color)}
                    description={kpi.status}
                    suffix={kpi.label === 'Ingresos Mensuales' ? undefined : 'Ord.'}
                />
            ))}
        </div>
    );
}
