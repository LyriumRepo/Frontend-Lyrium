export type ChatCategory = 'facturacion' | 'logistica' | 'negativo' | 'informacion' | 'positivo';

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
  category?: string;
  subject?: string;
  messages?: CustomerMessage[];
}

export interface CustomerAttachment {
  id: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  url: string;
  download_url: string;
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
  attachments?: CustomerAttachment[];
}

export interface CustomerChatFilters {
  status: 'all' | 'active' | 'archived';
  search: string;
}
