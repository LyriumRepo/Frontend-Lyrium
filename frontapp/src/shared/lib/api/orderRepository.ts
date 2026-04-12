import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import type { ApiResponse } from './base-client';

export type OrderStatus = 'pending_seller' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: number;
  product_id: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
  status: OrderStatus;
  can_confirm: boolean;
  can_cancel: boolean;
}

export interface OrderAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  country: string;
  phone?: string;
}

export interface OrderResource {
  id: number;
  order_number: string;
  status: OrderStatus;
  global_status: OrderStatus;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  items: OrderItem[];
  shipping_address?: OrderAddress;
  billing_address?: OrderAddress;
  customer_name: string;
  customer_email: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderPayload {
  shipping_address?: OrderAddress;
  billing_address?: OrderAddress;
  payment_method?: string;
  notes?: string;
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

export const orderApi = {
  list: async (page = 1): Promise<{ data: OrderResource[]; pagination: { current_page: number; per_page: number; total: number; total_pages: number } }> => {
    const response = await request<ApiResponse<OrderResource[]>>(`/orders?page=${page}`);
    return {
      data: response.data || [],
      pagination: (response as unknown as { meta?: { current_page: number; per_page: number; total: number; total_pages: number } }).meta || { current_page: 1, per_page: 20, total: 0, total_pages: 0 },
    };
  },

  get: async (id: number): Promise<OrderResource | null> => {
    try {
      const response = await request<ApiResponse<OrderResource>>(`/orders/${id}`);
      return response.data || null;
    } catch {
      return null;
    }
  },

  create: async (payload: CreateOrderPayload): Promise<OrderResource> => {
    const response = await request<ApiResponse<OrderResource>>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.data!;
  },

  getMyOrders: async (page = 1): Promise<{ data: OrderResource[]; pagination: { current_page: number; per_page: number; total: number; total_pages: number } }> => {
    const response = await request<ApiResponse<OrderResource[]>>(`/customer/orders?page=${page}`);
    return {
      data: response.data || [],
      pagination: (response as unknown as { meta?: { current_page: number; per_page: number; total: number; total_pages: number } }).meta || { current_page: 1, per_page: 20, total: 0, total_pages: 0 },
    };
  },

  updateStatus: async (id: number, status: OrderStatus): Promise<OrderResource> => {
    const response = await request<ApiResponse<OrderResource>>(`/seller/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return response.data!;
  },

  confirmItem: async (orderId: number, itemId: number): Promise<OrderResource> => {
    const response = await request<ApiResponse<OrderResource>>(`/orders/${orderId}/items/${itemId}/confirm`, {
      method: 'PUT',
    });
    return response.data!;
  },

  updateItemStatus: async (orderId: number, itemId: number, status: OrderStatus): Promise<OrderResource> => {
    const response = await request<ApiResponse<OrderResource>>(`/orders/${orderId}/items/${itemId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return response.data!;
  },

  cancelItem: async (orderId: number, itemId: number): Promise<OrderResource> => {
    const response = await request<ApiResponse<OrderResource>>(`/orders/${orderId}/items/${itemId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'cancelled' }),
    });
    return response.data!;
  },
};
