import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import { getAuthHeaders } from './token-store';
import type { ApiResponse } from './base-client';

export interface ChatSeller {
  id: string;
  name: string;
  store: string;
  avatar?: string;
}

export interface ChatAttachment {
  id: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  url: string;
  download_url: string;
}

export interface ChatCustomer {
  id: string;
  name: string;
  email: string;
}

export interface ChatConversation {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerStore: string;
  sellerAvatar?: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerDocumentNumber?: string;
  customerAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'active' | 'archived';
  category?: string;
  subject?: string;
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'seller';
  content: string;
  timestamp: string;
  read: boolean;
  attachments?: ChatAttachment[];
}

interface RawConversation {
  id: string;
  seller_id: string;
  seller_name: string;
  seller_store: string;
  seller_avatar: string;
  customer_id?: string;
  customer_name?: string;
  customer_email?: string;
  customer_document_number?: string;
  customer_avatar?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  status: string;
  category?: string;
  subject?: string;
  messages?: RawMessage[];
}

interface RawAttachment {
  id: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  url: string;
  download_url: string;
}

interface RawMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_type: string;
  content: string;
  timestamp: string;
  read: boolean;
  attachments?: RawAttachment[];
}

export interface CreateChatPayload {
  store_id: string;
  category: string;
  subject: string;
  message: string;
  customer_user_id?: string;
}

function mapConversation(raw: RawConversation): ChatConversation {
  return {
    id: raw.id,
    sellerId: raw.seller_id,
    sellerName: raw.seller_name,
    sellerStore: raw.seller_store,
    sellerAvatar: raw.seller_avatar,
    customerId: raw.customer_id,
    customerName: raw.customer_name,
    customerEmail: raw.customer_email,
    customerDocumentNumber: raw.customer_document_number,
    customerAvatar: raw.customer_avatar,
    lastMessage: raw.last_message,
    lastMessageTime: raw.last_message_time,
    unreadCount: raw.unread_count,
    status: raw.status === 'archived' ? 'archived' : 'active',
    category: raw.category,
    subject: raw.subject,
    messages: raw.messages?.map(mapMessage),
  };
}

function mapAttachment(raw: RawAttachment): ChatAttachment {
  return {
    id: raw.id,
    file_name: raw.file_name,
    mime_type: raw.mime_type,
    file_size: raw.file_size,
    url: raw.url,
    download_url: raw.download_url,
  };
}

function mapMessage(raw: RawMessage): ChatMessage {
  return {
    id: raw.id,
    conversationId: raw.conversation_id,
    senderId: raw.sender_id,
    senderName: raw.sender_name,
    senderType: raw.sender_type === 'seller' ? 'seller' : 'customer',
    content: raw.content,
    timestamp: raw.timestamp,
    read: raw.read,
    attachments: raw.attachments?.map(mapAttachment),
  };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${LARAVEL_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
      ...headers,
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
    throw new Error(error.message || error.error || `API Error: ${response.status}`);
  }
  if (response.status === 204) return {} as T;
  const text = await response.text();
  return text ? JSON.parse(text) : {} as T;
}

async function multipartRequest<T>(endpoint: string, formData: FormData): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${LARAVEL_API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      ...headers,
    },
    body: formData,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
    throw new Error(error.message || error.error || `API Error: ${response.status}`);
  }
  const text = await response.text();
  return text ? JSON.parse(text) : {} as T;
}

export const chatApi = {
  list: async (): Promise<ChatConversation[]> => {
    const response = await request<ApiResponse<RawConversation[]>>('/conversations');
    return Array.isArray(response.data) ? response.data.map(mapConversation) : [];
  },

  get: async (id: string): Promise<ChatConversation | null> => {
    try {
      const response = await request<ApiResponse<RawConversation>>(`/conversations/${id}`);
      return response.data ? mapConversation(response.data) : null;
    } catch {
      return null;
    }
  },

  create: async (payload: CreateChatPayload): Promise<ChatConversation> => {
    const response = await request<ApiResponse<RawConversation>>('/conversations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapConversation(response.data!);
  },

  sendMessage: async (conversationId: string, content: string): Promise<ChatMessage> => {
    const response = await request<ApiResponse<RawMessage>>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    return mapMessage(response.data!);
  },

  sendMessageWithAttachment: async (conversationId: string, content: string, files: File[]): Promise<ChatMessage> => {
    const formData = new FormData();
    if (content.trim()) {
      formData.append('content', content);
    }
    files.forEach((file) => {
      formData.append('attachments[]', file);
    });

    const response = await multipartRequest<ApiResponse<RawMessage>>(
      `/conversations/${conversationId}/messages/attachments`,
      formData,
    );
    return mapMessage(response.data!);
  },

  getMessages: async (conversationId: string, beforeId?: string): Promise<{ data: ChatMessage[]; hasMore: boolean }> => {
    const query = beforeId ? `?before_id=${beforeId}` : '';
    const response = await request<ApiResponse<RawMessage[]> & { has_more: boolean }>(`/conversations/${conversationId}/messages${query}`);
    return {
      data: Array.isArray(response.data) ? response.data.map(mapMessage) : [],
      hasMore: response.has_more ?? false,
    };
  },

  markRead: async (conversationId: string): Promise<void> => {
    await request(`/conversations/${conversationId}/read`, { method: 'PUT' });
  },

  archive: async (conversationId: string): Promise<void> => {
    await request(`/conversations/${conversationId}/archive`, { method: 'PUT' });
  },

  myStores: async (): Promise<{ id: string; name: string }[]> => {
    const response = await request<ApiResponse<{ id: string; name: string }[]>>('/conversations/my-stores');
    return Array.isArray(response.data) ? response.data : [];
  },

  customers: async (query?: string): Promise<ChatCustomer[]> => {
    const q = query ? `?q=${encodeURIComponent(query)}` : '';
    const response = await request<ApiResponse<ChatCustomer[]>>(`/conversations/customers${q}`);
    return Array.isArray(response.data) ? response.data : [];
  },

  stores: async (): Promise<ChatSeller[]> => {
    const response = await request<ApiResponse<ChatSeller[]>>('/conversations/stores');
    return Array.isArray(response.data) ? response.data : [];
  },
};
