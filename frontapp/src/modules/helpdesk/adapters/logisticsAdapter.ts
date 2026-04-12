import { UnifiedTicketListItem, TicketStatus, TicketPriority } from '../types';

interface LogisticsTicket {
    id: string;
    subject: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    createdAt: string;
    updatedAt: string;
    messages: { id: string }[];
}

function normalizePriority(priority: string): TicketPriority {
    const map: Record<string, TicketPriority> = {
        'low': 'baja',
        'medium': 'media',
        'high': 'alta',
        'urgent': 'critica',
    };
    return map[priority] || 'media';
}

function normalizeStatus(status: string): TicketStatus {
    const map: Record<string, TicketStatus> = {
        'open': 'abierto',
        'in_progress': 'proceso',
        'resolved': 'resuelto',
        'closed': 'cerrado',
    };
    return map[status] || 'abierto';
}

export function adaptLogisticsTicketListItem(ticket: LogisticsTicket): UnifiedTicketListItem {
    return {
        id: ticket.id,
        displayId: ticket.id,
        title: ticket.subject,
        status: normalizeStatus(ticket.status),
        priority: normalizePriority(ticket.priority),
        requester: {
            name: 'Operador Logístico',
        },
        updatedAt: ticket.updatedAt,
        unreadCount: 0,
        messageCount: ticket.messages.length,
        source: 'logistics',
    };
}

export function adaptLogisticsTicketList(tickets: LogisticsTicket[]): UnifiedTicketListItem[] {
    return tickets.map(adaptLogisticsTicketListItem);
}
