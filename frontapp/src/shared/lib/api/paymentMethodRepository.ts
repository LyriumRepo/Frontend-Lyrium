import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import { getAuthHeaders } from './token-store';
import type { ApiResponse } from './base-client';

export interface PaymentMethod {
  id: number;
  tipo_metodo: 'tarjeta' | 'yape' | 'plin';
  documento: string | null;
  titular: string;
  detalle_extra: string | null;
  is_default: boolean;
  card_token: string | null;
  card_last4: string | null;
  card_brand: string | null;
  card_exp_month: string | null;
  card_exp_year: string | null;
  token_status: string | null;
  ruc_dni: string | null;
  razon_social: string | null;
  direccion_fiscal: string | null;
  created_at: string;
  updated_at: string;
}

export interface TokenizeSession {
  mode: 'mock' | 'izipay';
  public_key: string;
  form_token: string;
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
    throw new Error(error.message || error.error || `API Error: ${response.status}`);
  }
  if (response.status === 204) return {} as T;
  const text = await response.text();
  return text ? JSON.parse(text) : {} as T;
}

export const paymentMethodApi = {
  list: async (): Promise<PaymentMethod[]> => {
    const response = await request<ApiResponse<PaymentMethod[]>>('/payment-methods');
    const data = response.data;
    return Array.isArray(data) ? data : [];
  },

  get: async (id: number): Promise<PaymentMethod | null> => {
    try {
      const response = await request<ApiResponse<PaymentMethod>>(`/payment-methods/${id}`);
      return response.data ?? null;
    } catch {
      return null;
    }
  },

  create: async (payload: Partial<PaymentMethod>): Promise<PaymentMethod> => {
    const response = await request<ApiResponse<PaymentMethod>>('/payment-methods', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.data!;
  },

  update: async (id: number, payload: Partial<PaymentMethod>): Promise<PaymentMethod> => {
    const response = await request<ApiResponse<PaymentMethod>>(`/payment-methods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return response.data!;
  },

  delete: async (id: number): Promise<void> => {
    await request<ApiResponse<null>>(`/payment-methods/${id}`, { method: 'DELETE' });
  },

  tokenize: async (): Promise<TokenizeSession> => {
    const response = await request<ApiResponse<TokenizeSession>>('/payment-methods/tokenize', {
      method: 'POST',
    });
    return response.data!;
  },
};
