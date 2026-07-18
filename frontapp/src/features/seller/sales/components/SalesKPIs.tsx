import React from 'react';
import { SalesKPI } from '@/features/seller/sales/types';
import BaseStatCard from '@/components/ui/BaseStatCard';

interface SalesKPIsProps {
    kpis: SalesKPI[];
    onKpiClick?: (kpi: SalesKPI) => void;
}

export default function SalesKPIs({ kpis, onKpiClick }: SalesKPIsProps) {
    type ColorType = 'lima' | 'verde' | 'turquesaClaro' | 'turquesa';

    const mapColor = (color: string): ColorType => {
        const mapping: Record<string, ColorType> = {
            'sky': 'lima',
            'indigo': 'turquesaClaro',
            'cyan': 'turquesa',
            'amber': 'verde',
            'red': 'turquesa',
            'emerald': 'verde',
            'violet': 'turquesaClaro',
            'rose': 'turquesa',
            'lima': 'lima',
            'verde': 'verde',
            'turquesaClaro': 'turquesaClaro',
            'turquesa': 'turquesa',
        };
        return mapping[color] || 'lima';
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