import React from 'react';
import { SalesKPI } from '@/features/seller/sales/types';
import BaseStatCard from '@/components/ui/BaseStatCard';

interface SalesKPIsProps {
    kpis: SalesKPI[];
    onKpiClick?: (kpi: SalesKPI) => void;
}

export default function SalesKPIs({ kpis, onKpiClick }: SalesKPIsProps) {
    type ColorType = 'sky' | 'indigo' | 'amber' | 'rose' | 'emerald' | 'violet';

    const mapColor = (color: string): ColorType => {
        const mapping: Record<string, ColorType> = {
            'sky': 'sky',
            'indigo': 'indigo',
            'cyan': 'sky',
            'amber': 'amber',
            'red': 'rose',
            'emerald': 'emerald',
            'violet': 'violet',
            'rose': 'rose',
        };
        return mapping[color] || 'sky';
    };

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 lg:gap-6 [&>*]:min-w-0">
            {kpis.map((kpi) => {
                const isMonetary = ['Ventas Totales', 'Ingresos'].some(k => kpi.label.includes(k));
                return (
                    <BaseStatCard
                        key={kpi.label}
                        label={kpi.label}
                        value={isMonetary ? `S/ ${kpi.count.toLocaleString()}` : kpi.count}
                        icon={kpi.icon}
                        color={mapColor(kpi.color)}
                        description={kpi.status}
                        suffix={isMonetary ? undefined : 'Ord.'}
                        onClick={() => onKpiClick?.(kpi)}
                    />
                );
            })}
        </div>
    );
}