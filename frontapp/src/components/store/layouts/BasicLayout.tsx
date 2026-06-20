'use client';

import { Tienda, Producto } from '@/types/public';
import StoreTabs from '../StoreTabs';
import StoreSidebar from '../StoreSidebar';

interface Servicio {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string | null;
  category: string | null;
  duration: string | null;
}

interface BasicLayoutProps {
  store: Tienda;
  products: Producto[];
  services?: Servicio[];
}

export default function BasicLayout({ store, products, services = [] }: BasicLayoutProps) {
  return (
    <div className="space-y-6">
      {/* ========================================= */}
      {/* LAYOUT BÁSICO: TABS + SIDEBAR */}
      {/* ========================================= */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Columna principal */}
        <div className="flex-1">
          <StoreTabs tienda={store} productos={products} servicios={services} plan="basico" />
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <StoreSidebar productos={products} />
        </div>
      </div>
    </div>
  );
}
