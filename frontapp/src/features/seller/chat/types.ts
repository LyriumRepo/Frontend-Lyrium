export type ChatCategory = 'facturacion' | 'logistica' | 'negativo' | 'informacion' | 'positivo';

export interface SellerConversation {
    id: string;
    customerId: string;
    customerName: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    status: 'active' | 'archived';
    category?: ChatCategory;
    subject?: string;
}

export interface SellerMessage {
    id: string;
    conversationId: string;
    senderId: string;
    senderName: string;
    senderType: 'seller' | 'customer';
    content: string;
    timestamp: string;
    read: boolean;
}

export interface SellerChatFilters {
    status: 'all' | 'active' | 'archived';
    search: string;
}
