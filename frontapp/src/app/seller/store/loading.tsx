/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LOADING STATE - Store Settings
 * 
 * Skeleton para streaming de configuración de tienda
 * ═══════════════════════════════════════════════════════════════════════════
 */

import ModuleHeader from '@/components/layout/shared/ModuleHeader';

function StoreCardSkeleton() {
  return (
    <div className="glass-card p-6 rounded-3xl bg-white border border-gray-100 shadow-lg animate-pulse">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
        <div className="space-y-2">
          <div className="h-5 w-32 bg-gray-200 rounded"></div>
          <div className="h-3 w-24 bg-gray-100 rounded"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full bg-gray-100 rounded"></div>
        <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
      </div>
    </div>
  );
}

function BranchCardSkeleton() {
  return (
    <div className="glass-card p-4 rounded-2xl bg-white border border-gray-100 shadow-md animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
        <div className="w-8 h-8 bg-gray-100 rounded-lg"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-gray-100 rounded"></div>
        <div className="h-3 w-2/3 bg-gray-100 rounded"></div>
      </div>
    </div>
  );
}

function FormFieldSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-3 w-20 bg-gray-200 rounded"></div>
      <div className="h-10 w-full bg-gray-100 rounded-lg"></div>
    </div>
  );
}

export default function StoreLoading() {
  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <ModuleHeader
        title="Mi Tienda"
        subtitle="Configura y personaliza tu tienda"
        icon="Store"
      />

      <StoreCardSkeleton />

      {/* Branches */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 bg-gray-200 rounded"></div>
          <div className="h-10 w-32 bg-gray-200 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <BranchCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="glass-card p-6 rounded-3xl bg-white border border-gray-100 shadow-lg animate-pulse">
        <div className="h-5 w-32 bg-gray-200 rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormFieldSkeleton />
          <FormFieldSkeleton />
          <FormFieldSkeleton />
          <FormFieldSkeleton />
        </div>
        <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
          <div className="h-10 w-32 bg-gray-300 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}
