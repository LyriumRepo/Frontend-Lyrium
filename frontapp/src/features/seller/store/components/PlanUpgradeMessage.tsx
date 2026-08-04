'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';

interface PlanUpgradeMessageProps {
    message: string;
    className?: string;
}

export default function PlanUpgradeMessage({ message, className = '' }: PlanUpgradeMessageProps) {
    return (
        <div className={`flex items-start gap-3 p-4 rounded-2xl bg-[var(--plan-lock-accent)]/10 border border-[var(--plan-lock-accent)]/20 ${className}`}>
            <div className="w-8 h-8 bg-[var(--plan-lock-accent)]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon name="Lock" className="w-4 h-4 text-[var(--plan-lock-accent)]" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-[var(--plan-lock-accent)] leading-relaxed">
                    {message}
                </p>
                <a
                    href="/seller/planes"
                    className="inline-flex items-center gap-1 mt-2 text-[10px] font-black text-[var(--plan-lock-accent)] uppercase tracking-widest hover:text-white transition-colors"
                >
                    Actualizar Plan
                    <Icon name="ArrowRight" className="w-3 h-3" />
                </a>
            </div>
        </div>
    );
}
