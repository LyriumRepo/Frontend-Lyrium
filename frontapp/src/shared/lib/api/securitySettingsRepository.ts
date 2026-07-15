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

export interface SecuritySettings {
  autoblock_enabled: boolean;
  autoblock_threshold: number;
  autoblock_window_minutes: number;
  autoblock_duration_minutes: number;
  whitelist_enabled: boolean;
  max_login_attempts: number;
}

interface SettingsResponse {
  success: boolean;
  data: SecuritySettings;
  message?: string;
}

export const securitySettingsRepository = {
  get(): Promise<SettingsResponse> {
    return apiFetch('/security/settings');
  },

  update(payload: Partial<SecuritySettings>): Promise<SettingsResponse> {
    return apiFetch('/security/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  reset(): Promise<SettingsResponse> {
    return apiFetch('/security/settings/reset', { method: 'POST' });
  },
};
