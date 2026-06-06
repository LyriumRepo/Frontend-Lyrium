// ============================================
// LIB — API Client for Seller Plans
// Uses Laravel API URL
// ============================================

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';
const API_BASE = LARAVEL_API_URL;

// ─── Token helper: lee vía /api/auth-token (Route Handler de Next.js) ──────────
let _tokenCache: { value: string | null; ts: number } | null = null;

async function getAuthToken(): Promise<string | null> {
  const now = Date.now();
  if (_tokenCache && now - _tokenCache.ts < 30_000) {
    return _tokenCache.value;
  }
  try {
    const res = await fetch('/api/auth-token', { credentials: 'include', cache: 'no-store' });
    if (!res.ok) return null;
    const { token } = await res.json();
    const clean = token?.replace(/^["']|["']$/g, '').trim() || null;
    _tokenCache = { value: clean, ts: now };
    return clean;
  } catch {
    return null;
  }
}

async function apiCall<T = unknown>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  const res = await fetch(API_BASE + endpoint, {
    headers,
    credentials: 'include',
    ...options,
    signal: controller.signal,
  });
  clearTimeout(timeout);

  const text = await res.text();
  if (!res.ok) {
    let msg: string;
    try {
      const json = JSON.parse(text);
      msg = json.message || json.error || `HTTP ${res.status}`;
    } catch {
      msg = text || `HTTP ${res.status}`;
    }
    throw new Error(msg);
  }

  return JSON.parse(text) as T;
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

export const getMyPlanRequest = async () => {
  return apiGet<{ success: boolean; data: any }>('/stores/me/plan-request');
};

export function getSSEUrl(canal: string, usuarioId: string): string {
  return `${LARAVEL_API_URL}/events?channel=${canal}&user_id=${usuarioId}`;
}

// Post silencioso — no loggea errores (para broadcasts opcionales)
export async function silentPost(endpoint: string, data: unknown): Promise<void> {
  try {
    const token = await getAuthToken();
    await fetch((process.env.NEXT_PUBLIC_API_BASE ?? '/api') + endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
  } catch { /* silencioso */ }
}

// System Config - Colores del sistema
export const getSystemColors = async (): Promise<Record<string, string>> => {
  const response = await apiGet<{ success: boolean; data: Record<string, string> }>('/config/colors');
  return response.success ? response.data : {};
};

export const updateSystemColors = async (colors: Record<string, string>): Promise<boolean> => {
  const response = await apiPost<{ success: boolean; message?: string }>('/admin/config/colors', colors);
  return response.success;
};

export const getPublicConfig = async (): Promise<Record<string, unknown>> => {
  const response = await apiGet<{ success: boolean; data: Record<string, unknown> }>('/config/public');
  return response.success ? response.data : {};
};

export { API_BASE };