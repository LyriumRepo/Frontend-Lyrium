'use client';

import { Tienda, Producto } from '@/types/public';
import StoreTabs from '../StoreTabs';
import StoreSidebar from '../StoreSidebar';
import MainProductGrid from '../MainProductGrid';
import AdBannersGrid from '../AdBannersGrid';
import SidebarInfo from '../SidebarInfo';

interface Layout2Props {
  store: Tienda;
  products: Producto[];
  plan: 'basico' | 'premium';
}

export default function Layout2({ store, products, plan }: Layout2Props) {
  // Tomar 12 productos para el grid de selecciones
  const productosSelecciones = products.slice(0, 12);

  return (
    <div className="space-y-6">
      {/* ========================================= */}
      {/* LAYOUT: SIDEBAR + TABS */}
      {/* Sidebar a la izquierda */}
      {/* ========================================= */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar izquierda */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <StoreSidebar productos={products} />
        </div>

        {/* Columna principal: Tabs con Productos destacados */}
        <div className="flex-1">
          <StoreTabs tienda={store} productos={products} plan={plan} />
        </div>
      </div>

      {/* ========================================= */}
      {/* CONTENIDO PREMIUM */}
      {/* ========================================= */}
      {plan === 'premium' && (
        <div className="space-y-6">
          {/* LÍNEA SEPARADORA */}
          <hr className="border-gray-200 dark:border-[var(--border-subtle)]" />

          {/* BANNER PUBLICITARIO "OFERTAS ESPECIALES" */}
          <AdBannersGrid />

          {/* LÍNEA SEPARADORA */}
          <hr className="border-gray-200 dark:border-[var(--border-subtle)]" />

          {/* SECCIÓN: GRID DE PRODUCTOS "SELECCIONES DESTACADAS" */}
          {/* Con sidebar derecho (altura = 3 filas de productos) */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
              Selecciones destacadas para ti
            </h3>
            
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Grid de Productos (12 productos = 4 columnas × 3 filas) */}
              <div className="flex-1">
                <MainProductGrid 
                  productos={productosSelecciones} 
                />
              </div>

              {/* Sidebar Derecho (Altura igual a 3 filas) */}
              <div className="hidden lg:block w-72 flex-shrink-0">
                <StoreSidebar productos={products.slice(0, 8)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
