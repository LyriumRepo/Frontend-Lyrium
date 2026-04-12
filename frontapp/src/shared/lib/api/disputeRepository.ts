import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import type { ApiResponse } from '@/shared/lib/api/base-client';

export type DisputeStatus = 'open' | 'under_review' | 'pending_response' | 'resolved' | 'closed' | 'rejected';
export type DisputeType = 'product_not_received' | 'defective_product' | 'refund_dispute' | 'seller_dispute' | 'payment_dispute' | 'other';
export type DisputePriority = 'low' | 'medium' | 'high' | 'urgent';
export type DisputeResolution = 'favor_customer' | 'favor_seller' | 'partial_refund' | 'store_credit' | 'pending' | 'other';

export interface DisputeMessage {
    id: number;
    dispute_id: number;
    user_id: number;
    user_name: string;
    user_role: 'customer' | 'seller' | 'admin' | 'support';
    message: string;
    attachments?: string[];
    created_at: string;
}

export interface Dispute {
    id: number;
    order_id: number;
    store_id: number;
    store_name: string;
    customer_id: number;
    customer_name: string;
    customer_email: string;
    type: DisputeType;
    status: DisputeStatus;
    priority: DisputePriority;
    title: string;
    description: string;
    evidence?: string[];
    resolution?: DisputeResolution;
    resolution_notes?: string;
    resolved_by?: number;
    resolved_at?: string;
    assigned_to?: number;
    assigned_to_name?: string;
    due_date?: string;
    messages: DisputeMessage[];
    timeline: DisputeEvent[];
    created_at: string;
    updated_at: string;
}

export interface DisputeEvent {
    id: number;
    status: string;
    description: string;
    user_name: string;
    timestamp: string;
}

export interface CreateDisputeInput {
    order_id: number;
    type: DisputeType;
    title: string;
    description: string;
    evidence?: string[];
}

export interface RespondDisputeInput {
    message: string;
    attachments?: string[];
}

export interface ResolveDisputeInput {
    resolution: DisputeResolution;
    resolution_notes?: string;
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

export const disputeApi = {
    list: async (status?: DisputeStatus, type?: DisputeType): Promise<Dispute[]> => {
        const params = new URLSearchParams();
        if (status) params.set('status', status);
        if (type) params.set('type', type);
        const query = params.toString() ? `?${params.toString()}` : '';
        const response = await request<ApiResponse<Dispute[]>>(`/disputes${query}`);
        return response.data || [];
    },

    myDisputes: async (): Promise<Dispute[]> => {
        const response = await request<ApiResponse<Dispute[]>>('/disputes/my');
        return response.data || [];
    },

    sellerDisputes: async (status?: DisputeStatus): Promise<Dispute[]> => {
        const params = status ? `?status=${status}` : '';
        const response = await request<ApiResponse<Dispute[]>>(`/disputes/seller${params}`);
        return response.data || [];
    },

    adminDisputes: async (filters?: {
        status?: DisputeStatus;
        type?: DisputeType;
        priority?: DisputePriority;
        assigned_to?: number;
    }): Promise<Dispute[]> => {
        const params = new URLSearchParams();
        if (filters?.status) params.set('status', filters.status);
        if (filters?.type) params.set('type', filters.type);
        if (filters?.priority) params.set('priority', filters.priority);
        if (filters?.assigned_to) params.set('assigned_to', String(filters.assigned_to));
        const query = params.toString() ? `?${params.toString()}` : '';
        const response = await request<ApiResponse<Dispute[]>>(`/disputes/admin${query}`);
        return response.data || [];
    },

    getById: async (id: number): Promise<Dispute | null> => {
        try {
            const response = await request<ApiResponse<Dispute>>(`/disputes/${id}`);
            return response.data || null;
        } catch {
            return null;
        }
    },

    create: async (input: CreateDisputeInput): Promise<Dispute> => {
        const response = await request<ApiResponse<Dispute>>('/disputes', {
            method: 'POST',
            body: JSON.stringify(input),
        });
        return response.data as Dispute;
    },

    respond: async (id: number, input: RespondDisputeInput): Promise<Dispute> => {
        const response = await request<ApiResponse<Dispute>>(`/disputes/${id}/respond`, {
            method: 'POST',
            body: JSON.stringify(input),
        });
        return response.data as Dispute;
    },

    assign: async (id: number, adminId: number): Promise<Dispute> => {
        const response = await request<ApiResponse<Dispute>>(`/disputes/${id}/assign`, {
            method: 'PUT',
            body: JSON.stringify({ admin_id: adminId }),
        });
        return response.data as Dispute;
    },

    setPriority: async (id: number, priority: DisputePriority): Promise<Dispute> => {
        const response = await request<ApiResponse<Dispute>>(`/disputes/${id}/priority`, {
            method: 'PUT',
            body: JSON.stringify({ priority }),
        });
        return response.data as Dispute;
    },

    resolve: async (id: number, input: ResolveDisputeInput): Promise<Dispute> => {
        const response = await request<ApiResponse<Dispute>>(`/disputes/${id}/resolve`, {
            method: 'PUT',
            body: JSON.stringify(input),
        });
        return response.data as Dispute;
    },

    close: async (id: number, notes?: string): Promise<Dispute> => {
        const response = await request<ApiResponse<Dispute>>(`/disputes/${id}/close`, {
            method: 'PUT',
            body: JSON.stringify({ notes }),
        });
        return response.data as Dispute;
    },

    reopen: async (id: number, reason: string): Promise<Dispute> => {
        const response = await request<ApiResponse<Dispute>>(`/disputes/${id}/reopen`, {
            method: 'PUT',
            body: JSON.stringify({ reason }),
        });
        return response.data as Dispute;
    },

    escalate: async (id: number, reason: string): Promise<Dispute> => {
        const response = await request<ApiResponse<Dispute>>(`/disputes/${id}/escalate`, {
            method: 'PUT',
            body: JSON.stringify({ reason }),
        });
        return response.data as Dispute;
    },
};
