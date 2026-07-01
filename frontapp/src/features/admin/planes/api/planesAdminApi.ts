/**
 * planesAdminApi.ts
 * Repositorio para el panel de administración de planes.
 * Compatible con cookie HttpOnly — lee el token vía /api/auth-token (server-side).
 * Patrón idéntico a adminSellerRepository.ts
 */

import { LARAVEL_API_URL } from '@/shared/lib/config/flags';

// ─── Token helper ─────────────────────────────────────────────────────────────
// La cookie laravel_token es HttpOnly → JS no puede leerla directamente.
// /api/auth-token corre server-side y sí puede leerla.

let _tokenCache: { value: string | null; ts: number } | null = null;

async function getToken(): Promise<string | null> {
  const now = Date.now();
  if (_tokenCache && now - _tokenCache.ts < 30_000) {
    return _tokenCache.value;
  }
  // Leer del localStorage primero (siempre fresco en cliente)
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('laravel_token');
    if (local) {
      _tokenCache = { value: local, ts: now };
      return local;
    }
  }
  // Fallback: cookie httpOnly via route handler
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
      '[planesAdmin] token:',
      token ? token.substring(0, 20) + '...' : 'null',
    );
    console.log('[planesAdmin] url  :', `${LARAVEL_API_URL}${path}`);
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

// ─── Query string helper ──────────────────────────────────────────────────────

function toQuery(params: Record<string, string | number | undefined>): string {
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
    )
    .join('&');
  return q ? `?${q}` : '';
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface PlanFromApi {
  id: number;
  name: string;
  slug: string;
  monthly_fee: string;
  commission_rate: string;
  has_membership_fee: boolean;
  features: { text: string; active: boolean }[] | null;
  detailed_benefits:
    | { emoji?: string; title: string; description: string; color?: string }[]
    | null;
  is_active: boolean;
  badge: string | null;
  description: string | null;
  requires_payment: boolean;
  timeline_icon: string;
  css_color: string;
  accent_color: string;
  enable_claim_lock: boolean;
  claim_months: number;
  subscribe_button_text: string;
  currency: string;
  period: string;
  price_annual: string | null;
  price_text: string | null;
  price_subtext: string;
  use_price_mode: boolean;
  compact_visible_count: number;
  trial_success_title: string | null;
  trial_success_message: string | null;
  trial_wait_message: string | null;
  claimed_button_text: string | null;
  claimed_warning_text: string | null;
  created_at: string;
  updated_at: string;
  subscriptions_count?: number;
  active_subscriptions_count?: number;
}

export interface ButtonColors {
  subscribeBg: string;
  subscribeColor: string;
  currentBg: string;
  currentColor: string;
  lockedBg: string;
  lockedColor: string;
  warningColor: string;
}

export interface PlanRequestFromApi {
  id: number;
  store_id: number;
  store_name: string;
  seller_name: string;
  seller_email: string;
  plan: { id: number; name: string; monthly_fee: string };
  months: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  status: string;
  created_at: string;
  current_plan_slug?: string;
}

export interface VendedorFromApi {
  id: number;
  store_id: number;
  trade_name: string;
  slug: string;
  status: string;
  ruc: string;
  commission_rate: string;
  strikes: number;
  seller: { id: number; name: string; email: string } | null;
  subscription: {
    id: number;
    plan_id: number;
    plan_name: string;
    plan_slug: string;
    plan_color: string;
    monthly_fee: string;
    starts_at: string;
    ends_at: string;
    is_active: boolean;
  } | null;
  created_at: string;
}

export interface PagoFromApi {
  id: number;
  store_id: number;
  store_name: string;
  seller_name: string;
  seller_email: string;
  plan: {
    id: number;
    name: string;
    slug: string;
    monthly_fee: string;
    color: string;
  };
  amount: number;
  months: number;
  payment_method: string;
  payment_status: string;
  status: string;
  created_at: string;
  procesado_en: string;
}

// ─── Paginación genérica ──────────────────────────────────────────────────────

interface Pagination {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

// ─── Repositorio ──────────────────────────────────────────────────────────────

export const planesAdminApi = {
  // ── Plans ──────────────────────────────────────────────────────────────────

  /** GET /admin/plans */
  async fetchPlans(): Promise<PlanFromApi[]> {
    const res = await apiFetch<{ data: PlanFromApi[] } | PlanFromApi[]>(
      '/admin/plans',
    );
    return Array.isArray(res) ? res : (res.data ?? []);
  },

  /** GET /admin/plans/:slug */
  async fetchPlan(slug: string): Promise<PlanFromApi> {
    const res = await apiFetch<{ data: PlanFromApi } | PlanFromApi>(
      `/admin/plans/${slug}`,
    );
    return ('data' in res && res.data ? res.data : res) as PlanFromApi;
  },

  /** POST /admin/plans */
  async createPlan(data: Partial<PlanFromApi>): Promise<PlanFromApi> {
    const res = await apiFetch<{ data: PlanFromApi; message?: string }>(
      '/admin/plans',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
    return res.data ?? (res as unknown as PlanFromApi);
  },

  /** PUT /admin/plans/:slug */
  async updatePlan(
    slug: string,
    data: Partial<PlanFromApi>,
  ): Promise<PlanFromApi> {
    const res = await apiFetch<{ data: PlanFromApi; message?: string }>(
      `/admin/plans/${slug}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
    );
    return res.data ?? (res as unknown as PlanFromApi);
  },

  /** DELETE /admin/plans/:slug */
  deletePlan(slug: string): Promise<void> {
    return apiFetch(`/admin/plans/${slug}`, { method: 'DELETE' });
  },

  /** PUT /admin/plans/:slug/toggle-active */
  async togglePlanActive(slug: string): Promise<PlanFromApi> {
    const res = await apiFetch<{ data: PlanFromApi; message?: string }>(
      `/admin/plans/${slug}/toggle-active`,
      { method: 'PUT' },
    );
    return res.data ?? (res as unknown as PlanFromApi);
  },

  /** PUT /admin/plans/:slug/icon */
  async updatePlanIcon(slug: string, icon: string): Promise<PlanFromApi> {
    const res = await apiFetch<{ data: PlanFromApi; message?: string }>(
      `/admin/plans/${slug}/icon`,
      { method: 'PUT', body: JSON.stringify({ icon }) },
    );
    return res.data ?? (res as unknown as PlanFromApi);
  },

  // ── Colors ─────────────────────────────────────────────────────────────────

  /** GET /admin/plan-colors */
  async fetchColors(): Promise<ButtonColors> {
    const res = await apiFetch<{ data: ButtonColors } | ButtonColors>(
      '/admin/plan-colors',
    );
    return ('data' in res && res.data ? res.data : res) as ButtonColors;
  },

  /** PUT /admin/plan-colors */
  async saveColors(colors: ButtonColors): Promise<ButtonColors> {
    const res = await apiFetch<{ data: ButtonColors; message?: string }>(
      '/admin/plan-colors',
      {
        method: 'PUT',
        body: JSON.stringify(colors),
      },
    );
    return res.data ?? (res as unknown as ButtonColors);
  },

  /** DELETE /admin/plan-colors */
  async resetColors(): Promise<ButtonColors> {
    const res = await apiFetch<{ data: ButtonColors; message?: string }>(
      '/admin/plan-colors',
      {
        method: 'DELETE',
      },
    );
    return res.data ?? (res as unknown as ButtonColors);
  },

  // ── Plan Requests ──────────────────────────────────────────────────────────

  /** GET /admin/plan-requests */
  fetchPlanRequests(
    params: {
      status?: string;
      payment_status?: string;
      per_page?: number;
    } = {},
  ): Promise<{ data: PlanRequestFromApi[]; pagination: Pagination }> {
    return apiFetch(`/admin/plan-requests${toQuery(params)}`);
  },

  /** PUT /admin/plan-requests/:id/approve */
  approvePlanRequest(id: number): Promise<{ message: string }> {
    return apiFetch(`/admin/plan-requests/${id}/approve`, { method: 'PUT' });
  },

  /** PUT /admin/plan-requests/:id/reject */
  rejectPlanRequest(id: number, notes: string): Promise<{ message: string }> {
    return apiFetch(`/admin/plan-requests/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
    });
  },

  // ── Vendedores ─────────────────────────────────────────────────────────────

  /** GET /admin/vendedores */
  fetchVendedores(
    params: {
      search?: string;
      status?: string;
      plan_filter?: string;
      per_page?: number;
    } = {},
  ): Promise<{ data: VendedorFromApi[]; pagination?: Pagination }> {
    return apiFetch(`/admin/vendedores${toQuery(params)}`);
  },

  /** GET /admin/vendedores/stats */
  fetchVendedorStats(): Promise<{
    total: number;
    active: number;
    pending: number;
    con_plan: number;
    sin_plan: number;
  }> {
    return apiFetch('/admin/vendedores/stats');
  },

  /** GET /admin/vendedores/:id/historial */
  async fetchVendedorDetail(id: number): Promise<{
    data: any[];
  }> {
    return apiFetch<{ data: any[] }>(`/admin/vendedores/${id}/historial`);
  },

  // ── Pagos ──────────────────────────────────────────────────────────────────

  /** GET /admin/pagos */
  fetchPagos(
    params: {
      estado?: string;
      metodo?: string;
      per_page?: number;
    } = {},
  ): Promise<{ data: PagoFromApi[]; totales: any; pagination: Pagination }> {
    return apiFetch(`/admin/pagos${toQuery(params)}`);
  },

  /** GET /admin/pagos/vendedor/:storeId */
  async fetchPagosVendedor(storeId: number): Promise<any[]> {
    const res = await apiFetch<{ data: any[] } | any[]>(
      `/admin/pagos/vendedor/${storeId}`,
    );
    return Array.isArray(res) ? res : (res.data ?? []);
  },
};

// Re-exportar las funciones sueltas para compatibilidad con usePlanesAdmin.ts
// (que hace `import * as api from '...'`)
export const fetchPlans = () => planesAdminApi.fetchPlans();
export const fetchPlan = (slug: string) => planesAdminApi.fetchPlan(slug);
export const createPlan = (data: Partial<PlanFromApi>) =>
  planesAdminApi.createPlan(data);
export const updatePlan = (slug: string, data: Partial<PlanFromApi>) =>
  planesAdminApi.updatePlan(slug, data);
export const deletePlan = (slug: string) => planesAdminApi.deletePlan(slug);
export const togglePlanActive = (slug: string) =>
  planesAdminApi.togglePlanActive(slug);
export const updatePlanIcon = (slug: string, icon: string) =>
  planesAdminApi.updatePlanIcon(slug, icon);
export const fetchColors = () => planesAdminApi.fetchColors();
export const saveColors = (c: ButtonColors) => planesAdminApi.saveColors(c);
export const resetColors = () => planesAdminApi.resetColors();
export const fetchPlanRequests = (
  p?: Parameters<typeof planesAdminApi.fetchPlanRequests>[0],
) => planesAdminApi.fetchPlanRequests(p);
export const approvePlanRequest = (id: number) =>
  planesAdminApi.approvePlanRequest(id);
export const rejectPlanRequest = (id: number, notes: string) =>
  planesAdminApi.rejectPlanRequest(id, notes);
export const fetchVendedores = (
  p?: Parameters<typeof planesAdminApi.fetchVendedores>[0],
) => planesAdminApi.fetchVendedores(p);
export const fetchVendedorStats = () => planesAdminApi.fetchVendedorStats();
export const fetchVendedorDetail = (id: number) =>
  planesAdminApi.fetchVendedorDetail(id);
export const fetchPagos = (
  p?: Parameters<typeof planesAdminApi.fetchPagos>[0],
) => planesAdminApi.fetchPagos(p);
export const fetchPagosVendedor = (storeId: number) =>
  planesAdminApi.fetchPagosVendedor(storeId);
