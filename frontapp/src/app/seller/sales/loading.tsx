/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LOADING STATE - Sales
 * 
 * Skeleton para streaming del centro de control de ventas
 * ═══════════════════════════════════════════════════════════════════════════
 */

import ModuleHeader from '@/components/layout/shared/ModuleHeader';

function KPISkeleton() {
  return (
    <div className="glass-card p-5 rounded-3xl bg-white border border-gray-100 shadow-lg animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
        <div className="w-16 h-4 bg-gray-100 rounded"></div>
      </div>
      <div className="h-8 w-24 bg-gray-200 rounded"></div>
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <div className="glass-card p-4 rounded-3xl bg-white border border-gray-100 shadow-lg animate-pulse">
      <div className="flex flex-wrap gap-3">
        <div className="h-10 w-40 bg-gray-200 rounded-xl"></div>
        <div className="h-10 w-40 bg-gray-200 rounded-xl"></div>
        <div className="h-10 w-32 bg-gray-200 rounded-xl ml-auto"></div>
      </div>
    </div>
  );
}

function OrderCardSkeleton() {
  return (
    <div className="glass-card p-4 rounded-2xl bg-white border border-gray-100 shadow-md animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
        <div className="h-6 w-20 bg-gray-100 rounded-full"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-3/4 bg-gray-100 rounded"></div>
        <div className="h-3 w-1/2 bg-gray-100 rounded"></div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
        <div className="h-3 w-16 bg-gray-100 rounded"></div>
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

export default function SalesLoading() {
  return (
    <div className="space-y-8 animate-fadeIn pb-20 max-w-7xl mx-auto">
      <ModuleHeader
        title="Centro de Control de Ventas"
        subtitle="Toda la información y trazabilidad sobre tus ventas generadas."
        icon="Sales"
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KPISkeleton key={i} />
        ))}
      </div>

      <FiltersSkeleton />

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <OrderCardSkeleton key={i} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center">
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-10 h-10 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
