import type { Contract as FrontendContract } from '@/lib/types/admin/contracts';

const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';

interface ApiContractResponse {
    id: string;
    dbId: number;
    storeId: number | null;
    company: string;
    ruc: string | null;
    rep: string | null;
    dni: string | null;
    direccion: string | null;
    admin_name: string | null;
    admin_phone: string | null;
    admin_email: string | null;
    type: string;
    modality: 'VIRTUAL' | 'PHYSICAL';
    plan: string | null;
    status: 'ACTIVE' | 'PENDING' | 'EXPIRED';
    start: string | null;
    end: string | null;
    storage_path: string;
    signed_file_path: string | null;
    has_signed_doc: boolean;
    notes: string | null;
    expiryUrgency: 'normal' | 'warning' | 'critical';
    auditTrail?: Array<{ timestamp: string; action: string; user: string }>;
    store?: { id: number; tradeName: string; slug: string } | null;
    createdAt: string | null;
}

interface ApiListResponse {
    data: ApiContractResponse[];
    kpis: {
        total: number;
        active: number;
        pending: number;
        expired: number;
    };
    meta?: any;
}

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
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
}

function mapApiToFrontend(api: ApiContractResponse): FrontendContract {
    return {
        id: api.id,
        dbId: api.dbId,
        company: api.company,
        ruc: api.ruc ?? '',
        rep: api.rep ?? '',
        dni: api.dni ?? '',
        direccion: api.direccion ?? '',
        admin_name: api.admin_name ?? '',
        admin_phone: api.admin_phone ?? '',
        admin_email: api.admin_email ?? '',
        plan: api.plan ?? '',
        type: api.type,
        modality: api.modality,
        status: api.status,
        start: api.start ?? '',
        end: api.end ?? '',
        storage_path: api.storage_path,
        auditTrail: api.auditTrail ?? [],
        expiryUrgency: api.expiryUrgency ?? 'normal',
    };
}

function frontendToApi(data: Partial<FrontendContract>): Record<string, any> {
    const result: Record<string, any> = {};
    if (data.company !== undefined) result.company = data.company;
    if (data.ruc !== undefined) result.ruc = data.ruc;
    if (data.rep !== undefined) result.rep = data.rep;
    if (data.dni !== undefined) result.dni = data.dni;
    if (data.direccion !== undefined) result.direccion = data.direccion;
    if (data.admin_name !== undefined) result.admin_name = data.admin_name;
    if (data.admin_phone !== undefined) result.admin_phone = data.admin_phone;
    if (data.admin_email !== undefined) result.admin_email = data.admin_email;
    if (data.plan !== undefined) result.plan = data.plan;
    if (data.type !== undefined) result.type = data.type;
    if (data.modality !== undefined) result.modality = data.modality;
    if (data.start !== undefined) result.start = data.start;
    if (data.end !== undefined) result.end = data.end;
    if (data.status !== undefined) result.status = data.status;
    return result;
}

export const contractApi = {
    list: async (filters?: { query?: string; status?: string; modality?: string }): Promise<{ contracts: FrontendContract[]; kpis: { total: number; active: number; pending: number; expired: number } }> => {
        const params = new URLSearchParams();
        if (filters?.query) params.set('search', filters.query);
        if (filters?.status && filters.status !== 'ALL') params.set('status', filters.status);
        if (filters?.modality && filters.modality !== 'ALL') params.set('modality', filters.modality);
        const query = params.toString() ? `?${params.toString()}` : '';
        const res = await apiRequest<ApiListResponse>(`/contracts${query}`);
        return {
            contracts: (res.data || []).map(mapApiToFrontend),
            kpis: res.kpis || { total: 0, active: 0, pending: 0, expired: 0 },
        };
    },

    getById: async (id: string): Promise<FrontendContract | null> => {
        try {
            const res = await apiRequest<{ data: ApiContractResponse }>(`/contracts/${id}`);
            return mapApiToFrontend(res.data);
        } catch { return null; }
    },

    create: async (input: Partial<FrontendContract>): Promise<FrontendContract> => {
        const res = await apiRequest<{ data: ApiContractResponse }>('/contracts', {
            method: 'POST',
            body: JSON.stringify(frontendToApi(input)),
        });
        return mapApiToFrontend(res.data);
    },

    update: async (id: string, input: Partial<FrontendContract>): Promise<FrontendContract> => {
        const res = await apiRequest<{ data: ApiContractResponse }>(`/contracts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(frontendToApi(input)),
        });
        return mapApiToFrontend(res.data);
    },

    updateStatus: async (id: string, status: string, updatedInfo: Partial<FrontendContract>): Promise<FrontendContract> => {
        const dbId = updatedInfo.dbId?.toString() ?? id;
        await apiRequest(`/contracts/${dbId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
        const res = await apiRequest<{ data: ApiContractResponse }>(`/contracts/${dbId}`, {
            method: 'PUT',
            body: JSON.stringify(frontendToApi(updatedInfo)),
        });
        return mapApiToFrontend(res.data);
    },

    uploadDocument: async (id: string, file: File): Promise<FrontendContract> => {
        const token = getToken();
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_URL}/contracts/${id}/upload`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: formData,
        });
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        const data = await res.json();
        return mapApiToFrontend(data.data);
    },

    downloadDocument: async (id: string): Promise<Blob> => {
        const token = getToken();
        const res = await fetch(`${API_URL}/contracts/${id}/download`, {
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        return res.blob();
    },
};
