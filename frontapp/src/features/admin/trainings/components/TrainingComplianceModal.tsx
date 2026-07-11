'use client';

import React, { useState } from 'react';
import { useTrainingCompliance } from '@/features/admin/trainings/hooks/useTrainingCompliance';
import BaseLoading from '@/components/ui/BaseLoading';

interface Props {
    open: boolean;
    onClose: () => void;
}

const FILTER_OPTIONS = [
    { key: 'all', label: 'Todos' },
    { key: 'at_risk', label: 'Con deuda' },
    { key: 'ok', label: 'Al día' },
] as const;

export default function TrainingComplianceModal({ open, onClose }: Props) {
    const { data, meta, loading, error, reload } = useTrainingCompliance();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'at_risk' | 'ok'>('all');

    if (!open) return null;

    const filtered = data.filter(s => {
        if (search && !s.trade_name.toLowerCase().includes(search.toLowerCase()) && !s.seller_name.toLowerCase().includes(search.toLowerCase())) return false;
        if (filter === 'at_risk' && s.required_pending.length === 0) return false;
        if (filter === 'ok' && s.required_pending.length > 0) return false;
        return true;
    });

    return (
        <div
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] grid place-items-center px-4 pb-8 pt-[8vh] md:pt-[12vh]"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl w-full max-w-5xl max-h-[75vh] overflow-y-auto scrollbar-hide relative animate-[slideUp_0.3s_ease] flex flex-col border border-[var(--border-subtle)]">
                <button className="absolute top-3 right-3 w-8 h-8 bg-gray-100 dark:bg-[var(--bg-muted)] border-none rounded-lg text-gray-500 dark:text-[var(--text-muted)] text-lg cursor-pointer flex items-center justify-center transition-colors hover:bg-red-500 hover:text-white z-10"
                    onClick={onClose}>×</button>

                <div className="p-5 border-b border-[var(--border-subtle)]">
                    <h2 className="text-lg font-extrabold text-[var(--text-primary)]">Progreso de capacitaciones</h2>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">Vendedores con acceso a capacitaciones según su plan</p>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center p-12"><BaseLoading message="Cargando progreso..." /></div>
                ) : error ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 p-12">
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                        </div>
                        <p className="text-sm font-bold text-[var(--text-primary)]">{error}</p>
                        <button onClick={reload} className="px-4 py-2 rounded-xl bg-[var(--brand-sky)] dark:bg-[var(--brand-teal)] text-white text-xs font-bold hover:opacity-90 transition-all cursor-pointer">Reintentar</button>
                    </div>
                ) : (
                    <>
                        {meta && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-4 bg-[var(--bg-muted)] border-b border-[var(--border-subtle)]">
                                <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center">
                                    <p className="text-lg font-black text-[var(--text-primary)]">{meta.total_sellers}</p>
                                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">Vendedores</p>
                                </div>
                                <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center">
                                    <p className="text-lg font-black text-[var(--text-primary)]">{meta.total_trainings}</p>
                                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">Capacitaciones</p>
                                </div>
                                <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center">
                                    <p className="text-lg font-black text-[var(--brand-sky)] dark:text-[var(--brand-teal)]">{meta.overall_completion}%</p>
                                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">Progreso global</p>
                                </div>
                                <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center">
                                    <p className="text-lg font-black text-[var(--brand-sky)] dark:text-[var(--brand-teal)]">{meta.required_completion}%</p>
                                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">Obligatorias cumplidas</p>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-2 p-4 border-b border-[var(--border-subtle)]">
                            <div className="relative flex-1">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar vendedor o tienda..." className="w-full pl-9 pr-3 py-2 border-2 border-[var(--border-subtle)] rounded-xl text-sm bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-sky)] dark:focus:border-[var(--brand-teal)] transition-all placeholder:text-[var(--text-muted)]" />
                            </div>
                            <div className="flex gap-1.5">
                                {FILTER_OPTIONS.map(f => (
                                    <button key={f.key} onClick={() => setFilter(f.key)} className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${filter === f.key ? 'bg-[var(--brand-sky)] dark:bg-[var(--brand-teal)] text-white shadow-sm' : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--brand-sky)] dark:hover:border-[var(--brand-teal)] hover:text-[var(--brand-sky)] dark:hover:text-[var(--brand-teal)]'}`}>
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                                <svg className="w-10 h-10 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                <p className="text-sm font-bold text-[var(--text-secondary)]">Sin resultados</p>
                                <p className="text-xs text-[var(--text-muted)]">No hay vendedores que coincidan con los filtros</p>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-[var(--bg-card)] border-b border-[var(--border-subtle)] z-[1]">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Vendedor / Tienda</th>
                                        <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Progreso</th>
                                        <th className="hidden sm:table-cell text-center px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Obligatorias</th>
                                        <th className="hidden sm:table-cell text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Pendientes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(s => {
                                        const hasPending = s.required_pending.length > 0;
                                        return (
                                            <tr key={s.store_id} className={`border-b border-[var(--border-subtle)] hover:bg-[var(--bg-muted)] transition-colors ${hasPending ? 'bg-[var(--brand-sky)]/5 dark:bg-[var(--brand-teal)]/5' : ''}`}>
                                                <td className="px-4 py-3">
                                                    <p className="font-bold text-[var(--text-primary)] text-sm">{s.seller_name}</p>
                                                    <p className="text-[11px] text-[var(--text-secondary)]">{s.trade_name}</p>
                                                    <p className="text-[10px] text-[var(--text-muted)]">{s.seller_email}</p>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className={`text-sm font-black ${s.progress_percent === 100 ? 'text-[var(--color-success)]' : 'text-[var(--text-primary)]'}`}>{s.progress_percent}%</span>
                                                        <span className="text-[10px] text-[var(--text-muted)]">{s.completed_trainings}/{s.total_trainings}</span>
                                                    </div>
                                                </td>
                                                <td className="hidden sm:table-cell px-4 py-3 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className={`text-sm font-black ${s.required_completed === s.required_trainings ? 'text-[var(--color-success)]' : 'text-[var(--brand-sky)] dark:text-[var(--brand-teal)]'}`}>{s.required_completed}/{s.required_trainings}</span>
                                                        {hasPending && <span className="text-[9px] font-bold text-[var(--brand-sky)] dark:text-[var(--brand-teal)] uppercase tracking-wider">Pendiente</span>}
                                                    </div>
                                                </td>
                                                <td className="hidden sm:table-cell px-4 py-3">
                                                    {hasPending ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {s.required_pending.map(t => (
                                                                <span key={t.id} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[var(--brand-sky)]/10 dark:bg-[var(--brand-teal)]/10 text-[var(--brand-sky)] dark:text-[var(--brand-teal)] border border-[var(--brand-sky)]/20 dark:border-[var(--brand-teal)]/20 whitespace-nowrap">{t.title}</span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] text-[var(--color-success)] font-bold">Completo</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
