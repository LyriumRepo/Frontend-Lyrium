import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import { getAuthHeaders } from './token-store';
import type { ApiResponse } from './base-client';

export interface WishlistProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  original_price: number | null;
  image: string;
  stock: number;
  store_name: string;
  store_slug: string;
  status: string;
  sticker: string | null;
  discount_percentage: number | null;
}

export interface WishlistItem {
  id: number;
  product_id: number;
  product: WishlistProduct | null;
  created_at: string;
}

export interface CheckResult {
  in_wishlist: boolean;
  wishlist_id: number | null;
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

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const wishlistApi = {
  list: async (): Promise<WishlistItem[]> => {
    const response = await request<ApiResponse<{ data: WishlistItem[] }>>('/wishlist');
    const payload = response.data;
    return Array.isArray(payload) ? payload : (payload?.data ?? []);
  },

  add: async (productId: number): Promise<WishlistItem> => {
    const response = await request<ApiResponse<{ data: WishlistItem }>>('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    });
    const payload = response.data;
    const inner = payload && (payload as any).data;
    return inner ?? (payload as unknown as WishlistItem);
  },

  remove: async (id: number): Promise<void> => {
    await request(`/wishlist/${id}`, { method: 'DELETE' });
  },

  check: async (productId: number): Promise<CheckResult> => {
    const response = await request<ApiResponse<CheckResult>>(`/wishlist/check?product_id=${productId}`);
    return response.data ?? { in_wishlist: false, wishlist_id: null };
  },
};
