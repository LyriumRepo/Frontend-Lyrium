export type TicketStatus = 'abierto' | 'proceso' | 'pendiente' | 'resuelto' | 'cerrado';
export type TicketCategory = 'critico' | 'tecnico' | 'negativo' | 'informacion' | 'positivo' | 'payments';
export type TicketPriority = 'baja' | 'media' | 'alta' | 'critica';

export interface CustomerTicket {
    id: string;
    ticketNumber: string;
    subject: string;
    description: string;
    category: TicketCategory;
    priority?: TicketPriority;
    status: TicketStatus;
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
    messages: CustomerTicketMessage[];
    unreadCount?: number;
    assignedTo?: string;
}

export interface CustomerTicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'agent';
  content: string;
  createdAt: string;
}

export interface CustomerTicketFilters {
  status: 'all' | TicketStatus;
  category: 'all' | TicketCategory;
  search: string;
}

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  critico:     'Soporte Crítico',
  tecnico:     'Soporte Técnico',
  negativo:    'Comentario Negativo',
  informacion: 'Solicitud de Información',
  positivo:    'Comentario Positivo',
  payments:    'Pagos y Facturación',
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  baja:   'Baja',
  media:  'Media',
  alta:   'Alta',
  critica: 'Crítica',
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
  abierto:   'Abierto',
  proceso:   'En Proceso',
  pendiente: 'Pendiente',
  resuelto:  'Resuelto',
  cerrado:   'Cerrado',
};
