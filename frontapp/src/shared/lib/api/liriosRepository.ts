import { LARAVEL_API_URL } from '@/shared/lib/config/flags';

export interface LiriosEligibility {
    balance: number;
    max_discount: number;
    eligible: boolean;
    lirios_percent: number;
    valor_venta: number;
    max_lirios_usables: number;
}

export interface LiriosBalance {
    balance: number;
}

export interface LiriosTransaction {
    id: number;
    user_id: number;
    type: 'accrue' | 'redeem';
    amount: number;
    balance_before: number;
    balance_after: number;
    reference_type: string | null;
    reference_id: number | null;
    description: string | null;
    created_at: string;
}

async function getAuthToken(): Promise<string | null> {
    try {
        const res = await fetch('/api/auth-token', {
            credentials: 'include',
            cache: 'no-store',
        });
        if (!res.ok) return null;
        const { token } = await res.json();
        return token?.replace(/^["']|["']$/g, '').trim() ?? null;
    } catch {
        return null;
    }
}

async function authHeaders(): Promise<HeadersInit> {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

async function get<T>(endpoint: string): Promise<T> {
    const headers = await authHeaders();
    const res = await fetch(`${LARAVEL_API_URL}${endpoint}`, {
        method: 'GET',
        headers,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? `Error ${res.status}`);
    return (json.data ?? json) as T;
}

export const liriosApi = {
    getBalance(): Promise<LiriosBalance> {
        return get<LiriosBalance>('/lirios/balance');
    },

    getCheckoutEligibility(cartTotal: number, storeIds?: number[]): Promise<LiriosEligibility> {
        const params = new URLSearchParams({ cart_total: cartTotal.toString() });
        if (storeIds && storeIds.length > 0) {
            params.set('store_ids', storeIds.join(','));
        }
        return get<LiriosEligibility>(`/lirios/checkout-eligibility?${params.toString()}`);
    },

    getTransactions(page: number = 1): Promise<{ data: { data: LiriosTransaction[]; current_page: number; total: number; last_page: number }; pagination: any }> {
        return get(`/lirios/transactions?page=${page}`);
    },
};
