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

export type BlockedIpStatus = 'blocked' | 'unblocked' | 'flagged' | 'whitelisted';

export interface BlockedIpItem {
  id: number;
  ip_address: string;
  reason: string;
  status: BlockedIpStatus;
  blocked_at: string | null;
  expires_at: string | null;
  unblocked_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  blocker?: { id: number; name: string; email: string } | null;
  unblocker?: { id: number; name: string; email: string } | null;
}

export interface IpPaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface IpListResponse {
  success: boolean;
  data: {
    items: BlockedIpItem[];
    pagination: IpPaginationMeta;
  };
}

interface IpSingleResponse {
  success: boolean;
  data: BlockedIpItem;
  message?: string;
}

interface IpCreatePayload {
  ip_address: string;
  reason: string;
  status: BlockedIpStatus;
  expires_at?: string | null;
}

interface IpUpdatePayload {
  reason?: string;
  status?: BlockedIpStatus;
  expires_at?: string | null;
}

export const ipRepository = {
  list(params: {
    status?: string;
    search?: string;
    sort?: string;
    per_page?: number;
    page?: number;
  } = {}): Promise<IpListResponse> {
    const q = toQuery(params as Record<string, string | number | boolean | undefined>);
    return apiFetch(`/security/ips${q}`);
  },

  get(id: number): Promise<IpSingleResponse> {
    return apiFetch(`/security/ips/${id}`);
  },

  create(payload: IpCreatePayload): Promise<IpSingleResponse> {
    return apiFetch('/security/ips', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update(id: number, payload: IpUpdatePayload): Promise<IpSingleResponse> {
    return apiFetch(`/security/ips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  delete(id: number): Promise<{ success: boolean; message: string }> {
    return apiFetch(`/security/ips/${id}`, { method: 'DELETE' });
  },

  block(id: number, reason: string, expires_at?: string | null): Promise<IpSingleResponse> {
    return apiFetch(`/security/ips/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'blocked', reason, expires_at }),
    });
  },

  unblock(id: number): Promise<IpSingleResponse> {
    return apiFetch(`/security/ips/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'unblocked' }),
    });
  },

  whitelist(id: number, reason: string): Promise<IpSingleResponse> {
    return apiFetch(`/security/ips/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'whitelisted', reason }),
    });
  },
};
