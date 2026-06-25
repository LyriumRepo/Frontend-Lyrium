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

type TabId = 'proveedores' | 'gastos' | 'roles' | 'auditoria';

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ kpi }: { kpi: OperationalKPI }) {
  return (
    <div className="bg-[var(--bg-muted)] rounded-[10px] p-4">
      <p className="text-[12px] text-[var(--text-muted)] mb-1">{kpi.label}</p>
      <p className="text-[22px] font-medium text-[var(--text-primary)] leading-tight">
        {kpi.val}
      </p>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-5 pb-20 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[var(--bg-muted)] rounded-[10px] h-20" />
        ))}
      </div>
      <div className="flex gap-1 border-b border-[var(--border-subtle)] pb-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[var(--bg-muted)] rounded-lg h-8 w-28" />
        ))}
      </div>
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-[var(--bg-muted)] rounded-lg h-10" />
        ))}
      </div>
    </div>
  );
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

const TABS: { id: TabId; label: string }[] = [
  { id: 'proveedores', label: 'Directorio' },
  { id: 'gastos', label: 'Gastos' },
  { id: 'roles', label: 'Roles y permisos' },
  { id: 'auditoria', label: 'Auditoría' },
];

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

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="flex flex-col gap-5 pb-20">
      {/* ── Stats ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {kpis.map((kpi) => (
          <StatCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────── */}
      <div className="flex gap-0.5 border-b border-[var(--border-subtle)] pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => actions.setActiveTab(tab.id)}
            className={`text-[13px] px-3.5 py-[5px] rounded-lg border-none transition-colors ${
              activeTab === tab.id
                ? 'bg-[var(--bg-muted)] text-[var(--text-primary)] font-medium'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] bg-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab panels ────────────────────────────────────────────── */}
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
          onNewRole={() => alert('Feature coming soon')}
          onEditRole={(role) => alert(`Editando: ${role.name}`)}
          onDeactivateRole={(role) => alert(`Desactivando: ${role.name}`)}
        />
      )}
      {activeTab === 'auditoria' && <AuditTab logs={auditLogs} />}
    </div>
  );
};
