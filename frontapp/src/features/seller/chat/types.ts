export type ChatCategory = 'tech' | 'admin' | 'info' | 'comment' | 'followup';

export interface ChatAttachment {
    id: string;
    file_name: string;
    mime_type: string;
    file_size: number;
    url: string;
    download_url: string;
}

export interface ChatMessage {
    id?: number;
    sender: 'user' | 'other';
    contenido: string;
    hora: string;
    status?: 'sent' | 'delivered' | 'read';
    attachments?: ChatAttachment[];
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
