export type TicketStatus = 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory = 'technical' | 'billing' | 'order' | 'shipping' | 'general';

export interface CustomerTicket {
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
