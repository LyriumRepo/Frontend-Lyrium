'use client';

import { ReactNode } from 'react';
import { Tienda, Producto } from '@/types/public';
import StoreTabs from '../StoreTabs';
import StoreSidebar from '../StoreSidebar';
import RelatedProducts from '../RelatedProducts';
import RecommendedProducts from '../RecommendedProducts';
import ProductCarousel from '../ProductCarousel';
import AdBannersGrid from '../AdBannersGrid';
import SidebarInfo from '../SidebarInfo';

interface Layout1Props {
  store: Tienda;
  products: Producto[];
  plan: 'basico' | 'premium';
}

export default function Layout1({ store, products, plan }: Layout1Props) {
  return (
    <div className="space-y-6">
      {/* ========================================= */}
      {/* BLOQUE 1: SIDEBAR IZQUIERDA + TABS */}
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

      {/* LÍNEA SEPARADORA */}
      <hr className="border-gray-200 dark:border-[var(--border-subtle)]" />

      {/* ========================================= */}
      {/* BLOQUE 2: PRODUCTOS + SIDEBAR DERECHA */}
      {/* "También te puede interesar" */}
      {/* ========================================= */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Columna principal: Productos secundarios */}
        <div className="flex-1">
          <RelatedProducts productos={products} titulo="También te puede interesar" />
        </div>

        {/* Sidebar derecha (altura reducida) */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <StoreSidebar productos={products.slice(0, 6)} />
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

          {/* BLOQUE 3: SIDEBAR IZQUIERDA + PRODUCTOS TERCIARIOS */}
          {/* "Más productos para ti" */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar izquierda */}
            <div className="hidden lg:block w-72 flex-shrink-0">
              <StoreSidebar productos={products.slice(0, 8)} />
            </div>

            {/* Columna principal: Productos terciarios */}
            <div className="flex-1">
              <RecommendedProducts productos={products} titulo="Más productos para ti" />
            </div>
          </div>

          {/* LÍNEA SEPARADORA */}
          <hr className="border-gray-200 dark:border-[var(--border-subtle)]" />

          {/* BLOQUE 4: SLIDER + SIDEBAR DERECHA */}
          {/* "Productos más vendidos" */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Columna principal: Slider de productos */}
            <div className="flex-1">
              <ProductCarousel productos={products} titulo="Productos más vendidos" />
            </div>

            {/* Sidebar derecha */}
            <div className="hidden lg:block w-72 flex-shrink-0">
              <SidebarInfo />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
