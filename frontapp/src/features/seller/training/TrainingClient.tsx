'use client';

import React, { useState, useMemo } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseLoading from '@/components/ui/BaseLoading';
import BaseStatCard from '@/components/ui/BaseStatCard';
import BaseButton from '@/components/ui/BaseButton';
import Icon from '@/components/ui/Icon';
import { usePlanCapabilities } from '@/shared/lib/hooks/usePlanCapabilities';
import { useTraining } from '@/features/seller/training/hooks/useTraining';
import { useAuth } from '@/shared/lib/context/AuthContext';
import ProgressBadge from '@/features/seller/training/components/ProgressBadge';
import TrainingGrid from '@/features/seller/training/components/TrainingGrid';
import TrainingPlayer from '@/features/seller/training/components/TrainingPlayer';
import TrainingGuide from '@/features/seller/training/TrainingGuide';
import type { SellerTraining } from '@/features/seller/training/types';

const statusOptions = [
    { key: 'todas', label: 'Todas' },
    { key: 'pendientes', label: 'Pendientes' },
    { key: 'completadas', label: 'Completadas' },
    { key: 'obligatorias', label: 'Obligatorias' },
] as const;

function SkeletonGrid() {
    return (
        <div className="space-y-4 animate-fadeIn pb-12">
            <ModuleHeader
                title="Capacitaciones"
                subtitle="Videos de formación para impulsar tu negocio"
                icon="Video"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                        <div className="h-2 w-16 rounded bg-[var(--bg-muted)] mb-2 animate-pulse" />
                        <div className="h-5 w-8 rounded bg-[var(--bg-muted)] animate-pulse" />
                    </div>
                ))}
            </div>
            <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                <div className="h-3 w-24 rounded bg-[var(--bg-muted)] mb-3 animate-pulse" />
                <div className="h-2.5 w-full rounded-full bg-[var(--bg-muted)] animate-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                {[1, 2, 3].map(i => (
                    <div key={i} className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] overflow-hidden">
                        <div className="aspect-video bg-[var(--bg-muted)] animate-pulse" />
                        <div className="p-4 space-y-2">
                            <div className="h-2 w-12 rounded bg-[var(--bg-muted)] animate-pulse" />
                            <div className="h-3 w-full rounded bg-[var(--bg-muted)] animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function TrainingClient() {
    const { user } = useAuth();
    const { can, capabilitiesLoading } = usePlanCapabilities();

    const hasAccess = can('can_training');

    const {
        trainings, loading, error, togglingId,
        toggleComplete, sortedCategories,
        completedCount, totalCount, progressPercent,
    } = useTraining();

    const [playing, setPlaying] = useState<SellerTraining | null>(null);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('todas');
    const [activeStatus, setActiveStatus] = useState<string>('todas');

    const filtered = useMemo(() => {
        return trainings.filter(t => {
            const cat = t.category ?? 'Sin categoría';
            if (activeCategory !== 'todas' && cat !== activeCategory) return false;
            if (activeStatus === 'pendientes' && t.completed) return false;
            if (activeStatus === 'completadas' && !t.completed) return false;
            if (activeStatus === 'obligatorias' && !t.is_required) return false;
            if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        });
    }, [trainings, activeCategory, activeStatus, search]);

    const filteredGrouped = useMemo(() => {
        return filtered.reduce<Record<string, SellerTraining[]>>((acc, t) => {
            const cat = t.category ?? 'Sin categoría';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(t);
            return acc;
        }, {});
    }, [filtered]);

    const filteredCategories = Object.keys(filteredGrouped).sort();
    const categories = ['todas', ...sortedCategories];

    const requiredCount = useMemo(() => trainings.filter(t => t.is_required).length, [trainings]);
    const categoryCount = sortedCategories.length;

    const firstPending = useMemo(() => {
        return trainings
            .filter(t => !t.completed)
            .sort((a, b) => a.sort_order - b.sort_order)[0] ?? null;
    }, [trainings]);

    const showContinue = firstPending && activeCategory === 'todas' && activeStatus === 'todas' && !search;

    if (capabilitiesLoading) {
        return <BaseLoading message="Verificando acceso..." />;
    }

    if (!hasAccess) {
        return (
            <div className="relative space-y-6 animate-fadeIn pb-12">
                <div className="blur-sm pointer-events-none select-none">
                    <ModuleHeader
                        title="Capacitaciones"
                        subtitle="Videos de formación para impulsar tu negocio"
                        icon="Video"
                    />
                    <ProgressBadge completed={0} total={0} percent={0} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="aspect-video rounded-2xl bg-[var(--bg-muted)] animate-pulse" />
                        ))}
                    </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center max-w-xs">
                        <div className="w-16 h-16 mx-auto mb-4">
                            <img src="/img/LyriumEspecial.png" alt="Lyrium Especial" className="w-full h-full object-contain" />
                        </div>
                        <p className="text-sm font-bold text-[var(--text-primary)] mb-1">Contenido bloqueado</p>
                        <p className="text-xs text-[var(--text-secondary)] mb-4">Las capacitaciones están disponibles desde el plan CRECE. Actualiza tu plan para acceder.</p>
                        <a href="/seller/planes"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--brand-sky)] dark:bg-[var(--brand-teal)] text-white text-xs font-black uppercase tracking-wider hover:opacity-90 transition-all">
                            Actualizar Plan
                            <Icon name="ArrowRight" className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return <SkeletonGrid />;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-5 animate-fadeIn">
                <div className="w-20 h-20 rounded-2xl bg-[var(--color-error)]/10 flex items-center justify-center">
                    <Icon name="XCircle" className="w-10 h-10 text-[var(--color-error)]" />
                </div>
                <div className="text-center">
                    <p className="text-base font-bold text-[var(--text-primary)] mb-1">Error al cargar capacitaciones</p>
                    <p className="text-sm text-[var(--text-secondary)]">{error}</p>
                </div>
                <BaseButton variant="primary" size="md" leftIcon="RefreshCw" onClick={() => window.location.reload()}>
                    Reintentar
                </BaseButton>
            </div>
        );
    }

    if (trainings.length === 0) {
        return (
            <div className="space-y-6 animate-fadeIn pb-12">
                <ModuleHeader
                    title="Capacitaciones"
                    subtitle="Videos de formación para impulsar tu negocio"
                    icon="Video"
                />
                <div className="flex flex-col items-center justify-center py-20 gap-5">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[var(--brand-sky)]/10 dark:from-[var(--brand-teal)]/10 to-[var(--brand-sky)]/5 dark:to-[var(--brand-teal)]/5 flex items-center justify-center">
                        <Icon name="MonitorPlay" className="w-12 h-12 text-[var(--brand-sky)] dark:text-[var(--brand-teal)]" />
                    </div>
                    <div className="text-center">
                        <p className="text-base font-bold text-[var(--text-secondary)] mb-1">No hay capacitaciones disponibles</p>
                        <p className="text-sm text-[var(--text-muted)] max-w-sm">Pronto tendrás contenido formativo diseñado para impulsar el crecimiento de tu negocio</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn pb-12">
            <ModuleHeader
                title="Capacitaciones"
                subtitle="Videos de formación para impulsar tu negocio"
                icon="Video"
            />

            <div data-tour="training-stats" className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 animate-card-entrance">
                <BaseStatCard label="Total" value={totalCount} icon="Video" color="sky" />
                <BaseStatCard label="Completadas" value={completedCount} icon="CheckCircle" color="emerald" />
                <BaseStatCard label="Obligatorias" value={requiredCount} icon="Shield" color="amber" />
                <BaseStatCard label="Categorías" value={categoryCount} icon="LayoutGrid" color="celeste" />
            </div>

            <div data-tour="training-progress" className="animate-fade-in-up">
                <ProgressBadge completed={completedCount} total={totalCount} percent={progressPercent} />
            </div>

            {showContinue && (
                <div data-tour="training-continue" className="group relative overflow-hidden rounded-2xl border border-[var(--brand-sky)]/20 dark:border-[var(--brand-teal)]/20 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--brand-sky)]/8 dark:from-[var(--brand-teal)]/8 via-[var(--brand-sky)]/5 dark:via-[var(--brand-teal)]/5 to-transparent" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand-sky)]/5 dark:bg-[var(--brand-teal)]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                    <div className="relative flex items-center justify-between gap-4 p-4 sm:p-5">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[var(--brand-sky)] dark:bg-[var(--brand-teal)] flex items-center justify-center shadow-lg shadow-[var(--brand-sky)]/20 dark:shadow-[var(--brand-teal)]/20">
                                <Icon name="Play" className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--brand-sky)] dark:text-[var(--brand-teal)] mb-1">Continúa aprendiendo</p>
                                <p className="text-sm sm:text-base font-bold text-[var(--text-primary)] truncate">{firstPending.title}</p>
                                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 flex items-center gap-1.5">
                                    <Icon name="FolderOpen" className="w-3 h-3" />
                                    {firstPending.category ?? 'General'}
                                    {firstPending.is_required && (
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[var(--brand-sky)]/10 dark:bg-[var(--brand-teal)]/10 text-[var(--brand-sky)] dark:text-[var(--brand-teal)] text-[9px] font-bold uppercase">
                                            <Icon name="Shield" className="w-2.5 h-2.5" /> Obligatorio
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setPlaying(firstPending)}
                            className="shrink-0 group/btn px-4 sm:px-5 py-2.5 rounded-xl bg-[var(--brand-sky)] dark:bg-[var(--brand-teal)] text-white text-xs font-bold shadow-lg shadow-[var(--brand-sky)]/20 dark:shadow-[var(--brand-teal)]/20 hover:shadow-xl hover:shadow-[var(--brand-sky)]/30 dark:hover:shadow-[var(--brand-teal)]/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                            <span className="hidden sm:inline">Ver ahora</span>
                            <Icon name="ArrowRight" className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                        </button>
                    </div>
                </div>
            )}

            <div data-tour="training-filters" className="space-y-3 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                    <div className="relative flex-1 max-w-xs group">
                        <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--brand-sky)] dark:group-focus-within:text-[var(--brand-teal)] transition-colors" />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar capacitación..."
                            className="w-full pl-9 pr-3 py-2.5 border-2 border-[var(--border-subtle)] rounded-xl text-sm bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-sky)] dark:focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--brand-sky)]/10 dark:focus:ring-[var(--brand-teal)]/10 transition-all placeholder:text-[var(--text-muted)]" />
                    </div>
                    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5 -mb-0.5">
                        {statusOptions.map(s => (
                            <button key={s.key} onClick={() => setActiveStatus(s.key)}
                                className={`shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                                    activeStatus === s.key
                                        ? 'bg-[var(--brand-sky)] dark:bg-[var(--brand-teal)] text-white shadow-md shadow-[var(--brand-sky)]/20 dark:shadow-[var(--brand-teal)]/20'
                                        : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--brand-sky)]/40 dark:hover:border-[var(--brand-teal)]/40 hover:text-[var(--brand-sky)] dark:hover:text-[var(--brand-teal)] hover:bg-[var(--brand-sky)]/5 dark:hover:bg-[var(--brand-teal)]/5'
                                }`}>
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setActiveCategory(cat)}
                            className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all duration-200 whitespace-nowrap ${
                                activeCategory === cat
                                    ? 'bg-[var(--brand-sky)] dark:bg-[var(--brand-teal)] text-white shadow-md shadow-[var(--brand-sky)]/20 dark:shadow-[var(--brand-teal)]/20'
                                    : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--brand-sky)]/40 dark:hover:border-[var(--brand-teal)]/40 hover:text-[var(--brand-sky)] dark:hover:text-[var(--brand-teal)] hover:bg-[var(--brand-sky)]/5 dark:hover:bg-[var(--brand-teal)]/5'
                            }`}>
                            {cat === 'todas' ? 'Todas' : cat}
                        </button>
                    ))}
                </div>
            </div>

            {filteredCategories.length > 0 ? (
                <div className="space-y-6">
                    {filteredCategories.map((cat, idx) => (
                        <TrainingGrid
                            key={cat}
                            category={cat}
                            trainings={filteredGrouped[cat]}
                            onPlay={setPlaying}
                            togglingId={togglingId}
                            isFirstGroup={idx === 0}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-in-up">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--brand-sky)]/10 dark:from-[var(--brand-teal)]/10 to-[var(--brand-sky)]/5 dark:to-[var(--brand-teal)]/5 flex items-center justify-center">
                        <Icon name="SearchX" className="w-9 h-9 text-[var(--brand-sky)] dark:text-[var(--brand-teal)]" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-bold text-[var(--text-secondary)] mb-1">Sin resultados</p>
                        <p className="text-xs text-[var(--text-muted)] max-w-xs">No hay capacitaciones que coincidan con los filtros seleccionados</p>
                    </div>
                    <BaseButton variant="ghost" size="sm" leftIcon="X"
                        onClick={() => { setSearch(''); setActiveCategory('todas'); setActiveStatus('todas'); }}>
                        Limpiar filtros
                    </BaseButton>
                </div>
            )}

            <TrainingPlayer
                training={playing}
                onClose={() => setPlaying(null)}
                onToggleComplete={toggleComplete}
                toggling={togglingId === playing?.id}
            />
            {user && <TrainingGuide userId={user.id} />}
        </div>
    );
}
