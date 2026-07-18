'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';

interface Props {
    totalCount: number;
    completedCount: number;
    requiredCount: number;
    categoryCount: number;
    progressPercent: number;
}

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function TrainingHero({ totalCount, completedCount, requiredCount, categoryCount, progressPercent }: Props) {
    const isComplete = progressPercent === 100 && totalCount > 0;
    const offset = CIRCUMFERENCE - (Math.min(progressPercent, 100) / 100) * CIRCUMFERENCE;

    return (
        <div
            data-tour="training-progress"
            className="relative overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-[var(--bg-secondary)] animate-fade-in-up"
        >
            {/* Blobs flotantes decorativos */}
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-[var(--brand-sky)]/10 dark:bg-[var(--brand-teal)]/10 blur-3xl animate-blob-float pointer-events-none" />
            <div className="absolute -bottom-14 -left-10 w-40 h-40 rounded-full bg-[var(--brand-sky)]/10 dark:bg-[var(--brand-teal)]/10 blur-3xl animate-blob-float-reverse pointer-events-none" />
            {isComplete && (
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-success)]/5 via-transparent to-transparent pointer-events-none" />
            )}

            <div className="relative flex flex-col sm:flex-row items-center gap-6 p-5 sm:p-7">
                {/* Anillo de progreso */}
                <div className="relative shrink-0 w-28 h-28 sm:w-32 sm:h-32">
                    {isComplete && (
                        <div className="absolute -inset-2 rounded-full border-2 border-dashed border-[var(--color-success)]/30 animate-spin-slow" />
                    )}
                    <div className={`absolute inset-0 rounded-full blur-xl ${isComplete ? 'bg-[var(--color-success)]/20' : 'bg-[var(--brand-sky)]/15 dark:bg-[var(--brand-teal)]/15'} animate-ring-pulse`} />
                    <svg viewBox="0 0 120 120" className="relative w-full h-full -rotate-90">
                        <circle cx="60" cy="60" r={RADIUS} fill="none" strokeWidth="10" className="stroke-[var(--bg-muted)]" />
                        <circle
                            cx="60" cy="60" r={RADIUS} fill="none" strokeWidth="10" strokeLinecap="round"
                            stroke={isComplete ? 'var(--color-success)' : 'var(--brand-sky)'}
                            className={!isComplete ? 'dark:stroke-[var(--brand-teal)]' : ''}
                            style={{
                                strokeDasharray: CIRCUMFERENCE,
                                strokeDashoffset: offset,
                                transition: 'stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        {isComplete ? (
                            <Icon name="Trophy" className="w-8 h-8 text-[var(--color-success)] animate-card-entrance" />
                        ) : (
                            <>
                                <span className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tabular-nums">{progressPercent}%</span>
                                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest -mt-0.5">Progreso</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Info + chips */}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                    <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Tu formación</p>
                    <p className="text-lg sm:text-xl font-black text-[var(--text-primary)] mt-0.5">
                        {isComplete ? '¡Completaste todas las capacitaciones!' : `${totalCount - completedCount} capacitaci${totalCount - completedCount === 1 ? 'ón' : 'ones'} pendiente${totalCount - completedCount === 1 ? '' : 's'}`}
                    </p>

                    <div data-tour="training-stats" className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
                        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                            <Icon name="Video" className="w-3.5 h-3.5 text-[var(--brand-sky)] dark:text-[var(--brand-teal)]" />
                            <span className="text-xs font-black text-[var(--text-primary)]">{totalCount}</span>
                            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wide">Total</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                            <Icon name="CheckCircle" className="w-3.5 h-3.5 text-[var(--color-success)]" />
                            <span className="text-xs font-black text-[var(--text-primary)]">{completedCount}</span>
                            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wide">Completadas</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                            <Icon name="Shield" className="w-3.5 h-3.5 text-[var(--brand-sky)] dark:text-[var(--brand-teal)]" />
                            <span className="text-xs font-black text-[var(--text-primary)]">{requiredCount}</span>
                            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wide">Obligatorias</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                            <Icon name="LayoutGrid" className="w-3.5 h-3.5 text-[var(--brand-sky)] dark:text-[var(--brand-teal)]" />
                            <span className="text-xs font-black text-[var(--text-primary)]">{categoryCount}</span>
                            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wide">Categorías</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
