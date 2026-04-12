import { UnifiedTicket, UnifiedMessage, TicketStatus } from '../types';

interface LogisticsTicketMessage {
  id: string;
  sender: 'operator' | 'admin';
  senderName: string;
  content: string;
  timestamp: string;
}

interface LogisticsTicket {
  id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  messages: LogisticsTicketMessage[];
}

function normalizeStatus(status: string): TicketStatus {
  const map: Record<string, TicketStatus> = {
    'open': 'open',
    'in_progress': 'in_progress',
    'resolved': 'resolved',
    'closed': 'closed',
  };
  return map[status] || 'open';
}

function adaptMessage(msg: LogisticsTicketMessage, ticketId: string): UnifiedMessage {
  const isOperator = msg.sender === 'operator';
  
  return {
    id: msg.id,
    ticketId,
    senderId: msg.id,
    senderName: msg.senderName,
    senderRole: isOperator ? 'vendor' : 'admin',
    content: msg.content,
    timestamp: new Date(msg.timestamp),
    hour: new Date(msg.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
  };
}

export function adaptLogisticsTicket(ticket: LogisticsTicket): UnifiedTicket {
  return {
    id: ticket.id,
    displayId: ticket.id,
    title: ticket.subject,
    status: normalizeStatus(ticket.status),
    priority: ticket.priority as any,
    assignedTo: {
      role: 'logistics',
      id: ticket.id,
      name: 'Operador Logístico',
    },
    requester: {
      name: ticket.messages[0]?.senderName || 'Operador',
    },
    createdAt: new Date(ticket.createdAt),
    updatedAt: new Date(ticket.updatedAt),
    messages: ticket.messages.map((m) => adaptMessage(m, ticket.id)),
    unreadCount: 0,
    source: 'logistics',
  };
}

export function adaptLogisticsTickets(tickets: LogisticsTicket[]): UnifiedTicket[] {
  return tickets.map(adaptLogisticsTicket);
}
