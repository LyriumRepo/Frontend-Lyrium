'use client';

import React from 'react';
import BaseStatCard from '@/components/ui/BaseStatCard';
import Icon from '@/components/ui/Icon';

export type StatColor = 'sky' | 'emerald' | 'amber' | 'indigo' | 'rose' | 'violet';

export interface StatItem {
    label: string;
    value: string | number;
    icon?: string;
    color?: StatColor;
    suffix?: string;
    description?: string;
    trend?: {
        value: string | number;
        isPositive: boolean;
    };
}

export interface StatsGridProps {
    stats: StatItem[];
    columns?: 1 | 2 | 3 | 4 | 5 | 6;
    isLoading?: boolean;
    customClass?: string;
}

const columnClasses: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
};

export default function BaseStatsGrid({ stats, columns = 4, isLoading = false, customClass = '' }: StatsGridProps) {
    const gridClass = columnClasses[columns] || columnClasses[4];

    if (isLoading) {
        return (
            <div className={`grid ${gridClass} gap-6 ${customClass}`}>
                {stats.map((stat) => (
                    <BaseStatCard
                        key={stat.label}
                        label={stat.label}
                        value={stat.value}
                        icon={stat.icon || 'BarChart3'}
                        color={stat.color || 'sky'}
                        isLoading={true}
                    />
                ))}
            </div>
        );
    }

    if (!stats || stats.length === 0) {
        return null;
    }

    return (
        <div className={`grid ${gridClass} gap-6 ${customClass}`}>
            {stats.map((stat) => (
                <BaseStatCard
                    key={stat.label}
                    label={stat.label}
                    value={stat.value}
                    icon={stat.icon || 'BarChart3'}
                    color={stat.color || 'sky'}
                    suffix={stat.suffix}
                    description={stat.description}
                    trend={stat.trend}
                />
            ))}
        </div>
    );
}
