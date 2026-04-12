export type OrderStatus = 'pending_seller' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type ItemStatus = 'pending_seller' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

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
}

export interface Order {
    id: string;
    fecha: string;
    cliente: string;
    dni: string;
    total: number;
    unidades: number;
    estado: OrderStatus;
    global_status: OrderStatus;
    currentStep: number;
    metodo_pago: string;
    estado_pago: 'pendiente' | 'verificado';
    envio: ShippingInfo;
    items: OrderItem[];
}

export interface SalesKPI {
    label: string;
    count: number;
    status: string;
    icon: string;
    color: string;
}
