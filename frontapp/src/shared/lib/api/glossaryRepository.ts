import { LARAVEL_API_URL } from '@/shared/lib/config/flags';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface GlossaryEntry {
    id: number;
    key: string;
    description: string;
    search_patterns: string[];
    default_amount: string | null;
    account_reference: string | null;
    is_income: boolean;
    status: string;
    source: string | null;
    suggested_supplier_id: number | null;
    created_at: string;
    updated_at: string;
}

export interface CreateGlossaryEntryInput {
    key: string;
    description: string;
    search_patterns: string[];
    default_amount?: number | null;
    account_reference?: string | null;
    is_income?: boolean;
    suggested_supplier_id?: number | null;
}

export interface UpdateGlossaryEntryInput {
    key?: string;
    description?: string;
    search_patterns?: string[];
    default_amount?: number | null;
    account_reference?: string | null;
    is_income?: boolean;
    status?: string;
    suggested_supplier_id?: number | null;
}

export interface PendingTerm {
    id: number;
    term: string;
    document_type: string | null;
    source_field: string;
    status: string;
    reviewed_by: number | null;
    reviewed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

// ─── Auth helper ───────────────────────────────────────────────────────────

let _tokenCache: { value: string | null; ts: number } | null = null;

async function getAuthToken(): Promise<string | null> {
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

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...((init.headers as Record<string, string>) ?? {}),
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${LARAVEL_API_URL}${path}`, { ...init, headers });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? `HTTP Error ${res.status}`);
    }
    return res.json();
}

// ─── API ───────────────────────────────────────────────────────────────────

export const glossaryApi = {
    list: async (params?: { status?: string; search?: string; per_page?: number }): Promise<PaginatedResponse<GlossaryEntry>> => {
        const q = new URLSearchParams();
        if (params?.status) q.set('status', params.status);
        if (params?.search) q.set('search', params.search);
        if (params?.per_page) q.set('per_page', String(params.per_page));
        const qs = q.toString();
        return request<PaginatedResponse<GlossaryEntry>>(`/glossary-entries${qs ? `?${qs}` : ''}`);
    },

    getById: async (id: number): Promise<GlossaryEntry> => {
        return request<GlossaryEntry>(`/glossary-entries/${id}`);
    },

    create: async (input: CreateGlossaryEntryInput): Promise<GlossaryEntry> => {
        return request<GlossaryEntry>('/glossary-entries', {
            method: 'POST',
            body: JSON.stringify(input),
        });
    },

    update: async (id: number, input: UpdateGlossaryEntryInput): Promise<GlossaryEntry> => {
        return request<GlossaryEntry>(`/glossary-entries/${id}`, {
            method: 'PUT',
            body: JSON.stringify(input),
        });
    },

    delete: async (id: number): Promise<void> => {
        await request(`/glossary-entries/${id}`, { method: 'DELETE' });
    },

    // ── Pending terms ──

    pendingTerms: async (): Promise<PaginatedResponse<PendingTerm>> => {
        return request<PaginatedResponse<PendingTerm>>('/glossary-entries/pending/terms');
    },

    approvePending: async (id: number, input: {
        key: string;
        description: string;
        search_patterns?: string[];
        default_amount?: number | null;
        account_reference?: string | null;
        is_income?: boolean;
        suggested_supplier_id?: number | null;
    }): Promise<void> => {
        await request(`/glossary-entries/pending/${id}/approve`, {
            method: 'POST',
            body: JSON.stringify(input),
        });
    },

    dismissPending: async (id: number): Promise<void> => {
        await request(`/glossary-entries/pending/${id}/dismiss`, { method: 'POST' });
    },

    dismissAllPending: async (): Promise<void> => {
        await request('/glossary-entries/pending/dismiss-all', { method: 'POST' });
    },
};
