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
    order_id: string;
    amount: number;
    emission_date: string;
    sunat_status: VoucherStatus;
    pdf_path?: string;
    xml_path?: string;
    cdr_path?: string;
    history: VoucherHistory[];
}

export interface InvoiceKPIs {
    totalFacturado: number;
    successRate: number;
    pendingCount: number;
    rejectedCount: number;
}
