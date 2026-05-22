/**
 * cartRepository.ts
 * Repositorio del carrito — conecta con Laravel CartController
 * Soporta sesión anónima (X-Session-ID) y usuario autenticado (Bearer token)
 */

import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import { getToken } from './token-store';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface CartItemProduct {
  id: number;
  name: string;
  slug: string;
  image?: string;
  price: number;
  regular_price?: number;
  stock?: number;
}

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product: CartItemProduct;
}

export interface CartResource {
  items: CartItem[];
  subtotal: number;
  total: number;
  itemCount: number;
}

interface ApiResponse<T> {
  data?: T;
  success?: boolean;
  message?: string;
}

// ─── Helpers de sesión / auth ─────────────────────────────────────────────────

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = sessionStorage.getItem('cart_session_id');
  if (!sid) {
    sid = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem('cart_session_id', sid);
  }
  return sid;
}

async function buildHeaders(): Promise<HeadersInit> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    headers['X-Session-ID'] = getSessionId();
  }
  return headers;
}

// ─── Request base ─────────────────────────────────────────────────────────────

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await buildHeaders();
  const res = await fetch(`${LARAVEL_API_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...(options.headers ?? {}) },
  });

  const json: ApiResponse<T> = await res.json();

  if (!res.ok) {
    throw new Error(json.message ?? `Error ${res.status}`);
  }

  return (json.data ?? json) as T;
}

// ─── API pública del repositorio ──────────────────────────────────────────────

export const cartApi = {
  /** Obtiene el carrito actual */
  getCart(): Promise<CartResource> {
    return request<CartResource>('/cart');
  },

  /** Agrega un producto (o incrementa cantidad si ya existe) */
  addItem(productId: number, quantity = 1): Promise<CartResource> {
    return request<CartResource>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  },

  /** Actualiza la cantidad de un ítem (PUT /api/cart/items/{productId}) */
  updateItem(productId: number, quantity: number): Promise<CartResource> {
    return request<CartResource>(`/cart/items/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  /** Elimina un ítem del carrito (DELETE /api/cart/items/{productId}) */
  removeItem(productId: number): Promise<CartResource> {
    return request<CartResource>(`/cart/items/${productId}`, {
      method: 'DELETE',
    });
  },

  /** Vacía el carrito completo */
  clearCart(): Promise<CartResource> {
    return request<CartResource>('/cart/clear', {
      method: 'DELETE',
    });
  },
};