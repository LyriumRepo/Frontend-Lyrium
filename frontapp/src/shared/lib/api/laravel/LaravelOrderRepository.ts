import { Order, OrderItem, OrderStatus, ShippingInfo, TipoEnvio, ServiceOrderItem, OrderType } from '@/features/seller/sales/types';
import { IOrderRepository, OrderFilters, CreateOrderInput, UpdateOrderInput } from '../contracts/IOrderRepository';

interface BackendItem {
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    status: string;
    actions: {
        canConfirm: boolean;
        canCancel: boolean;
    };
}

interface BackendShipping {
    address: string | null;
    city: string | null;
    name: string | null;
    email: string | null;
    phone: string | null;
    postalCode: string | null;
    notes: string | null;
}

interface BackendServiceItem {
    id: string;
    serviceId: number;
    serviceName: string;
    storeId: number;
    storeName: string | null;
    specialistName: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    status: string;
    appointmentDate: string | null;
    startTime: string | null;
    endTime: string | null;
    modality: string | null;
    durationMinutes: number | null;
    serviceBookingId: string | null;
    createdAt: string;
    updatedAt: string;
}

interface BackendOrder {
    id: string;
    orderNumber: string;
    orderType: string;
    itemsSummary: string;
    status: string;
    globalStatus: string;
    statusLabel: string;
    paymentMethod: string | null;
    paymentStatus: string;
    paymentStatusLabel: string;
    totalQuantity: number;
    shippingType: string | null;
    trackingNumber: string | null;
    carrier: string | null;
    carrierCode?: string | null;
    carrierData?: Record<string, string> | null;
    storeName: string | null;
    shipping: BackendShipping;
    subtotal: number;
    shippingCost: number;
    taxAmount: number;
    discountAmount: number;
    total: number;
    couponCode: string | null;
    notes: string | null;
    paidAt: string | null;
    items: BackendItem[];
    serviceItems: BackendServiceItem[];
    user: { id: string; name: string; email: string; phone: string | null; documentType: string | null; documentNumber: string | null } | null;
    createdAt: string;
    updatedAt: string;
}

const PRODUCT_STATUS_STEP_MAP: Record<string, number> = {
    pending_seller: 1,
    confirmed: 2,
    processing: 3,
    shipped: 4,
    delivered: 5,
    cancelled: 0,
};

const SERVICE_STATUS_STEP_MAP: Record<string, number> = {
    pending: 1,
    confirmed: 2,
    completed: 3,
    cancelled: 0,
    no_show: 0,
};

const ADVANCE_FLOW: Record<string, string> = {
    confirmed: 'processing',
    processing: 'shipped',
    shipped: 'delivered',
    delivered: 'delivered',
};

export class LaravelOrderRepository implements IOrderRepository {
    private getBaseUrl(): string {
        return process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';
    }

    private async getAuthHeaders(): Promise<HeadersInit> {
        const token = await this.getToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    private async getToken(): Promise<string | null> {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('laravel_token');
        }
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
                Accept: 'application/json',
                ...authHeaders,
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`Laravel API Error: ${response.status}`);
        }

        return response.json();
    }

    private mapItem(item: BackendItem): OrderItem {
        return {
            id: item.id,
            name: item.productName,
            qty: item.quantity,
            price: item.unitPrice,
            status: item.status as OrderItem['status'],
            can_confirm: item.actions.canConfirm,
            can_cancel: item.actions.canCancel,
        };
    }

    private mapOrder(backend: BackendOrder): Order {
        const items = (backend.items || []).map((i) => this.mapItem(i));
        const productQty = items.reduce((sum, i) => sum + i.qty, 0);
        const serviceItems: ServiceOrderItem[] = (backend.serviceItems || []).map((s) => ({
            id: s.id,
            serviceId: s.serviceId,
            serviceName: s.serviceName,
            storeId: s.storeId,
            storeName: s.storeName,
            specialistName: s.specialistName,
            quantity: s.quantity,
            unitPrice: s.unitPrice,
            lineTotal: s.lineTotal,
            status: s.status,
            appointmentDate: s.appointmentDate,
            startTime: s.startTime,
            endTime: s.endTime,
            modality: s.modality,
            durationMinutes: s.durationMinutes,
            serviceBookingId: s.serviceBookingId,
        }));

        const serviceQty = serviceItems.reduce((sum, s) => sum + s.quantity, 0);
        const unidades = productQty + serviceQty;

        const productCurrentStep = items.length > 0
            ? Math.max(...items.map((i) => PRODUCT_STATUS_STEP_MAP[i.status] ?? 0), 0) || 1
            : 0;

        const serviceCurrentStep = serviceItems.length > 0
            ? Math.max(...serviceItems.map((s) => SERVICE_STATUS_STEP_MAP[s.status] ?? 0), 0) || 1
            : 0;

        const currentStep = productCurrentStep || serviceCurrentStep || 1;

        const fecha =
            backend.createdAt?.substring(0, 10) ||
            new Date().toISOString().substring(0, 10);

        return {
            id: backend.id,
            orderNumber: backend.orderNumber ?? backend.id,
            statusLabel: backend.statusLabel ?? '',
            fecha,
            updatedAt: backend.updatedAt ?? '',
            cliente: backend.user?.name ?? 'Cliente',
            customerEmail: backend.user?.email ?? backend.shipping?.email ?? '',
            customerPhone: backend.user?.phone ?? backend.shipping?.phone ?? '',
            customerDocument: backend.user?.documentNumber ?? '',
            customerDocumentType: backend.user?.documentType ?? '',
            dni: backend.user?.documentNumber ?? '',
            subtotal: backend.subtotal ?? 0,
            shippingCost: backend.shippingCost ?? 0,
            taxAmount: backend.taxAmount ?? 0,
            discountAmount: backend.discountAmount ?? 0,
            total: backend.total,
            unidades,
            estado: backend.status as OrderStatus,
            global_status: backend.globalStatus as OrderStatus,
            currentStep,
            productCurrentStep,
            serviceCurrentStep,
            orderType: (backend.orderType as OrderType) ?? 'product',
            itemsSummary: backend.itemsSummary ?? '',
            tipo_envio: (backend.shippingType as TipoEnvio) ?? null,
            metodo_pago: backend.paymentMethod ?? '',
            estado_pago: (backend.paymentStatus === 'paid' || backend.paymentStatus === 'verified'
                ? 'verificado'
                : 'pendiente') as 'pendiente' | 'verificado',
            paymentStatusLabel: backend.paymentStatusLabel ?? '',
            trackingNumber: backend.trackingNumber ?? null,
            storeName: backend.storeName ?? null,
            couponCode: backend.couponCode ?? null,
            notes: backend.notes ?? null,
            paidAt: backend.paidAt ?? null,
            envio: {
                direccion: backend.shipping?.address ?? '',
                carrier: backend.carrier ?? '',
                tracking: backend.trackingNumber ?? '-',
                costo: backend.shippingCost,
                city: backend.shipping?.city ?? '',
                postalCode: backend.shipping?.postalCode ?? '',
                notes: backend.shipping?.notes ?? '',
                carrierCode: backend.carrierCode ?? backend.carrier ?? null,
                carrierData: backend.carrierData ?? null,
            } as ShippingInfo,
            items,
            serviceItems,
        };
    }

    async getOrders(filters?: OrderFilters): Promise<Order[]> {
        const params = new URLSearchParams();
        if (filters?.status) params.set('status', filters.status);
        if (filters?.search) params.set('search', filters.search);
        if (filters?.dateStart) params.set('date_start', filters.dateStart);
        if (filters?.dateEnd) params.set('date_end', filters.dateEnd);

        const query = params.toString() ? `?${params.toString()}` : '';
        const raw = await this.request<any>(`/orders${query}`);
        // Backend wraps in { success: true, data: { data: [...], pagination: {...} } }
        const orders = raw?.data?.data ?? [];
        return (Array.isArray(orders) ? orders : []).map((o: any) => this.mapOrder(o as BackendOrder));
    }

    async getOrderById(id: string): Promise<Order | null> {
        try {
            const raw = await this.request<Record<string, unknown>>(`/orders/${id}`);
            // Backend wraps in { success: true, data: { ...orderResource } }
            const orderData = (raw as any)?.data ?? null;
            return orderData ? this.mapOrder(orderData as BackendOrder) : null;
        } catch {
            return null;
        }
    }

    async createOrder(input: CreateOrderInput): Promise<Order> {
        const raw = await this.request<Record<string, unknown>>('/orders', {
            method: 'POST',
            body: JSON.stringify({
                customer_id: input.customerId,
                items: input.items,
                shipping_address: input.shippingAddress,
                payment_method: input.paymentMethod,
            }),
        });
        return this.mapOrder((raw as any).data as BackendOrder);
    }

    async updateOrder(id: string, input: UpdateOrderInput): Promise<Order> {
        const body: Record<string, unknown> = {};
        if (input.status) body.status = input.status;
        if (input.carrier_code) body.carrier_code = input.carrier_code;
        if (input.carrier_data) body.carrier_data = input.carrier_data;
        const raw = await this.request<Record<string, unknown>>(`/orders/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
        return this.mapOrder((raw as any).data as BackendOrder);
    }

    async deleteOrder(id: string): Promise<boolean> {
        await this.request(`/orders/${id}`, {
            method: 'DELETE',
        });
        return true;
    }

    async confirmOrder(id: string): Promise<Order> {
        const raw = await this.request<Record<string, unknown>>(`/orders/${id}/confirm`, {
            method: 'PUT',
        });
        return this.mapOrder((raw as any).data as BackendOrder);
    }

    async advanceOrderStep(id: string): Promise<Order> {
        const order = await this.getOrderById(id);
        if (!order) throw new Error('Order not found');

        if (order.estado === 'pending_seller') {
            return this.confirmOrder(id);
        }

        const newStatus = ADVANCE_FLOW[order.estado] || order.estado;
        if (newStatus === order.estado) return order;

        return this.updateOrder(id, { status: newStatus as OrderStatus });
    }

    async confirmItem(orderId: string, itemId: string): Promise<Order> {
        const raw = await this.request<Record<string, unknown>>(`/orders/${orderId}/items/${itemId}/confirm`, {
            method: 'PUT',
        });
        return this.mapOrder((raw as any).data as BackendOrder);
    }

    async updateItemStatus(orderId: string, itemId: string, status: string): Promise<Order> {
        const raw = await this.request<Record<string, unknown>>(`/orders/${orderId}/items/${itemId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
        return this.mapOrder((raw as any).data as BackendOrder);
    }

    async cancelItem(orderId: string, itemId: string): Promise<Order> {
        const raw = await this.request<Record<string, unknown>>(`/orders/${orderId}/items/${itemId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'cancelled' }),
        });
        return this.mapOrder((raw as any).data as BackendOrder);
    }
}
