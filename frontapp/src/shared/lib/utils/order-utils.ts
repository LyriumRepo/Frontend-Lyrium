/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UTILIDADES PARA PEDIDOS
 * Funciones helper para el componente de detalle de pedido
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type OrderStatus = 'pending_seller' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// Tipos legacy de WooCommerce para compatibilidad
export type WooCommerceStatus = 'pending' | 'processing' | 'on-hold' | 'completed' | 'cancelled' | 'refunded' | 'failed';

// Mapear statuses de WooCommerce a nuestros statuses
export function mapWooCommerceStatus(wcStatus: WooCommerceStatus): OrderStatus {
  const mapping: Record<WooCommerceStatus, OrderStatus> = {
    pending: 'pending_seller',
    processing: 'confirmed',
    'on-hold': 'pending_seller',
    completed: 'delivered',
    cancelled: 'cancelled',
    refunded: 'cancelled',
    failed: 'cancelled',
  };
  return mapping[wcStatus] || 'pending_seller';
}

export function getStatusLabel(status: OrderStatus | WooCommerceStatus): string {
  const labels: Record<string, string> = {
    // Nuevos statuses
    pending_seller: 'Pendiente Confirmar',
    confirmed: 'Confirmado',
    processing: 'Preparando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
    // Legacy WooCommerce statuses
    pending: 'Pendiente',
    'on-hold': 'En Espera',
    completed: 'Completado',
    refunded: 'Reembolsado',
    failed: 'Fallido',
  };
  return labels[status] || status;
}

export function getStatusColor(status: OrderStatus | WooCommerceStatus): string {
  const colors: Record<string, string> = {
    // Nuevos statuses
    pending_seller: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-sky-100 text-sky-700',
    processing: 'bg-indigo-100 text-indigo-700',
    shipped: 'bg-blue-100 text-blue-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
    // Legacy WooCommerce statuses
    pending: 'bg-amber-100 text-amber-700',
    'on-hold': 'bg-purple-100 text-purple-700',
    completed: 'bg-emerald-100 text-emerald-700',
    refunded: 'bg-gray-100 text-gray-700',
    failed: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}

export const ORDER_STATUSES: (OrderStatus | WooCommerceStatus)[] = [
  'pending_seller',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

// formatDate y formatDateTime en order-utils usan formatos específicos para pedidos
// (mes completo/abreviado) que difieren de formatters.ts
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
