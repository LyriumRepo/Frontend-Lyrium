import { Order, OrderItem, OrderStatus, ShippingInfo, TipoEnvio, ServiceOrderItem, OrderType, BranchInfo } from '@/features/seller/sales/types';
import { IOrderRepository, OrderFilters, CreateOrderInput, UpdateOrderInput } from '../contracts/IOrderRepository';
import { serviceStatusToStep } from '@/shared/lib/booking/serviceFlowSteps';

interface BackendItem {
    id: string;
    sellerId: number;
    isOwn: boolean;
    store?: { id: number; name: string; slug: string } | null;
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    shippingCost: number;
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
    bookingStatus: string | null;
    customerValidatedAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

interface BackendBranch {
    id: number;
    name: string;
    address: string | null;
    department: string | null;
    province: string | null;
    district: string | null;
    phone: string | null;
    hours: string | null;
    mapsUrl: string | null;
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
    checkoutCarrier?: string | null;
    storeName: string | null;
    shipping: BackendShipping;
    branch: BackendBranch | null;
    storeShipping: Array<{ store_id: number; shipping_cost: number }> | null;
    subtotal: number;
    shippingCost: number;
    taxAmount: number;
    discountAmount: number;
    total: number;
    couponCode: string | null;
    notes: string | null;
    paidAt: string | null;
    deliveredAt?: string | null;
    customerValidatedAt?: string | null;
    validationSource?: string | null;
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

const ADVANCE_FLOW: Record<string, string> = {
    confirmed: 'processing',
    processing: 'shipped',
    shipped: 'delivered',
    delivered: 'delivered',
};

// El backend (OrderController@updateStatus / @updateItemStatus) SOLO permite
// la cadena secuencial confirmed→processing→shipped→delivered, sin saltos,
// para cualquier tipo de envío — no distingue retiro_tienda. Un flujo que
// saltara 'processing' (como este mapa hacía antes) pedía una transición que
// el backend rechaza en silencio (0 filas actualizadas), dejando el pedido
// congelado en 'confirmed' aunque el vendedor siguiera haciendo clic.
const ADVANCE_FLOW_RETiro: Record<string, string> = {
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
            let bodyText = '';
            try { bodyText = await response.text(); } catch {}
            const msg = `Laravel API Error: ${response.status} — ${bodyText.substring(0, 500)}`;
            console.error('[LaravelOrderRepository::request] ERROR', { endpoint, status: response.status, body: bodyText.substring(0, 500) });
            throw new Error(msg);
        }

        return response.json();
    }

    private normalizeStatus(status: string | null | undefined): string {
        return String(status ?? '').trim();
    }

    private normalizeTipoEnvio(raw: string | null | undefined): TipoEnvio | null {
        const v = String(raw ?? '').trim().toLowerCase();
        if (v === 'pickup' || v === 'retiro_tienda') return 'retiro_tienda';
        if (v === 'delivery' || v === 'domicilio') return 'domicilio';
        if (v === 'agencia') return 'agencia';
        return null;
    }

    private mapItem(item: BackendItem): OrderItem {
        return {
            id: item.id,
            storeId: item.sellerId,
            storeName: item.store?.name ?? '',
            isOwn: item.isOwn,
            name: item.productName,
            qty: item.quantity,
            price: item.unitPrice,
            lineTotal: item.lineTotal,
            shippingCost: item.shippingCost ?? 0,
            status: this.normalizeStatus(item.status) as OrderItem['status'],
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
            status: this.normalizeStatus(s.status),
            appointmentDate: s.appointmentDate,
            startTime: s.startTime,
            endTime: s.endTime,
            modality: s.modality,
            durationMinutes: s.durationMinutes,
            serviceBookingId: s.serviceBookingId,
            bookingStatus: this.normalizeStatus(s.bookingStatus),
            customerValidatedAt: s.customerValidatedAt ?? null,
        }));

        const serviceQty = serviceItems.reduce((sum, s) => sum + s.quantity, 0);
        const unidades = productQty + serviceQty;

        const productCurrentStep = items.length > 0
            ? Math.max(...items.map((i) => PRODUCT_STATUS_STEP_MAP[i.status] ?? 0), 0) || 1
            : 0;

        const serviceCurrentStep = serviceItems.length > 0
            ? Math.max(...serviceItems.map((s) => serviceStatusToStep(s.bookingStatus || s.status)), 0) || 1
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
            estado: this.normalizeStatus(backend.status) as OrderStatus,
            global_status: this.normalizeStatus(backend.globalStatus) as OrderStatus,
            currentStep,
            productCurrentStep,
            serviceCurrentStep,
            orderType: (backend.orderType as OrderType) ?? 'product',
            itemsSummary: backend.itemsSummary ?? '',
            tipo_envio: this.normalizeTipoEnvio(backend.shippingType),
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
            customerValidatedAt: backend.customerValidatedAt ?? null,
            validationSource: backend.validationSource ?? null,
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
                checkoutCarrier: backend.checkoutCarrier ?? null,
            } as ShippingInfo,
            branch: backend.branch ? {
                id: backend.branch.id,
                name: backend.branch.name,
                address: backend.branch.address ?? '',
                department: backend.branch.department ?? '',
                province: backend.branch.province ?? '',
                district: backend.branch.district ?? '',
                phone: backend.branch.phone ?? null,
                hours: backend.branch.hours ?? null,
                mapsUrl: backend.branch.mapsUrl ?? null,
            } as BranchInfo : null,
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

    async advanceOrderStep(id: string, section?: 'products' | 'services' | 'confirm', serviceItemId?: string): Promise<Order> {
        console.log('[LaravelOrderRepository::advanceOrderStep] START', { orderId: id, section, serviceItemId });

        if (section === 'confirm') {
            console.log('[LaravelOrderRepository::advanceOrderStep] confirm action requested, calling confirmOrder');
            return this.confirmOrder(id);
        }

        const order = await this.getOrderById(id);
        if (!order) {
            console.error('[LaravelOrderRepository::advanceOrderStep] Order not found', { orderId: id });
            throw new Error('Order not found');
        }

        console.log('[LaravelOrderRepository::advanceOrderStep] Order loaded', {
            orderId: order.id,
            orderType: order.orderType,
            estado: order.estado,
            serviceItemsCount: order.serviceItems?.length,
            serviceItems: order.serviceItems?.map(si => ({
                id: si.id,
                serviceBookingId: si.serviceBookingId,
                status: si.status,
                bookingStatus: si.bookingStatus,
                modality: si.modality,
            })),
        });

        const shouldAdvanceServices = section === 'services' || (order.orderType === 'service' && !section);
        console.log('[LaravelOrderRepository::advanceOrderStep] decision', {
            shouldAdvanceServices,
            section,
            orderType: order.orderType,
            estadoRaw: JSON.stringify(order.estado),
            firstItemStatusRaw: JSON.stringify(order.serviceItems?.[0]?.status),
            firstItemBookingStatusRaw: JSON.stringify(order.serviceItems?.[0]?.bookingStatus),
        });

        if (shouldAdvanceServices) {
            const itemsWithBooking = (order.serviceItems ?? []).filter((si) => !!si.serviceBookingId);
            console.log('[LaravelOrderRepository::advanceOrderStep] itemsWithBooking', itemsWithBooking.map(si => ({
                id: si.id,
                serviceBookingId: si.serviceBookingId,
                status: si.status,
                bookingStatus: si.bookingStatus,
                modality: si.modality,
            })));

            if (itemsWithBooking.length === 0) {
                console.error('[LaravelOrderRepository::advanceOrderStep] No serviceBookingId on any service item');
                throw new Error('No se encontró reserva para este servicio');
            }

            // A pedido can carry several service lines (mixed order with multiple bookings).
            // Each click must advance exactly ONE booking one step — same as the product flow,
            // where each item is confirmed individually. Never batch-advance every booking at once.
            const targetItem = serviceItemId
                ? itemsWithBooking.find((si) => si.id === serviceItemId || si.serviceBookingId === serviceItemId)
                : itemsWithBooking.find((si) => this.getServiceNextAction(si) !== null) ?? itemsWithBooking[0];

            if (!targetItem?.serviceBookingId) {
                console.error('[LaravelOrderRepository::advanceOrderStep] No matching service item for target', { serviceItemId });
                throw new Error('No se encontró la reserva de servicio indicada');
            }

            const action = this.getServiceNextAction(targetItem);
            console.log('[LaravelOrderRepository::advanceOrderStep] action determined', { bookingId: targetItem.serviceBookingId, action, status: targetItem.status, bookingStatus: targetItem.bookingStatus, modality: targetItem.modality });

            if (!action) {
                console.warn('[LaravelOrderRepository::advanceOrderStep] No valid next action for target booking, returning order unchanged');
                return order;
            }

            try {
                await this.request<any>(`/bookings/${targetItem.serviceBookingId}/${action}`, { method: 'PUT' });
                console.log('[LaravelOrderRepository::advanceOrderStep] booking endpoint succeeded', { bookingId: targetItem.serviceBookingId, action });
            } catch (err) {
                console.error('[LaravelOrderRepository::advanceOrderStep] booking endpoint FAILED', { bookingId: targetItem.serviceBookingId, action }, err);
                throw err;
            }

            const nextStatus = action === 'confirm' ? 'confirmed'
                : action === 'on-the-way' ? 'on_the_way'
                : action === 'complete' ? 'completed'
                : targetItem.status;

            const updatedServiceItems = order.serviceItems.map((si) =>
                si.serviceBookingId === targetItem.serviceBookingId
                    ? { ...si, status: nextStatus, bookingStatus: nextStatus }
                    : si
            );

            const maxStep = Math.max(
                ...updatedServiceItems.map((s) => serviceStatusToStep(s.bookingStatus || s.status)), 0
            );
            const newEstado = maxStep >= 3 ? 'completed'
                : maxStep >= 2 ? 'on_the_way'
                : maxStep >= 1 ? 'confirmed'
                : order.estado;

            const orderWithUpdatedServices = {
                ...order,
                estado: newEstado as Order['estado'],
                serviceItems: updatedServiceItems,
                serviceCurrentStep: Math.max(
                    ...updatedServiceItems.map((s) => serviceStatusToStep(s.bookingStatus || s.status)), 0
                ) || 1,
            };

            console.log('[LaravelOrderRepository::advanceOrderStep] returning order with locally updated services', {
                serviceCurrentStep: orderWithUpdatedServices.serviceCurrentStep,
                serviceItems: updatedServiceItems.map(si => ({ id: si.id, status: si.status })),
            });
            return orderWithUpdatedServices;
        }

        console.log('[LaravelOrderRepository::advanceOrderStep] using product flow', { estado: order.estado });

        if (order.estado === 'pending_seller') {
            return this.confirmOrder(id);
        }

        const advanceFlow = order.tipo_envio === 'retiro_tienda' ? ADVANCE_FLOW_RETiro : ADVANCE_FLOW;
        const newStatus = advanceFlow[order.estado] || order.estado;
        if (newStatus === order.estado) return order;

        return this.updateOrder(id, { status: newStatus as OrderStatus });
    }

    private getServiceNextAction(item: ServiceOrderItem): 'confirm' | 'on-the-way' | 'complete' | null {
        const bookingStatus = this.normalizeStatus(item.bookingStatus);
        const modality = String(item.modality ?? '').trim().toLowerCase();
        const isHome = modality === 'home' || modality === 'domicilio' || modality === 'home_service';
        const isInPerson = modality === 'in_person' || modality === 'sede' || modality === 'presencial';

        let action: 'confirm' | 'on-the-way' | 'complete' | null = null;
        if (bookingStatus === 'pending') {
            action = 'confirm';
        } else if (bookingStatus === 'confirmed' && isHome) {
            action = 'on-the-way';
        } else if (bookingStatus === 'confirmed' && isInPerson) {
            action = 'complete';
        } else if (bookingStatus === 'on_the_way') {
            action = 'complete';
        }

        console.log('[getServiceNextAction]', { bookingStatus, modality, normalizedModality: modality, isHome, isInPerson, action });
        return action;
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

    async getDashboardStats(): Promise<{ monthlySales: number; todayOrders: number }> {
        const raw = await this.request<any>('/orders/dashboard-stats');
        const d = raw?.data ?? raw;
        return {
            monthlySales: Number(d?.monthly_sales ?? 0),
            todayOrders: Number(d?.today_orders ?? 0),
        };
    }
}
