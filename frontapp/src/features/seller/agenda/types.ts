export type EventType = 'order' | 'service';

export type AgendaFilterType = 'all' | 'orders' | 'services';

export interface AgendaOrderItem {
    product_name: string;
    quantity: number;
    unit_price: number;
    line_total: number;
    image_url: string | null;
}

export interface AgendaShipment {
    carrier: string | null;
    tracking_number: string | null;
    tracking_url: string | null;
    status: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
}

export interface AgendaSpecialist {
    id: number;
    nombres: string;
    apellidos: string;
    especialidad: string | null;
    foto: string | null;
}

export interface AgendaEvent {
    id: string;
    type: EventType;
    date: string;
    time: string;
    title: string;
    subtitle: string;
    status: string;
    payment_status: string;
    total: number;
    customer_name: string;
    customer_email?: string;
    customer_phone?: string;
    items_summary?: string;
    service_name?: string;
    order_id?: number;
    booking_id?: number;

    // Order-specific
    order_number?: string;
    order_status?: string;
    payment_method?: string;
    paid_at?: string;
    shipping_address?: string;
    shipping_city?: string;
    shipping_type?: string;
    shipping_notes?: string;
    subtotal?: number;
    shipping_cost?: number;
    tax_amount?: number;
    discount_amount?: number;
    items?: AgendaOrderItem[];
    shipment?: AgendaShipment | null;

    // Service-specific
    service_id?: number;
    duration_minutes?: number;
    notes?: string;
    seller_notes?: string;
    appointment_date?: string;
    end_time?: string;
    specialist?: AgendaSpecialist | null;
}

export interface AgendaMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface AgendaResponse {
    data: AgendaEvent[];
    meta: AgendaMeta;
}
