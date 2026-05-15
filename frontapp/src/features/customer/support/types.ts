export type TicketStatus = 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
export type TicketCategory = 'critico' | 'tecnico' | 'negativo' | 'informacion' | 'positivo';

export interface CustomerTicket {
    id: string;
    ticketNumber: string;
    subject: string;
    description: string;
    category: TicketCategory;
    status: TicketStatus;
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
    messages: CustomerTicketMessage[];
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
