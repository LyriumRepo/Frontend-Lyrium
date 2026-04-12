/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ESTRATEGIA: Server Components vs Client Components
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * REGLA DE ORO: ¿El componente necesita alguno de estos?
 *   ✅ useState / useReducer
 *   ✅ useEffect
 *   ✅ Event handlers (onClick, onChange, onSubmit)
 *   ✅ Context API
 *   ✅ Refs
 *   ✅ Custom hooks con lógica de cliente
 * 
 * Si la respuesta es NO → Server Component (pure UI + props)
 * 
 * ─────────────────────────────────────────────────────────────────────────────
 * CASO DE ESTUDIO: SalesPage
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Order, SalesKPI } from '@/features/seller/sales/types';
import { Product } from '@/features/seller/catalog/types';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SERVER COMPONENTS (Pure Rendering - NO hooks)
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ✅ PUEDE SER SERVER COMPONENT
// Solo recibe datos y renderiza UI. No tiene estado ni eventos.
export function OrderCard({ order, onClick }: { 
  order: Order; 
  onClick: (order: Order) => void; 
}) {
  // Las funciones onClick se definen EN EL CLIENT COMPONENT PADRE
  // Este componente solo la ejecuta, no la define
  
  const statusConfig = {
    'pagado': { class: 'bg-emerald-100 text-emerald-700', label: 'Confirmado' },
    'en_proceso': { class: 'bg-blue-100 text-blue-700', label: 'En Proceso' },
    'entregado': { class: 'bg-indigo-100 text-indigo-700', label: 'Completado' },
    'pendiente': { class: 'bg-amber-100 text-amber-700', label: 'Pendiente' },
    'cancelado': { class: 'bg-red-100 text-red-700', label: 'Cancelado' }
  };

  return (
    <div onClick={() => onClick(order)}>
      {/* UI render only - no hooks */}
    </div>
  );
}

// ✅ PUEDE SER SERVER COMPONENT
// Solo muestra KPIs. No necesita estado.
export function SalesKPIs({ kpis }: { kpis: SalesKPI[] }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {kpis.map(kpi => (
        <div key={kpi.label} className="stat-card">
          <span className="text-xs text-gray-500">{kpi.label}</span>
          <span className="text-xl font-bold">{kpi.value}</span>
        </div>
      ))}
    </div>
  );
}

// ✅ PUEDE SER SERVER COMPONENT
// Solo formatea y muestra texto
export function ProductPrice({ product }: { product: Product }) {
  const hasDiscount = product.discountPercentage && product.discountPercentage > 0;
  
  return (
    <div className="price-container">
      {hasDiscount && (
        <span className="original-price line-through text-gray-400">
          S/{product.price}
        </span>
      )}
      <span className="final-price text-emerald-600">
        S/{hasDiscount 
          ? (product.price * (1 - product.discountPercentage! / 100)).toFixed(2)
          : product.price
        }
      </span>
    </div>
  );
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CLIENT COMPONENTS (Interactivity Required)
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ❌ DEBE SER CLIENT COMPONENT
// Usa useState, useEffect, event handlers
'use client';

import { useState } from 'react';
import { useSellerSales } from '@/features/seller/sales/hooks/useSellerSales';
import { OrderCard } from './OrderCard';
import { SalesKPIs } from './SalesKPIs';

export function SalesFilters({ 
  dateStart, 
  dateEnd, 
  onDateChange, 
  onClear, 
  onExport 
}: {
  dateStart: string | null;
  dateEnd: string | null;
  onDateChange: (type: 'dateStart' | 'dateEnd', value: string) => void;
  onClear: () => void;
  onExport: (type: 'excel' | 'pdf') => void;
}) {
  const [isOpen, setIsOpen] = useState(false); // ✅ useState
  
  return (
    <div className="filters">
      {/* Event handlers - necesita Client Component */}
      <input 
        type="date" 
        value={dateStart ?? ''}
        onChange={(e) => onDateChange('dateStart', e.target.value)} // ✅ onChange
      />
      <button onClick={() => onExport('pdf')}> // ✅ onClick
        Exportar
      </button>
    </div>
  );
}

// ❌ DEBE SER CLIENT COMPONENT
// Define la lógica de negocio, no solo la ejecuta
'use client';

import { create } from 'zustand';

interface OrderStore {
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order | null) => void;
  filters: OrderFilters;
  updateFilters: (filters: Partial<OrderFilters>) => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
  selectedOrder: null,
  setSelectedOrder: (order) => set({ selectedOrder: order }),
  filters: { dateStart: null, dateEnd: null },
  updateFilters: (newFilters) => set((state) => ({ 
    filters: { ...state.filters, ...newFilters } 
  })),
}));

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PAGE STRUCTURE: Separación Server/Client
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* 
// src/app/seller/sales/page.tsx (SERVER COMPONENT)
import { getOrders, getKPIs } from '@/shared/lib/actions/sales';
import { SalesPageClient } from './SalesPageClient';

export default async function SalesPage() {
  // ✅ Fetch en el servidor - 0 JS bundle
  const [orders, kpis] = await Promise.all([
    getOrders(),
    getKPIs()
  ]);

  return (
    <SalesPageClient 
      initialOrders={orders} 
      initialKPIs={kpis} 
    />
  );
}

// src/app/seller/sales/SalesPageClient.tsx (CLIENT COMPONENT)
'use client';

import { useSellerSales } from '@/features/seller/sales/hooks/useSellerSales';
import { OrderCard, SalesKPIs } from './components'; // Server Components
import { SalesFilters } from './components/SalesFilters'; // Client Component

export function SalesPageClient({ 
  initialOrders, 
  initialKPIs 
}: { 
  initialOrders: Order[]; 
  initialKPIs: SalesKPI[]; 
}) {
  // Solo aquí usamos hooks
  const { orders, isLoading, updateFilters } = useSellerSales({
    initialData: { orders: initialOrders, kpis: initialKPIs }
  });

  return (
    <>
      <SalesKPIs kpis={initialKPIs} /> {/* Server - sin hooks */}
      <SalesFilters onDateChange={updateFilters} /> {/* Client - necesita hooks */}
      <div className="grid">
        {orders.map(order => (
          <OrderCard 
            key={order.id} 
            order={order} 
            onClick={(o) => console.log(o.id)} // Client handler
          />
        ))}
      </div>
    </>
  );
}
*/
