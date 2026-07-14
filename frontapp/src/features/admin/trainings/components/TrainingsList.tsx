'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';
import BaseButton from '@/components/ui/BaseButton';
import type { AdminTraining } from '../types';

interface Props {
    trainings: AdminTraining[];
    loading: boolean;
    deletingId: number | null;
    onEdit: (t: AdminTraining) => void;
    onDelete: (id: number) => void;
}

function getPlatformBadgeStyle(platform: string): string {
    switch (platform) {
        case 'youtube': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
        case 'vimeo': return 'bg-[var(--brand-sky)]/10 text-[var(--brand-sky)] border-[var(--brand-sky)]/20';
        case 'drive': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
        default: return 'bg-[var(--bg-muted)] text-[var(--text-secondary)] border-[var(--border-subtle)]';
    }
}

export default function TrainingsList({ trainings, loading, deletingId, onEdit, onDelete }: Props) {
    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 sm:h-16 bg-[var(--bg-muted)] rounded-2xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (trainings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--brand-sky)]/10 dark:from-[var(--brand-teal)]/10 to-[var(--brand-sky)]/5 dark:to-[var(--brand-teal)]/5 flex items-center justify-center">
                    <Icon name="Video" className="w-10 h-10 text-[var(--brand-sky)] dark:text-[var(--brand-teal)]" />
                </div>
                <div className="text-center">
                    <p className="text-base font-bold text-[var(--text-secondary)] mb-1">No hay capacitaciones aún</p>
                    <p className="text-sm text-[var(--text-muted)]">Crea la primera capacitación para tus vendedores</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2 stagger-grid">
            {trainings.map(t => (
                <div key={t.id}
                    className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:shadow-lg hover:shadow-[var(--brand-sky)]/5 dark:hover:shadow-[var(--brand-teal)]/5 hover:border-[var(--brand-sky)]/20 dark:hover:border-[var(--brand-teal)]/20 transition-all duration-200 animate-card-entrance">
                    {/* Thumbnail */}
                    <div className="w-full sm:w-10 h-32 sm:h-10 rounded-xl bg-[var(--bg-muted)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {t.thumbnail && (
                            <img src={t.thumbnail} alt="" className="w-full h-full object-cover"
                                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        )}
                        <Icon name="Video" className="w-5 h-5 text-[var(--text-muted)]" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-[var(--text-primary)] truncate">{t.title}</span>
                            {t.is_required && (
                                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-[var(--brand-sky)]/10 dark:bg-[var(--brand-teal)]/10 text-[var(--brand-sky)] dark:text-[var(--brand-teal)] border border-[var(--brand-sky)]/20 dark:border-[var(--brand-teal)]/20">
                                    Requerido
                                </span>
                            )}
                            {!t.is_published && (
                                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                                    Borrador
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            {t.category && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-[var(--text-secondary)]">
                                    <Icon name="FolderOpen" className="w-2.5 h-2.5" /> {t.category}
                                </span>
                            )}
                            {t.category && t.platform && <span className="text-[10px] text-[var(--text-muted)]">·</span>}
                            {t.platform && (
                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border ${getPlatformBadgeStyle(t.platform)}`}>
                                    {t.platform}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                        <BaseButton variant="ghost" size="sm" leftIcon="Pencil" onClick={() => onEdit(t)}>
                            <span className="hidden sm:inline">Editar</span>
                        </BaseButton>
                        <BaseButton variant="ghost" size="sm" leftIcon="Trash2" onClick={() => onDelete(t.id)} isLoading={deletingId === t.id} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                            <span className="hidden sm:inline">Eliminar</span>
                        </BaseButton>
                    </div>
                </div>
            ))}
        </div>
    );
}
