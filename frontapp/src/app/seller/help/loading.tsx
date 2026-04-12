/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LOADING STATE - Help Desk
 * 
 * Skeleton para streaming del centro de ayuda
 * ═══════════════════════════════════════════════════════════════════════════
 */

import ModuleHeader from '@/components/layout/shared/ModuleHeader';

function TicketCardSkeleton() {
  return (
    <div className="glass-card p-4 rounded-2xl bg-white border border-gray-100 shadow-md animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-1">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="h-3 w-16 bg-gray-100 rounded"></div>
        </div>
        <div className="h-6 w-20 bg-gray-100 rounded-full"></div>
      </div>
      <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
      <div className="h-3 w-full bg-gray-100 rounded"></div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="h-3 w-20 bg-gray-100 rounded"></div>
        <div className="h-3 w-16 bg-gray-100 rounded"></div>
      </div>
    </div>
  );
}

export default function HelpLoading() {
  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <ModuleHeader
        title="Centro de Ayuda"
        subtitle="Gestiona tus tickets de soporte"
        icon="Headset"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-4 rounded-2xl bg-white border border-gray-100 shadow-md animate-pulse">
            <div className="h-3 w-20 bg-gray-100 rounded mb-2"></div>
            <div className="h-8 w-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <TicketCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
