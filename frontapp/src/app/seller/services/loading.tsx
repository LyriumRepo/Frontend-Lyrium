/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LOADING STATE - Services
 * 
 * Skeleton para streaming del ecosistema de servicios
 * ═══════════════════════════════════════════════════════════════════════════
 */

import ModuleHeader from '@/components/layout/shared/ModuleHeader';

function ServiceCardSkeleton() {
  return (
    <div className="glass-card p-5 rounded-2xl bg-white border border-gray-100 shadow-md animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
        <div className="w-12 h-6 bg-gray-100 rounded-full"></div>
      </div>
      <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
      <div className="h-3 w-full bg-gray-100 rounded mb-3"></div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="h-4 w-16 bg-gray-100 rounded"></div>
        <div className="h-6 w-20 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

function SpecialistSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 animate-pulse">
      <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
        <div className="h-3 w-24 bg-gray-100 rounded"></div>
      </div>
      <div className="flex gap-2">
        <div className="w-8 h-8 bg-gray-100 rounded-lg"></div>
        <div className="w-8 h-8 bg-gray-100 rounded-lg"></div>
      </div>
    </div>
  );
}

function TabSkeleton() {
  return (
    <div className="h-12 w-32 bg-gray-200 rounded-xl"></div>
  );
}

export default function ServicesLoading() {
  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <ModuleHeader
        title="Ecosistema de Servicios"
        subtitle="Gestiona tus servicios, especialistas y citas"
        icon="Briefcase"
      />

      {/* Tabs */}
      <div className="flex gap-3">
        <TabSkeleton />
        <TabSkeleton />
        <TabSkeleton />
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <ServiceCardSkeleton key={i} />
        ))}
      </div>

      {/* Specialists */}
      <div className="space-y-4">
        <div className="h-5 w-40 bg-gray-200 rounded"></div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SpecialistSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
