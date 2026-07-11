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

function getPlatformTextColor(platform: string): string {
    switch (platform) {
        case 'youtube': return 'text-red-500 dark:text-red-400';
        case 'vimeo': return 'text-[var(--brand-sky)]';
        case 'drive': return 'text-emerald-600 dark:text-emerald-400';
        default: return 'text-[var(--brand-teal)]';
    }
}

function getPlatformBgColor(platform: string): string {
    switch (platform) {
        case 'youtube': return 'bg-red-500/10';
        case 'vimeo': return 'bg-[var(--brand-sky)]/10';
        case 'drive': return 'bg-emerald-500/10';
        default: return 'bg-[var(--brand-teal)]/10';
    }
}

export default function TrainingGrid({ category, trainings, onPlay, togglingId, isFirstGroup }: Props) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2.5">
                <div className="w-1 h-5 rounded-full bg-[var(--brand-teal)]" />
                <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">{category}</h3>
                <span className="text-[10px] font-bold text-[var(--text-muted)]">({trainings.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {trainings.map((t, idx) => (
                    <button
                        key={t.id}
                        {...(isFirstGroup && idx === 0 ? { 'data-tour': 'training-card' } : {})}
                        onClick={() => onPlay(t)}
                        disabled={togglingId === t.id}
                        className="group text-left bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden hover:shadow-xl hover:shadow-[var(--brand-teal)]/10 hover:border-[var(--brand-teal)]/25 hover:-translate-y-1 transition-all duration-300 cursor-pointer disabled:opacity-50"
                    >
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
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-[var(--bg-card)] shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                                    <svg className="w-5 h-5 text-[var(--text-primary)] ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                        <polygon points="5 3 19 12 5 21 5 3" />
                                    </svg>
                                </div>
                            </div>
                            {t.is_required && (
                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-[var(--brand-teal)]/90 text-white shadow-sm backdrop-blur-sm">
                                    Requerido
                                </div>
                            )}
                            {t.completed && (
                                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-[var(--color-success)]/90 text-white shadow-sm backdrop-blur-sm flex items-center gap-1">
                                    <Icon name="Check" className="w-2.5 h-2.5" />
                                    Completado
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold text-white uppercase ${getPlatformBgColor(t.platform)} ${getPlatformTextColor(t.platform)}`}>
                                    {getPlatformLabel(t.platform)}
                                </span>
                                {t.completed && (
                                    <Icon name="CheckCircle" className="w-3.5 h-3.5 text-[var(--color-success)]" />
                                )}
                            </div>
                            <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug line-clamp-2">{t.title}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
