export type OrderStatus = 'pending_seller' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type ItemStatus = 'pending_seller' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type TipoEnvio = 'domicilio' | 'agencia';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    pending_seller: 'Pendiente Confirmar',
    confirmed: 'Confirmado',
    processing: 'Preparando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
};

export const ITEM_STATUS_LABELS: Record<ItemStatus, string> = {
    pending_seller: 'Pendiente',
    confirmed: 'Confirmado',
    processing: 'Preparando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
};

export interface OrderItem {
    id: string;
    name: string;
    qty: number;
    price: number;
    status: ItemStatus;
    can_confirm: boolean;
    can_cancel: boolean;
}

export interface ShippingInfo {
    direccion: string;
    carrier: string;
    tracking: string;
    costo: number;
    city: string;
    postalCode: string;
    notes: string;
    carrierCode?: string | null;
    carrierData?: Record<string, string> | null;
}

export type OrderType = 'product' | 'service' | 'mixed';

export interface ServiceOrderItem {
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
    bookingStatus?: string | null;
}

export interface Order {
    id: string;
    orderNumber: string;
    statusLabel: string;
    fecha: string;
    updatedAt: string;
    cliente: string;
    customerEmail: string;
    customerPhone: string;
    customerDocument: string;
    customerDocumentType: string;
    dni: string;
    subtotal: number;
    shippingCost: number;
    taxAmount: number;
    discountAmount: number;
    total: number;
    unidades: number;
    estado: OrderStatus;
    global_status: OrderStatus;
    currentStep: number;
    productCurrentStep: number;
    serviceCurrentStep: number;
    orderType: OrderType;
    itemsSummary: string;
    tipo_envio: TipoEnvio | null;
    metodo_pago: string;
    estado_pago: 'pendiente' | 'verificado';
    paymentStatusLabel: string;
    trackingNumber: string | null;
    storeName: string | null;
    couponCode: string | null;
    notes: string | null;
    paidAt: string | null;
    envio: ShippingInfo;
    items: OrderItem[];
    serviceItems: ServiceOrderItem[];
}

export interface SalesKPI {
    label: string;
    count: number;
    status: string;
    icon: string;
    color: string;
}