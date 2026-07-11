/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LOADING STATE - Logistics
 * 
 * Skeleton para streaming del panel de logística
 * ═══════════════════════════════════════════════════════════════════════════
 */

import ModuleHeader from '@/components/layout/shared/ModuleHeader';

function StatsSkeleton() {
  return (
    <div className="glass-card p-5 rounded-2xl bg-white border border-gray-100 shadow-md animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
        <div className="h-6 w-16 bg-gray-100 rounded-full"></div>
      </div>
      <div className="h-8 w-20 bg-gray-200 rounded"></div>
    </div>
  );
}

function ShipmentCardSkeleton() {
  return (
    <div className="glass-card p-4 rounded-2xl bg-white border border-gray-100 shadow-md animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
        <div className="h-6 w-24 bg-gray-100 rounded-full"></div>
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-3 w-3/4 bg-gray-100 rounded"></div>
        <div className="h-3 w-1/2 bg-gray-100 rounded"></div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="h-3 w-16 bg-gray-100 rounded"></div>
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-gray-100 rounded-lg"></div>
          <div className="w-8 h-8 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

export default function LogisticsLoading() {
  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <ModuleHeader
        title="Centro de Logística"
        subtitle="Gestiona tus envíos y entregas"
        icon="Truck"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsSkeleton key={i} />
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card p-4 rounded-2xl bg-white border border-gray-100 shadow-md animate-pulse">
        <div className="flex flex-wrap gap-3">
          <div className="h-10 w-32 bg-gray-200 rounded-xl"></div>
          <div className="h-10 w-32 bg-gray-200 rounded-xl"></div>
          <div className="h-10 w-40 bg-gray-200 rounded-xl ml-auto"></div>
        </div>
      </div>

      {/* Shipments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <ShipmentCardSkeleton key={i} />
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
