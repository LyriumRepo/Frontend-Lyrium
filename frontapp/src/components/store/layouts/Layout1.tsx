'use client';

import { Tienda, Producto } from '@/types/public';
import ProductGrid from '@/components/products/ProductGrid';
import AdBannersGrid from '../AdBannersGrid';

interface Layout1Props {
  store: Tienda;
  products: Producto[];
  plan: 'basico' | 'premium';
}

export default function Layout1({ products }: Layout1Props) {
  const productosNormales = products.filter((p) => p.tipo !== 'service');
  const productosServicio = products.filter((p) => p.tipo === 'service');

  return (
    <div className="space-y-6">
      <AdBannersGrid />

      <hr className="border-gray-200 dark:border-[var(--border-subtle)]" />

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-[var(--text-primary)]">
          Productos destacados
        </h2>
        <ProductGrid productos={productosNormales} />
      </div>

      <AdBannersGrid />

      <hr className="border-gray-200 dark:border-[var(--border-subtle)]" />

      {productosServicio.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-[var(--text-primary)]">
            Servicios de la tienda
          </h2>
          <ProductGrid productos={productosServicio} />
        </div>
      )}
    </div>
  );
}
