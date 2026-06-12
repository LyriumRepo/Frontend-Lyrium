import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import { getAuthHeaders } from './token-store';
import type { ApiResponse } from './base-client';

export interface Address {
  id: number;
  etiqueta: 'casa' | 'trabajo' | 'otro';
  destinatario: string;
  pais: string;
  departamento: string;
  provincia: string;
  distrito: string;
  avenida: string;
  numero: string;
  piso_lote: string | null;
  referencia: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
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

export const addressApi = {
  list: async (): Promise<Address[]> => {
    const response = await request<ApiResponse<Address[]>>('/addresses');
    const data = response.data;
    return Array.isArray(data) ? data : [];
  },

  get: async (id: number): Promise<Address | null> => {
    try {
      const response = await request<ApiResponse<Address>>(`/addresses/${id}`);
      return response.data ?? null;
    } catch {
      return null;
    }
  },

  create: async (payload: Partial<Address>): Promise<Address> => {
    const response = await request<ApiResponse<Address>>('/addresses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.data!;
  },

  update: async (id: number, payload: Partial<Address>): Promise<Address> => {
    const response = await request<ApiResponse<Address>>(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return response.data!;
  },

  delete: async (id: number): Promise<void> => {
    await request<ApiResponse<null>>(`/addresses/${id}`, { method: 'DELETE' });
  },

  setDefault: async (id: number): Promise<Address> => {
    const response = await request<ApiResponse<Address>>(`/addresses/${id}/default`, {
      method: 'PUT',
    });
    return response.data!;
  },
};
