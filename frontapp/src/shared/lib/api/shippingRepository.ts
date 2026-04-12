import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import type { ApiResponse } from '@/shared/lib/api/base-client';

export type ShippingMethodType = 'standard' | 'express' | 'free' | 'pickup' | 'custom';
export type ShipmentStatus = 'pending' | 'processing' | 'shipped' | 'in_transit' | 'delivered' | 'cancelled' | 'returned';

export interface ShippingZone {
    id: number;
    name: string;
    region: string;
    departments: string[];
    districts: string[];
    is_active: boolean;
}

export interface ShippingMethod {
    id: number;
    store_id: number;
    name: string;
    type: ShippingMethodType;
    description?: string;
    base_price: number;
    free_shipping_threshold?: number;
    estimated_days: number;
    max_weight_kg: number;
    is_active: boolean;
    created_at: string;
}

export interface ShippingRate {
    method_id: number;
    zone_id: number;
    price: number;
    free_shipping_threshold?: number;
    estimated_days: number;
}

export interface ShippingQuote {
    method_id: number;
    method_name: string;
    type: ShippingMethodType;
    price: number;
    estimated_days: number;
    free_shipping: boolean;
    currency: string;
}

export interface Shipment {
    id: number;
    order_id: number;
    store_id: number;
    store_name: string;
    customer_name: string;
    customer_email: string;
    shipping_address: string;
    shipping_department: string;
    shipping_province: string;
    shipping_district: string;
    method_id: number;
    method_name: string;
    tracking_number?: string;
    tracking_url?: string;
    status: ShipmentStatus;
    weight_kg?: number;
    shipped_at?: string;
    delivered_at?: string;
    events: ShipmentEvent[];
    created_at: string;
    updated_at: string;
}

export interface ShipmentEvent {
    id: number;
    status: string;
    description: string;
    location?: string;
    timestamp: string;
}

export interface ConfigureShippingInput {
    method_type: ShippingMethodType;
    base_price: number;
    free_shipping_threshold?: number;
    estimated_days: number;
    max_weight_kg: number;
    zones: number[];
}

export interface UpdateTrackingInput {
    tracking_number: string;
    tracking_url?: string;
    carrier?: string;
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

export const shippingApi = {
    listMethods: async (): Promise<ShippingMethod[]> => {
        const response = await request<ApiResponse<ShippingMethod[]>>('/shipping/methods');
        return response.data || [];
    },

    listZones: async (): Promise<ShippingZone[]> => {
        const response = await request<ApiResponse<ShippingZone[]>>('/shipping/zones');
        return response.data || [];
    },

    calculate: async (params: {
        store_id: number;
        weight_kg: number;
        department: string;
        province: string;
        district: string;
    }): Promise<ShippingQuote[]> => {
        const query = new URLSearchParams({
            store_id: String(params.store_id),
            weight_kg: String(params.weight_kg),
            department: params.department,
            province: params.province,
            district: params.district,
        }).toString();
        const response = await request<ApiResponse<ShippingQuote[]>>(`/shipping/calculate?${query}`);
        return response.data || [];
    },

    storeMethods: async (): Promise<ShippingMethod[]> => {
        const response = await request<ApiResponse<ShippingMethod[]>>('/store/shipping/methods');
        return response.data || [];
    },

    configureStore: async (input: ConfigureShippingInput): Promise<ShippingMethod> => {
        const response = await request<ApiResponse<ShippingMethod>>('/store/shipping/configure', {
            method: 'POST',
            body: JSON.stringify(input),
        });
        return response.data as ShippingMethod;
    },
};

export const shipmentApi = {
    list: async (status?: ShipmentStatus): Promise<Shipment[]> => {
        const params = status ? `?status=${status}` : '';
        const response = await request<ApiResponse<Shipment[]>>(`/shipments${params}`);
        return response.data || [];
    },

    getById: async (id: number): Promise<Shipment | null> => {
        try {
            const response = await request<ApiResponse<Shipment>>(`/shipments/${id}`);
            return response.data || null;
        } catch {
            return null;
        }
    },

    updateTracking: async (id: number, input: UpdateTrackingInput): Promise<Shipment> => {
        const response = await request<ApiResponse<Shipment>>(`/shipments/${id}/tracking`, {
            method: 'PUT',
            body: JSON.stringify(input),
        });
        return response.data as Shipment;
    },

    markAsShipped: async (id: number): Promise<Shipment> => {
        const response = await request<ApiResponse<Shipment>>(`/shipments/${id}/ship`, {
            method: 'PUT',
        });
        return response.data as Shipment;
    },

    markAsDelivered: async (id: number): Promise<Shipment> => {
        const response = await request<ApiResponse<Shipment>>(`/shipments/${id}/deliver`, {
            method: 'PUT',
        });
        return response.data as Shipment;
    },

    updateStatus: async (id: number, status: ShipmentStatus): Promise<Shipment> => {
        const response = await request<ApiResponse<Shipment>>(`/shipments/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
        return response.data as Shipment;
    },

    addEvent: async (id: number, status: string, description: string, location?: string): Promise<Shipment> => {
        const response = await request<ApiResponse<Shipment>>(`/shipments/${id}/event`, {
            method: 'POST',
            body: JSON.stringify({ status, description, location }),
        });
        return response.data as Shipment;
    },
};
