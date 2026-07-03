'use client';

import React from 'react';

interface PlanLimitBadgeProps {
    current: number;
    max: number;
    singular?: string;
    plural?: string;
}

export default function PlanLimitBadge({ current, max, singular = 'usado', plural = 'usados' }: PlanLimitBadgeProps) {
    if (max === -1) return null;

    const isAtLimit = current >= max;
    const label = max === 1 ? singular : plural;

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap ${
                isAtLimit
                    ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                    : current >= max * 0.8
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
            }`}
            title={isAtLimit ? `Límite alcanzado (${current}/${max})` : `${current}/${max} ${label}`}
        >
            {current}/{max} {label}
        </span>
    );
}
