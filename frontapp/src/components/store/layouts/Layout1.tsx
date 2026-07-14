'use client';

import { Tienda, Producto } from '@/types/public';
import ProductGrid from '@/components/products/ProductGrid';
import AdBannersCarousel from '../AdBannersCarousel';
import ScrollableSection from './ScrollableSection';

interface Layout1Props {
  store: Tienda;
  products: Producto[];
  plan: 'basico' | 'premium';
  banners?: { url: string; titulo: string; link?: string }[];
}

export default function Layout1({ products, banners }: Layout1Props) {
  const productosNormales = products.filter((p) => p.tipo !== 'service');
  const productosServicio = products.filter((p) => p.tipo === 'service');

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      <AdBannersCarousel banners={banners} maxBanners={4} startIndex={0} fallback={4} />

      <hr className="border-gray-200 dark:border-[var(--border-subtle)]" />

      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-[var(--text-primary)]">
          Productos destacados
        </h2>
        <ScrollableSection visibleRows={2}>
          <ProductGrid productos={productosNormales} />
        </ScrollableSection>
      </div>

      <AdBannersCarousel banners={banners} maxBanners={4} startIndex={4} fallback={4} />

      <hr className="border-gray-200 dark:border-[var(--border-subtle)]" />

      {productosServicio.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-[var(--text-primary)]">
            Servicios de la tienda
          </h2>
          <ScrollableSection visibleRows={2}>
            <ProductGrid productos={productosServicio} />
          </ScrollableSection>
        </div>
      )}
    </div>
  );
}