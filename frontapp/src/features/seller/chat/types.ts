export type ChatCategory = 'tech' | 'admin' | 'info' | 'comment' | 'followup';

export interface ChatMessage {
    id?: number;
    sender: 'user' | 'other';
    contenido: string;
    hora: string;
    status?: 'sent' | 'delivered' | 'read';
}

export interface ChatConversation {
    id: number;
    nombre: string;
    email: string;
    dni: string;
    avatar: string;
    ultimoMensaje: string;
    fecha: string;
    type: ChatCategory;
    critical: boolean;
    mensajes: ChatMessage[];
}

export interface ChatFilters {
    search: string;
    category: string | 'all';
}
