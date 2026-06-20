'use client';

import { Tienda, Producto } from '@/types/public';
import StoreTabs from '../StoreTabs';
import SidebarProducts from '../SidebarProducts';
import RelatedProducts from '../RelatedProducts';
import RecommendedProducts from '../RecommendedProducts';
import ProductCarousel from '../ProductCarousel';
import SidebarInfo from '../SidebarInfo';

interface Servicio {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string | null;
  category: string | null;
  duration: string | null;
}

interface Layout3Props {
  store: Tienda;
  products: Producto[];
  services?: Servicio[];
  plan: 'basico' | 'premium';
}

export default function Layout3({ store, products, services = [], plan }: Layout3Props) {
  return (
    <div className="space-y-6">
      {/* ========================================= */}
      {/* LAYOUT THREE COLUMNS */}
      {/* Sidebar + Contenido + Sidebar */}
      {/* ========================================= */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar izquierda (Artículos de tendencia) */}
        <div className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
          <SidebarProducts productos={products.slice(0, 6)} titulo="Artículos de tendencia" />
        </div>

        {/* Columna principal */}
        <div className="flex-1">
          <StoreTabs tienda={store} productos={products} servicios={services} plan={plan} />
        </div>

        {/* Sidebar derecha (Más productos) */}
        <div className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
          <SidebarProducts productos={products.slice(0, 6)} titulo="Más productos" />
        </div>
      </div>

      {/* ========================================= */}
      {/* CONTENIDO PREMIUM */}
      {/* ========================================= */}
      {plan === 'premium' && (
        <div className="space-y-6">
          {/* LÍNEA SEPARADORA */}
          <hr className="border-gray-200 dark:border-[var(--border-subtle)]" />

          {/* PRODUCTOS SECUNDARIOS */}
          <RelatedProducts productos={products} titulo="Descubre más productos" />

          {/* LÍNEA SEPARADORA */}
          <hr className="border-gray-200 dark:border-[var(--border-subtle)]" />

          {/* PRODUCTOS TERCIARIOS */}
          <RecommendedProducts productos={products} titulo="Más productos para ti" />

          {/* LÍNEA SEPARADORA */}
          <hr className="border-gray-200 dark:border-[var(--border-subtle)]" />
        </div>
      )}
    </div>
  );
}
