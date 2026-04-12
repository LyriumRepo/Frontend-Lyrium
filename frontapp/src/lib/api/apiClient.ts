const API_BASE = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';

interface ApiClientOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: HeadersInit;
    body?: Record<string, unknown> | null;
}

let cachedToken: string | null = null;
let tokenExpiry = 0;

export function invalidateTokenCache() {
    cachedToken = null;
    tokenExpiry = 0;
}

async function getToken(): Promise<string | null> {
    const now = Date.now();

    if (cachedToken && tokenExpiry > now) {
        return cachedToken;
    }

    try {
        const res = await fetch('/api/auth-token', { credentials: 'same-origin' });
        if (!res.ok) return null;
        const data = await res.json();
        cachedToken = data.token ?? null;
        tokenExpiry = now + 60_000;
    } catch {
        cachedToken = null;
    }

    return cachedToken;
}

export async function apiClient<T = unknown>(
    endpoint: string,
    options: ApiClientOptions = {}
): Promise<T> {
    const token = await getToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        method: options.method ?? 'GET',
        headers: {
            ...headers,
            ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (response.status === 401) {
        invalidateTokenCache();
        throw new Error(`API Error: 401 Unauthorized`);
    }

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}
