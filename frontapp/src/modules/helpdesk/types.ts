export type TicketStatus = 'abierto' | 'proceso' | 'resuelto' | 'cerrado' | 'reabierto';
export type TicketType = 'tech' | 'admin' | 'info' | 'comment' | 'followup' | 'payments' | 'documentation';
export type TicketPriority = 'baja' | 'media' | 'alta' | 'critica';

export interface TicketMessage {
    id: number;
    timestamp: string;
    leido?: boolean;
    tipo?: 'normal' | 'respuesta_rapida' | 'escalamiento' | 'sistema';
    archivo?: string | null;
    user?: string;
    role?: string;
    texto?: string;
    hora?: string;
    isUser?: boolean;
    usuario?: string;
    contenido?: string;
    attachments?: TicketAttachment[];
}

export interface TicketAttachment {
    name: string;
    type: 'image' | 'file';
    url: string;
}

export interface TicketUser {
    id: number;
    nombre: string;
    empresa?: string;
}

export interface Ticket {
    id: number;
    id_display: string;
    numero?: string;
    titulo: string;
    descripcion: string;
    status?: TicketStatus;
    estado?: TicketStatus;
    type?: TicketType;
    priority?: TicketPriority;
    prioridad?: TicketPriority;
    critical?: boolean;
    tiempo?: string;
    mensajes_count?: number;
    total_mensajes?: number;
    mensajes_sin_leer?: number;
    ultimo_mensaje?: string;
    survey_required?: boolean;
    satisfaction_rating?: number;
    satisfaction_comment?: string;
    escalated?: boolean;
    escalated_to?: string | null;
    tienda?: {
        razon_social: string;
        nombre_comercial: string;
    };
    contacto_adm?: {
        nombre: string;
        apellido: string;
        numeros: string;
        correo: string;
    };
    vendedor?: TicketUser;
    admin_asignado?: TicketUser;
    categoria?: string;
    fecha_creacion?: string;
    fecha_actualizacion?: string;
    mensajes: TicketMessage[];
    has_more_messages?: boolean;
    oldest_message_id?: number;
}

export interface CreateTicketPayload {
    asunto: string;
    mensaje?: string;
    tipo_ticket: TicketType;
    criticidad: TicketPriority;
    adjuntos?: File[];
}

export interface SendMessagePayload {
    content?: string;
    attachments?: File[];
}

export interface SubmitSurveyPayload {
    rating: number;
    comment: string;
}

export interface TicketFilters {
    search: string;
    category?: TicketType | 'all' | 'critical' | 'tech-critical';
    status?: TicketStatus | '';
    priority?: string;
}

export interface UnifiedTicketListItem {
    id: string;
    displayId: string;
    title: string;
    description?: string;
    status: string;
    priority?: string;
    category?: TicketType;
    requester: {
        name: string;
        company?: string;
    };
    updatedAt: string;
    unreadCount: number;
    messageCount: number;
    source: 'admin' | 'seller' | 'logistics';
}

export const TICKET_TYPE_LABELS: Record<TicketType, string> = {
    tech: 'Técnico',
    admin: 'Administrativo',
    info: 'Información',
    comment: 'Comentario',
    followup: 'Seguimiento',
    payments: 'Pagos',
    documentation: 'Documentación',
};

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
    baja: 'Baja',
    media: 'Media',
    alta: 'Alta',
    critica: 'Crítica',
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
    abierto: 'Abierto',
    proceso: 'En Proceso',
    resuelto: 'Resuelto',
    cerrado: 'Cerrado',
    reabierto: 'Reabierto',
};

export interface TicketListProps {
    tickets: UnifiedTicketListItem[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onFilterChange: (filters: Partial<TicketFilters>) => void;
    filters: TicketFilters;
    className?: string;
    showFilters?: boolean;
    showPriority?: boolean;
}

export interface TicketItemProps {
    ticket: UnifiedTicketListItem;
    isActive: boolean;
    onClick: (id: string) => void;
    showPriority?: boolean;
    showCategory?: boolean;
}

export type TicketCategory = TicketType;
