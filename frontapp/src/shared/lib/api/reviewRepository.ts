import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import type { ApiResponse } from '@/shared/lib/api/base-client';

export interface Review {
    id: number;
    product_id: number;
    product_name: string;
    customer_id: number;
    customer_name: string;
    customer_avatar?: string;
    rating: number;
    title?: string;
    content: string;
    photos?: string[];
    seller_response?: string;
    seller_response_at?: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    updated_at: string;
}

export interface CreateReviewInput {
    product_id: number;
    rating: number;
    title?: string;
    content: string;
    photos?: string[];
}

export interface UpdateReviewInput {
    rating?: number;
    title?: string;
    content?: string;
    photos?: string[];
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

export const reviewApi = {
    list: async (productId?: number): Promise<Review[]> => {
        const params = productId ? `?product_id=${productId}` : '';
        const response = await request<ApiResponse<Review[]>>(`/reviews${params}`);
        return response.data || [];
    },

    getById: async (id: number): Promise<Review | null> => {
        try {
            const response = await request<ApiResponse<Review>>(`/reviews/${id}`);
            return response.data || null;
        } catch {
            return null;
        }
    },

    create: async (input: CreateReviewInput): Promise<Review> => {
        const response = await request<ApiResponse<Review>>('/reviews', {
            method: 'POST',
            body: JSON.stringify(input),
        });
        return response.data as Review;
    },

    update: async (id: number, input: UpdateReviewInput): Promise<Review> => {
        const response = await request<ApiResponse<Review>>(`/reviews/${id}`, {
            method: 'PUT',
            body: JSON.stringify(input),
        });
        return response.data as Review;
    },

    delete: async (id: number): Promise<boolean> => {
        await request(`/reviews/${id}`, { method: 'DELETE' });
        return true;
    },

    respond: async (id: number, response_text: string): Promise<Review> => {
        const response = await request<ApiResponse<Review>>(`/reviews/${id}/respond`, {
            method: 'PUT',
            body: JSON.stringify({ response: response_text }),
        });
        return response.data as Review;
    },

    getProductReviews: async (productId: number): Promise<Review[]> => {
        const response = await request<ApiResponse<Review[]>>(`/products/${productId}/reviews`);
        return response.data || [];
    },
};
