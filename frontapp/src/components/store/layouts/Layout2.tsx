'use client';

import { Tienda, Producto } from '@/types/public';
import ProductGrid from '@/components/products/ProductGrid';
import AdBannersCarousel from '../AdBannersCarousel';

interface Layout2Props {
  store: Tienda;
  products: Producto[];
  plan: 'basico' | 'premium';
  banners?: { url: string; titulo: string; link?: string }[];
}

export default function Layout2({ products, banners }: Layout2Props) {
  const productosNormales = products.filter((p) => p.tipo !== 'service');
  const productosServicio = products.filter((p) => p.tipo === 'service');

  return (
    <div className="space-y-6">
      <AdBannersCarousel banners={banners} maxBanners={4} startIndex={0} fallback={4} />

      <hr className="border-gray-200 dark:border-[var(--border-subtle)]" />

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:[var(--text-primary)]">
          Productos destacados
        </h2>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-80 flex-shrink-0">
            <AdBannersCarousel banners={banners} maxBanners={4} vertical startIndex={4} fallback={4} />
          </div>
          <div className="flex-1">
            <ProductGrid productos={productosNormales} />
          </div>
        </div>
      </div>

      <AdBannersCarousel banners={banners} maxBanners={4} startIndex={8} fallback={4} />

      <hr className="border-gray-200 dark:border-[var(--border-subtle)]" />

      {productosServicio.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 dark:[var(--text-primary)]">
            Servicios de la tienda
          </h2>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <ProductGrid productos={productosServicio} />
            </div>
            <div className="w-full lg:w-80 flex-shrink-0">
              <AdBannersCarousel banners={banners} maxBanners={4} vertical startIndex={12} fallback={4} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
