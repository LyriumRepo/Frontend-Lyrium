'use client';

import { useState } from 'react';
import { Tienda, Producto } from '@/types/public';
import ProductGrid from '@/components/products/ProductGrid';
import EmptyStoreState from '@/components/products/EmptyStoreState';
import AdBannersCarousel, { VERTICAL_BANNER_FIXED_HEIGHT } from '../AdBannersCarousel';
import ScrollableSection from './ScrollableSection';

const GRID_GAP = 16; // debe coincidir con el gap interno que usa ScrollableSection/ProductGrid

interface Layout2Props {
  store: Tienda;
  products: Producto[];
  plan: 'basico' | 'premium';
  banners?: { url: string; titulo: string; link?: string; orientation?: 'horizontal' | 'vertical' }[];
}

export default function Layout2({ products, banners }: Layout2Props) {
  const productosNormales = products.filter((p) => p.tipo !== 'service');
  const productosServicio = products.filter((p) => p.tipo === 'service');

  // Alto real (px) de una fila de la grilla de productos, medido por ScrollableSection,
  // para que el banner vertical de al lado use el mismo alto por fila (2 slides = 2 filas).
  const [productRowHeight, setProductRowHeight] = useState<number | undefined>(undefined);
  // Alto real total del contenido de esa misma grilla (puede ser 1 sola fila).
  const [productContentHeight, setProductContentHeight] = useState<number | undefined>(undefined);
  // El banner siempre asume 2 filas (2 slides). Si la grilla real solo tiene 1 fila,
  // sobra espacio: se rellena con una tarjeta de mensaje, igual que en Servicios.
  const productExpectedBannerHeight = productRowHeight !== undefined
    ? productRowHeight * 2 + 12
    : VERTICAL_BANNER_FIXED_HEIGHT;
  const productFillerHeight = productContentHeight !== undefined
    ? productExpectedBannerHeight - productContentHeight - GRID_GAP
    : 0;

  // Servicios: el banner vertical se mantiene fijo (2 slides, diseño original) en vez
  // de adaptarse a la fila. Si la grilla de servicios queda más corta que el banner,
  // se mide su alto real para rellenar el hueco sobrante con una tarjeta de mensaje.
  const [serviceContentHeight, setServiceContentHeight] = useState<number | undefined>(undefined);
  const serviceFillerHeight = serviceContentHeight !== undefined
    ? VERTICAL_BANNER_FIXED_HEIGHT - serviceContentHeight - GRID_GAP
    : 0;

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      <AdBannersCarousel banners={banners} maxBanners={4} startIndex={0} fallback={4} filterOrientation="horizontal" />

      <hr className="border-gray-200 dark:border-[var(--border-subtle)]" />

      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-[var(--text-primary)]">
          Productos destacados
        </h2>
        <div className="flex flex-col md:flex-row gap-4 sm:gap-5 md:gap-6 md:items-start">
          <div className="w-full md:w-56 lg:w-80 flex-shrink-0">
            <AdBannersCarousel banners={banners} maxBanners={4} vertical startIndex={0} fallback={4} filterOrientation="vertical" rowHeight={productRowHeight} />
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <ScrollableSection visibleRows={2} onRowHeight={setProductRowHeight} onContentHeight={setProductContentHeight}>
              <ProductGrid
                productos={productosNormales}
                emptyStateHeightPx={productosNormales.length === 0 ? VERTICAL_BANNER_FIXED_HEIGHT : undefined}
              />
            </ScrollableSection>
            {productFillerHeight > 60 && (
              <div className="hidden md:block">
                <EmptyStoreState heightPx={productFillerHeight} />
              </div>
            )}
          </div>
        </div>
      </div>

      <AdBannersCarousel banners={banners} maxBanners={4} startIndex={4} fallback={4} filterOrientation="horizontal" />

      <hr className="border-gray-200 dark:border-[var(--border-subtle)]" />

      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-[var(--text-primary)]">
          Servicios de la tienda
        </h2>
        <div className="flex flex-col md:flex-row gap-4 sm:gap-5 md:gap-6 md:items-start">
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <ScrollableSection visibleRows={2} onContentHeight={setServiceContentHeight}>
              <ProductGrid
                productos={productosServicio}
                emptyStateHeightPx={productosServicio.length === 0 ? VERTICAL_BANNER_FIXED_HEIGHT : undefined}
              />
            </ScrollableSection>
            {serviceFillerHeight > 60 && (
              <div className="hidden md:block">
                <EmptyStoreState heightPx={serviceFillerHeight} />
              </div>
            )}
          </div>
          <div className="w-full md:w-56 lg:w-80 flex-shrink-0">
            <AdBannersCarousel banners={banners} maxBanners={4} vertical startIndex={4} fallback={4} filterOrientation="vertical" />
          </div>
        </div>
      </div>
    </div>
  );
}