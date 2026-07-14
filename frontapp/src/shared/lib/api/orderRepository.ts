import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import { getAuthHeaders } from './token-store';
import type { ApiResponse } from './base-client';

export type OrderStatus = 'pending_seller' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  country: string;
  phone?: string;
}

export interface ShippingInfo {
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  notes: string | null;
  type: string | null;
}

export interface BranchInfo {
  id: number;
  name: string;
  address: string | null;
  department: string | null;
  province: string | null;
  district: string | null;
  phone: string | null;
  hours: string | null;
  mapsUrl: string | null;
}

export interface OrderItemResource {
  id: string;
  sellerId: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  status: string;
  statusLabel: string;
  actions: { canConfirm: boolean; canCancel: boolean };
  product?: { id: string; name: string; slug: string; image: string };
  store?: { id: string; name: string; slug: string };
}

export interface OrderResource {
  id: string;
  orderNumber: string;
  status: string;
  globalStatus: string;
  statusLabel: string;
  paymentMethod: string | null;
  paymentStatus: string;
  shipping: ShippingInfo;
  branch?: BranchInfo | null;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  couponCode: string | null;
  notes: string | null;
  actions: { canCancel: boolean; canConfirm: boolean; canUpdate: boolean };
  items?: OrderItemResource[];
  user?: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  payment_method?: string;
  shipping_name?: string;
  shipping_email?: string;
  shipping_phone?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_postal_code?: string;
  shipping_notes?: string;
  shipping_type?: string;
  shipping_cost?: number;
  coupon_code?: string;
  notes?: string;
  billing_address?: OrderAddress;
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
  getActiveCount: async (): Promise<number> => {
    const response = await request<{ success: boolean; data: { count: number } }>('/orders/active-count');
    return response.data?.count ?? 0;
  },
  list: async (page = 1): Promise<{ data: OrderResource[]; pagination: { current_page: number; per_page: number; total: number; total_pages: number } }> => {
    const response = await request<ApiResponse<unknown>>(`/orders?page=${page}`);
    const payload = response.data as any;
    const list = Array.isArray(payload) ? payload : (payload?.data ?? []);
    return {
      data: list,
      pagination: payload?.pagination ?? { current_page: 1, per_page: 20, total: 0, total_pages: 0 },
    };
  },

  get: async (id: number): Promise<OrderResource | null> => {
    try {
      const response = await request<ApiResponse<unknown>>(`/orders/${id}`);
      const payload = response.data as any;
      return (payload?.data ?? payload) || null;
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
    const response = await request<ApiResponse<unknown>>(`/orders?page=${page}`);
    const payload = response.data as any;
    const list = Array.isArray(payload) ? payload : (payload?.data ?? []);
    return {
      data: list,
      pagination: payload?.pagination ?? { current_page: 1, per_page: 20, total: 0, total_pages: 0 },
    };
  },

  updateStatus: async (id: number, status: OrderStatus): Promise<OrderResource> => {
    const response = await request<ApiResponse<OrderResource>>(`/orders/${id}/status`, {
      method: 'PUT',
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

  requestReceipt: async (orderId: number): Promise<{ conversationId: string }> => {
    const response = await request<{ success: boolean; data: { id: string }; message: string }>(`/orders/${orderId}/request-receipt`, {
      method: 'POST',
    });
    return { conversationId: response.data.id };
  },

  downloadReceipt: async (orderId: number): Promise<void> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${LARAVEL_API_URL}/orders/${orderId}/receipt`, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf',
        ...headers,
      },
    });

    if (!response.ok) {
      throw new Error('Error al descargar el comprobante');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comprobante-${orderId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  downloadPaymentConfirmation: async (orderId: number): Promise<void> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${LARAVEL_API_URL}/orders/${orderId}/payment-confirmation`, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf',
        ...headers,
      },
    });

    if (!response.ok) {
      throw new Error('Error al descargar la confirmación de pago');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `confirmacion-pago-${orderId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};
