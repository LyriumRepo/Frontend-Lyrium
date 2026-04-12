import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import type { ApiResponse } from '@/shared/lib/api/base-client';

export type SupplierStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export interface SupplierStore {
    store_id: number;
    store_name: string;
    store_slug: string;
    relationship_type: 'primary' | 'secondary' | 'logistics';
    is_active: boolean;
}

export interface Supplier {
    id: number;
    name: string;
    ruc: string;
    business_name: string;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    address: string;
    category: string;
    status: SupplierStatus;
    stores: SupplierStore[];
    notes?: string;
    rating?: number;
    created_at: string;
    updated_at: string;
}

export interface CreateSupplierInput {
    name: string;
    ruc: string;
    business_name: string;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    address: string;
    category: string;
    notes?: string;
}

export interface UpdateSupplierInput {
    name?: string;
    business_name?: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    address?: string;
    category?: string;
    status?: SupplierStatus;
    notes?: string;
}

export interface SupplierStoreInput {
    store_id: number;
    relationship_type: 'primary' | 'secondary' | 'logistics';
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

export const supplierApi = {
    list: async (status?: SupplierStatus): Promise<Supplier[]> => {
        const params = status ? `?status=${status}` : '';
        const response = await request<ApiResponse<Supplier[]>>(`/suppliers${params}`);
        return response.data || [];
    },

    getById: async (id: number): Promise<Supplier | null> => {
        try {
            const response = await request<ApiResponse<Supplier>>(`/suppliers/${id}`);
            return response.data || null;
        } catch {
            return null;
        }
    },

    create: async (input: CreateSupplierInput): Promise<Supplier> => {
        const response = await request<ApiResponse<Supplier>>('/suppliers', {
            method: 'POST',
            body: JSON.stringify(input),
        });
        return response.data as Supplier;
    },

    update: async (id: number, input: UpdateSupplierInput): Promise<Supplier> => {
        const response = await request<ApiResponse<Supplier>>(`/suppliers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(input),
        });
        return response.data as Supplier;
    },

    delete: async (id: number): Promise<boolean> => {
        await request(`/suppliers/${id}`, { method: 'DELETE' });
        return true;
    },

    addStore: async (supplierId: number, store: SupplierStoreInput): Promise<Supplier> => {
        const response = await request<ApiResponse<Supplier>>(`/suppliers/${supplierId}/stores`, {
            method: 'POST',
            body: JSON.stringify(store),
        });
        return response.data as Supplier;
    },

    removeStore: async (supplierId: number, storeId: number): Promise<Supplier> => {
        const response = await request<ApiResponse<Supplier>>(`/suppliers/${supplierId}/stores/${storeId}`, {
            method: 'DELETE',
        });
        return response.data as Supplier;
    },

    updateStoreRelation: async (supplierId: number, storeId: number, relationshipType: SupplierStoreInput['relationship_type']): Promise<Supplier> => {
        const response = await request<ApiResponse<Supplier>>(`/suppliers/${supplierId}/stores/${storeId}`, {
            method: 'PUT',
            body: JSON.stringify({ relationship_type: relationshipType }),
        });
        return response.data as Supplier;
    },
};
