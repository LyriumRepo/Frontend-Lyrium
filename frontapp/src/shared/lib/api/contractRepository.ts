import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import type { ApiResponse } from '@/shared/lib/api/base-client';

export type ContractStatus = 'DRAFT' | 'PENDING_SIGNATURE' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
export type ContractModality = 'VIRTUAL' | 'PHYSICAL';

export interface Contract {
    id: number;
    store_id: number;
    store_name: string;
    store_ruc: string;
    representative_name: string;
    representative_dni: string;
    type: string;
    modality: ContractModality;
    status: ContractStatus;
    start_date: string;
    end_date: string;
    auto_renew: boolean;
    document_url?: string;
    signed_at?: string;
    created_at: string;
    updated_at: string;
}

export interface ContractFilters {
    status?: ContractStatus;
    search?: string;
    dateStart?: string;
    dateEnd?: string;
}

export interface CreateContractInput {
    store_id: number;
    type: string;
    modality: ContractModality;
    start_date: string;
    end_date: string;
    auto_renew?: boolean;
}

export interface UpdateContractInput {
    type?: string;
    modality?: ContractModality;
    start_date?: string;
    end_date?: string;
    auto_renew?: boolean;
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

export const contractApi = {
    list: async (filters?: ContractFilters): Promise<Contract[]> => {
        const params = new URLSearchParams();
        if (filters?.status) params.set('status', filters.status);
        if (filters?.search) params.set('search', filters.search);
        if (filters?.dateStart) params.set('date_start', filters.dateStart);
        if (filters?.dateEnd) params.set('date_end', filters.dateEnd);
        
        const query = params.toString() ? `?${params.toString()}` : '';
        const response = await request<ApiResponse<Contract[]>>(`/contracts${query}`);
        return response.data || [];
    },

    getById: async (id: number): Promise<Contract | null> => {
        try {
            const response = await request<ApiResponse<Contract>>(`/contracts/${id}`);
            return response.data || null;
        } catch {
            return null;
        }
    },

    create: async (input: CreateContractInput): Promise<Contract> => {
        const response = await request<ApiResponse<Contract>>('/contracts', {
            method: 'POST',
            body: JSON.stringify(input),
        });
        return response.data as Contract;
    },

    update: async (id: number, input: UpdateContractInput): Promise<Contract> => {
        const response = await request<ApiResponse<Contract>>(`/contracts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(input),
        });
        return response.data as Contract;
    },

    updateStatus: async (id: number, status: ContractStatus): Promise<Contract> => {
        const response = await request<ApiResponse<Contract>>(`/contracts/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
        return response.data as Contract;
    },

    sign: async (id: number): Promise<Contract> => {
        const response = await request<ApiResponse<Contract>>(`/contracts/${id}/sign`, {
            method: 'PUT',
        });
        return response.data as Contract;
    },

    cancel: async (id: number, reason?: string): Promise<Contract> => {
        const response = await request<ApiResponse<Contract>>(`/contracts/${id}/cancel`, {
            method: 'PUT',
            body: JSON.stringify({ reason }),
        });
        return response.data as Contract;
    },

    uploadDocument: async (id: number, file: File): Promise<Contract> => {
        const formData = new FormData();
        formData.append('document', file);
        
        const response = await fetch(`${LARAVEL_API_URL}/contracts/${id}/upload`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.data as Contract;
    },

    downloadDocument: async (id: number): Promise<Blob> => {
        const response = await fetch(`${LARAVEL_API_URL}/contracts/${id}/download`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return response.blob();
    },
};
