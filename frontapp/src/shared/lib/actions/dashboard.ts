'use server';

import { revalidateTag } from 'next/cache';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TIPOS para el Dashboard
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface SalesKPIs {
  totalVentas: number;
  pedidosHoy: number;
  pedidosMes: number;
  conversionRate: number;
  ticketPromedio: number;
  clientesNuevos: number;
  productosTop: { nombre: string; ventas: number }[];
}

export interface RecentOrder {
  id: string;
  cliente: string;
  fecha: string;
  total: number;
  estado: 'pendiente' | 'procesando' | 'enviado' | 'entregado' | 'cancelado';
  items: number;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Server Action: Obtener KPIs desde Laravel
 * ═══════════════════════════════════════════════════════════════════════════
 */
export async function getSalesKPIs(): Promise<SalesKPIs> {
  return {
    totalVentas: 0,
    pedidosHoy: 0,
    pedidosMes: 0,
    conversionRate: 0,
    ticketPromedio: 0,
    clientesNuevos: 0,
    productosTop: [],
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Server Action: Obtener pedidos recientes desde WooCommerce
 * ═══════════════════════════════════════════════════════════════════════════
 */
export async function getRecentOrders(_limit = 10): Promise<RecentOrder[]> {
  return [];
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Server Action: Obtener datos del dashboard completos (parallel)
 * 
 * Esta es la función que se usa en el page.tsx con Promise.all
 * ═══════════════════════════════════════════════════════════════════════════
 */
export async function getDashboardData() {
  // Ejecución en paralelo - ambas APIs responden independientemente
  const [kpis, orders] = await Promise.all([
    getSalesKPIs(),
    getRecentOrders(8),
  ]);

  return { kpis, orders };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Server Action: Refrescar datos del dashboard
 * ═══════════════════════════════════════════════════════════════════════════
 */
export async function refreshDashboard() {
  revalidateTag('dashboard-kpis', 'max');
  revalidateTag('dashboard-orders', 'max');
  return { success: true };
}
