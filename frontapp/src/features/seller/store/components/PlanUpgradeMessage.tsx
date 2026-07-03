'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';

interface PlanUpgradeMessageProps {
    message: string;
    className?: string;
}

export default function PlanUpgradeMessage({ message, className = '' }: PlanUpgradeMessageProps) {
    return (
        <div className={`flex items-start gap-3 p-4 rounded-2xl bg-[var(--lima-500)]/10 border border-[var(--lima-500)]/20 ${className}`}>
            <div className="w-8 h-8 bg-[var(--lima-500)]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon name="Lock" className="w-4 h-4 text-[var(--lima-500)]" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-[var(--lima-500)] leading-relaxed">
                    {message}
                </p>
                <a
                    href="/seller/planes"
                    className="inline-flex items-center gap-1 mt-2 text-[10px] font-black text-[var(--lima-500)] uppercase tracking-widest hover:text-white transition-colors"
                >
                    Actualizar Plan
                    <Icon name="ArrowRight" className="w-3 h-3" />
                </a>
            </div>
        </div>
    );
}
