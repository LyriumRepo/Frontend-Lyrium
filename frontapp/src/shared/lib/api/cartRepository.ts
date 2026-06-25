/**
 * cartRepository.ts
 * Repositorio del carrito — conecta con Laravel CartController
 * Soporta sesión anónima (X-Session-ID) y usuario autenticado (Bearer token)
 */

import { LARAVEL_API_URL } from '@/shared/lib/config/flags';

const LARAVEL_BASE_URL = LARAVEL_API_URL.replace(/\/api\/?$/, '');

function resolveImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `${LARAVEL_BASE_URL}${url}`;
  return url;
}

function transformCartResource(data: CartResource): CartResource {
  return {
    ...data,
    items: data.items.map((item) => ({
      ...item,
      product: {
        ...item.product,
        image: resolveImageUrl(item.product.image),
      },
    })),
  };
}

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
  store_id?:   number;
  store_name?: string;
  store_slug?: string;
  peso?:  number;
  largo?: number;
  ancho?: number;
  alto?:  number;
  origen?: {
    departamento: string;
    provincia:    string;
    distrito:     string;
  };
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

let _tokenCache: { value: string | null; ts: number } | null = null;

async function getAuthToken(): Promise<string | null> {
  const now = Date.now();
  if (_tokenCache && now - _tokenCache.ts < 30_000) {
    return _tokenCache.value;
  }
  try {
    const res = await fetch('/api/auth-token', {
      credentials: 'include',
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const { token } = await res.json();
    const clean = token?.replace(/^["']|["']$/g, '').trim() || null;
    _tokenCache = { value: clean, ts: now };
    return clean;
  } catch {
    return null;
  }
}

async function buildHeaders(): Promise<HeadersInit> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Session-ID': getSessionId(), //  SIEMPRE lo enviamos (invitado o logueado)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

// ─── Request base ─────────────────────────────────────────────────────────────

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
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
    return request<CartResource>('/cart').then(transformCartResource);
  },

  /** Agrega un producto (o incrementa cantidad si ya existe) */
  addItem(productId: number, quantity = 1): Promise<CartResource> {
    return request<CartResource>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    }).then(transformCartResource);
  },

  /** Actualiza la cantidad de un ítem (PUT /api/cart/items/{productId}) */
  updateItem(productId: number, quantity: number): Promise<CartResource> {
    return request<CartResource>(`/cart/items/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }).then(transformCartResource);
  },

  /** Elimina un ítem del carrito (DELETE /api/cart/items/{productId}) */
  removeItem(productId: number): Promise<CartResource> {
    return request<CartResource>(`/cart/items/${productId}`, {
      method: 'DELETE',
    }).then(transformCartResource);
  },

  /** Vacía el carrito completo */
  clearCart(): Promise<CartResource> {
    return request<CartResource>('/cart/clear', {
      method: 'DELETE',
    }).then(transformCartResource);
  },
};
