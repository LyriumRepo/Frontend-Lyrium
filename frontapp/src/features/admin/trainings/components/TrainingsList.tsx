'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';
import type { AdminTraining } from '../types';

interface Props {
    trainings: AdminTraining[];
    loading: boolean;
    deletingId: number | null;
    onEdit: (t: AdminTraining) => void;
    onDelete: (id: number) => void;
}

export default function TrainingsList({ trainings, loading, deletingId, onEdit, onDelete }: Props) {
    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-[var(--bg-muted)] rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (trainings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-16 h-16 rounded-full bg-[var(--bg-muted)] flex items-center justify-center">
                    <Icon name="Video" className="w-8 h-8 text-[var(--text-muted)]" />
                </div>
                <p className="text-sm font-bold text-[var(--text-secondary)]">No hay capacitaciones aún</p>
                <p className="text-xs text-[var(--text-muted)]">Crea la primera capacitación para tus vendedores</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {trainings.map(t => (
                <div key={t.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:shadow-sm transition-all">
                    <div className="w-10 h-10 rounded-lg bg-[var(--bg-muted)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {t.thumbnail && (
                            <img src={t.thumbnail} alt="" className="w-full h-full object-cover"
                                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        )}
                        <Icon name="Video" className="w-5 h-5 text-[var(--text-muted)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[var(--text-primary)] truncate">{t.title}</span>
                            {t.is_required && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[var(--brand-teal)]/10 text-[var(--brand-teal)] border border-[var(--brand-teal)]/20">
                                    Requerido
                                </span>
                            )}
                            {!t.is_published && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                                    Borrador
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            {t.category && (
                                <span className="text-[10px] text-[var(--text-secondary)]">{t.category}</span>
                            )}
                            {t.category && t.platform && <span className="text-[10px] text-[var(--text-muted)]">·</span>}
                            {t.platform && (
                                <span className="text-[10px] text-[var(--text-muted)] capitalize">{t.platform}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => onEdit(t)}
                            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition-all cursor-pointer"
                            title="Editar">
                            <Icon name="Pencil" className="w-4 h-4" />
                        </button>
                        <button onClick={() => onDelete(t.id)} disabled={deletingId === t.id}
                            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer disabled:opacity-40"
                            title="Eliminar">
                            {deletingId === t.id ? (
                                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Icon name="Trash2" className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
