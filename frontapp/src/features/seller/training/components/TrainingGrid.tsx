'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';
import type { SellerTraining } from '../types';

interface Props {
    category: string;
    trainings: SellerTraining[];
    onPlay: (t: SellerTraining) => void;
    togglingId: number | null;
    isFirstGroup?: boolean;
}

function getPlatformGradient(platform: string): string {
    switch (platform) {
        case 'youtube': return 'from-red-500/80 to-red-600/60';
        case 'vimeo': return 'from-[var(--brand-sky)]/80 to-[var(--brand-sky)]/50';
        case 'drive': return 'from-[var(--brand-teal)]/80 to-emerald-600/50';
        default: return 'from-[var(--brand-teal)]/80 to-[var(--brand-teal)]/50';
    }
}

function getPlatformLabel(platform: string): string {
    switch (platform) {
        case 'youtube': return 'YouTube';
        case 'vimeo': return 'Vimeo';
        case 'drive': return 'Drive';
        default: return platform;
    }
}

function getPlatformBadgeStyle(platform: string): string {
    switch (platform) {
        case 'youtube': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
        case 'vimeo': return 'bg-[var(--brand-sky)]/10 text-[var(--brand-sky)] border-[var(--brand-sky)]/20';
        case 'drive': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
        default: return 'bg-[var(--brand-teal)]/10 text-[var(--brand-teal)] border-[var(--brand-teal)]/20';
    }
}

function getPlatformIcon(platform: string): string {
    switch (platform) {
        case 'youtube': return 'Youtube';
        case 'vimeo': return 'Video';
        default: return 'Video';
    }
}

export default function TrainingGrid({ category, trainings, onPlay, togglingId, isFirstGroup }: Props) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[var(--brand-teal)] to-[var(--brand-sky)]" />
                <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">{category}</h3>
                <span className="px-2 py-0.5 rounded-full bg-[var(--bg-muted)] text-[10px] font-bold text-[var(--text-muted)]">{trainings.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 stagger-grid">
                {trainings.map((t, idx) => (
                    <button
                        key={t.id}
                        {...(isFirstGroup && idx === 0 ? { 'data-tour': 'training-card' } : {})}
                        onClick={() => onPlay(t)}
                        disabled={togglingId === t.id}
                        className="group relative text-left bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden hover:shadow-xl hover:shadow-[var(--brand-teal)]/10 hover:border-[var(--brand-teal)]/25 hover:-translate-y-1 transition-all duration-300 cursor-pointer disabled:opacity-50 animate-card-entrance"
                    >
                        {/* Thumbnail area */}
                        <div className="relative aspect-video bg-[var(--bg-muted)] overflow-hidden">
                            {t.thumbnail && (
                                <img src={t.thumbnail} alt="" loading="lazy"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            )}
                            {!t.thumbnail && (
                                <div className={`absolute inset-0 bg-gradient-to-br ${getPlatformGradient(t.platform)} flex items-center justify-center`}>
                                    <Icon name="Video" className="w-10 h-10 text-white/70" />
                                </div>
                            )}

                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                <div className="w-14 h-14 rounded-full bg-white/95 shadow-2xl flex items-center justify-center transform scale-75 group-hover:scale-100 transition-all duration-300">
                                    <svg className="w-6 h-6 text-[var(--brand-sky)] dark:text-[var(--brand-teal)] ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                        <polygon points="5 3 19 12 5 21 5 3" />
                                    </svg>
                                </div>
                            </div>

                            {/* Badges */}
                            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                                {t.is_required && (
                                    <div className="px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-[var(--brand-sky)]/90 dark:bg-[var(--brand-teal)]/90 text-white shadow-md backdrop-blur-sm flex items-center gap-1">
                                        <Icon name="Shield" className="w-2.5 h-2.5" /> Requerido
                                    </div>
                                )}
                            </div>
                            {t.completed && (
                                <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-[var(--color-success)]/90 text-white shadow-md backdrop-blur-sm flex items-center gap-1">
                                    <Icon name="Check" className="w-2.5 h-2.5" /> Completado
                                </div>
                            )}

                            {/* Bottom gradient fade */}
                            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[var(--bg-card)] to-transparent" />
                        </div>

                        {/* Content */}
                        <div className="p-4 pt-2">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] font-bold uppercase border ${getPlatformBadgeStyle(t.platform)}`}>
                                    <Icon name={getPlatformIcon(t.platform)} className="w-2.5 h-2.5" />
                                    {getPlatformLabel(t.platform)}
                                </span>
                            </div>
                            <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug line-clamp-2 group-hover:text-[var(--brand-sky)] dark:group-hover:text-[var(--brand-teal)] transition-colors duration-200">{t.title}</p>
                            {t.completed && (
                                <div className="flex items-center gap-1 mt-2">
                                    <Icon name="CheckCircle2" className="w-3.5 h-3.5 text-[var(--color-success)]" />
                                    <span className="text-[10px] font-bold text-[var(--color-success)]">Completado</span>
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
