import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import type { ApiResponse } from '@/shared/lib/api/base-client';

export type CouponType = 'fixed_cart' | 'percent' | 'fixed_product';
export type CouponDiscountType = 'flat' | 'percentage';

export interface Coupon {
    id: number;
    code: string;
    description: string;
    discount_type: CouponDiscountType;
    amount: number;
    minimum_amount?: number;
    maximum_amount?: number;
    usage_limit?: number;
    usage_count?: number;
    expires_at?: string;
    product_ids?: number[];
    category_ids?: number[];
    exclude_product_ids?: number[];
    is_active: boolean;
}

export interface CouponValidation {
    valid: boolean;
    message: string;
    coupon?: Coupon;
    discount_amount?: number;
}

export interface CreateCouponInput {
    code: string;
    description: string;
    discount_type: CouponDiscountType;
    amount: number;
    minimum_amount?: number;
    maximum_amount?: number;
    usage_limit?: number;
    expires_at?: string;
    product_ids?: number[];
    category_ids?: number[];
}

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

export const couponApi = {
    list: async (): Promise<Coupon[]> => {
        const response = await request<ApiResponse<Coupon[]>>('/coupons');
        return response.data || [];
    },

    getById: async (id: number): Promise<Coupon | null> => {
        try {
            const response = await request<ApiResponse<Coupon>>(`/coupons/${id}`);
            return response.data || null;
        } catch {
            return null;
        }
    },

    validate: async (code: string, orderTotal?: number): Promise<CouponValidation> => {
        const params = new URLSearchParams({ code });
        if (orderTotal) params.set('order_total', String(orderTotal));
        
        const response = await request<ApiResponse<CouponValidation>>(`/coupons/validate?${params}`);
        return response.data || { valid: false, message: 'Cupón no válido' };
    },

    create: async (input: CreateCouponInput): Promise<Coupon> => {
        const response = await request<ApiResponse<Coupon>>('/coupons', {
            method: 'POST',
            body: JSON.stringify(input),
        });
        return response.data as Coupon;
    },

    update: async (id: number, input: Partial<CreateCouponInput>): Promise<Coupon> => {
        const response = await request<ApiResponse<Coupon>>(`/coupons/${id}`, {
            method: 'PUT',
            body: JSON.stringify(input),
        });
        return response.data as Coupon;
    },

    delete: async (id: number): Promise<boolean> => {
        await request(`/coupons/${id}`, { method: 'DELETE' });
        return true;
    },
};
