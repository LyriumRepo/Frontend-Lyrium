import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import { getAuthHeaders } from '@/shared/lib/api/token-store';
import type { Voucher, InvoiceKPIs } from '@/shared/types/invoices';

async function authFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const authHeaders = await getAuthHeaders();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(authHeaders as Record<string, string>),
    };

    const response = await fetch(`${LARAVEL_API_URL}${endpoint}`, {
        ...options,
        headers: { ...headers, ...(options?.headers as Record<string, string> || {}) },
    });

    if (!response.ok) {
        const errBody = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
        throw new Error(errBody.error || errBody.message || `API Error: ${response.status}`);
    }

    return response.json();
}

export const invoiceApi = {
    list: async (params?: { status?: string; type?: string; page?: number; per_page?: number }): Promise<Voucher[]> => {
        const query = new URLSearchParams();
        if (params?.status && params.status !== 'ALL') query.set('status', params.status);
        if (params?.type && params.type !== 'ALL') query.set('type', params.type);
        if (params?.page) query.set('page', String(params.page));
        if (params?.per_page) query.set('per_page', String(params.per_page));
        const qs = query.toString() ? `?${query.toString()}` : '';
        const res = await authFetch<{ success: boolean; data: { data: Voucher[]; pagination: any } }>(`/seller/invoices${qs}`);
        return res.data?.data || [];
    },

    getById: async (id: string): Promise<Voucher | null> => {
        try {
            const res = await authFetch<{ success: boolean; data: Voucher }>(`/invoices/${id}`);
            return res.data || null;
        } catch {
            return null;
        }
    },

    kpis: async (): Promise<InvoiceKPIs> => {
        const res = await authFetch<{ success: boolean; data: InvoiceKPIs }>('/seller/invoices/kpis');
        return res.data;
    },

    /* --- Customer invoices (Mis Comprobantes) --- */

    customerList: async (params?: { type?: string; page?: number }): Promise<{ data: Voucher[]; pagination: { page: number; perPage: number; total: number; totalPages: number; hasMore: boolean } }> => {
        const query = new URLSearchParams();
        if (params?.type && params.type !== 'ALL') query.set('type', params.type);
        if (params?.page) query.set('page', String(params.page));
        const qs = query.toString() ? `?${query.toString()}` : '';
        const res = await authFetch<{ success: boolean; data: Voucher[]; pagination: any }>(`/customer/invoices${qs}`);
        return { data: res.data || [], pagination: res.pagination || { page: 1, perPage: 20, total: 0, totalPages: 0, hasMore: false } };
    },

    downloadPdf: async (id: string, filename?: string): Promise<void> => {
        const authHeaders = await getAuthHeaders();
        const response = await fetch(`${LARAVEL_API_URL}/invoices/${id}/pdf`, {
            headers: {
                'Accept': 'application/pdf',
                ...(authHeaders as Record<string, string>),
            },
        });
        if (!response.ok) throw new Error('Error al descargar el PDF');
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || `comprobante-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    shareLink: async (id: string): Promise<string | null> => {
        try {
            const res = await authFetch<{ success: boolean; data: { url: string } }>(`/invoices/${id}/share-link`);
            return res.data?.url ?? null;
        } catch {
            return null;
        }
    },

    /* --- Customer payment confirmations (Mis Confirmaciones de Pago) --- */

    customerPaymentConfirmations: async (params?: { page?: number; fechaInicio?: string; fechaFin?: string }): Promise<{ data: PaymentConfirmation[]; pagination: { page: number; perPage: number; total: number; totalPages: number; hasMore: boolean } }> => {
        const query = new URLSearchParams();
        if (params?.page) query.set('page', String(params.page));
        if (params?.fechaInicio) query.set('fecha_inicio', params.fechaInicio);
        if (params?.fechaFin) query.set('fecha_fin', params.fechaFin);
        const qs = query.toString() ? `?${query.toString()}` : '';
        const res = await authFetch<{ success: boolean; data: PaymentConfirmation[]; pagination: any }>(`/customer/payment-confirmations${qs}`);
        return { data: res.data || [], pagination: res.pagination || { page: 1, perPage: 20, total: 0, totalPages: 0, hasMore: false } };
    },

};

export interface PaymentConfirmationItem {
    id: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
}

export interface PaymentConfirmation {
    id: string;
    orderNumber: string;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    paymentStatusLabel: string;
    shipping: {
        name: string | null;
        email: string | null;
        phone: string | null;
        address: string | null;
        city: string | null;
    };
    subtotal: number;
    shippingCost: number;
    taxAmount: number;
    discountAmount: number;
    total: number;
    items: PaymentConfirmationItem[];
    paidAt: string | null;
    createdAt: string;
}
