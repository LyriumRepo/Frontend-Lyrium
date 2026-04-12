import React from 'react';
import { ProvidersTab, ExpensesTab, CredentialsTab, AuditTab } from './OperationsTabs';
import { Provider } from '@/lib/types/admin/operations';
import Skeleton from '@/components/ui/Skeleton';
import { OperationalKPI, ProviderFilters, Expense } from '@/features/admin/operations/types';

import { Users, TrendingUp, ShieldCheck, Terminal } from 'lucide-react';

type TabId = 'proveedores' | 'gastos' | 'roles' | 'auditoria';

const MapIcon = (iconName: string) => {
    switch (iconName) {
        case 'UserCheck': return <Users className="w-8 h-8" />;
        case 'UserMinus': return <Users className="w-8 h-8" />;
        default: return <Users className="w-8 h-8" />;
    }
}

interface GestionOperativaModuleProps {
    state: {
        data: any;
        loading: boolean;
        activeTab: string;
        kpis: OperationalKPI[];
        filteredProviders: Provider[];
        filteredExpenses: Expense[];
        totalInvestment: number;
        providerFilters: ProviderFilters;
    };
    actions: {
        setActiveTab: (tab: any) => void;
        setSelectedProvider: (provider: any) => void;
        setProviderFilters: (filters: any) => void;
        deleteProvider: (provider: Provider) => void;
    };
}

export const GestionOperativaModule: React.FC<GestionOperativaModuleProps> = ({ state, actions }) => {
    const { data, loading, activeTab, kpis, filteredProviders, filteredExpenses, totalInvestment, providerFilters } = state;

    if (loading || !data) {
        return (
            <div className="space-y-6 pb-20">
                {/* KPI SKELETONS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div key="gestion-op-kpi-1" className="bg-[var(--bg-card)] p-8 rounded-[2rem] shadow-sm space-y-4">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-14 w-14 rounded-2xl" />
                            <Skeleton className="h-10 w-16 rounded-md" />
                        </div>
                        <Skeleton className="h-4 w-32 rounded" />
                    </div>
                    <div key="gestion-op-kpi-2" className="bg-[var(--bg-card)] p-8 rounded-[2rem] shadow-sm space-y-4">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-14 w-14 rounded-2xl" />
                            <Skeleton className="h-10 w-16 rounded-md" />
                        </div>
                        <Skeleton className="h-4 w-32 rounded" />
                    </div>
                    <div key="gestion-op-kpi-3" className="bg-[var(--bg-card)] p-8 rounded-[2rem] shadow-sm space-y-4">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-14 w-14 rounded-2xl" />
                            <Skeleton className="h-10 w-16 rounded-md" />
                        </div>
                        <Skeleton className="h-4 w-32 rounded" />
                    </div>
                    <div key="gestion-op-kpi-4" className="bg-[var(--bg-card)] p-8 rounded-[2rem] shadow-sm space-y-4">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-14 w-14 rounded-2xl" />
                            <Skeleton className="h-10 w-16 rounded-md" />
                        </div>
                        <Skeleton className="h-4 w-32 rounded" />
                    </div>
                </div>

                {/* TABS SKELETON */}
                <div className="flex bg-[var(--bg-secondary)]/80 p-1.5 rounded-[2rem] w-fit mx-auto border border-[var(--border-subtle)]/50 backdrop-blur-sm shadow-inner mb-10">
                    <Skeleton key="gestion-op-tab-1" className="h-12 w-32 rounded-[1.7rem] mx-1" />
                    <Skeleton key="gestion-op-tab-2" className="h-12 w-32 rounded-[1.7rem] mx-1" />
                    <Skeleton key="gestion-op-tab-3" className="h-12 w-32 rounded-[1.7rem] mx-1" />
                    <Skeleton key="gestion-op-tab-4" className="h-12 w-32 rounded-[1.7rem] mx-1" />
                </div>

                {/* CONTENT SKELETON */}
                <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm space-y-6">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-12 w-1/3 rounded-xl" />
                        <Skeleton className="h-12 w-32 rounded-xl" />
                    </div>
                    <div key="gestion-op-row-1" className="flex gap-4 py-4 border-b border-[var(--border-subtle)] last:border-0">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/4 rounded" />
                            <Skeleton className="h-3 w-1/3 rounded" />
                        </div>
                        <Skeleton className="h-8 w-24 rounded-lg" />
                    </div>
                    <div key="gestion-op-row-2" className="flex gap-4 py-4 border-b border-[var(--border-subtle)] last:border-0">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/4 rounded" />
                            <Skeleton className="h-3 w-1/3 rounded" />
                        </div>
                        <Skeleton className="h-8 w-24 rounded-lg" />
                    </div>
                    <div key="gestion-op-row-3" className="flex gap-4 py-4 border-b border-[var(--border-subtle)] last:border-0">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/4 rounded" />
                            <Skeleton className="h-3 w-1/3 rounded" />
                        </div>
                        <Skeleton className="h-8 w-24 rounded-lg" />
                    </div>
                    <div key="gestion-op-row-4" className="flex gap-4 py-4 border-b border-[var(--border-subtle)] last:border-0">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/4 rounded" />
                            <Skeleton className="h-3 w-1/3 rounded" />
                        </div>
                        <Skeleton className="h-8 w-24 rounded-lg" />
                    </div>
                    <div key="gestion-op-row-5" className="flex gap-4 py-4 border-b border-[var(--border-subtle)] last:border-0">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/4 rounded" />
                            <Skeleton className="h-3 w-1/3 rounded" />
                        </div>
                        <Skeleton className="h-8 w-24 rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">

            {/* Dashboard Stats (Proveedores RF-12) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi: OperationalKPI) => (
                    <div key={kpi.label} className={`bg-[var(--bg-card)] p-8 border-l-4 border-${kpi.color}-500 transition-all hover:scale-[1.02] rounded-[2rem] shadow-sm`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className={`p-4 bg-${kpi.color}-500/10 text-${kpi.color}-500 rounded-2xl`}>
                                {MapIcon(kpi.icon)}
                            </div>
                            <span className="text-3xl font-black text-[var(--text-primary)] font-industrial">{kpi.val}</span>
                        </div>
                        <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest leading-none font-industrial">{kpi.label}</p>
                    </div>
                ))}
            </div>

            {/* Navigation Tabs (RF-12, RF-13) */}
            <div className="flex bg-[var(--bg-secondary)]/80 p-1.5 rounded-[2rem] w-fit mx-auto border border-[var(--border-subtle)]/50 backdrop-blur-sm shadow-inner mb-10">
                {[
                    { id: 'proveedores', label: 'Directorio', icon: <Users className="w-4 h-4" /> },
                    { id: 'gastos', label: 'Gestión de Gastos', icon: <TrendingUp className="w-4 h-4" /> },
                    { id: 'roles', label: 'Roles y Permisos', icon: <ShieldCheck className="w-4 h-4" /> },
                    { id: 'auditoria', label: 'Auditoría Técnica', icon: <Terminal className="w-4 h-4" /> },
                ].map(tab => (
                    <button
                        key={tab.id}
                        className={`px-8 py-3.5 rounded-[1.7rem] text-[10px] font-black transition-all flex items-center gap-2 font-industrial uppercase tracking-wider ${activeTab === tab.id ? 'bg-[var(--bg-card)] shadow-md text-sky-500' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)]/50'
                            }`}
                        onClick={() => actions.setActiveTab(tab.id)}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Panels */}
            <div className="animate-in fade-in duration-500">
                {activeTab === 'proveedores' && (
                    <ProvidersTab
                        providers={filteredProviders}
                        filters={providerFilters}
                        onFilterChange={actions.setProviderFilters}
                        onNewProvider={() => actions.setSelectedProvider({} as Provider)}
                        onEditProvider={actions.setSelectedProvider}
                        onDeleteProvider={actions.deleteProvider}
                    />
                )}
                {activeTab === 'gastos' && (
                    <ExpensesTab
                        expenses={filteredExpenses}
                        totalInvestment={totalInvestment}
                    />
                )}
                {activeTab === 'roles' && (
                    <CredentialsTab
                        credentials={data.credenciales}
                        onNewRole={() => alert('Feature coming soon: New Role Creation (RF-13)')}
                        onEditRole={(role) => alert(`Editing permissions for: ${role}`)}
                        onDeactivateRole={(role) => alert(`Revoking access for: ${role}`)}
                    />
                )}
                {activeTab === 'auditoria' && (
                    <AuditTab logs={data.auditoria || []} />
                )}
            </div>

        </div>
    );
};
