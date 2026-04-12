/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LOADING STATE - Finance
 * 
 * Skeleton para streaming del panel financiero
 * ═══════════════════════════════════════════════════════════════════════════
 */

import ModuleHeader from '@/components/layout/shared/ModuleHeader';

function FinanceKPISkeleton() {
  return (
    <div className="glass-card p-6 rounded-3xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-lg animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
        <div className="w-16 h-6 bg-gray-100 rounded-full"></div>
      </div>
      <div className="h-3 w-20 bg-gray-100 rounded mb-2"></div>
      <div className="h-8 w-32 bg-gray-200 rounded"></div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="glass-card p-6 rounded-3xl bg-white border border-gray-100 shadow-lg h-80 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-5 w-40 bg-gray-200 rounded"></div>
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-gray-100 rounded"></div>
          <div className="h-6 w-16 bg-gray-100 rounded"></div>
        </div>
      </div>
      <div className="h-48 bg-gray-100 rounded"></div>
    </div>
  );
}

function ProxPagoSkeleton() {
  return (
    <div className="glass-card p-6 rounded-3xl bg-white border border-gray-100 shadow-lg animate-pulse">
      <div className="h-5 w-32 bg-gray-200 rounded mb-4"></div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="space-y-1">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-3 w-16 bg-gray-100 rounded"></div>
            </div>
            <div className="h-5 w-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FinanceLoading() {
  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <ModuleHeader
        title="Centro Financiero"
        subtitle="Gestiona tus ingresos, payouts y reportes financieros"
        icon="Wallet"
      />

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <FinanceKPISkeleton key={i} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ProxPagoSkeleton />
      </div>

      {/* More Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}
