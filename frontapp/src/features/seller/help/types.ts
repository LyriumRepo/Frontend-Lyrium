export type TicketStatus = 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
export type TicketCategory = 'critico' | 'tecnico' | 'negativo' | 'informacion' | 'positivo';

export interface SellerTicket {
    id: string;
    ticketNumber: string;
    subject: string;
    description: string;
    category: TicketCategory;
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
