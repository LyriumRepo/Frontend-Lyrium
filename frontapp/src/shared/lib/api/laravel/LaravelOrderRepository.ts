import { Order } from '@/features/seller/sales/types';
import { IOrderRepository, OrderFilters, CreateOrderInput, UpdateOrderInput } from '../contracts/IOrderRepository';

export class LaravelOrderRepository implements IOrderRepository {
    private getBaseUrl(): string {
        return process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';
    }

    private async getAuthHeaders(): Promise<HeadersInit> {
        const token = await this.getToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    private async getToken(): Promise<string | null> {
        try {
            const { cookies } = await import('next/headers');
            const cookieStore = await cookies();
            return cookieStore.get('laravel_token')?.value ?? null;
        } catch {
            return null;
        }
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const baseUrl = this.getBaseUrl();
        const authHeaders = await this.getAuthHeaders();

        const response = await fetch(`${baseUrl}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders,
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`Laravel API Error: ${response.status}`);
        }

        return response.json();
    }

    async getOrders(filters?: OrderFilters): Promise<Order[]> {
        const params = new URLSearchParams();
        if (filters?.status) params.set('status', filters.status);
        if (filters?.search) params.set('search', filters.search);
        if (filters?.dateStart) params.set('date_start', filters.dateStart);
        if (filters?.dateEnd) params.set('date_end', filters.dateEnd);
        
        const query = params.toString() ? `?${params.toString()}` : '';
        return this.request<Order[]>(`/orders${query}`);
    }

    async getOrderById(id: string): Promise<Order | null> {
        try {
            return await this.request<Order>(`/orders/${id}`);
        } catch {
            return null;
        }
    }

    async createOrder(input: CreateOrderInput): Promise<Order> {
        return this.request<Order>('/orders', {
            method: 'POST',
            body: JSON.stringify({
                customer_id: input.customerId,
                items: input.items,
                shipping_address: input.shippingAddress,
                payment_method: input.paymentMethod,
            }),
        });
    }

    async updateOrder(id: string, input: UpdateOrderInput): Promise<Order> {
        const updateData: Record<string, unknown> = {};
        if (input.status) updateData.status = input.status;
        if (input.tracking) updateData.tracking_number = input.tracking;
        if (input.notes) updateData.notes = input.notes;

        return this.request<Order>(`/orders/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });
    }

    async deleteOrder(id: string): Promise<boolean> {
        await this.request(`/orders/${id}`, {
            method: 'DELETE',
        });
        return true;
    }

    async confirmOrder(id: string): Promise<Order> {
        return this.request<Order>(`/orders/${id}/confirm`, {
            method: 'PUT',
        });
    }

    async advanceOrderStep(id: string): Promise<Order> {
        const order = await this.getOrderById(id);
        if (!order) throw new Error('Order not found');
        
        const currentStatus = order.estado;
        const statusFlow: Record<string, string> = {
            'pending_seller': 'confirmed',
            'confirmed': 'processing',
            'processing': 'shipped',
            'shipped': 'delivered',
            'delivered': 'delivered',
        };
        
        const newStatus = statusFlow[currentStatus] || currentStatus;
        
        return this.updateOrder(id, { status: newStatus as any });
    }

    async confirmItem(orderId: string, itemId: string): Promise<Order> {
        const response = await this.request<Order>(`/orders/${orderId}/items/${itemId}/confirm`, {
            method: 'PUT',
        });
        return response;
    }

    async updateItemStatus(orderId: string, itemId: string, status: string): Promise<Order> {
        const response = await this.request<Order>(`/orders/${orderId}/items/${itemId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
        return response;
    }

    async cancelItem(orderId: string, itemId: string): Promise<Order> {
        const response = await this.request<Order>(`/orders/${orderId}/items/${itemId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'cancelled' }),
        });
        return response;
    }
}
