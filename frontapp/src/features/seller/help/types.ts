export type TicketStatus = 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
export type TicketCategory = 'tech' | 'admin' | 'info' | 'comment' | 'followup' | 'payments' | 'documentation';
export type TicketPriority = 'baja' | 'media' | 'alta' | 'critica';

export interface SellerTicket {
    id: string;
    ticketNumber: string;
    subject: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
    status: TicketStatus;
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
    messages: SellerTicketMessage[];
}

export interface SellerTicketMessage {
    id: string;
    ticketId: string;
    senderId: string;
    senderName: string;
    senderType: 'seller' | 'agent';
    content: string;
    createdAt: string;
}

export interface SellerTicketFilters {
    status: 'all' | TicketStatus;
    category: 'all' | TicketCategory;
    search: string;
}

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  tech: 'Soporte Técnico',
  admin: 'Administrativo',
  info: 'Información',
  comment: 'Comentario',
  followup: 'Seguimiento',
  payments: 'Pagos',
  documentation: 'Documentación',
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  critica: 'Crítica',
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Abierto',
  in_progress: 'En Proceso',
  pending: 'Pendiente',
  resolved: 'Resuelto',
  closed: 'Cerrado',
};
