/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SERVICES MASTER MANAGEMENT PAGE - Server Component
 * * Responsabilidades:
 * - Realizar el fetch de datos iniciales en el Servidor (SSR)
 * - Inyectar los datos en el árbol del cliente de forma fluida
 * - Prevenir parpadeos visuales al cambiar de rutas
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import {
  getServicesAction,
  getSpecialistsAction,
  getAppointmentsAction,
} from '@/shared/lib/actions/services';
import { ServicesPageClient } from '@/features/seller/services/ServicesPageClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function ServicesPage() {
  // Ejecuta la recopilación de datos en paralelo en el servidor de Next.js
  const [initialServices, initialSpecialists, initialAppointments] =
    await Promise.all([
      getServicesAction(),
      getSpecialistsAction(),
      getAppointmentsAction(),
    ]);

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
      <ServicesPageClient
        initialServices={initialServices}
        initialSpecialists={initialSpecialists}
        initialAppointments={initialAppointments}
      />
    </Suspense>
  );
}
