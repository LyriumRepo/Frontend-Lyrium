export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { ServicesPageClient } from '@/features/seller/services/ServicesPageClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-8 animate-fadeIn pb-20">
          <div className="glass-card p-6 rounded-[2.5rem] bg-white border border-gray-100">
            <div className="h-8 bg-gray-100 rounded w-1/3 animate-pulse"></div>
          </div>
          <div className="flex items-center justify-center py-32">
            <BaseLoading message="Configurando catálogo y agenda de servicios..." />
          </div>
        </div>
      }
    >
      <ServicesPageClient />
    </Suspense>
  );
}
