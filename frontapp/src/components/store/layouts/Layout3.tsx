'use client';

import { Tienda, Producto } from '@/types/public';
import ProductGrid from '@/components/products/ProductGrid';
import AdBannersGrid from '../AdBannersGrid';

interface Layout3Props {
  store: Tienda;
  products: Producto[];
  plan: 'basico' | 'premium';
}

export default function Layout3({ products }: Layout3Props) {
  const productosNormales = products.filter((p) => p.tipo !== 'service');
  const productosServicio = products.filter((p) => p.tipo === 'service');

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      <hr className="border-gray-200 dark:border-[var(--border-subtle)]" />

      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-[var(--text-primary)]">
          Productos destacados
        </h2>
        <div className="flex flex-col md:flex-row gap-4 sm:gap-5 md:gap-6">
          <div className="hidden md:block w-48 lg:w-72 flex-shrink-0">
            <AdBannersGrid maxBanners={1} vertical />
          </div>
          <div className="flex-1">
            <ProductGrid productos={productosNormales} />
          </div>
          <div className="hidden md:block w-48 lg:w-72 flex-shrink-0">
            <AdBannersGrid maxBanners={1} vertical />
          </div>
        </div>
      </div>

      <hr className="border-gray-200 dark:border-[var(--border-subtle)]" />

      <AdBannersGrid />

      <hr className="border-gray-200 dark:border-[var(--border-subtle)]" />

      {productosServicio.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-[var(--text-primary)]">
            Servicios de la tienda
          </h2>
          <ProductGrid productos={productosServicio} />
        </div>
      )}
    </div>
  );
}