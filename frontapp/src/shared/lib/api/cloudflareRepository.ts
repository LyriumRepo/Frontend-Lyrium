import { LARAVEL_API_URL } from '@/shared/lib/config/flags';

const API_BASE = `${LARAVEL_API_URL}/admin/security/cloudflare`;

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('laravel_token') || '';

    const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...((options?.method && options.method !== 'GET') ? { 'Content-Type': 'application/json' } : {}),
    };

    const response = await fetch(url, { ...options, headers: { ...headers, ...options?.headers as Record<string, string> } });

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const message = body?.error?.message || body?.error || `HTTP ${response.status}`;
        throw new Error(message);
    }

    return response.json();
}

// ── Status ────────────────────────────────────────────────────────

export async function getStatus() {
    return fetchJson<{ success: boolean; data: import('@/features/security/cloudflare/types').CloudflareStatus }>(`${API_BASE}/status`);
}

// ── Zone ───────────────────────────────────────────────────────────

export async function getZone() {
    return fetchJson<{ success: boolean; data: { zone: import('@/features/security/cloudflare/types').CloudflareZone } }>(`${API_BASE}/zone`);
}

// ── Analytics ──────────────────────────────────────────────────────

export async function getAnalytics(since?: string, until?: string) {
    const params = new URLSearchParams();
    if (since) params.set('since', since);
    if (until) params.set('until', until);
    const qs = params.toString();
    return fetchJson<{ success: boolean; data: { analytics: import('@/features/security/cloudflare/types').CloudflareAnalytics } }>(
        `${API_BASE}/analytics${qs ? `?${qs}` : ''}`
    );
}

// ── Security ───────────────────────────────────────────────────────

export async function getSecurity(since?: string, until?: string) {
    const params = new URLSearchParams();
    if (since) params.set('since', since);
    if (until) params.set('until', until);
    const qs = params.toString();
    return fetchJson<{ success: boolean; data: { security: import('@/features/security/cloudflare/types').CloudflareSecurity } }>(
        `${API_BASE}/security${qs ? `?${qs}` : ''}`
    );
}

// ── Firewall Events ────────────────────────────────────────────────

export async function getFirewallEvents(perPage = 50, page = 1) {
    return fetchJson<{ success: boolean; data: { events: import('@/features/security/cloudflare/types').CloudflareFirewallEvent[]; total: number } }>(
        `${API_BASE}/firewall-events?per_page=${perPage}&page=${page}`
    );
}

// ── DNS Records ────────────────────────────────────────────────────

export async function getDnsRecords(search?: string) {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return fetchJson<{ success: boolean; data: { records: import('@/features/security/cloudflare/types').CloudflareDNSRecord[]; total: number } }>(
        `${API_BASE}/dns-records${qs}`
    );
}

export async function createDnsRecord(data: { type: string; name: string; content: string; ttl?: number; proxied?: boolean; comment?: string }) {
    return fetchJson<{ success: boolean; data: { record: import('@/features/security/cloudflare/types').CloudflareDNSRecord } }>(
        `${API_BASE}/dns-records`,
        { method: 'POST', body: JSON.stringify(data) }
    );
}

export async function deleteDnsRecord(recordId: string) {
    return fetchJson<{ success: boolean; data: { deleted: boolean } }>(
        `${API_BASE}/dns-records/${recordId}`,
        { method: 'DELETE' }
    );
}

// ── Cache ──────────────────────────────────────────────────────────

export async function purgeCache(type: 'everything' | 'files' | 'tags' = 'everything', files?: string[], tags?: string[]) {
    const body: Record<string, unknown> = { type };
    if (files) body.files = files;
    if (tags) body.tags = tags;
    return fetchJson<{ success: boolean; data: { purged: boolean; type: string } }>(
        `${API_BASE}/purge-cache`,
        { method: 'POST', body: JSON.stringify(body) }
    );
}

// ── Zone Settings ──────────────────────────────────────────────────

export async function getZoneSettings() {
    return fetchJson<{ success: boolean; data: { settings: Record<string, unknown>[] } }>(`${API_BASE}/settings`);
}

// ── WAF ────────────────────────────────────────────────────────────

export async function getWaf() {
    return fetchJson<{ success: boolean; data: { rulesets: unknown[] } }>(`${API_BASE}/waf`);
}

// ── Tunnels ────────────────────────────────────────────────────────

export async function getTunnels() {
    return fetchJson<{ success: boolean; data: { tunnels: unknown[] } }>(`${API_BASE}/tunnels`);
}

// ── Rate Limits ────────────────────────────────────────────────────

export async function getRateLimits() {
    return fetchJson<{ success: boolean; data: { rate_limits: unknown[] } }>(`${API_BASE}/rate-limits`);
}

// ── IP Lists ───────────────────────────────────────────────────────

export async function getIpLists() {
    return fetchJson<{ success: boolean; data: { ip_lists: unknown[] } }>(`${API_BASE}/ip-lists`);
}
