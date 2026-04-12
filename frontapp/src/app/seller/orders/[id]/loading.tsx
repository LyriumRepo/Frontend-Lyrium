/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LOADING STATE - Order Detail
 * 
 * Skeleton para streaming del detalle de pedido
 * ═══════════════════════════════════════════════════════════════════════════
 */

import ModuleHeader from '@/components/layout/shared/ModuleHeader';

function OrderHeaderSkeleton() {
  return (
    <div className="glass-card p-6 rounded-3xl bg-white border border-gray-100 shadow-lg animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
          <div className="h-8 w-48 bg-gray-300 rounded"></div>
        </div>
        <div className="h-10 w-24 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  );
}

function InfoCardSkeleton() {
  return (
    <div className="glass-card p-6 rounded-3xl bg-white border border-gray-100 shadow-lg animate-pulse">
      <div className="h-4 w-24 bg-gray-200 rounded mb-4"></div>
      <div className="space-y-3">
        <div className="h-3 w-3/4 bg-gray-100 rounded"></div>
        <div className="h-3 w-1/2 bg-gray-100 rounded"></div>
        <div className="h-3 w-2/3 bg-gray-100 rounded"></div>
      </div>
    </div>
  );
}

function ItemRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl animate-pulse">
      <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
        <div className="h-3 w-1/3 bg-gray-100 rounded"></div>
      </div>
      <div className="h-4 w-20 bg-gray-200 rounded"></div>
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="glass-card p-6 rounded-3xl bg-white border border-gray-100 shadow-lg animate-pulse">
      <div className="h-4 w-32 bg-gray-200 rounded mb-6"></div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="w-3 h-3 bg-gray-300 rounded-full mt-2"></div>
            <div className="flex-1 space-y-1">
              <div className="h-3 w-1/3 bg-gray-200 rounded"></div>
              <div className="h-2 w-1/4 bg-gray-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OrderDetailLoading() {
  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <ModuleHeader
        title="Detalle del Pedido"
        subtitle="Información completa del pedido"
        icon="Package"
      />

      <OrderHeaderSkeleton />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCardSkeleton />
        <InfoCardSkeleton />
      </div>

      <div className="space-y-3">
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <ItemRowSkeleton key={i} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimelineSkeleton />
        <InfoCardSkeleton />
      </div>
    </div>
  );
}
