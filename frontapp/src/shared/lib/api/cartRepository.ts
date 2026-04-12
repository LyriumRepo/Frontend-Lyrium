import { LARAVEL_API_URL } from '@/shared/lib/config/flags';

export interface CartItemProduct {
  id: number;
  name: string;
  slug: string;
  image?: string;
  price: number;
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

async function getAuthHeaders(): Promise<HeadersInit> {
  if (typeof window === 'undefined') return {};
  const match = document.cookie.match(/laravel_token=([^;]+)/);
  return match ? { Authorization: `Bearer ${match[1]}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${LARAVEL_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
      ...headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

export const cartApi = {
  get: async (): Promise<CartResource> => {
    const response = await request<ApiResponse<CartResource>>('/cart');
    return response.data || {
      items: [],
      subtotal: 0,
      total: 0,
      itemCount: 0,
    };
  },

  addItem: async (productId: number, quantity = 1): Promise<CartResource> => {
    const response = await request<ApiResponse<CartResource>>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    });
    return response.data!;
  },

  updateItem: async (itemId: number, quantity: number): Promise<CartResource> => {
    const response = await request<ApiResponse<CartResource>>(`/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
    return response.data!;
  },

  removeItem: async (itemId: number): Promise<CartResource> => {
    const response = await request<ApiResponse<CartResource>>(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
    return response.data!;
  },

  clear: async (): Promise<void> => {
    await request('/cart', { method: 'DELETE' });
  },
};
