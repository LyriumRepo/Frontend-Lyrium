'use server';

import { revalidateTag, revalidatePath } from 'next/cache';
import { getStatusLabel, OrderStatus } from '../utils/order-utils';
import { getAuthUser, checkOwnership } from '../auth/permissions';
import { API_CONFIG } from '../config/api';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TIPOS PARA PEDIDOS
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Usar el tipo unificado de order-utils para mantener consistencia
// Los valores antiguos de WooCommerce se mapean a los nuevos
export type LegacyOrderStatus = 'pending' | 'processing' | 'on-hold' | 'completed' | 'cancelled' | 'refunded' | 'failed';

export interface OrderItem {
  id: number;
  name: string;
  product_id: number;
  quantity: number;
  price: number;
  total: number;
  sku?: string;
  image?: string;
}

export interface OrderCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface OrderDetails {
  id: string;
  number: string;
  date_created: string;
  date_modified: string;
  status: OrderStatus;
  currency: string;
  total: number;
  subtotal: number;
  shipping_total: number;
  tax_total: number;
  payment_method: string;
  payment_method_title: string;
  billing: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone?: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  customer: OrderCustomer;
  line_items: OrderItem[];
  shipping_lines: {
    id: number;
    method_title: string;
    total: string;
  }[];
  notes: string[];
  customer_note: string;
}

export interface OrderActionResult {
  success: boolean;
  order?: OrderDetails;
  error?: string;
  message?: string;
  code?: 'NOT_FOUND' | 'FORBIDDEN' | 'UNAUTHORIZED' | 'VALIDATION_ERROR';
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OBTENER DETALLE DE PEDIDO
 * ═══════════════════════════════════════════════════════════════════════════
 */
export async function getOrderById(orderId: string): Promise<OrderActionResult> {
  // Validar autenticación
  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: 'No autorizado', code: 'UNAUTHORIZED' };
  }

  try {
    const key = process.env.NEXT_PUBLIC_WP_CS_KEY;
    const secret = process.env.NEXT_PUBLIC_WP_CS_SECRET;

    if (!key || !secret) {
      return { success: false, error: 'Credenciales no configuradas' };
    }

    const auth = Buffer.from(`${key}:${secret}`).toString('base64');
    const wcUrl = API_CONFIG.wcApiUrl;

    const response = await fetch(`${wcUrl}/orders/${orderId}`, {
      headers: { 'Authorization': `Basic ${auth}` },
      next: { tags: [`order-${orderId}`] },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: 'Pedido no encontrado', code: 'NOT_FOUND' };
      }
      return { success: false, error: 'Error al obtener el pedido' };
    }

    const order = await response.json();

    // VALIDACIÓN DE OWNERSHIP: Verificar que el vendedor puede ver este pedido
    // El pedido tiene un meta campo _dokan_vendor_id con el ID del vendedor
    const vendorId = order.meta_data?.find((m: { key: string }) => m.key === '_dokan_vendor_id')?.value;

    const ownership = checkOwnership(user, vendorId);

    if (!ownership.isOwner) {
      return {
        success: false,
        error: 'No tienes permiso para ver este pedido',
        code: 'FORBIDDEN'
      };
    }

    // Transformar respuesta de WC a nuestro formato
    const orderDetails: OrderDetails = {
      id: String(order.id),
      number: order.number,
      date_created: order.date_created,
      date_modified: order.date_modified,
      status: order.status,
      currency: order.currency,
      total: parseFloat(order.total),
      subtotal: parseFloat(order.subtotal),
      shipping_total: parseFloat(order.shipping_total),
      tax_total: parseFloat(order.total_tax),
      payment_method: order.payment_method,
      payment_method_title: order.payment_method_title,
      billing: order.billing,
      shipping: order.shipping,
      customer: {
        id: order.customer_id,
        email: order.billing.email,
        first_name: order.billing.first_name,
        last_name: order.billing.last_name,
        phone: order.billing.phone,
      },
      line_items: order.line_items.map((item: Record<string, unknown>) => ({
        id: item.id as number,
        name: item.name as string,
        product_id: item.product_id as number,
        quantity: item.quantity as number,
        price: parseFloat(item.price as string),
        total: parseFloat(item.total as string),
        sku: item.sku as string | undefined,
        image: (item.image as { src?: string })?.src,
      })),
      shipping_lines: order.shipping_lines,
      notes: [],
      customer_note: order.customer_note || '',
    };

    return { success: true, order: orderDetails };
  } catch (error) {
    console.error('Error fetching order:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ACTUALIZAR ESTADO DEL PEDIDO
 * ═══════════════════════════════════════════════════════════════════════════
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<OrderActionResult> {
  try {
    const key = process.env.NEXT_PUBLIC_WP_CS_KEY;
    const secret = process.env.NEXT_PUBLIC_WP_CS_SECRET;

    if (!key || !secret) {
      return { success: false, error: 'Credenciales no configuradas' };
    }

    const auth = Buffer.from(`${key}:${secret}`).toString('base64');
    const wcUrl = API_CONFIG.wcApiUrl;

    const response = await fetch(`${wcUrl}/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Error al actualizar estado' };
    }

    // Revalidar cachés relacionados
    revalidateTag(`order-${orderId}`, 'max');
    revalidateTag('seller-orders', 'max');
    revalidateTag('seller-catalog', 'max');
    revalidatePath('/seller/orders');
    revalidatePath('/seller/dashboard');

    return {
      success: true,
      message: `Pedido actualizado a "${getStatusLabel(newStatus)}"`
    };
  } catch (error) {
    console.error('Error updating order:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AGREGAR NOTA AL PEDIDO
 * ═══════════════════════════════════════════════════════════════════════════
 */
export async function addOrderNote(
  orderId: string,
  note: string,
  isCustomerNote = false
): Promise<OrderActionResult> {
  try {
    const key = process.env.NEXT_PUBLIC_WP_CS_KEY;
    const secret = process.env.NEXT_PUBLIC_WP_CS_SECRET;

    if (!key || !secret) {
      return { success: false, error: 'Credenciales no configuradas' };
    }

    const auth = Buffer.from(`${key}:${secret}`).toString('base64');
    const wcUrl = API_CONFIG.wcApiUrl;

    const response = await fetch(`${wcUrl}/orders/${orderId}/notes`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        note,
        customer_note: isCustomerNote,
      }),
    });

    if (!response.ok) {
      return { success: false, error: 'Error al agregar nota' };
    }

    revalidateTag(`order-${orderId}`, 'max');

    return { success: true, message: 'Nota agregada correctamente' };
  } catch (error) {
    return { success: false, error: 'Error de conexión' };
  }
}

