import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import type { ApiResponse } from '@/shared/lib/api/base-client';

export type ServiceStatus = 'active' | 'inactive' | 'pending';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';
export type PaymentMethod = 'card' | 'yape' | 'plin' | 'cash' | 'store';

export interface ServiceSchedule {
    id: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
    break_start?: string;
    break_end?: string;
    is_available: boolean;
}

export interface Service {
    id: number;
    store_id: number;
    store_name: string;
    name: string;
    slug: string;
    description: string;
    duration_minutes: number;
    price: number;
    currency: string;
    category: string;
    image?: string;
    status: ServiceStatus;
    cancellation_policy: 'flexible' | 'strict' | 'no_refund';
    cancellation_hours: number;
    requires_payment: boolean;
    is_virtual: boolean;
    meeting_link?: string;
    max_bookings_per_slot: number;
    schedule: ServiceSchedule[];
    created_at: string;
    updated_at: string;
}

export interface ServiceSlot {
    date: string;
    time: string;
    available: boolean;
    remaining_slots: number;
}

export interface ServiceBooking {
    id: number;
    service_id: number;
    service_name: string;
    store_id: number;
    store_name: string;
    customer_id: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    date: string;
    start_time: string;
    end_time: string;
    status: BookingStatus;
    payment_method: PaymentMethod;
    payment_status: PaymentStatus;
    payment_amount: number;
    notes?: string;
    seller_notes?: string;
    reschedule_token?: string;
    no_show_reason?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateServiceInput {
    name: string;
    description: string;
    duration_minutes: number;
    price: number;
    category: string;
    image?: string;
    cancellation_policy: 'flexible' | 'strict' | 'no_refund';
    cancellation_hours: number;
    requires_payment: boolean;
    is_virtual: boolean;
    meeting_link?: string;
    max_bookings_per_slot: number;
    schedule: Omit<ServiceSchedule, 'id'>[];
}

export interface UpdateServiceInput extends Partial<CreateServiceInput> {
    status?: ServiceStatus;
}

export interface BookServiceInput {
    service_id: number;
    date: string;
    start_time: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    payment_method: PaymentMethod;
    notes?: string;
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

export const serviceApi = {
    list: async (status?: ServiceStatus): Promise<Service[]> => {
        const params = status ? `?status=${status}` : '';
        const response = await request<ApiResponse<Service[]>>(`/services${params}`);
        return response.data || [];
    },

    getById: async (id: number): Promise<Service | null> => {
        try {
            const response = await request<ApiResponse<Service>>(`/services/${id}`);
            return response.data || null;
        } catch {
            return null;
        }
    },

    getSlots: async (id: number, date: string): Promise<ServiceSlot[]> => {
        const response = await request<ApiResponse<ServiceSlot[]>>(`/services/${id}/slots?date=${date}`);
        return response.data || [];
    },

    create: async (input: CreateServiceInput): Promise<Service> => {
        const response = await request<ApiResponse<Service>>('/services', {
            method: 'POST',
            body: JSON.stringify(input),
        });
        return response.data as Service;
    },

    update: async (id: number, input: UpdateServiceInput): Promise<Service> => {
        const response = await request<ApiResponse<Service>>(`/services/${id}`, {
            method: 'PUT',
            body: JSON.stringify(input),
        });
        return response.data as Service;
    },

    delete: async (id: number): Promise<boolean> => {
        await request(`/services/${id}`, { method: 'DELETE' });
        return true;
    },

    book: async (serviceId: number, input: Omit<BookServiceInput, 'service_id'>): Promise<ServiceBooking> => {
        const response = await request<ApiResponse<ServiceBooking>>(`/services/${serviceId}/book`, {
            method: 'POST',
            body: JSON.stringify(input),
        });
        return response.data as ServiceBooking;
    },
};

export const bookingApi = {
    myBookings: async (): Promise<ServiceBooking[]> => {
        const response = await request<ApiResponse<ServiceBooking[]>>('/bookings/my');
        return response.data || [];
    },

    sellerBookings: async (status?: BookingStatus): Promise<ServiceBooking[]> => {
        const params = status ? `?status=${status}` : '';
        const response = await request<ApiResponse<ServiceBooking[]>>(`/bookings/seller${params}`);
        return response.data || [];
    },

    cancel: async (id: number, reason?: string): Promise<ServiceBooking> => {
        const response = await request<ApiResponse<ServiceBooking>>(`/bookings/${id}/cancel`, {
            method: 'PUT',
            body: JSON.stringify({ reason }),
        });
        return response.data as ServiceBooking;
    },

    reschedule: async (id: number, newDate: string, newTime: string, token: string): Promise<ServiceBooking> => {
        const response = await request<ApiResponse<ServiceBooking>>(`/bookings/${id}/reschedule`, {
            method: 'POST',
            body: JSON.stringify({ date: newDate, time: newTime, token }),
        });
        return response.data as ServiceBooking;
    },

    confirm: async (id: number): Promise<ServiceBooking> => {
        const response = await request<ApiResponse<ServiceBooking>>(`/bookings/${id}/confirm`, {
            method: 'PUT',
        });
        return response.data as ServiceBooking;
    },

    markNoShow: async (id: number, reason?: string): Promise<ServiceBooking> => {
        const response = await request<ApiResponse<ServiceBooking>>(`/bookings/${id}/no-show`, {
            method: 'PUT',
            body: JSON.stringify({ reason }),
        });
        return response.data as ServiceBooking;
    },

    updateNotes: async (id: number, notes: string): Promise<ServiceBooking> => {
        const response = await request<ApiResponse<ServiceBooking>>(`/bookings/${id}/notes`, {
            method: 'PUT',
            body: JSON.stringify({ notes }),
        });
        return response.data as ServiceBooking;
    },
};
