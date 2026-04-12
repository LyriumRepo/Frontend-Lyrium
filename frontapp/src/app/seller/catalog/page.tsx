/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CATALOG PAGE - Server Component
 * 
 * Responsabilidades:
 * - Fetch inicial de datos (Server Side)
 * - Pasar datos al Client Component
 * - No tiene estado ni eventos propios
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { getProducts } from '@/shared/lib/actions/catalog';
import CatalogClient from '@/features/seller/catalog/CatalogPageClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function CatalogPage() {
  // Fetch en el servidor - 0 JavaScript adicional en cliente
  const initialProducts = await getProducts();

  return (
    <Suspense fallback={
      <div className="space-y-8 animate-fadeIn pb-20">
        <div className="glass-card p-6 rounded-[2.5rem] bg-white border border-gray-100">
          <div className="h-8 bg-gray-100 rounded w-1/3 animate-pulse"></div>
        </div>
        <div className="flex items-center justify-center py-32">
          <BaseLoading message="Cargando catálogo de productos..." />
        </div>
      </div>
    }>
      <CatalogClient initialProducts={initialProducts} />
    </Suspense>
  );
}
