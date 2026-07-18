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

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertStatus = 'open' | 'dismissed' | 'resolved';
export type AlertType = 'security' | 'auth' | 'system' | 'critical';

export interface SecurityAlertItem {
  id: number;
  type: AlertType;
  title: string;
  message: string | null;
  severity: AlertSeverity;
  status: AlertStatus;
  ip_address: string | null;
  created_at: string;
  resolved_at: string | null;
  audit_log_id: number | null;
  resolver?: { id: number; name: string; email: string } | null;
  audit_log?: { id: number; event: string; description: string } | null;
}

export interface AlertPaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface AlertListResponse {
  success: boolean;
  data: {
    items: SecurityAlertItem[];
    pagination: AlertPaginationMeta;
    active_count: number;
  };
}

interface AlertSingleResponse {
  success: boolean;
  data: SecurityAlertItem;
  message?: string;
}

export const alertRepository = {
  list(params: {
    status?: string;
    severity?: string;
    type?: string;
    from?: string;
    to?: string;
    sort?: string;
    per_page?: number;
    page?: number;
  } = {}): Promise<AlertListResponse> {
    const q = toQuery(params as Record<string, string | number | boolean | undefined>);
    return apiFetch(`/security/alerts${q}`);
  },

  get(id: number): Promise<AlertSingleResponse> {
    return apiFetch(`/security/alerts/${id}`);
  },

  dismiss(id: number, comment?: string): Promise<AlertSingleResponse> {
    return apiFetch(`/security/alerts/${id}/dismiss`, {
      method: 'PUT',
      body: JSON.stringify({ comment }),
    });
  },

  resolve(id: number, comment?: string): Promise<AlertSingleResponse> {
    return apiFetch(`/security/alerts/${id}/resolve`, {
      method: 'PUT',
      body: JSON.stringify({ comment }),
    });
  },
};
