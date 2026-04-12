import { UnifiedTicket, UnifiedMessage, TicketStatus, MessageAttachment } from '../types';

interface AdminAttachment {
  name: string;
  type: 'image' | 'file';
  url: string;
}

interface AdminMessage {
  id: number;
  usuario?: string;
  user?: string;
  contenido?: string;
  texto?: string;
  timestamp: string;
  archivo?: string | null;
  leido: boolean;
  role?: string;
  tipo?: 'normal' | 'respuesta_rapida' | 'escalamiento' | 'sistema';
  attachments?: AdminAttachment[];
}

interface AdminUser {
  id: number;
  nombre: string;
  empresa?: string;
  rol?: string;
}

interface AdminTicket {
  id: number;
  numero?: string;
  id_display?: string;
  titulo?: string;
  asunto?: string;
  descripcion?: string;
  vendedor?: AdminUser;
  admin_asignado?: AdminUser;
  categoria?: string;
  prioridad?: string;
  prioridad_ticket?: string;
  estado: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  total_mensajes?: number;
  mensajes_sin_leer?: number;
  mensajes?: AdminMessage[];
}

function normalizeStatus(status: string): TicketStatus {
  const map: Record<string, TicketStatus> = {
    'Abierto': 'open',
    'En Proceso': 'in_progress',
    'Resuelto': 'resolved',
    'Cerrado': 'closed',
    'Reabierto': 'reopened',
    'abierto': 'open',
    'proceso': 'in_progress',
    'resuelto': 'resolved',
    'cerrado': 'closed',
    'reabierto': 'reopened',
  };
  return map[status] || 'open';
}

function adaptMessage(msg: AdminMessage, ticketId: string): UnifiedMessage {
  const senderName = msg.usuario || msg.user || 'Usuario';
  const senderRoleRaw = msg.role || '';
  const isAdmin =
    senderRoleRaw.toLowerCase().includes('admin') ||
    senderName.includes('(Admin)') ||
    senderName === 'Sistema Lyrium';

  const attachments: MessageAttachment[] | undefined = msg.attachments?.length
    ? msg.attachments.map((a, idx) => ({
        id: `${msg.id}-${idx}`,
        url: a.url,
        name: a.name,
        type: a.type,
      }))
    : undefined;

  return {
    id: String(msg.id),
    ticketId,
    senderId: String(msg.id),
    senderName,
    senderRole: isAdmin ? 'admin' : 'vendor',
    content: msg.contenido || msg.texto || '',
    timestamp: new Date(msg.timestamp),
    hour: msg.timestamp,
    isQuickReply: msg.tipo === 'respuesta_rapida',
    isEscalation: msg.tipo === 'escalamiento',
    isRead: msg.leido ?? false,
    attachments,
  };
}

export function adaptAdminTicket(ticket: AdminTicket): UnifiedTicket {
  const displayId = ticket.numero || ticket.id_display || String(ticket.id);
  const title = ticket.asunto || ticket.titulo || 'Sin título';
  
  const unifiedTicket: UnifiedTicket = {
    id: String(ticket.id),
    displayId,
    title,
    description: ticket.descripcion,
    status: normalizeStatus(ticket.estado),
    priority: (ticket.prioridad || ticket.prioridad_ticket) as any,
    assignedTo: ticket.admin_asignado ? {
      role: 'admin',
      id: String(ticket.admin_asignado.id),
      name: ticket.admin_asignado.nombre,
    } : { role: 'admin', id: '0', name: 'Sin asignar' },
    requester: {
      name: ticket.vendedor?.nombre || 'Vendedor',
      company: ticket.vendedor?.empresa,
    },
    createdAt: ticket.fecha_creacion ? new Date(ticket.fecha_creacion) : new Date(),
    updatedAt: ticket.fecha_actualizacion ? new Date(ticket.fecha_actualizacion) : new Date(),
    messages: (ticket.mensajes ?? []).map((m) => adaptMessage(m, String(ticket.id))),
    unreadCount: ticket.mensajes_sin_leer || 0,
    category: ticket.categoria,
    source: 'admin',
  };

  return unifiedTicket;
}

export function adaptAdminTickets(tickets: AdminTicket[]): UnifiedTicket[] {
  return tickets.map(adaptAdminTicket);
}
