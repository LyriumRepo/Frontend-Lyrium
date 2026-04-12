import { UnifiedTicketListItem, TicketType } from '../types';

interface SellerTicket {
  id: number;
  id_display: string;
  titulo: string;
  descripcion: string;
  ultimo_mensaje?: string;
  status: string;
  type?: TicketType;
  tipo?: TicketType;
  tiempo: string;
  mensajes_count: number;
  mensajes_sin_leer?: number;
  tienda?: {
    razon_social: string;
    nombre_comercial: string;
  };
  vendedor?: {
    id: number;
    nombre: string;
    empresa?: string;
  };
}

export function adaptSellerTicketListItem(ticket: SellerTicket): UnifiedTicketListItem {
  const category = ticket.type || ticket.tipo;
  
  return {
    id: String(ticket.id),
    displayId: ticket.id_display,
    title: ticket.titulo,
    description: ticket.ultimo_mensaje || ticket.descripcion,
    status: ticket.status as UnifiedTicketListItem['status'],
    category,
    requester: {
      name: ticket.tienda?.razon_social || ticket.vendedor?.nombre || 'Vendedor',
      company: ticket.tienda?.nombre_comercial || ticket.vendedor?.empresa,
    },
    updatedAt: ticket.tiempo,
    unreadCount: ticket.mensajes_sin_leer ?? 0,
    messageCount: ticket.mensajes_count || 0,
    source: 'seller',
  };
}

export function adaptSellerTicketList(tickets: SellerTicket[]): UnifiedTicketListItem[] {
  return tickets.map(adaptSellerTicketListItem);
}
