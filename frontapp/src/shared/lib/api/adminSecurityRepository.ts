import { LARAVEL_API_URL } from '@/shared/lib/config/flags';

let _tokenCache: { value: string | null; ts: number } | null = null;

async function getToken(): Promise<string | null> {
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

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
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

function toQuery(params: Record<string, string | number | boolean | undefined>): string {
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return q ? `?${q}` : '';
}

export interface SecurityStats {
  active_users: number;
  total_users: number;
  active_sessions: number;
  failed_logins_today: number;
  success_logins_today: number;
  banned_users: number;
  events_today: number;
  blocked_ips: number;
}

export interface SecuritySessionItem {
  id: string;
  user_id: number | null;
  ip_address: string | null;
  user_agent: string | null;
  device: string;
  browser: string;
  last_activity: string;
  is_active: boolean;
  user?: { id: number; name: string; email: string } | null;
}

export interface SecurityEventItem {
  id: number;
  event_type: string;
  description: string | null;
  ip_address: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  user?: { id: number; name: string; email: string } | null;
}

export interface LoginAttemptItem {
  id: number;
  email: string;
  ip_address: string | null;
  status: 'success' | 'failed';
  created_at: string;
  user?: { id: number; name: string; email: string } | null;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ChartDataPoint {
  date: string;
  success: number;
  failed: number;
}

export interface EventTypeCount {
  event_type: string;
  total: number;
}

export interface DailyActiveUser {
  date: string;
  active_users: number;
}

export interface SessionCount {
  date: string;
  total: number;
}

export interface SecurityChartData {
  login_attempts: ChartDataPoint[];
  events_by_type: EventTypeCount[];
  daily_active_users: DailyActiveUser[];
  sessions_by_day: SessionCount[];
}

export const adminSecurityRepository = {
  getStats(): Promise<{ data: SecurityStats }> {
    return apiFetch('/admin/security/stats');
  },

  getChartData(): Promise<{ data: SecurityChartData }> {
    return apiFetch('/admin/security/chart-data');
  },

  getSessions(params: { user_id?: number; active?: boolean; search?: string; per_page?: number; page?: number } = {}): Promise<PaginatedResponse<SecuritySessionItem>> {
    const q = toQuery(params as Record<string, string | number | boolean | undefined>);
    return apiFetch(`/admin/security/sessions${q}`);
  },

  revokeSession(id: string): Promise<{ data: null; message: string }> {
    return apiFetch(`/admin/security/sessions/${id}`, { method: 'DELETE' });
  },

  getActivity(params: { event_type?: string; user_id?: number; from?: string; to?: string; per_page?: number; page?: number } = {}): Promise<PaginatedResponse<SecurityEventItem>> {
    const q = toQuery(params as Record<string, string | number | boolean | undefined>);
    return apiFetch(`/admin/security/activity${q}`);
  },

  getLoginAttempts(params: { status?: string; email?: string; from?: string; to?: string; per_page?: number; page?: number } = {}): Promise<PaginatedResponse<LoginAttemptItem>> {
    const q = toQuery(params as Record<string, string | number | boolean | undefined>);
    return apiFetch(`/admin/security/login-attempts${q}`);
  },
};
