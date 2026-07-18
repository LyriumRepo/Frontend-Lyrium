'use client';

import React from 'react';
import BaseStatCard from '@/components/ui/BaseStatCard';
import BaseStatsGrid from '@/components/ui/BaseStatsGrid';
import BaseSkeleton from '@/components/ui/BaseSkeleton';

export interface AdminIndicator {
    label: string;
    value: string | number;
    icon: string;
    color?: 'lima' | 'verde' | 'turquesa' | 'turquesaClaro' | 'celeste' | 'azulCeleste' | 'sky' | 'emerald' | 'amber' | 'rose' | 'violet';
    description?: string;
    onClick?: () => void;
}

interface Props {
    indicators: AdminIndicator[];
    columns?: 1 | 2 | 3 | 4 | 5 | 6;
    isLoading?: boolean;
    className?: string;
}

const gridCols: Record<number, string> = {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6',
};

export default function AdminIndicatorGrid({ indicators, columns = 4, isLoading, className = '' }: Props) {
    const colsClass = gridCols[columns] || gridCols[4];

    if (isLoading) {
        return (
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${colsClass} gap-6 ${className}`}>
                {Array.from({ length: columns }).map((_, i) => (
                    <BaseSkeleton key={i} className="h-[130px] rounded-2xl" />
                ))}
            </div>
        );
    }

    return (
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${colsClass} gap-6 ${className}`}>
            {indicators.map((ind) => (
                <BaseStatCard
                    key={ind.label}
                    label={ind.label}
                    value={ind.value}
                    icon={ind.icon}
                    color={ind.color || 'celeste'}
                    description={ind.description}
                    onClick={ind.onClick}
                />
            ))}
        </div>
    );
}
