import { UnifiedTicketListItem } from '../types';

interface AdminTicket {
  id: number;
  id_display: string;
  numero?: string;
  titulo: string;
  asunto?: string;
  descripcion?: string;
  ultimo_mensaje?: string;
  vendedor?: {
    id: number;
    nombre: string;
    empresa?: string;
  };
  prioridad?: string;
  prioridad_ticket?: string;
  estado: string;
  fecha_actualizacion?: string;
  mensajes_sin_leer: number;
  total_mensajes?: number;
  mensajes?: Array<{ id: number }>;
}

function normalizeStatus(status: string): string {
  const normalized = status
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const map: Record<string, string> = {
    abierto: 'abierto',
    open: 'open',
    'en proceso': 'proceso',
    proceso: 'proceso',
    in_progress: 'in_progress',
    resuelto: 'resuelto',
    resolved: 'resolved',
    cerrado: 'cerrado',
    closed: 'closed',
    reabierto: 'reabierto',
    reopened: 'reopened',
  };

  return map[normalized] || normalized;
}

export function adaptAdminTicketListItem(ticket: AdminTicket): UnifiedTicketListItem {
  return {
    id: String(ticket.id),
    displayId: ticket.numero || ticket.id_display,
    title: ticket.asunto || ticket.titulo,
    description: ticket.ultimo_mensaje || ticket.descripcion,
    status: normalizeStatus(ticket.estado),
    priority: ticket.prioridad || ticket.prioridad_ticket,
    requester: {
      name: ticket.vendedor?.nombre || 'Vendedor',
      company: ticket.vendedor?.empresa,
    },
    updatedAt: ticket.fecha_actualizacion || 'Ahora',
    unreadCount: ticket.mensajes_sin_leer,
    messageCount: ticket.total_mensajes ?? ticket.mensajes?.length ?? 0,
    source: 'admin',
  };
}

export function adaptAdminTicketList(tickets: AdminTicket[]): UnifiedTicketListItem[] {
  return tickets.map(adaptAdminTicketListItem);
}
