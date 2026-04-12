import React from 'react';
import { TreasuryKPI } from '@/features/admin/treasury/types';
import { BalanceTab, CashInTab, CashOutTab } from './TreasuryTabs';
import { TrendingUp, Clock, ArrowLeftRight, AlertCircle, Search } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';

const MapIcon = (iconName: string) => {
    switch (iconName) {
        case 'ChartLineUp': return <TrendingUp className="w-8 h-8" />;
        case 'Clock': return <Clock className="w-8 h-8" />;
        case 'ArrowsLeftRight': return <ArrowLeftRight className="w-8 h-8" />;
        case 'WarningCircle': return <AlertCircle className="w-8 h-8" />;
        default: return <TrendingUp className="w-8 h-8" />;
    }
}

interface TreasuryModuleProps {
    state: {
        data: any;
        loading: boolean;
        activeTab: string;
        kpis: TreasuryKPI[];
        filteredCashIn: any[];
        filteredCashOut: any[];
        filters: Record<string, any>;
    };
    actions: Record<string, any>;
}

export const TreasuryModule: React.FC<TreasuryModuleProps> = ({ state, actions }) => {
    const { data, loading, activeTab, kpis, filteredCashIn, filteredCashOut, filters } = state;

    if (loading && !data) {
        return (
            <div className="space-y-6 pb-20 font-industrial">
                {/* KPI SKELETONS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((idx) => (
                        <div key={`treasury-skel-kpi-${idx}`} className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-sm space-y-4">
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-12 w-12 rounded-xl" />
                                <Skeleton className="h-8 w-20 rounded-md" />
                            </div>
                            <Skeleton className="h-4 w-32 rounded" />
                        </div>
                    ))}
                </div>

                {/* TABS SKELETON */}
                <div className="flex flex-wrap gap-2 pt-6 border-t border-[var(--border-subtle)]">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={`treasury-tab-${i}`} className="h-10 w-48 rounded-[1.2rem]" />
                    ))}
                </div>

                {/* CONTENT SKELETON */}
                <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm space-y-6">
                    <div className="flex gap-4 mb-4">
                        <Skeleton className="h-48 w-1/3 rounded-[2rem]" />
                        <Skeleton className="h-48 w-2/3 rounded-[2rem]" />
                    </div>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={`treasury-row-${i}`} className="flex gap-4 py-4 border-b border-[var(--border-subtle)] last:border-0 px-2">
                            <Skeleton className="h-12 w-32 rounded-lg" />
                            <Skeleton className="flex-1 h-12 rounded-lg" />
                            <Skeleton className="h-12 w-24 rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 font-industrial">

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi: TreasuryKPI) => (
                    <div key={kpi.label} className={`bg-[var(--bg-card)] p-6 border-l-4 border-${kpi.color}-500 transition-all hover:scale-[1.02] rounded-2xl shadow-sm`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className={`p-3 bg-${kpi.color}-500/10 text-${kpi.color}-500 rounded-2xl`}>
                                {MapIcon(kpi.icon)}
                            </div>
                            <span className="text-2xl font-black text-[var(--text-primary)] tracking-tighter">{kpi.val}</span>
                        </div>
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mt-2">{kpi.label}</p>
                    </div>
                ))}
            </div>

            {/* Navigation Tabs (Finanzas + Pagos Combined) */}
            <div className="flex flex-wrap gap-2 pt-6 border-t border-[var(--border-subtle)] overflow-x-auto custom-scrollbar">
                {[
                    { id: 'balance', label: 'Dashboard General (Finanzas)', icon: TrendingUp },
                    { id: 'cashin', label: 'Aprobaciones de Pago (Cash-In)', icon: Clock },
                    { id: 'cashout', label: 'Liquidaciones a Vendedores (Cash-Out)', icon: ArrowLeftRight }
                ].map(tab => {
                    const IconComp = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => actions.setActiveTab(tab.id)}
                            className={`px-6 py-3 rounded-[1.2rem] font-black text-[11px] uppercase transition-all flex items-center gap-2 font-industrial ${activeTab === tab.id ? 'bg-sky-500 text-white shadow-xl' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)]'
                                }`}
                        >
                            <IconComp className="w-4 h-4" /> {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Smart Filters (only when in cashin/cashout) */}
            {activeTab !== 'balance' && (
                <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-subtle)] shadow-sm flex flex-col md:flex-row gap-4 items-end animate-fadeIn">
                    <div className="flex-1 space-y-2">
                        <label htmlFor="treasury-search" className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Buscador de UUID / Ref</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-4 h-4" />
                            <input
                                id="treasury-search"
                                type="text"
                                placeholder="Buscar por ID, Cliente o Empresa..."
                                value={filters.search}
                                onChange={(e) => actions.setFilters({ ...filters, search: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-input)] border-none rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 font-industrial font-bold text-[var(--text-primary)]"
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-60 space-y-2">
                        <label htmlFor="treasury-status" className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Estado Lógico</label>
                        <select
                            id="treasury-status"
                            value={filters.status}
                            onChange={(e) => actions.setFilters({ ...filters, status: e.target.value })}
                            className="w-full p-2.5 bg-[var(--bg-input)] border-none rounded-xl text-xs font-black text-[var(--text-primary)] uppercase cursor-pointer tracking-widest"
                        >
                            <option value="ALL">Todos los Estados</option>
                            {activeTab === 'cashin' ? (
                                <>
                                    <option value="PENDING_VALIDATION">En Revisión (Bank)</option>
                                    <option value="VALIDATED">Validados (Ok)</option>
                                    <option value="REJECTED">Rechazados</option>
                                    <option value="EXPIRED">Expirados (Timeout)</option>
                                </>
                            ) : (
                                <>
                                    <option value="SCHEDULED">Programado a Batch</option>
                                    <option value="PROCESSING">Procesando</option>
                                    <option value="PAID">Dinero Acreditado</option>
                                    <option value="DISPUTED">Disputa (Retenido)</option>
                                    <option value="FAILED">Error Bancario</option>
                                </>
                            )}
                        </select>
                    </div>
                </div>
            )}


            {/* Tab Views */}
            <div className="animate-fadeIn">
                {activeTab === 'balance' && <BalanceTab resume={data.resumen} monthly={data.liquidacionesMensuales} />}
                {activeTab === 'cashin' && <CashInTab payments={filteredCashIn} onSelect={actions.setSelectedPayment} />}
                {activeTab === 'cashout' && <CashOutTab payments={filteredCashOut} onSelect={actions.setSelectedPayment} windowOpen={data.windowOpen} />}
            </div>

        </div>
    );
};
