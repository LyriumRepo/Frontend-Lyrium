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
  // Simular llamada a Laravel API
  // En producción:
  // const response = await fetch(`${process.env.LARAVEL_API_URL}/dashboard/kpis`, {
  //   headers: { 'Authorization': `Bearer ${token}` }
  // });
  
  await new Promise(r => setTimeout(r, 600)); // Simular latencia
  
  return {
    totalVentas: 45600.50,
    pedidosHoy: 8,
    pedidosMes: 156,
    conversionRate: 3.2,
    ticketPromedio: 292.31,
    clientesNuevos: 24,
    productosTop: [
      { nombre: 'Vitamina C 1000mg', ventas: 45 },
      { nombre: 'Colágeno Marino', ventas: 38 },
      { nombre: 'Omega 3 Premium', ventas: 32 },
    ],
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Server Action: Obtener pedidos recientes desde WooCommerce
 * ═══════════════════════════════════════════════════════════════════════════
 */
export async function getRecentOrders(limit = 10): Promise<RecentOrder[]> {
  // Simular llamada a WooCommerce
  // En producción:
  // const response = await fetch(`${process.env.WC_API_URL}/orders?per_page=${limit}`);
  
  await new Promise(r => setTimeout(r, 400)); // Simular latencia
  
  return [
    { id: 'ORD-2847', cliente: 'María González', fecha: '2024-01-15', total: 156.00, estado: 'pendiente', items: 3 },
    { id: 'ORD-2846', cliente: 'Carlos Ruiz', fecha: '2024-01-15', total: 89.50, estado: 'procesando', items: 2 },
    { id: 'ORD-2845', cliente: 'Ana López', fecha: '2024-01-14', total: 234.00, estado: 'enviado', items: 5 },
    { id: 'ORD-2844', cliente: 'Pedro Sánchez', fecha: '2024-01-14', total: 67.00, estado: 'entregado', items: 1 },
    { id: 'ORD-2843', cliente: 'Laura Díaz', fecha: '2024-01-13', total: 445.00, estado: 'entregado', items: 8 },
    { id: 'ORD-2842', cliente: 'Miguel Torres', fecha: '2024-01-13', total: 178.00, estado: 'cancelado', items: 4 },
    { id: 'ORD-2841', cliente: 'Sofia Martín', fecha: '2024-01-12', total: 92.00, estado: 'entregado', items: 2 },
    { id: 'ORD-2840', cliente: 'Jorge Vargas', fecha: '2024-01-12', total: 321.00, estado: 'entregado', items: 6 },
  ];
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
