/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LOADING STATE - Profile
 * 
 * Skeleton para streaming del perfil del vendedor
 * ═══════════════════════════════════════════════════════════════════════════
 */

import ModuleHeader from '@/components/layout/shared/ModuleHeader';

function ProfileCardSkeleton() {
  return (
    <div className="glass-card p-6 rounded-3xl bg-white border border-gray-100 shadow-lg animate-pulse">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
        <div className="space-y-2">
          <div className="h-5 w-32 bg-gray-200 rounded"></div>
          <div className="h-3 w-24 bg-gray-100 rounded"></div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-4 w-full bg-gray-100 rounded"></div>
        <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
        <div className="h-4 w-1/2 bg-gray-100 rounded"></div>
      </div>
    </div>
  );
}

function FormFieldSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-3 w-24 bg-gray-200 rounded"></div>
      <div className="h-10 w-full bg-gray-100 rounded-lg"></div>
    </div>
  );
}

export default function ProfileLoading() {
  return (
    <div className="space-y-8 animate-fadeIn pb-20 max-w-4xl mx-auto">
      <ModuleHeader
        title="Mi Perfil"
        subtitle="Gestiona tu información personal y de tu tienda"
        icon="User"
      />

      <ProfileCardSkeleton />

      <div className="glass-card p-6 rounded-3xl bg-white border border-gray-100 shadow-lg animate-pulse">
        <div className="h-5 w-32 bg-gray-200 rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormFieldSkeleton />
          <FormFieldSkeleton />
          <FormFieldSkeleton />
          <FormFieldSkeleton />
        </div>
        <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end gap-3">
          <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
          <div className="h-10 w-32 bg-gray-300 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}
