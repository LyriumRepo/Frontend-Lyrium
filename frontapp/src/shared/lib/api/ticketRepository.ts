import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import { getAuthHeaders } from './token-store';
import type { ApiResponse } from './base-client';

export interface TicketData {
  id: number;
  id_display: string;
  titulo: string;
  descripcion: string;
  ultimo_mensaje: string;
  status: string;
  type: string;
  critical: boolean;
  tiempo: string;
  mensajes_count: number;
  mensajes_sin_leer: number;
  survey_required: boolean;
  satisfaction_rating: number | null;
  satisfaction_comment: string | null;
  escalated: boolean;
  escalated_to: string | null;
  tienda: {
    razon_social: string;
    nombre_comercial: string;
  };
  contacto_adm: {
    nombre: string;
    apellido: string;
    numeros: string;
    correo: string;
  };
  mensajes?: TicketMessageData[];
  has_more_messages?: boolean;
  oldest_message_id?: number;
}

export interface TicketMessageData {
  id: number;
  user: string;
  role: string;
  timestamp: string;
  texto: string;
  isUser: boolean;
  hora: string;
  leido: boolean;
  tipo: string;
  attachments?: Array<{
    name: string;
    type: string;
    url: string;
  }>;
}

export interface CreateTicketPayload {
  asunto: string;
  mensaje: string;
  tipo_ticket: string;
  criticidad: string;
}

export interface TicketListResponse {
  data: TicketData[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${LARAVEL_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
      ...headers,
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
    throw new Error(error.message || error.error || `API Error: ${response.status}`);
  }
  if (response.status === 204) return {} as T;
  const text = await response.text();
  return text ? JSON.parse(text) : {} as T;
}

export const ticketApi = {
  list: async (): Promise<TicketData[]> => {
    const response = await request<TicketListResponse>('/tickets');
    return Array.isArray(response.data) ? response.data : [];
  },

  get: async (id: number): Promise<TicketData | null> => {
    try {
      const response = await request<ApiResponse<TicketData>>(`/tickets/${id}`);
      return response.data ?? null;
    } catch {
      return null;
    }
  },

  create: async (payload: CreateTicketPayload): Promise<TicketData> => {
    const response = await request<ApiResponse<TicketData>>('/tickets', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.data!;
  },

  sendMessage: async (ticketId: number, content: string): Promise<TicketMessageData> => {
    const response = await request<ApiResponse<TicketMessageData>>(`/tickets/${ticketId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    return response.data!;
  },

  getMessages: async (ticketId: number, beforeId?: number): Promise<{ data: TicketMessageData[]; hasMore: boolean }> => {
    const query = beforeId ? `?before_id=${beforeId}` : '';
    const response = await request<ApiResponse<TicketMessageData[]> & { has_more: boolean }>(`/tickets/${ticketId}/messages${query}`);
    return {
      data: Array.isArray(response.data) ? response.data : [],
      hasMore: response.has_more ?? false,
    };
  },

  close: async (ticketId: number): Promise<void> => {
    await request(`/tickets/${ticketId}/close`, { method: 'PUT' });
  },

  submitSurvey: async (ticketId: number, rating: number, comment?: string): Promise<void> => {
    await request(`/tickets/${ticketId}/survey`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
  },
};
