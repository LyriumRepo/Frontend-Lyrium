import {
    Ticket,
    CreateTicketPayload,
    SendMessagePayload,
    SubmitSurveyPayload,
} from '@/modules/helpdesk/types';
import { apiClient, invalidateTokenCache } from './apiClient';

class TicketApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public data?: unknown
    ) {
        super(message);
        this.name = 'TicketApiError';
    }
}

function normalizeAdminStatus(status: string): string {
    const normalized = status
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    const map: Record<string, string> = {
        abierto: 'open',
        proceso: 'in_progress',
        'en proceso': 'in_progress',
        resuelto: 'resolved',
        cerrado: 'closed',
        reabierto: 'reopened',
        open: 'open',
        in_progress: 'in_progress',
        resolved: 'resolved',
        closed: 'closed',
        reopened: 'reopened',
    };

    return map[normalized] || status;
}

function normalizeAdminPriority(priority: string): string {
    const normalized = priority
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    const map: Record<string, string> = {
        baja: 'low',
        media: 'medium',
        alta: 'high',
        critica: 'critical',
        low: 'low',
        medium: 'medium',
        high: 'high',
        critical: 'critical',
    };

    return map[normalized] || priority;
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
        invalidateTokenCache();
    }
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new TicketApiError(
            errorData.message || `HTTP error ${response.status}`,
            response.status,
            errorData
        );
    }
    return response.json();
}

const API_BASE = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';

let cachedToken: string | null = null;
let tokenExpiry = 0;

function getTokenFromCookies(): string | null {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'laravel_token') {
            return decodeURIComponent(value || '');
        }
    }
    return null;
}

async function getToken(): Promise<string | null> {
    const now = Date.now();
    
    if (cachedToken && tokenExpiry > now) {
        return cachedToken;
    }
    
    cachedToken = getTokenFromCookies();
    tokenExpiry = now + 60000;
    
    return cachedToken;
}

async function getAuthHeaders(contentType?: string): Promise<Record<string, string>> {
    const token = await getToken();

    const headers: Record<string, string> = {};

    // Don't set Content-Type for FormData — the browser sets it with the correct boundary
    if (contentType !== 'multipart') {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
}

export const ticketApi = {
    seller: {
        async list(): Promise<Ticket[]> {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE}/tickets`, { 
                headers,
            });
            const data = await handleResponse<{ data: Ticket[] }>(response);
            return data.data;
        },

        async get(id: number): Promise<Ticket> {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE}/tickets/${id}`, {
                headers,
            });
            const data = await handleResponse<{ data: Ticket }>(response);
            return data.data;
        },

        async getMessages(ticketId: number, beforeId?: number): Promise<{ messages: Ticket['mensajes']; hasMore: boolean }> {
            const headers = await getAuthHeaders();
            const url = beforeId
                ? `${API_BASE}/tickets/${ticketId}/messages?before_id=${beforeId}`
                : `${API_BASE}/tickets/${ticketId}/messages`;
            const response = await fetch(url, { headers });
            const data = await handleResponse<{ data: Ticket['mensajes']; has_more: boolean }>(response);
            return { messages: data.data, hasMore: data.has_more };
        },

        async create(payload: CreateTicketPayload): Promise<Ticket> {
            const hasFiles = payload.adjuntos && payload.adjuntos.length > 0;
            const headers = await getAuthHeaders(hasFiles ? 'multipart' : undefined);

            let body: FormData | string;
            if (hasFiles) {
                const form = new FormData();
                form.append('asunto', payload.asunto);
                form.append('tipo_ticket', payload.tipo_ticket);
                form.append('criticidad', payload.criticidad);
                if (payload.mensaje) form.append('mensaje', payload.mensaje);
                payload.adjuntos!.forEach((f) => form.append('adjuntos[]', f));
                body = form;
            } else {
                body = JSON.stringify({
                    asunto: payload.asunto,
                    mensaje: payload.mensaje ?? '',
                    tipo_ticket: payload.tipo_ticket,
                    criticidad: payload.criticidad,
                });
            }

            const response = await fetch(`${API_BASE}/tickets`, {
                method: 'POST',
                headers,
                body,
            });
            const data = await response.json();

            if (!response.ok) {
                throw new TicketApiError(
                    data.message || `HTTP error ${response.status}`,
                    response.status,
                    data
                );
            }

            return data.data || data;
        },

        async sendMessage(ticketId: number, payload: SendMessagePayload): Promise<Ticket> {
            const hasFiles = payload.attachments && payload.attachments.length > 0;
            const headers = await getAuthHeaders(hasFiles ? 'multipart' : undefined);

            let body: FormData | string;
            if (hasFiles) {
                const form = new FormData();
                if (payload.content) form.append('content', payload.content);
                payload.attachments!.forEach((f) => form.append('attachments[]', f));
                body = form;
            } else {
                body = JSON.stringify({ content: payload.content ?? '' });
            }

            const response = await fetch(`${API_BASE}/tickets/${ticketId}/messages`, {
                method: 'POST',
                headers,
                body,
            });
            return handleResponse<Ticket>(response);
        },

        async close(ticketId: number): Promise<Ticket> {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE}/tickets/${ticketId}/close`, {
                method: 'PUT',
                headers,
            });
            return handleResponse<Ticket>(response);
        },

        async submitSurvey(ticketId: number, payload: SubmitSurveyPayload): Promise<Ticket> {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE}/tickets/${ticketId}/survey`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload),
            });
            return handleResponse<Ticket>(response);
        },
    },

    admin: {
        async list(): Promise<Ticket[]> {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE}/admin/tickets`, { 
                headers,
            });
            const data = await handleResponse<{ data: Ticket[] }>(response);
            return data.data;
        },

        async get(id: number): Promise<Ticket> {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE}/admin/tickets/${id}`, {
                headers,
            });
            const data = await handleResponse<{ data: Ticket }>(response);
            return data.data;
        },

        async getMessages(ticketId: number, beforeId?: number): Promise<{ messages: Ticket['mensajes']; hasMore: boolean }> {
            const headers = await getAuthHeaders();
            const url = beforeId
                ? `${API_BASE}/admin/tickets/${ticketId}/messages?before_id=${beforeId}`
                : `${API_BASE}/admin/tickets/${ticketId}/messages`;
            const response = await fetch(url, { headers });
            const data = await handleResponse<{ data: Ticket['mensajes']; has_more: boolean }>(response);
            return { messages: data.data, hasMore: data.has_more };
        },

        async sendMessage(ticketId: number, payload: SendMessagePayload): Promise<Ticket> {
            const hasFiles = payload.attachments && payload.attachments.length > 0;
            const headers = await getAuthHeaders(hasFiles ? 'multipart' : undefined);

            let body: FormData | string;
            if (hasFiles) {
                const form = new FormData();
                if (payload.content) form.append('content', payload.content);
                payload.attachments!.forEach((f) => form.append('attachments[]', f));
                body = form;
            } else {
                body = JSON.stringify({ content: payload.content ?? '' });
            }

            const response = await fetch(`${API_BASE}/admin/tickets/${ticketId}/messages`, {
                method: 'POST',
                headers,
                body,
            });
            return handleResponse<Ticket>(response);
        },

        async updateStatus(ticketId: number, status: string): Promise<Ticket> {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE}/admin/tickets/${ticketId}/status`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ status: normalizeAdminStatus(status) }),
            });
            return handleResponse<Ticket>(response);
        },

        async assign(ticketId: number, adminId: number): Promise<Ticket> {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE}/admin/tickets/${ticketId}/assign`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ admin_id: adminId }),
            });
            return handleResponse<Ticket>(response);
        },

        async updatePriority(ticketId: number, priority: string): Promise<Ticket> {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE}/admin/tickets/${ticketId}/priority`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ priority: normalizeAdminPriority(priority) }),
            });
            return handleResponse<Ticket>(response);
        },

        async escalate(ticketId: number, reason?: string): Promise<Ticket> {
            const headers = await getAuthHeaders();
            const escalatedTo = reason?.trim() || 'Soporte especializado';
            const response = await fetch(`${API_BASE}/admin/tickets/${ticketId}/escalate`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ escalated_to: escalatedTo }),
            });
            return handleResponse<Ticket>(response);
        },
    },
};
