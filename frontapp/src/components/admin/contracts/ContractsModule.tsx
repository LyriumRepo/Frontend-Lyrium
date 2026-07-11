import React from 'react';
import { StatusBadge, ModalityBadge, KpiCard, ExpiryTrafficLight } from './ContractsUIComponents';
import { Contract } from '@/lib/types/admin/contracts';
import { ContractKPI } from '@/features/admin/contracts/types';
import { Search, Plus, ArrowRight, ChevronRight, FileText, Calendar, Shield, Hash, Landmark, CheckCircle, Clock, AlertOctagon } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';

const getKpiConfig = (iconKey: string, colorKey: string) => {
    const icons: Record<string, React.ReactNode> = {
        Files: <FileText className="w-5 h-5" />,
        CheckCircle: <CheckCircle className="w-5 h-5" />,
        Hourglass: <Clock className="w-5 h-5" />,
        AlertOctagon: <AlertOctagon className="w-5 h-5" />
    };

    const colors: Record<string, { iconWrapper: string; glow: string }> = {
        indigo: {
            iconWrapper: 'bg-[var(--celeste-500)]/10 text-[var(--celeste-500)]',
            glow: 'bg-[var(--celeste-500)]/5 group-hover:bg-[var(--celeste-500)]/10'
        },
        emerald: {
            iconWrapper: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
            glow: 'bg-[var(--color-success)]/5 group-hover:bg-[var(--color-success)]/10'
        },
        amber: {
            iconWrapper: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
            glow: 'bg-[var(--color-warning)]/5 group-hover:bg-[var(--color-warning)]/10'
        },
        red: {
            iconWrapper: 'bg-[var(--color-error)]/10 text-[var(--color-error)]',
            glow: 'bg-[var(--color-error)]/5 group-hover:bg-[var(--color-error)]/10'
        }
    };

    return {
        icon: icons[iconKey] || <FileText className="w-5 h-5" />,
        classes: colors[colorKey] || colors.indigo
    };
};

interface ContratosModuleProps {
    state: {
        contracts: Contract[];
        kpis: ContractKPI[];
        loading: boolean;
        error: unknown;
        filters: Record<string, any>;
    };
    actions: Record<string, any>;
}

export const ContratosModule: React.FC<ContratosModuleProps> = ({ state, actions }) => {
    const { contracts, kpis, loading, error, filters } = state;

    if (loading && contracts.length === 0) {
        return (
            <div className="space-y-8 animate-fadeIn pb-20 text-left font-industrial">
                {/* KPI SKELETONS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={`kpi-skel-${i}`} className="bg-[var(--bg-card)] p-6 rounded-[2rem] shadow-sm space-y-4 border border-[var(--border-subtle)]">
                            <Skeleton className="h-4 w-24 rounded" />
                            <Skeleton className="h-8 w-16 rounded-md" />
                        </div>
                    ))}
                </div>

                {/* FILTROS SKELETON */}
                <Skeleton className="w-full h-24 rounded-[2.5rem]" />

                {/* TABLA SKELETON */}
                <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm overflow-hidden p-8">
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={`row-skel-${i}`} className="flex gap-4 py-5 border-b border-[var(--border-subtle)] last:border-0 items-center">
                                <Skeleton className="h-8 w-20 rounded" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-1/3 rounded" />
                                    <Skeleton className="h-2 w-1/4 rounded" />
                                </div>
                                <Skeleton className="h-4 w-32 rounded" />
                                <Skeleton className="h-8 w-24 rounded-full" />
                                <Skeleton className="h-8 w-8 rounded-xl" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn pb-20 text-left font-industrial">

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {kpis.map((kpi) => {
                    const config = getKpiConfig(kpi.icon, kpi.color);
                    return (
                        <div 
                            key={kpi.label}
                            className="bg-[var(--bg-card)] p-6 rounded-[2.2rem] border border-[var(--border-subtle)] shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden group flex flex-col justify-between min-h-[140px]"
                        >
                            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8 blur-xl transition-all ${config.classes.glow}`}></div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none">
                                    {kpi.label}
                                </span>
                                <div className={`p-2.5 rounded-xl ${config.classes.iconWrapper}`}>
                                    {config.icon}
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-3xl font-black text-[var(--text-primary)] tracking-tighter leading-none">
                                    {kpi.val}
                                </p>
                                <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider mt-2">
                                    Sistema de Registro Validado
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* FILTROS - Diseño Premium */}
            <div className="bg-[var(--bg-card)] p-4 sm:p-8 rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--celeste-500)]/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-[var(--celeste-500)]/20 transition-all duration-700 hidden dark:block"></div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end relative z-10">
                    <div className="lg:col-span-6 space-y-2">
                        <label htmlFor="contract-search" className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">
                            Buscar Expediente Legal
                        </label>
                        <div className="relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5" />
                            <input
                                id="contract-search"
                                type="text"
                                placeholder="Buscar por Razón Social, RUC o Representante..."
                                value={filters.query}
                                onChange={(e) => actions.setFilters({ ...filters, query: e.target.value })}
                                className="w-full pl-14 pr-6 py-4 bg-[var(--bg-secondary)] border-none rounded-2xl text-xs font-black placeholder:text-[var(--text-muted)] text-[var(--text-primary)] focus:ring-4 focus:ring-[var(--celeste-500)]/10 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-2">
                        <label htmlFor="contract-modality" className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">
                            Aislar Modalidad
                        </label>
                        <select
                            id="contract-modality"
                            value={filters.modality}
                            onChange={(e) => actions.setFilters({ ...filters, modality: e.target.value })}
                            className="w-full p-4 bg-[var(--bg-secondary)] border-none rounded-2xl text-xs font-black text-[var(--text-primary)] uppercase cursor-pointer"
                        >
                            <option value="ALL">Todas</option>
                            <option value="VIRTUAL">Virtual (Digital)</option>
                            <option value="PHYSICAL">Presencial (Físico)</option>
                        </select>
                    </div>

                    <div className="lg:col-span-2 space-y-2">
                        <label htmlFor="contract-status" className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">
                            Estado Legal
                        </label>
                        <select
                            id="contract-status"
                            value={filters.status}
                            onChange={(e) => actions.setFilters({ ...filters, status: e.target.value })}
                            className="w-full p-4 bg-[var(--bg-secondary)] border-none rounded-2xl text-xs font-black text-[var(--text-primary)] uppercase cursor-pointer"
                        >
                            <option value="ALL">Todos los Estados</option>
                            <option value="ACTIVE">Vigentes (Activos)</option>
                            <option value="PENDING">En Revisión / Pendiente</option>
                            <option value="EXPIRED">Rechazados</option>
                        </select>
                    </div>

                    <button
                        onClick={actions.createNew}
                        className="lg:col-span-2 w-full p-4 bg-[var(--icons-green)] hover:bg-[var(--icons-green)] active:bg-[var(--icons-green)] text-white rounded-2xl transition-all shadow-xl shadow-[var(--icons-green)]/20 flex items-center justify-center gap-2 whitespace-nowrap active:scale-95 duration-300"
                    >
                        <Plus className="w-4 h-4 font-bold" /> 
                        <span className="text-xs font-black uppercase tracking-widest">Nuevo Contrato</span>
                    </button>
                </div>
            </div>

            {/* EXPEDIENTES - Mobile: cards */}
            <div className="sm:hidden bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm overflow-hidden divide-y divide-[var(--border-subtle)]">
                {contracts.map((c: Contract) => (
                    <div
                        key={c.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => actions.setSelectedContract(c)}
                        onKeyDown={(e) => { if (e.key === 'Enter') actions.setSelectedContract(c); }}
                        className="p-5 flex items-start gap-3 active:bg-[var(--celeste-500)]/5 cursor-pointer"
                    >
                        <div className="w-9 h-9 rounded-xl bg-brand-green/10 text-brand-green dark:bg-icons-green/10 dark:text-icons-green flex items-center justify-center shrink-0 font-black text-xs mt-0.5">
                            {c.company ? c.company.substring(0, 2).toUpperCase() : 'CTR'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-xs font-black text-[var(--text-primary)] uppercase truncate">
                                        {c.company || 'Sin Empresa Decl.'}
                                    </p>
                                    <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider mt-0.5 font-mono">
                                        RUC: {c.ruc || '—'} · <Hash className="w-2.5 h-2.5 inline -mt-0.5" />{c.id}
                                    </p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-[var(--text-muted)] shrink-0 mt-0.5" />
                            </div>
                            <p className="text-[11px] font-black text-[var(--text-secondary)] uppercase flex items-center gap-1.5 mt-2">
                                <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                                {c.start || '—'}
                                <ArrowRight className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                                {c.end || '—'}
                            </p>
                            <div className="mt-1.5">
                                <ExpiryTrafficLight urgency={c.expiryUrgency} />
                            </div>
                            <div className="flex items-center flex-wrap gap-2 mt-2.5">
                                <ModalityBadge modality={c.modality} />
                                <span className="flex items-center gap-1.5 text-xs font-black text-[var(--text-secondary)] uppercase">
                                    <Landmark className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                                    {c.plan || '—'}
                                </span>
                                <StatusBadge status={c.status} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* TABLA DE EXPEDIENTES - Rediseño Híbrido Premium (tablet+) */}
            <div className="hidden sm:block bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm overflow-hidden p-2">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse" aria-label="Tabla de contratos">
                        <thead>
                            <tr className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-subtle)] text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                                <th scope="col" className="px-8 py-5 whitespace-nowrap">ID Expediente</th>
                                <th scope="col" className="px-8 py-5 whitespace-nowrap">Razón Social / RUC</th>
                                <th scope="col" className="px-8 py-5 whitespace-nowrap min-w-[240px]">Vigencia Temporal</th>
                                <th scope="col" className="px-8 py-5 whitespace-nowrap">Modalidad</th>
                                <th scope="col" className="px-8 py-5 whitespace-nowrap">Plan</th>
                                <th scope="col" className="px-8 py-5 whitespace-nowrap text-center">Estado Legal</th>
                                <th scope="col" className="px-8 py-5 text-right whitespace-nowrap"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)]">
                            {contracts.map((c: Contract) => (
                                <tr
                                    key={c.id}
                                    onClick={() => actions.setSelectedContract(c)}
                                    className="hover:bg-[var(--celeste-500)]/5 dark:hover:bg-[var(--celeste-500)]/10 transition-all duration-300 group cursor-pointer"
                                >
                                    {/* ID */}
                                    <td className="px-8 py-6 font-mono font-black text-xs text-[var(--text-muted)] group-hover:text-[var(--celeste-500)] transition-colors">
                                        <div className="flex items-center gap-2">
                                            <Hash className="w-3.5 h-3.5 opacity-40 shrink-0" />
                                            {c.id}
                                        </div>
                                    </td>

                                    {/* Razón Social */}
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-brand-green/10 text-brand-green dark:bg-icons-green/10 dark:text-icons-green flex items-center justify-center shrink-0 font-black text-xs">
                                                {c.company ? c.company.substring(0, 2).toUpperCase() : 'CTR'}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-[var(--text-primary)] uppercase">
                                                    {c.company || 'Sin Empresa Decl.'}
                                                </p>
                                                <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider mt-0.5 font-mono">
                                                    RUC: {c.ruc || '—'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Vigencia */}
                                    <td className="px-8 py-6 min-w-[240px] whitespace-nowrap">
                                        <div className="flex flex-col gap-1.5">
                                            <p className="text-[11px] font-black text-[var(--text-secondary)] uppercase flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                                                {c.start || '—'} 
                                                <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" /> 
                                                {c.end || '—'}
                                            </p>
                                            <ExpiryTrafficLight urgency={c.expiryUrgency} />
                                        </div>
                                    </td>

                                    {/* Modalidad */}
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <ModalityBadge modality={c.modality} />
                                    </td>

                                    {/* Tipo */}
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <Landmark className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                                            <span className="text-xs font-black text-[var(--text-secondary)] uppercase">
                                                {c.plan || '—'}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Estado */}
                                    <td className="px-8 py-6 text-center whitespace-nowrap">
                                        <StatusBadge status={c.status} />
                                    </td>

                                    {/* Flecha */}
                                    <td className="px-8 py-6 text-right whitespace-nowrap">
                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--celeste-500)] group-hover:bg-[var(--celeste-500)]/10 transition-all shrink-0 ml-auto">
                                            <ChevronRight className="w-5 h-5 shrink-0" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};
