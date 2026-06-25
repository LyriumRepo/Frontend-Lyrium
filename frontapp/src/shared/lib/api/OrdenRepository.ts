/**
 * orderRepository.ts
 * ARCHIVO: src/shared/lib/api/OrdenRepository.ts
 *
 * CAMBIO vs versión Culqi:
 *  - Eliminado: chargeWithCulqi(), CulqiChargePayload, CulqiChargeResult
 *  - Agregado:  createIzipaySession(), getIzipayStatus(), tipos Izipay
 */

import { LARAVEL_API_URL } from '@/shared/lib/config/flags';

// ─── Tipos del backend ────────────────────────────────────────────────────────

export interface OrderShipping {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes?: string;
}

export interface OrderItemResult {
  id: string;
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  status: string;
}

export interface OrderResult {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  shipping: OrderShipping;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  items: OrderItemResult[];
  createdAt: string;
}

export interface CreateOrderPayload {
  shipping_name?: string;
  shipping_email?: string;
  shipping_phone?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_postal_code?: string;
  shipping_notes?: string;
  shipping_cost?: number;
  shipping_type?: string;
  carrier?: string;
  coupon_code?: string;
  notes?: string;
  lirios_used?: number;
  store_shipping?: Array<{ store_id: number; shipping_cost: number }>;
}

// ── Tipos Izipay ──────────────────────────────────────────────────────────────

export interface CreateIzipaySessionPayload {
  order_id: string;
  email: string;
  cart_token?: string;
}

export interface IzipaySessionResult {
  form_token: string; // Token para el Smart Form de Krypton
  order_id: string;
  order_number: string;
  amount: number; // En soles: 149.90
  amount_in_cents: number; // En céntimos: 14990
  currency: string;
  transaction_id: number; // ID local en izipay_order_transactions
}

export interface ChargeWithTokenPayload {
  order_id: string;
  payment_method_id: number;
}

export interface ChargeWithTokenResult {
  message: string;
  order_id: string;
  transaction_id: string;
  invoices_creadas: number;
}

export interface IzipayStatusResult {
  order_id: string;
  order_number: string;
  payment_status: string; // 'pending' | 'paid' | 'failed'
  total: number;
  transaction: {
    id: number;
    status: string;
    transaction_status: string;
    payment_method_type: string;
    card_brand: string | null;
    card_last4: string | null;
    updated_at: string;
  } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getAuthToken(): Promise<string | null> {
  try {
    const res = await fetch('/api/auth-token', {
      credentials: 'include',
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const { token } = await res.json();
    return token?.replace(/^["']|["']$/g, '').trim() ?? null;
  } catch {
    return null;
  }
}

async function buildHeaders(): Promise<HeadersInit> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Session-ID': getSessionId(),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = sessionStorage.getItem('cart_session_id');
  if (!sid) {
    sid = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem('cart_session_id', sid);
  }
  return sid;
}

async function post<T>(endpoint: string, body: object): Promise<T> {
  const headers = await buildHeaders();
  const res = await fetch(`${LARAVEL_API_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message ?? json.error ?? `Error ${res.status}`);
  }

  return (json.data ?? json) as T;
}

async function get<T>(endpoint: string): Promise<T> {
  const headers = await buildHeaders();
  const res = await fetch(`${LARAVEL_API_URL}${endpoint}`, {
    method: 'GET',
    headers,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? `Error ${res.status}`);
  return (json.data ?? json) as T;
}

// ─── API pública ──────────────────────────────────────────────────────────────

export const orderApi = {
  /**
   * Crea la orden en el backend desde el carrito del usuario.
   */
  createOrder(payload: CreateOrderPayload): Promise<OrderResult> {
    return post<OrderResult>('/orders', payload);
  },

  /**
   * Crea una sesión de pago en Izipay.
   * Devuelve el formToken para cargar el Smart Form de Krypton.
   *
   * Reemplaza: chargeWithCulqi()
   */
  createIzipaySession(
    payload: CreateIzipaySessionPayload,
  ): Promise<IzipaySessionResult> {
    return post<IzipaySessionResult>(
      '/payments/izipay/create-session',
      payload,
    );
  },

  /**
   * Consulta el estado de pago de una orden.
   * Útil para polling si el webhook de Izipay tarda.
   */
  getIzipayStatus(orderId: string): Promise<IzipayStatusResult> {
    return get<IzipayStatusResult>(`/payments/izipay/status/${orderId}`);
  },

  chargeWithToken(payload: ChargeWithTokenPayload): Promise<ChargeWithTokenResult> {
    return post<ChargeWithTokenResult>('/payments/izipay/charge-with-token', payload);
  },

  /**
   * Fallback de confirmación cuando el webhook de Izipay no llega (dev/localhost).
   * Si el webhook ya procesó el pago devuelve 400 — ignorar silenciosamente.
   */
  confirmIzipayPayment(orderId: string): Promise<{ message: string; order_id: string }> {
    return post<{ message: string; order_id: string }>(
      `/payments/izipay/confirm/${orderId}`,
      {},
    );
  },
};
