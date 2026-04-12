export interface CustomerConversation {
    id: string;
    sellerId: string;
    sellerName: string;
    sellerStore: string;
    sellerAvatar?: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    status: 'active' | 'archived';
}

export interface CustomerMessage {
    id: string;
    conversationId: string;
    senderId: string;
    senderName: string;
    senderType: 'customer' | 'seller';
    content: string;
    timestamp: string;
    read: boolean;
}

export interface CustomerChatFilters {
    status: 'all' | 'active' | 'archived';
    search: string;
}
