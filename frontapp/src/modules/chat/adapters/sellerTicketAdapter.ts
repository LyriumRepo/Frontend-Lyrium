import { UnifiedTicket, UnifiedMessage, TicketStatus } from '../types';

interface SellerAttachment {
  name: string;
  type: 'image' | 'file';
  url: string;
}

interface SellerMessage {
  id: number;
  user: string;
  role: string;
  timestamp: string;
  texto: string;
  isUser: boolean;
  hora: string;
  attachments?: SellerAttachment[];
}

interface SellerTicket {
  id: number;
  id_display: string;
  titulo?: string;
  descripcion?: string;
  status?: string;
  type?: string;
  critical?: boolean;
  tiempo?: string;
  mensajes_count?: number;
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
  mensajes?: SellerMessage[];
}

function normalizeStatus(status: string | undefined): TicketStatus {
  const map: Record<string, TicketStatus> = {
    'abierto': 'open',
    'proceso': 'in_progress',
    'resuelto': 'resolved',
    'cerrado': 'closed',
    'reabierto': 'reopened',
  };
  return map[status || ''] || 'open';
}

function adaptMessage(msg: SellerMessage, ticketId: string): UnifiedMessage {
  return {
    id: String(msg.id),
    ticketId,
    senderId: String(msg.id),
    senderName: msg.user || 'Usuario',
    senderRole: msg.isUser ? 'vendor' : 'admin',
    content: msg.texto || '',
    timestamp: new Date(msg.timestamp || Date.now()),
    hour: msg.hora || '',
    attachments: msg.attachments?.map((a) => ({
      id: a.url,
      url: a.url,
      name: a.name,
      type: a.type,
    })),
    isRead: msg.leido ?? false,
  };
}

export function adaptSellerTicket(ticket: SellerTicket): UnifiedTicket {
  return {
    id: String(ticket.id),
    displayId: ticket.id_display || String(ticket.id),
    title: ticket.titulo || 'Sin título',
    description: ticket.descripcion || '',
    status: normalizeStatus(ticket.status),
    assignedTo: {
      role: 'admin',
      id: String(ticket.id),
      name: ticket.contacto_adm?.nombre || 'Lyrium Admin',
    },
    requester: {
      name: ticket.contacto_adm?.nombre || 'Vendedor',
      email: ticket.contacto_adm?.correo,
      company: ticket.tienda?.nombre_comercial,
    },
    createdAt: new Date(ticket.tiempo || Date.now()),
    updatedAt: new Date(ticket.tiempo || Date.now()),
    messages: ticket.mensajes?.map((m) => adaptMessage(m, String(ticket.id))) || [],
    unreadCount: 0,
    surveyRequired: ticket.survey_required,
    satisfactionRating: ticket.satisfaction_rating,
    satisfactionComment: ticket.satisfaction_comment,
    escalated: ticket.escalated,
    escalatedTo: ticket.escalated_to,
    source: 'seller',
  };
}

export function adaptSellerTickets(tickets: SellerTicket[]): UnifiedTicket[] {
  return tickets.map(adaptSellerTicket);
}
