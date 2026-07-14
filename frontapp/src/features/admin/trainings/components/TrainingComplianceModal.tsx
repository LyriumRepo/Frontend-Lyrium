'use client';

import React, { useState } from 'react';
import { useTrainingCompliance } from '@/features/admin/trainings/hooks/useTrainingCompliance';
import BaseLoading from '@/components/ui/BaseLoading';
import BaseModal from '@/components/ui/BaseModal';
import BaseButton from '@/components/ui/BaseButton';
import BaseStatCard from '@/components/ui/BaseStatCard';
import Icon from '@/components/ui/Icon';

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
        <BaseModal
            isOpen={open}
            onClose={onClose}
            title="Progreso de capacitaciones"
            subtitle="Vendedores con acceso a capacitaciones según su plan"
            size="5xl"
        >
            {loading ? (
                <div className="flex items-center justify-center py-16"><BaseLoading message="Cargando progreso..." /></div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center gap-4 py-16">
                    <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                        <Icon name="XCircle" className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-sm font-bold text-[var(--text-primary)]">{error}</p>
                    <BaseButton variant="primary" size="sm" leftIcon="RefreshCw" onClick={reload}>
                        Reintentar
                    </BaseButton>
                </div>
            ) : (
                <>
                    {/* Stats */}
                    {meta && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 animate-card-entrance">
                            <BaseStatCard label="Vendedores" value={meta.total_sellers} icon="Users" color="sky" />
                            <BaseStatCard label="Capacitaciones" value={meta.total_trainings} icon="Video" color="celeste" />
                            <BaseStatCard label="Progreso global" value={`${meta.overall_completion}%`} icon="TrendingUp" color="emerald" />
                            <BaseStatCard label="Obligatorias" value={`${meta.required_completion}%`} icon="Shield" color="amber" />
                        </div>
                    )}

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-2 mb-5">
                        <div className="relative flex-1 group">
                            <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--brand-sky)] dark:group-focus-within:text-[var(--brand-teal)] transition-colors" />
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar vendedor o tienda..."
                                className="w-full pl-9 pr-3 py-2.5 border-2 border-[var(--border-subtle)] rounded-xl text-sm bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-sky)] dark:focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--brand-sky)]/10 dark:focus:ring-[var(--brand-teal)]/10 transition-all placeholder:text-[var(--text-muted)]" />
                        </div>
                        <div className="flex gap-1.5">
                            {FILTER_OPTIONS.map(f => (
                                <button key={f.key} onClick={() => setFilter(f.key)}
                                    className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                                        filter === f.key
                                            ? 'bg-[var(--brand-sky)] dark:bg-[var(--brand-teal)] text-white shadow-md shadow-[var(--brand-sky)]/20 dark:shadow-[var(--brand-teal)]/20'
                                            : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--brand-sky)]/40 dark:hover:border-[var(--brand-teal)]/40 hover:text-[var(--brand-sky)] dark:hover:text-[var(--brand-teal)]'
                                    }`}>
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-muted)] flex items-center justify-center">
                                <Icon name="SearchX" className="w-8 h-8 text-[var(--text-muted)]" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-[var(--text-secondary)]">Sin resultados</p>
                                <p className="text-xs text-[var(--text-muted)]">No hay vendedores que coincidan con los filtros</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Desktop: Table */}
                            <div className="hidden sm:block overflow-hidden rounded-xl border border-[var(--border-subtle)]">
                                <table className="w-full text-sm">
                                    <thead className="bg-[var(--bg-muted)]">
                                        <tr>
                                            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Vendedor / Tienda</th>
                                            <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Progreso</th>
                                            <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Obligatorias</th>
                                            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Pendientes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map(s => {
                                            const hasPending = s.required_pending.length > 0;
                                            return (
                                                <tr key={s.store_id} className={`border-t border-[var(--border-subtle)] hover:bg-[var(--bg-muted)] transition-colors ${hasPending ? 'bg-[var(--brand-sky)]/5 dark:bg-[var(--brand-teal)]/5' : ''}`}>
                                                    <td className="px-4 py-3">
                                                        <p className="font-bold text-[var(--text-primary)] text-sm">{s.seller_name}</p>
                                                        <p className="text-[11px] text-[var(--text-secondary)]">{s.trade_name}</p>
                                                        <p className="text-[10px] text-[var(--text-muted)]">{s.seller_email}</p>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`text-sm font-black ${s.progress_percent === 100 ? 'text-[var(--color-success)]' : 'text-[var(--text-primary)]'}`}>{s.progress_percent}%</span>
                                                        <p className="text-[10px] text-[var(--text-muted)]">{s.completed_trainings}/{s.total_trainings}</p>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`text-sm font-black ${s.required_completed === s.required_trainings ? 'text-[var(--color-success)]' : 'text-[var(--brand-sky)] dark:text-[var(--brand-teal)]'}`}>{s.required_completed}/{s.required_trainings}</span>
                                                        {hasPending && <p className="text-[9px] font-bold text-[var(--brand-sky)] dark:text-[var(--brand-teal)] uppercase tracking-wider">Pendiente</p>}
                                                    </td>
                                                    <td className="px-4 py-3">
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
                            </div>

                            {/* Mobile: Cards */}
                            <div className="sm:hidden space-y-3 stagger-grid">
                                {filtered.map(s => {
                                    const hasPending = s.required_pending.length > 0;
                                    return (
                                        <div key={s.store_id} className={`p-4 rounded-2xl border animate-card-entrance ${
                                            hasPending
                                                ? 'bg-[var(--brand-sky)]/5 dark:bg-[var(--brand-teal)]/5 border-[var(--brand-sky)]/20 dark:border-[var(--brand-teal)]/20'
                                                : 'bg-[var(--bg-card)] border-[var(--border-subtle)]'
                                        }`}>
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="min-w-0">
                                                    <p className="font-bold text-[var(--text-primary)] text-sm">{s.seller_name}</p>
                                                    <p className="text-[11px] text-[var(--text-secondary)]">{s.trade_name}</p>
                                                    <p className="text-[10px] text-[var(--text-muted)]">{s.seller_email}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className={`text-lg font-black ${s.progress_percent === 100 ? 'text-[var(--color-success)]' : 'text-[var(--text-primary)]'}`}>{s.progress_percent}%</span>
                                                    <p className="text-[10px] text-[var(--text-muted)]">{s.completed_trainings}/{s.total_trainings}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Obligatorias</span>
                                                        <span className={`text-xs font-black ${s.required_completed === s.required_trainings ? 'text-[var(--color-success)]' : 'text-[var(--brand-sky)] dark:text-[var(--brand-teal)]'}`}>{s.required_completed}/{s.required_trainings}</span>
                                                    </div>
                                                    <div className="w-full h-1.5 rounded-full bg-[var(--bg-muted)] overflow-hidden">
                                                        <div className={`h-full rounded-full transition-all duration-500 ${s.required_completed === s.required_trainings ? 'bg-[var(--color-success)]' : 'bg-[var(--brand-sky)] dark:bg-[var(--brand-teal)]'}`}
                                                            style={{ width: `${s.required_trainings > 0 ? (s.required_completed / s.required_trainings) * 100 : 100}%` }} />
                                                    </div>
                                                </div>
                                            </div>

                                            {hasPending && (
                                                <div>
                                                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1.5">Pendientes</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {s.required_pending.map(t => (
                                                            <span key={t.id} className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-[var(--brand-sky)]/10 dark:bg-[var(--brand-teal)]/10 text-[var(--brand-sky)] dark:text-[var(--brand-teal)] border border-[var(--brand-sky)]/20 dark:border-[var(--brand-teal)]/20">{t.title}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </>
            )}
        </BaseModal>
    );
}
