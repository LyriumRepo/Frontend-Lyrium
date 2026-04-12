/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LOADING STATE - Agenda
 * 
 * Skeleton para streaming de la agenda de citas
 * ═══════════════════════════════════════════════════════════════════════════
 */

import ModuleHeader from '@/components/layout/shared/ModuleHeader';

function CalendarDaySkeleton() {
  return (
    <div className="min-w-[14.28%] p-2 animate-pulse">
      <div className="h-6 w-6 bg-gray-200 rounded-full mx-auto mb-1"></div>
      <div className="space-y-1">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-2 w-full bg-gray-100 rounded"></div>
        ))}
      </div>
    </div>
  );
}

function AppointmentCardSkeleton() {
  return (
    <div className="glass-card p-3 rounded-xl bg-white border border-gray-100 shadow-sm animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        <div className="h-3 w-16 bg-gray-200 rounded"></div>
      </div>
      <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
      <div className="h-3 w-1/2 bg-gray-100 rounded mt-1"></div>
    </div>
  );
}

export default function AgendaLoading() {
  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <ModuleHeader
        title="Agenda"
        subtitle="Gestiona tus citas y disponibilidad"
        icon="Calendar"
      />

      {/* Calendar */}
      <div className="glass-card p-6 rounded-3xl bg-white border border-gray-100 shadow-lg animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-100 rounded-lg"></div>
            <div className="h-8 w-8 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
        
        {/* Days header */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
            <div key={day} className="text-center h-4 w-full bg-gray-100 rounded"></div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="flex flex-wrap">
          {Array.from({ length: 35 }).map((_, i) => (
            <CalendarDaySkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Appointments */}
      <div className="space-y-4">
        <div className="h-5 w-32 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <AppointmentCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
