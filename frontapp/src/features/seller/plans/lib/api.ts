// ============================================
// LIB — API Client for Seller Plans
// Uses Laravel API URL
// ============================================

import { getToken } from '@/shared/lib/api/token-store';

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';
const API_BASE = LARAVEL_API_URL;

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function apiCall<T = unknown>(endpoint: string, options?: RequestInit, timeoutMs = 15000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(API_BASE + endpoint, {
      signal: controller.signal,
      headers: getAuthHeaders(),
      ...options,
    });
    clearTimeout(timer);
    const text = await res.text();
    try {
      return JSON.parse(text) as T;
    } catch {
      return { success: false, message: 'Error del servidor.' } as T;
    }
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === 'AbortError') {
      return { success: false, message: 'timeout' } as T;
    }
    return { success: false, message: err instanceof Error ? err.message : 'Error desconocido' } as T;
  }
}

export function apiGet<T = unknown>(endpoint: string): Promise<T> {
  return apiCall<T>(endpoint, { method: 'GET' });
}

export function apiPost<T = unknown>(endpoint: string, data: unknown): Promise<T> {
  return apiCall<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function apiDelete<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
  return apiCall<T>(endpoint, {
    method: 'DELETE',
    body: JSON.stringify(data),
  });
}

// Plan Requests (Seller)
export const createPlanRequest = async (payload: {
  plan_id: number;
  payment_method: 'trial' | 'izipay';
  months?: number;
}) => {
  console.log('[API] Creating plan request:', payload);
  // El endpoint puede devolver: { request: {...}, message: "..." } O { success: true, request: {...} }
  const result = await apiPost<{ success?: boolean; request?: any; data?: any; message?: string }>('/plans/requests', payload);
  console.log('[API] Plan request result:', result);
  
  // Normalizar respuesta - si existe request, considerar exitoso
  const isSuccess = result.success === true || result.request !== undefined;
  return {
    success: isSuccess,
    data: result.data || result.request,
    message: result.message,
  };
};

export const createIzipayPlanSession = async (payload: {
  plan_id?: number;
  plan_slug?: string;
  months: number;
}) => {
  return apiCall<{
    success: boolean;
    form_token?: string;
    public_key?: string;
    izipay_order_id?: string;
    plan_request_id?: number;
    amount?: number;
    mode?: 'mock' | 'izipay';
    message?: string;
  }>('/payments/izipay/plan-session', { method: 'POST', body: JSON.stringify(payload) }, 30000);
};

export const getMyPlanRequest = async () => {
  return apiGet<{ success: boolean; data: any }>('/stores/me/plan-request');
};

interface AutoRenewSubscription {
  id: number;
  auto_renew: boolean;
  payment_method_id: number | null;
}

export const updateAutoRenew = async (subscriptionId: number, enabled: boolean, paymentMethodId?: number) => {
  return apiCall<{ message: string; subscription?: AutoRenewSubscription }>(`/subscriptions/${subscriptionId}/auto-renew`, {
    method: 'PUT',
    body: JSON.stringify({ enabled, ...(paymentMethodId ? { payment_method_id: paymentMethodId } : {}) }),
  });
};

// Admin - Plan Requests
export const getAllPlanRequests = async () => {
  return apiGet<{ success: boolean; data: any[] }>('/admin/plan-requests');
};

export const getPlanRequestById = async (id: number) => {
  return apiGet<{ success: boolean; data: any }>(`/admin/plan-requests/${id}`);
};

export const approvePlanRequest = async (id: number, notes?: string) => {
  return apiCall<{ success: boolean; data: any }>(`/admin/plan-requests/${id}/approve`, {
    method: 'PUT',
    body: JSON.stringify({ admin_notes: notes || '' }),
  });
};

export const rejectPlanRequest = async (id: number, notes: string) => {
  return apiCall<{ success: boolean; data: any }>(`/admin/plan-requests/${id}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ admin_notes: notes }),
  });
};

export function getSSEUrl(canal: string, usuarioId: string): string {
  return `${LARAVEL_API_URL}/events?channel=${canal}&user_id=${usuarioId}`;
}

// Post silencioso — no loggea errores (para broadcasts opcionales)
export async function silentPost(endpoint: string, data: unknown): Promise<void> {
  try {
    await fetch((process.env.NEXT_PUBLIC_API_BASE ?? '/api') + endpoint, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
  } catch { /* silencioso */ }
}

// System Config - Colores del sistema
export const getSystemColors = async (): Promise<Record<string, string>> => {
  const response = await apiGet<any>('/config/colors');
  const data = response?.data;
  return (data && typeof data === 'object' && !Array.isArray(data)) ? data : {};
};

export const updateSystemColors = async (colors: Record<string, string>): Promise<boolean> => {
  const response = await apiPost<{ success: boolean; message?: string }>('/admin/config/colors', colors);
  return response.success;
};

export const getPublicConfig = async (): Promise<Record<string, unknown>> => {
  const response = await apiGet<{ success: boolean; data: Record<string, unknown> }>('/config/public');
  return response.success ? response.data : {};
};

// Admin - Vendedores
export const getVendedores = async (): Promise<any[]> => {
  const response = await apiGet<{ success: boolean; data: any[] }>('/admin/vendedores');
  return response.success ? response.data : [];
};

export const getVendedorHistorial = async (vendedorId: number): Promise<any[]> => {
  const response = await apiGet<{ success: boolean; data: any[] }>(`/admin/vendedores/${vendedorId}/historial`);
  return response.success ? response.data : [];
};

// Admin - Planes (CRUD)
export const updatePlanStatus = async (planId: number, activo: boolean): Promise<boolean> => {
  const response = await apiPost<{ success: boolean }>(`/admin/plans/${planId}/status`, { activo });
  return response.success;
};

export const deletePlan = async (planId: number): Promise<boolean> => {
  const response = await apiDelete<{ success: boolean }>(`/admin/plans/${planId}`);
  return response.success;
};

export const updatePlanIcon = async (planId: number, icono: string): Promise<boolean> => {
  const response = await apiPost<{ success: boolean }>(`/admin/plans/${planId}/icon`, { icono });
  return response.success;
};

export const savePlan = async (planData: any): Promise<{ success: boolean; data?: any }> => {
  return apiPost<{ success: boolean; data?: any }>(`/admin/plans`, planData);
};

export const updatePlan = async (planId: number, planData: any): Promise<boolean> => {
  const response = await apiCall<{ success: boolean }>(`/admin/plans/${planId}`, {
    method: 'PUT',
    body: JSON.stringify(planData),
  });
  return response.success;
};

export const getPaymentHistory = async (filter: string): Promise<{ vendedores: any[]; totales: any }> => {
  const params = filter !== 'all' ? `?status=${filter}` : '';
  const response = await apiGet<{ success: boolean; data?: any[]; totales?: any }>(`/admin/plan-payments${params}`);
  return {
    vendedores: Array.isArray((response as any).data) ? (response as any).data : [],
    totales: (response as any).totales ?? { total_monto: 0, pagos_exitosos: 0, pagos_fallidos: 0, pagos_pending: 0 },
  };
};

export { API_BASE };