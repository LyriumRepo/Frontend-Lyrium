export type VoucherStatus = 'DRAFT' | 'SENT_WAIT_CDR' | 'ACCEPTED' | 'OBSERVED' | 'REJECTED';
export type VoucherType = 'FACTURA' | 'BOLETA' | 'NOTA_CREDITO';

export interface VoucherHistory {
    status: VoucherStatus;
    note: string;
    timestamp: string;
    user: string;
}

export interface Voucher {
    id: string;
    series: string;
    number: string;
    type: VoucherType;
    customer_name: string;
    customer_ruc: string;
    store_name?: string;
    store_ruc?: string;
    order_id: string;
    amount: number;
    store_amount?: number;
    order_total?: number;
    commission_rate?: number | null;
    commission_amount?: number | null;
    seller_name?: string;
    emission_date: string;
    sunat_status: VoucherStatus;
    pdf_url?: string;
    history: VoucherHistory[];
    store_id?: string | null;
    invoice_number?: string;
    provider?: string;
    provider_invoice_id?: string | null;
    authorization_code?: string | null;
    qr_data?: string | null;
    xml_url?: string | null;
    cdr_url?: string | null;
    items?: unknown;
    order_type?: 'Producto' | 'Servicio' | 'Producto y Servicio' | null;
}

export interface InvoiceKPIs {
    totalFacturado: number;
    successRate: number;
    pendingCount: number;
    totalComprobantes: number;
}

export interface CreateInvoiceInput {
    type: VoucherType;
    customer_name: string;
    customer_ruc: string;
    series: string;
    number: string;
    amount: number;
    order_id: string;
}
