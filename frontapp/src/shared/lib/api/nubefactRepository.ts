const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';

function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('laravel_token');
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    const json = await res.json() as { success: boolean; data: T; error?: string };

    if (!res.ok || !json.success) {
        throw new Error(json.error ?? `Error ${res.status}`);
    }

    return json.data;
}

export interface NubefactItem {
    unidad_de_medida: string;
    codigo?: string;
    descripcion: string;
    cantidad: number;
    valor_unitario: number;
    precio_unitario: number;
    descuento?: number;
    subtotal: number;
    tipo_de_igv: string;
    igv: number;
    total: number;
}

export interface NubefactStore {
    id: string;
    name: string;
    slug: string;
}

export interface NubefactOrderItem {
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    storeName: string | null;
    storeSlug: string | null;
}

export interface NubefactOrder {
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    items?: NubefactOrderItem[];
    stores?: NubefactStore[];
}

export interface NubefactInvoice {
    id: string;
    orderId: string | null;
    invoiceNumber: string;
    documentType: string | null;
    type: string;
    series: string | null;
    number: string | null;
    nit: string | null;
    businessName: string | null;
    customerDocumentType: string | null;
    customerAddress: string | null;
    customerEmail: string | null;
    provider: string;
    providerInvoiceId: string | null;
    qrData: string | null;
    pdfUrl: string | null;
    authorizationCode: string | null;
    total: number;
    storeAmount?: number;
    status: string;
    items: NubefactItem[] | null;
    order: NubefactOrder | null;
    createdAt: string;
    updatedAt: string;
}

export interface NubefactKPIs {
    totalFacturadoMesActual: number;
    totalFacturadoMesAnterior: number;
    porcentajeCrecimiento: number;
    montoPromedio: number;
    topSellers: Array<{
        id: string;
        name: string;
        slug: string;
        totalVendido: number;
    }>;
}

interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        perPage: number;
        total: number;
        totalPages: number;
        hasMore: boolean;
    };
}

export interface EmitInvoicePayload {
    tipo_de_comprobante: string;
    serie: string;
    numero: string;
    cliente_tipo_de_documento: string;
    cliente_numero_de_documento: string;
    cliente_denominacion: string;
    cliente_direccion?: string;
    cliente_email?: string;
    fecha_de_emision?: string;
    moneda?: string;
    total_gravada: number;
    total_igv: number;
    total: number;
    observaciones?: string;
    items: Array<{
        unidad_de_medida: string;
        codigo?: string;
        descripcion: string;
        cantidad: number;
        valor_unitario: number;
        precio_unitario: number;
        descuento?: number;
        subtotal: number;
        tipo_de_igv: string;
        igv: number;
        total: number;
    }>;
}

const DOCUMENT_TYPE_MAP: Record<string, string> = {
    '1': 'FACTURA',
    '2': 'BOLETA',
    '3': 'NOTA_CREDITO',
    '4': 'NOTA_DEBITO',
};

const STATUS_DISPLAY: Record<string, string> = {
    DRAFT: 'Borrador',
    SENT_WAIT_CDR: 'Pendiente CDR',
    ACCEPTED: 'Aceptado',
    OBSERVED: 'Observado',
    REJECTED: 'Rechazado',
    pending: 'Pendiente',
};

export function mapStatusLabel(status: string): string {
    return STATUS_DISPLAY[status] ?? status;
}

export function mapDocumentType(type: string | null): string {
    if (!type) return '—';
    return DOCUMENT_TYPE_MAP[type] ?? type;
}

export const nubefactApi = {
    comprobantes: async (page = 1, perPage = 50): Promise<PaginatedResponse<NubefactInvoice>> => {
        return apiRequest<PaginatedResponse<NubefactInvoice>>(
            `/nubefact/comprobantes?page=${page}&per_page=${perPage}`
        );
    },

    mostrar: async (id: string): Promise<NubefactInvoice> => {
        return apiRequest<NubefactInvoice>(`/nubefact/comprobantes/${id}`);
    },

    kpis: async (): Promise<NubefactKPIs> => {
        return apiRequest<NubefactKPIs>('/nubefact/kpis');
    },

    emitir: async (payload: EmitInvoicePayload): Promise<NubefactInvoice> => {
        return apiRequest<NubefactInvoice>('/nubefact/emitir', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },

    planInvoices: async (page = 1, perPage = 50): Promise<PaginatedResponse<PlanInvoice>> => {
        return apiRequest<PaginatedResponse<PlanInvoice>>(
            `/admin/plan-invoices?page=${page}&per_page=${perPage}`
        );
    },
};

export interface PlanInvoice {
    id: number;
    invoice_number: string;
    series: string | null;
    number: string | null;
    type: string;
    customer_name: string;
    customer_ruc: string;
    customer_email: string | null;
    total: number;
    subtotal_sin_igv: number;
    igv_amount: number;
    sunat_status: string;
    pdf_url: string | null;
    xml_url: string | null;
    emission_date: string;
    created_at: string;
    plan_name: string | null;
    months: number | null;
    store_name: string | null;
    store_id: number | null;
    plan_request_id: number | null;
}
