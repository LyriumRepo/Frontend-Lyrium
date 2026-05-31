const API_BASE = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';

interface ApiResponse<T> {
  message?: string;
  data?: T;
  success?: boolean;
  [key: string]: unknown;
}

// ─── Token helper: lee vía /api/auth-token (Route Handler de Next.js) ──────────
// La cookie laravel_token es HttpOnly → JS no puede leerla directamente.
// /api/auth-token corre server-side y sí puede leerla.

let _tokenCache: { value: string | null; ts: number } | null = null;

async function getAuthToken(): Promise<string | null> {
  const now = Date.now();
  if (_tokenCache && now - _tokenCache.ts < 30_000) {
    return _tokenCache.value;
  }
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

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  const res = await fetch(`${API_BASE}${endpoint}`, { headers, credentials: 'include', ...options, signal: controller.signal });
  clearTimeout(timeout);
  if (!res.ok) {
    const text = await res.text();
    let msg: string;
    try {
      const json = JSON.parse(text);
      msg = json.message || json.error || `HTTP ${res.status}`;
    } catch {
      msg = text || `HTTP ${res.status}`;
    }
    throw new Error(msg);
  }
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`API error [${endpoint}]: ${text}`);
  }
}

function get<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: 'GET' });
}

function post<T>(endpoint: string, data?: unknown): Promise<T> {
  return request<T>(endpoint, { method: 'POST', body: data ? JSON.stringify(data) : undefined });
}

function put<T>(endpoint: string, data?: unknown): Promise<T> {
  return request<T>(endpoint, { method: 'PUT', body: data ? JSON.stringify(data) : undefined });
}

function del<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: 'DELETE' });
}

// ── Plans ────────────────────────────────

export interface PlanFromApi {
  id: number;
  name: string;
  slug: string;
  monthly_fee: string;
  commission_rate: string;
  has_membership_fee: boolean;
  features: { text: string; active: boolean }[] | null;
  detailed_benefits: { emoji?: string; title: string; description: string; color?: string }[] | null;
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

export async function fetchPlans(): Promise<PlanFromApi[]> {
  const res = await get<ApiResponse<PlanFromApi[]> | PlanFromApi[]>('/admin/plans');
  return Array.isArray(res) ? res : (res.data ?? []);
}

export async function fetchPlan(slug: string): Promise<PlanFromApi> {
  const res = await get<ApiResponse<PlanFromApi>>(`/admin/plans/${slug}`);
  return (res.data ?? res) as PlanFromApi;
}

export async function createPlan(data: Partial<PlanFromApi>): Promise<PlanFromApi> {
  const res = await post<ApiResponse<PlanFromApi>>('/admin/plans', data);
  return (res.data ?? res) as PlanFromApi;
}

export async function updatePlan(slug: string, data: Partial<PlanFromApi>): Promise<PlanFromApi> {
  const res = await put<ApiResponse<PlanFromApi>>(`/admin/plans/${slug}`, data);
  return (res.data ?? res) as PlanFromApi;
}

export async function deletePlan(slug: string): Promise<void> {
  await del(`/admin/plans/${slug}`);
}

export async function togglePlanActive(slug: string): Promise<PlanFromApi> {
  const res = await put<ApiResponse<PlanFromApi>>(`/admin/plans/${slug}/toggle-active`);
  return (res.data ?? res) as PlanFromApi;
}

export async function updatePlanIcon(slug: string, icon: string): Promise<PlanFromApi> {
  const res = await put<ApiResponse<PlanFromApi>>(`/admin/plans/${slug}/icon`, { icon });
  return (res.data ?? res) as PlanFromApi;
}

// ── Colors ───────────────────────────────

export interface ButtonColors {
  subscribeBg: string;
  subscribeColor: string;
  currentBg: string;
  currentColor: string;
  lockedBg: string;
  lockedColor: string;
  warningColor: string;
}

export async function fetchColors(): Promise<ButtonColors> {
  const res = await get<ApiResponse<ButtonColors>>('/admin/plan-colors');
  return (res.data ?? res) as ButtonColors;
}

export async function saveColors(colors: ButtonColors): Promise<ButtonColors> {
  const res = await put<ApiResponse<ButtonColors>>('/admin/plan-colors', colors);
  return (res.data ?? res) as ButtonColors;
}

export async function resetColors(): Promise<ButtonColors> {
  const res = await del<ApiResponse<ButtonColors>>('/admin/plan-colors');
  return (res.data ?? res) as ButtonColors;
}

// ── Plan Requests (admin) ────────────────

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
}

export async function fetchPlanRequests(params?: {
  status?: string;
  payment_status?: string;
  per_page?: number;
}): Promise<{ data: PlanRequestFromApi[]; pagination: any }> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  if (params?.payment_status) qs.set('payment_status', params.payment_status);
  if (params?.per_page) qs.set('per_page', String(params.per_page));
  const res = await get<any>(`/admin/plan-requests${qs.toString() ? `?${qs.toString()}` : ''}`);
  return res;
}

export async function approvePlanRequest(id: number): Promise<void> {
  await put(`/admin/plan-requests/${id}/approve`);
}

export async function rejectPlanRequest(id: number, notes: string): Promise<void> {
  await put(`/admin/plan-requests/${id}/reject`, { notes });
}

// ── Vendedores (admin) ───────────────────

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

export async function fetchVendedores(params?: {
  search?: string;
  status?: string;
  plan_filter?: string;
  per_page?: number;
}): Promise<{ data: VendedorFromApi[]; pagination?: any }> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.status) qs.set('status', params.status);
  if (params?.plan_filter) qs.set('plan_filter', params.plan_filter);
  if (params?.per_page) qs.set('per_page', String(params.per_page));
  const res = await get<any>(`/admin/vendedores${qs.toString() ? `?${qs.toString()}` : ''}`);
  return Array.isArray(res) ? { data: res } : res;
}

export async function fetchVendedorDetail(id: number): Promise<{
  store: VendedorFromApi;
  subscriptions: any[];
  plan_requests: any[];
}> {
  const res = await get<ApiResponse<{ store: any; subscriptions: any[]; plan_requests: any[] }>>(`/admin/vendedores/${id}`);
  return (res.data ?? res) as any;
}

export async function fetchVendedorStats(): Promise<{
  total: number;
  active: number;
  pending: number;
  con_plan: number;
  sin_plan: number;
}> {
  const res = await get<ApiResponse<any>>('/admin/vendedores/stats');
  return (res.data ?? res) as any;
}

// ── Pagos (admin) ────────────────────────

export interface PagoFromApi {
  id: number;
  store_id: number;
  store_name: string;
  seller_name: string;
  seller_email: string;
  plan: { id: number; name: string; slug: string; monthly_fee: string; color: string };
  amount: number;
  months: number;
  payment_method: string;
  payment_status: string;
  status: string;
  created_at: string;
  procesado_en: string;
}

export async function fetchPagos(params?: {
  estado?: string;
  metodo?: string;
  per_page?: number;
}): Promise<{ data: PagoFromApi[]; totales: any; pagination: any }> {
  const qs = new URLSearchParams();
  if (params?.estado) qs.set('estado', params.estado);
  if (params?.metodo) qs.set('metodo', params.metodo);
  if (params?.per_page) qs.set('per_page', String(params.per_page));
  const res = await get<any>(`/admin/pagos${qs.toString() ? `?${qs.toString()}` : ''}`);
  return res;
}

export async function fetchPagosVendedor(storeId: number): Promise<any[]> {
  const res = await get<ApiResponse<any[]>>(`/admin/pagos/vendedor/${storeId}`);
  return res.data ?? [];
}
