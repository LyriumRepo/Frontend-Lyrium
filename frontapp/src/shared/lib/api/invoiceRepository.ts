import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import type { ApiResponse } from '@/shared/lib/api/base-client';
import type { Voucher, CreateInvoiceInput } from '@/shared/types/invoices';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${LARAVEL_API_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        ...options,
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
}

export const invoiceApi = {
    list: async (): Promise<Voucher[]> => {
        const response = await request<ApiResponse<Voucher[]>>('/invoices');
        return response.data || [];
    },

    getById: async (id: string): Promise<Voucher | null> => {
        try {
            const response = await request<ApiResponse<Voucher>>(`/invoices/${id}`);
            return response.data || null;
        } catch {
            return null;
        }
    },

    create: async (orderId: string, input: CreateInvoiceInput): Promise<Voucher> => {
        const response = await request<ApiResponse<Voucher>>(`/orders/${orderId}/invoice`, {
            method: 'POST',
            body: JSON.stringify(input),
        });
        return response.data as Voucher;
    },
};
