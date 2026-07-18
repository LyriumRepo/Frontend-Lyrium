import { LARAVEL_API_URL } from '@/shared/lib/config/flags';

let _tokenCache: { value: string | null; ts: number } | null = null;

async function getToken(): Promise<string | null> {
  const now = Date.now();
  if (_tokenCache && now - _tokenCache.ts < 30_000) return _tokenCache.value;
  try {
    const res = await fetch('/api/auth-token', { credentials: 'include', cache: 'no-store' });
    if (!res.ok) return null;
    const { token } = await res.json();
    const clean = token?.replace(/^["']|["']$/g, '').trim() || null;
    _tokenCache = { value: clean, ts: now };
    return clean;
  } catch { return null; }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${LARAVEL_API_URL}${path}`, {
    ...options, credentials: 'include',
    headers: {
      'Content-Type': 'application/json', Accept: 'application/json',
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

export type ProtectionRuleType = 'rate_limit' | 'ip_block' | 'geo' | 'device' | 'custom';
export type ProtectionRuleStatus = 'active' | 'inactive' | 'triggered';
export type ProtectionRuleSeverity = 'info' | 'warning' | 'critical';

export interface ProtectionRuleItem {
  id: number;
  name: string;
  type: ProtectionRuleType;
  pattern: string | null;
  severity: ProtectionRuleSeverity;
  status: ProtectionRuleStatus;
  priority: number;
  description: string | null;
  config: Record<string, unknown> | null;
  triggered_at: string | null;
  trigger_count: number;
  created_at: string;
  updated_at: string;
  creator?: { id: number; name: string; email: string } | null;
}

interface RuleListResponse {
  success: boolean;
  data: {
    items: ProtectionRuleItem[];
    active_count: number;
  };
}

interface RuleSingleResponse {
  success: boolean;
  data: ProtectionRuleItem;
  message?: string;
}

interface RulePayload {
  name: string;
  type: ProtectionRuleType;
  pattern?: string | null;
  severity: ProtectionRuleSeverity;
  status: ProtectionRuleStatus;
  priority?: number;
  description?: string | null;
  config?: Record<string, unknown> | null;
}

export const protectionRuleRepository = {
  list(params: { type?: string; status?: string } = {}): Promise<RuleListResponse> {
    const q = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');
    return apiFetch(`/security/protection${q ? `?${q}` : ''}`);
  },

  get(id: number): Promise<RuleSingleResponse> {
    return apiFetch(`/security/protection/${id}`);
  },

  create(payload: RulePayload): Promise<RuleSingleResponse> {
    return apiFetch('/security/protection', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update(id: number, payload: Partial<RulePayload>): Promise<RuleSingleResponse> {
    return apiFetch(`/security/protection/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  toggleStatus(id: number): Promise<RuleSingleResponse> {
    return apiFetch(`/security/protection/${id}/toggle`, { method: 'PUT' });
  },

  delete(id: number): Promise<{ success: boolean; message: string }> {
    return apiFetch(`/security/protection/${id}`, { method: 'DELETE' });
  },
};
