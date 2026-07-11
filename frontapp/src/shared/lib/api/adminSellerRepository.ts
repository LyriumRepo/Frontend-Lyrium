/**
 * adminSellerRepository.ts
 * Repositorio para el panel de control de vendedores.
 * Compatible con cookie HttpOnly — lee el token via /api/auth-token (server-side).
 */

import { LARAVEL_API_URL } from '@/shared/lib/config/flags';

// ─── Helper: lee el token desde el Route Handler de Next.js ──────────────────
// La cookie laravel_token es HttpOnly → JS no puede leerla directamente.
// /api/auth-token corre server-side y sí puede leerla.

// En adminSellerRepository.ts reemplaza getToken con esto:
let _tokenCache: { value: string | null; ts: number } | null = null;

async function getToken(): Promise<string | null> {
  const now = Date.now();
  if (_tokenCache && now - _tokenCache.ts < 30_000) {
    return _tokenCache.value;
  }
  // Primero intentar leer del localStorage (disponible en cliente, siempre fresco)
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('laravel_token');
    if (local) {
      _tokenCache = { value: local, ts: now };
      return local;
    }
  }
  // Fallback: cookie httpOnly via route handler (para SSR o cuando localStorage está vacío)
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

// ─── Fetch genérico ───────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getToken();

  if (process.env.NODE_ENV === 'development') {
    console.log(
      '[adminRepo] token:',
      token ? token.substring(0, 20) + '...' : 'null',
    );
    console.log('[adminRepo] url :', `${LARAVEL_API_URL}${path}`);
  }

  const res = await fetch(`${LARAVEL_API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }

  return res.json();
}

// ─── Helper: serializa params a query string ──────────────────────────────────

function toQuery(params: Record<string, string | number | undefined>): string {
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
    )
    .join('&');
  return q ? `?${q}` : '';
}

// ─── Tipos de respuesta del backend ──────────────────────────────────────────

export interface SellerStatsResponse {
  total: number;
  active: number;
  pending: number;
  alerts: number;
}

export interface SellerStoreInfo {
  id: number;
  trade_name: string;
  store_name: string | null;
  slug: string;
  logo: string | null;
  status: 'pending' | 'active' | 'suspended' | 'approved';
  profile_status: 'approved' | 'pending' | 'rejected';
  strikes: number;
  rating: number;
  total_sales: number;
  approved_at: string | null;
  has_active_contract: boolean;
}

export interface SellerListItem {
  id: number;
  username: string;
  display_name: string;
  email: string;
  phone: string | null;
  document_type: string | null;
  document_number: string | null;
  avatar: string | null;
  is_banned: boolean;
  email_verified: boolean;
  created_at: string;
  stores_count: number;
  store: SellerStoreInfo | null;
  alerts: string[]; // ['strikes', 'disputes', 'failed_payment']
  has_alerts: boolean;
}

export interface SellerListResponse {
  data: SellerListItem[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface SellerDetailResponse {
  user: {
    id: number;
    username: string;
    display_name: string;
    email: string;
    phone: string | null;
    document_type: string | null;
    document_number: string | null;
    avatar: string | null;
    is_banned: boolean;
    email_verified: boolean;
    created_at: string;
  };
  store:
    | (SellerStoreInfo & {
        ruc: string;
        razon_social: string | null;
        nombre_comercial: string | null;
        rep_legal_nombre: string | null;
        rep_legal_dni: string | null;
        commission_rate: number;
        description: string | null;
        activity: string | null;
        instagram: string | null;
        facebook: string | null;
        whatsapp: string | null;
        contracts: Array<{
          id: number;
          contract_number: string;
          status: string;
          start_date: string;
          end_date: string | null;
        }>;
      })
    | null;
  open_disputes: number;
  pending_payments: number;
}

export interface AdminProductItem {
  id: number;
  name: string;
  slug: string;
  price: string;
  status: string;
  rejection_reason: string | null;
  reviewed_at: string | null;
  created_at: string;
  store?: { id: number; name: string; slug: string };
  categories?: Array<{ id: number; name: string }>;
  images: Array<{ src: string; thumb: string; medium: string; large: string; alt: string }>;
}

export interface AdminServiceItem {
  id: number;
  name: string;
  slug: string;
  price: string;
  status: string;
  rejection_reason: string | null;
  reviewed_at: string | null;
  created_at: string;
  store?: { id: number; name: string; slug: string };
  category?: { id: number; name: string };
}

export interface AdminServicesResponse {
  success: boolean;
  data: AdminServiceItem[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface AdminProductsResponse {
  success: boolean;
  data: AdminProductItem[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

// ─── Parámetros ───────────────────────────────────────────────────────────────

export interface SellerListParams {
  search?: string;
  status?: 'active' | 'pending' | 'banned' | 'alert' | string;
  per_page?: number;
  page?: number;
}

export interface AdminProductsParams {
  status?: 'pending_review' | 'approved' | 'rejected' | 'draft';
  search?: string;
  per_page?: number;
}

export interface AdminServicesParams {
  status?: 'pending_review' | 'approved' | 'rejected';
  search?: string;
  per_page?: number;
}

// ─── Repositorio ──────────────────────────────────────────────────────────────

export const adminSellerRepository = {
  /** GET /admin/sellers/stats */
  getStats(): Promise<SellerStatsResponse> {
    return apiFetch('/admin/sellers/stats');
  },

  /** GET /admin/sellers?search=&status=&per_page= */
  getSellers(params: SellerListParams = {}): Promise<SellerListResponse> {
    const q = toQuery(params as Record<string, string | number | undefined>);
    return apiFetch(`/admin/sellers${q}`);
  },

  /** GET /admin/sellers/{id} */
  getSellerDetail(id: number): Promise<SellerDetailResponse> {
    return apiFetch(`/admin/sellers/${id}`);
  },

  /** PUT /admin/sellers/{id}/ban */
  toggleBan(
    id: number,
  ): Promise<{ id: number; is_banned: boolean; message: string }> {
    return apiFetch(`/admin/sellers/${id}/ban`, { method: 'PUT' });
  },

  /** PUT /admin/sellers/{storeId}/store-status */
  updateStoreStatus(
    storeId: number,
    status: 'active' | 'pending' | 'suspended',
  ): Promise<{ store_id: number; status: string; message: string }> {
    return apiFetch(`/admin/sellers/${storeId}/store-status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  /** GET /admin/products?status=&search=&per_page= */
  getProducts(
    params: AdminProductsParams = {},
  ): Promise<AdminProductsResponse> {
    const q = toQuery(params as Record<string, string | number | undefined>);
    return apiFetch(`/admin/products${q}`);
  },

  /** GET /admin/services?status=&search=&per_page= */
  getServices(
    params: AdminServicesParams = {},
  ): Promise<AdminServicesResponse> {
    const q = toQuery(params as Record<string, string | number | undefined>);
    return apiFetch(`/admin/services${q}`);
  },

  /** PUT /services/{id}/status */
  updateServiceStatus(
    id: number,
    status: 'approved' | 'rejected' | 'pending_review',
    reason?: string,
  ): Promise<unknown> {
    return apiFetch(`/services/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    });
  },

  /** GET /audit-logs?per_page=50 */
  getAuditLogs(params: { per_page?: number; module?: string; search?: string } = {}): Promise<{
    data: Array<{
      id: number;
      event: string;
      module: string;
      description: string;
      created_at: string;
      actor: { id: number; email: string; role: string };
      auditable?: { type: string; id: number };
    }>;
  }> {
    const q = toQuery(params as Record<string, string | number | undefined>);
    return apiFetch(`/audit-logs${q || '?per_page=50'}`);
  },

  /** PUT /products/{id}/status */
  updateProductStatus(
    id: number,
    status: 'approved' | 'rejected' | 'pending_review',
    reason?: string,
  ): Promise<unknown> {
    return apiFetch(`/products/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    });
  },
};
