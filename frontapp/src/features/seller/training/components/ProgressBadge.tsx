'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';

interface Props {
    completed: number;
    total: number;
    percent: number;
}

export default function ProgressBadge({ completed, total, percent }: Props) {
    const isComplete = percent === 100 && total > 0;

    return (
        <div className={`relative overflow-hidden p-4 sm:p-5 rounded-2xl border transition-all duration-300 ${
            isComplete
                ? 'bg-gradient-to-br from-[var(--color-success)]/5 via-[var(--bg-card)] to-[var(--bg-card)] border-[var(--color-success)]/20'
                : 'bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-secondary)] border-[var(--border-subtle)]'
        }`}>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--brand-sky)]/5 dark:bg-[var(--brand-teal)]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-[var(--brand-sky)]/5 dark:bg-[var(--brand-teal)]/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

            <div className="relative flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isComplete
                            ? 'bg-gradient-to-br from-[var(--color-success)] to-emerald-400 shadow-lg shadow-[var(--color-success)]/20'
                            : 'bg-[var(--brand-sky)] dark:bg-[var(--brand-teal)] shadow-lg shadow-[var(--brand-sky)]/20 dark:shadow-[var(--brand-teal)]/20'
                    }`}>
                        <Icon name={isComplete ? 'Trophy' : 'TrendingUp'} className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Tu progreso</p>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                            {isComplete ? '¡Todas completadas!' : `${total - completed} restante${total - completed !== 1 ? 's' : ''}`}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-[var(--text-primary)]">{percent}</span>
                        <span className="text-xs font-bold text-[var(--text-muted)]">%</span>
                    </div>
                    <p className="text-[10px] font-bold text-[var(--text-muted)]">{completed} de {total}</p>
                </div>
            </div>

            {/* Progress bar */}
            <div className="relative w-full h-3 rounded-full bg-[var(--bg-muted)] overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        isComplete
                            ? 'bg-gradient-to-r from-[var(--color-success)] via-emerald-400 to-[var(--color-success)]'
                            : 'bg-[var(--brand-sky)] dark:bg-[var(--brand-teal)]'
                    }`}
                    style={{ width: `${percent}%` }}
                />
                {/* Shimmer effect on the bar */}
                {percent > 0 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" style={{ width: `${percent}%` }} />
                )}
            </div>

            {isComplete && (
                <div className="relative mt-3 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/20">
                    <div className="w-7 h-7 rounded-lg bg-[var(--color-success)]/20 flex items-center justify-center flex-shrink-0">
                        <Icon name="Trophy" className="w-4 h-4 text-[var(--color-success)]" />
                    </div>
                    <span className="text-xs font-bold text-[var(--color-success)]">¡Completaste todas las capacitaciones!</span>
                </div>
            )}
        </div>
    );
}
