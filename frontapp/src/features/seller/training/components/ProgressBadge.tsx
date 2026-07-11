'use client';

import React from 'react';

interface Props {
    completed: number;
    total: number;
    percent: number;
}

export default function ProgressBadge({ completed, total, percent }: Props) {
    return (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[var(--brand-teal)]/10 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-[var(--brand-teal)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                        </svg>
                    </div>
                    <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Tu progreso</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-[var(--text-primary)]">{completed}/{total}</span>
                    <span className="text-[10px] font-bold text-[var(--text-muted)]">({percent}%)</span>
                </div>
            </div>
            <div className="w-full h-2.5 rounded-full bg-[var(--bg-muted)] overflow-hidden">
                <div
                    className="h-full rounded-full bg-[var(--brand-teal)] transition-all duration-700 ease-out"
                    style={{ width: `${percent}%` }}
                />
            </div>
            {percent === 100 && total > 0 && (
                <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-gradient-to-r from-[var(--color-success)]/10 to-[var(--color-success)]/5 border border-[var(--color-success)]/20">
                    <div className="w-6 h-6 rounded-full bg-[var(--color-success)]/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <span className="text-[11px] font-bold text-[var(--color-success)]">¡Completaste todas las capacitaciones!</span>
                </div>
            )}
        </div>
    );
}
