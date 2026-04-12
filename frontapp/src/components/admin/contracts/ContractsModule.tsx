import React from 'react';
import { StatusBadge, ModalityBadge, KpiCard, ExpiryTrafficLight } from './ContractsUIComponents';
import { Contract } from '@/lib/types/admin/contracts';
import { ContractKPI } from '@/features/admin/contracts/types';
import { Search, Plus, ArrowRight, ChevronRight } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';

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
            <div className="space-y-6 animate-fadeIn pb-20 text-left font-industrial">
                {/* KPI SKELETONS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div key="contracts-kpi-skel-1" className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-sm space-y-4">
                        <Skeleton className="h-4 w-24 rounded" />
                        <Skeleton className="h-8 w-16 rounded-md" />
                    </div>
                    <div key="contracts-kpi-skel-2" className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-sm space-y-4">
                        <Skeleton className="h-4 w-24 rounded" />
                        <Skeleton className="h-8 w-16 rounded-md" />
                    </div>
                    <div key="contracts-kpi-skel-3" className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-sm space-y-4">
                        <Skeleton className="h-4 w-24 rounded" />
                        <Skeleton className="h-8 w-16 rounded-md" />
                    </div>
                    <div key="contracts-kpi-skel-4" className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-sm space-y-4">
                        <Skeleton className="h-4 w-24 rounded" />
                        <Skeleton className="h-8 w-16 rounded-md" />
                    </div>
                </div>

                {/* FILTROS SKELETON */}
                <Skeleton className="w-full h-24 rounded-3xl" />

                {/* TABLA SKELETON */}
                <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm overflow-hidden p-6">
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={`row-skel-${i}`} className="flex gap-4 py-4 border-b border-[var(--border-subtle)] last:border-0 items-center">
                                <Skeleton className="h-8 w-16 rounded" />
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
        <div className="space-y-6 animate-fadeIn pb-20 text-left font-industrial">

            {/* KPI Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {kpis.map((kpi) => <KpiCard key={kpi.label} kpi={kpi} />)}
            </div>

            {/* FILTROS */}
            <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-subtle)] shadow-sm mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 space-y-2">
                        <label htmlFor="contract-search" className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Búsqueda</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-4 h-4" />
                            <input
                                id="contract-search"
                                type="text"
                                placeholder="Empresa, RUC o Representante..."
                                value={filters.query}
                                onChange={(e) => actions.setFilters({ ...filters, query: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-input)] border-none rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 font-industrial text-[var(--text-primary)]"
                            />
                        </div>
                    </div>

                    <div className="w-full md:w-40 space-y-2">
                        <label htmlFor="contract-modality" className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Modalidad</label>
                        <select
                            id="contract-modality"
                            value={filters.modality}
                            onChange={(e) => actions.setFilters({ ...filters, modality: e.target.value })}
                            className="w-full p-2.5 bg-[var(--bg-input)] border-none rounded-xl text-xs font-bold text-[var(--text-primary)] font-industrial uppercase cursor-pointer"
                        >
                            <option value="ALL">Todas</option>
                            <option value="VIRTUAL">Virtual (Digital)</option>
                            <option value="PHYSICAL">Presencial (Físico)</option>
                        </select>
                    </div>

                    <div className="w-full md:w-40 space-y-2">
                        <label htmlFor="contract-status" className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Estado Legal</label>
                        <select
                            id="contract-status"
                            value={filters.status}
                            onChange={(e) => actions.setFilters({ ...filters, status: e.target.value })}
                            className="w-full p-2.5 bg-[var(--bg-input)] border-none rounded-xl text-xs font-bold text-[var(--text-primary)] font-industrial uppercase cursor-pointer"
                        >
                            <option value="ALL">Todos</option>
                            <option value="ACTIVE">Vigentes</option>
                            <option value="PENDING">Pendientes</option>
                            <option value="EXPIRED">Vencidos</option>
                        </select>
                    </div>

                    <button
                        onClick={actions.createNew}
                        className="p-2.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 whitespace-nowrap px-4 font-industrial"
                    >
                        <Plus className="w-4 h-4 font-bold" /> <span className="text-xs font-black uppercase tracking-widest">Nuevo Contrato</span>
                    </button>
                </div>
            </div>

            {/* TABLA */}
            <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left" aria-label="Tabla de contratos">
                        <thead>
                            <tr className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-subtle)] text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                                <th scope="col" className="px-6 py-5 whitespace-nowrap">ID Contrato</th>
                                <th scope="col" className="px-6 py-5 whitespace-nowrap">Empresa / Vendedor</th>
                                <th scope="col" className="px-6 py-5 whitespace-nowrap">Vigencia</th>
                                <th scope="col" className="px-6 py-5 whitespace-nowrap">Modalidad</th>
                                <th scope="col" className="px-6 py-5 whitespace-nowrap">Tipo</th>
                                <th scope="col" className="px-6 py-5 whitespace-nowrap">Estado Legal</th>
                                <th scope="col" className="px-6 py-5 text-right whitespace-nowrap">Gestión</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)]">
                            {contracts.map((c: Contract) => (
                                <tr
                                    key={c.id}
                                    onClick={() => actions.setSelectedContract(c)}
                                    className="hover:bg-[var(--bg-secondary)]/50 transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-4 font-black text-xs text-[var(--text-primary)] group-hover:text-indigo-500 transition-colors">{c.id}</td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-bold text-[var(--text-primary)] uppercase">{c.company}</p>
                                        <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">RUC: {c.ruc}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase flex items-center gap-1">
                                                {c.start} <ArrowRight className="w-3 h-3 text-[var(--text-muted)]" /> {c.end}
                                            </p>
                                            <ExpiryTrafficLight urgency={c.expiryUrgency} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <ModalityBadge modality={c.modality} />
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium text-[var(--text-secondary)] uppercase">{c.type}</td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={c.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-[var(--text-muted)] group-hover:text-indigo-500 group-hover:bg-indigo-500/10 rounded-xl transition-all">
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
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
