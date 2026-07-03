/**
 * auditRepository.ts
 * Repositorio para el módulo de auditoría de seguridad.
 * Compatible con cookie HttpOnly — lee el token via /api/auth-token (server-side).
 */

import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import type {
  AuditLog,
  AuditLogFilters,
  AuditStats,
  AuditModule,
  AuditRealtimeResponse,
  PaginatedResponse,
} from '@/features/security/audit/types';

// ─── Helper: lee el token desde el Route Handler de Next.js ──────────────────

let _tokenCache: { value: string | null; ts: number } | null = null;

async function getToken(): Promise<string | null> {
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

// ─── Fetch genérico ───────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getToken();

  if (process.env.NODE_ENV === 'development') {
    console.log(
      '[auditRepo] token:',
      token ? token.substring(0, 20) + '...' : 'null',
    );
    console.log('[auditRepo] url :', `${LARAVEL_API_URL}${path}`);
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

// ─── Repositorio ──────────────────────────────────────────────────────────────

export const auditRepository = {
  /** GET /audit-logs?module=&event=&severity=&page=&per_page= */
  list(filters: AuditLogFilters = {}): Promise<PaginatedResponse<AuditLog>> {
    const q = toQuery(filters as Record<string, string | number | undefined>);
    return apiFetch(`/audit-logs${q}`);
  },

  /** GET /audit-logs/modules */
  modules(): Promise<AuditModule[]> {
    return apiFetch('/audit-logs/modules');
  },

  /** GET /audit-logs/{id} */
  get(id: number): Promise<AuditLog> {
    return apiFetch(`/audit-logs/${id}`);
  },

  /** GET /audit-logs/stats */
  stats(): Promise<AuditStats> {
    return apiFetch('/audit-logs/stats');
  },

  /** GET /security/dashboard/realtime (eventos críticos últimos 5 min) */
  realtime(): Promise<AuditRealtimeResponse> {
    return apiFetch('/security/dashboard/realtime');
  },

  /** GET /audit-logs/export?format=csv (devuelve URL para window.open) */
  getExportUrl(filters: AuditLogFilters = {}): string {
    const q = toQuery({ ...filters, format: 'csv' } as unknown as Record<
      string,
      string | number | undefined
    >);
    return `${LARAVEL_API_URL}/audit-logs/export${q}`;
  },
};
