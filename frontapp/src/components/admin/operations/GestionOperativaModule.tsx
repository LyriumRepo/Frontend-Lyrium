import React from 'react';
import {
  ProvidersTab,
  ExpensesTab,
  CredentialsTab,
  AuditTab,
} from './OperationsTabs';
import {
  Supplier,
  SupplierFilters,
  Expense,
  OperationalRole,
  AuditLog,
  OperationalKPI,
} from '@/features/admin/operations/types/operations';
import Skeleton from '@/components/ui/Skeleton';
import {
  Users,
  TrendingUp,
  ShieldCheck,
  Terminal,
  Coins,
  Receipt,
  UserCheck,
  UserMinus,
} from 'lucide-react';

type TabId = 'proveedores' | 'gastos' | 'roles' | 'auditoria';

function MapIcon(iconName: string) {
  const icons: Record<string, React.ReactNode> = {
    Coins: <Coins className="w-8 h-8" />,
    UserCheck: <UserCheck className="w-8 h-8" />,
    UserMinus: <UserMinus className="w-8 h-8" />,
    Receipt: <Receipt className="w-8 h-8" />,
  };
  return icons[iconName] ?? <Users className="w-8 h-8" />;
}

interface GestionOperativaModuleProps {
  state: {
    loading: boolean;
    activeTab: string;
    kpis: OperationalKPI[];
    filteredProviders: Supplier[];
    filteredExpenses: Expense[];
    totalInvestment: number;
    providerFilters: SupplierFilters;
    roles: OperationalRole[];
    auditLogs: AuditLog[];
  };
  actions: {
    setActiveTab: (tab: TabId) => void;
    setSelectedProvider: (provider: Supplier | null) => void;
    setProviderFilters: (filters: Partial<SupplierFilters>) => void;
    deleteProvider: (provider: Supplier) => void;
  };
}

export const GestionOperativaModule: React.FC<GestionOperativaModuleProps> = ({
  state,
  actions,
}) => {
  const {
    loading,
    activeTab,
    kpis,
    filteredProviders,
    filteredExpenses,
    totalInvestment,
    providerFilters,
    roles,
    auditLogs,
  } = state;

  // ── Skeleton: sólo cuando loading=true (ya no depende de `data`) ──────
  if (loading) {
    return (
      <div className="space-y-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-[var(--bg-card)] p-8 rounded-[2rem] shadow-sm space-y-4"
            >
              <div className="flex justify-between items-center">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <Skeleton className="h-10 w-16 rounded-md" />
              </div>
              <Skeleton className="h-4 w-32 rounded" />
            </div>
          ))}
        </div>
        <div className="flex bg-[var(--bg-secondary)]/80 p-1.5 rounded-[2rem] w-fit mx-auto border border-[var(--border-subtle)]/50 backdrop-blur-sm shadow-inner mb-10">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-32 rounded-[1.7rem] mx-1" />
          ))}
        </div>
        <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-12 w-1/3 rounded-xl" />
            <Skeleton className="h-12 w-32 rounded-xl" />
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex gap-4 py-4 border-b border-[var(--border-subtle)]"
            >
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4 rounded" />
                <Skeleton className="h-3 w-1/3 rounded" />
              </div>
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={`bg-[var(--bg-card)] p-8 border-l-4 border-${kpi.color}-500 transition-all hover:scale-[1.02] rounded-[2rem] shadow-sm`}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`p-4 bg-${kpi.color}-500/10 text-${kpi.color}-500 rounded-2xl`}
              >
                {MapIcon(kpi.icon)}
              </div>
              <span className="text-3xl font-black text-[var(--text-primary)] font-industrial">
                {kpi.val}
              </span>
            </div>
            <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest leading-none font-industrial">
              {kpi.label}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex bg-[var(--bg-secondary)]/80 p-1.5 rounded-[2rem] w-fit mx-auto border border-[var(--border-subtle)]/50 backdrop-blur-sm shadow-inner mb-10">
        {(
          [
            {
              id: 'proveedores',
              label: 'Directorio',
              icon: <Users className="w-4 h-4" />,
            },
            {
              id: 'gastos',
              label: 'Gestión de Gastos',
              icon: <TrendingUp className="w-4 h-4" />,
            },
            {
              id: 'roles',
              label: 'Roles y Permisos',
              icon: <ShieldCheck className="w-4 h-4" />,
            },
            {
              id: 'auditoria',
              label: 'Auditoría Técnica',
              icon: <Terminal className="w-4 h-4" />,
            },
          ] as { id: TabId; label: string; icon: React.ReactNode }[]
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => actions.setActiveTab(tab.id)}
            className={`px-8 py-3.5 rounded-[1.7rem] text-[10px] font-black transition-all flex items-center gap-2 font-industrial uppercase tracking-wider ${
              activeTab === tab.id
                ? 'bg-[var(--bg-card)] shadow-md text-sky-500'
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)]/50'
            }`}
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
            onNewProvider={() => actions.setSelectedProvider({} as Supplier)}
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
            roles={roles}
            onNewRole={() => alert('Feature coming soon: New Role Creation')}
            onEditRole={(role) => alert(`Editing: ${role.name}`)}
            onDeactivateRole={(role) => alert(`Deactivating: ${role.name}`)}
          />
        )}
        {activeTab === 'auditoria' && <AuditTab logs={auditLogs} />}
      </div>
    </div>
  );
};
