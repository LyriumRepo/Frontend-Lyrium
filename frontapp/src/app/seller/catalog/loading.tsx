/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LOADING STATE CON STREAMS Y SKELETONS
 * 
 * Este archivo implementa:
 * - Streaming con Suspense (Next.js lo hace automáticamente)
 * - Skeletons que coinciden con la estructura del ProductCard
 * - Mejora la percepción de carga del usuario
 * 
 * Next.js automáticamente:
 * 1. Envía este loading.tsx inmediatamente al cliente
 * 2. Continúa renderizando el page.tsx en el servidor
 * 3. Cuando termina, "hidrata" el contenido real
 * ═══════════════════════════════════════════════════════════════════════════
 */

import ModuleHeader from '@/components/layout/shared/ModuleHeader';

/**
 * Skeleton para el Header del módulo
 */
function HeaderSkeleton() {
  return (
    <div className="glass-card p-6 rounded-[2.5rem] bg-white border border-gray-100 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-4 w-96 bg-gray-100 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-36 bg-gray-200 rounded-3xl animate-pulse"></div>
      </div>
    </div>
  );
}

/**
 * Skeleton para los filtros de búsqueda
 */
function FiltersSkeleton() {
  return (
    <div className="glass-card p-6 rounded-[2.5rem] bg-white border border-gray-100 shadow-xl shadow-gray-100/50">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="h-14 w-full bg-gray-100 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton que replica la estructura del ProductCard
 * Asegura que cuando los productos carguen, el layout no haga shift
 */
function ProductCardSkeleton() {
  return (
    <div className="product-card glass-card p-4 h-full flex flex-col animate-pulse">
      {/* Imagen */}
      <div className="relative mb-3 overflow-hidden rounded-xl bg-gray-100 aspect-square">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      {/* Info del producto */}
      <div className="flex-1 min-h-0 text-center space-y-2">
        <div className="h-3 w-3/4 bg-gray-100 rounded mx-auto"></div>
        <div className="flex items-center justify-center gap-2">
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
          <div className="h-3 w-12 bg-gray-100 rounded"></div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="mt-2 pt-2 border-t border-gray-50 flex gap-1 items-center justify-center">
        <div className="flex-1 h-8 bg-gray-100 rounded-lg"></div>
        <div className="w-8 h-8 bg-gray-100 rounded-lg"></div>
        <div className="w-8 h-8 bg-gray-100 rounded-lg"></div>
      </div>
    </div>
  );
}

/**
 * Grid de skeletons paraProductGrid
 */
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Componente principal de loading
 * Se muestra inmediatamente mientras el Server Component carga datos
 */
export default function CatalogLoading() {
  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      {/* Header */}
      <ModuleHeader
        title="Gestión de Catálogo"
        subtitle="Administra tus productos, precios e inventario centralizado."
        icon="Catalog"
      />

      {/* Filtros con skeleton */}
      <FiltersSkeleton />

      {/* Grid de productos con skeleton */}
      <ProductGridSkeleton />
    </div>
  );
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CÓMO FUNCIONA EL STREAMING EN NEXT.JS:
 * 
 * 1. Usuario visita /seller/catalog
 * 
 * 2. Next.js detecta loading.tsx y:
 *    - Envía HTML de loading.tsx INMEDIATAMENTE (TTFB bajo)
 *    - Comienza a renderizar page.tsx en paralelo
 * 
 * 3. El Server Component (page.tsx) hace fetch a WP:
 *    - Mientras tanto, el usuario ve los skeletons
 *    - No hay "blank screen" ni spinner único
 * 
 * 4. Cuando los datos llegan:
 *    - Next.js envía el HTML de los productos
 *    - El navegador hace "resume" y reemplaza skeletons con datos reales
 *    - No hay flash, solo transición suave
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */
