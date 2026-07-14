'use client';

import { Tienda, Producto } from '@/types/public';
import ProductGrid from '@/components/products/ProductGrid';
import AdBannersCarousel from '../AdBannersCarousel';
import ScrollableSection from './ScrollableSection';

interface Layout3Props {
  store: Tienda;
  products: Producto[];
  plan: 'basico' | 'premium';
  banners?: { url: string; titulo: string; link?: string }[];
}

export default function Layout3({ products, banners }: Layout3Props) {
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
            <AdBannersCarousel banners={banners} maxBanners={4} vertical startIndex={0} fallback={4} />
          </div>
          <ScrollableSection visibleRows={2} className="flex-1 min-h-0">
            <ProductGrid productos={productosNormales} className="lg:!grid-cols-3" />
          </ScrollableSection>
          <div className="hidden md:block w-48 lg:w-72 flex-shrink-0">
            <AdBannersCarousel banners={banners} maxBanners={4} vertical startIndex={4} fallback={4} />
          </div>
        </div>
      </div>

      <hr className="border-gray-200 dark:border-[var(--border-subtle)]" />

      <AdBannersCarousel banners={banners} maxBanners={4} startIndex={8} fallback={4} />

      <hr className="border-gray-200 dark:border-[var(--border-subtle)]" />

      {productosServicio.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-[var(--text-primary)]">
            Servicios de la tienda
          </h2>
          <ScrollableSection visibleRows={2}>
            <ProductGrid productos={productosServicio} className="lg:!grid-cols-3" />
          </ScrollableSection>
        </div>
      )}
    </div>
  );
}