/**
 * CORE TYPES - Unified Domain Model
 * Standardizing on English keys for better interoperability.
 */

export type ID = string | number;

export type UserRole = 'admin' | 'seller' | 'operator' | 'customer' | 'system';

export interface CoreUser {
    id: ID;
    name: string;
    email?: string;
    avatar?: string;
    role: UserRole;
    company?: string;
}

export type MessageType = 'text' | 'image' | 'file' | 'system' | 'action';

export interface CoreMessage {
    id: ID;
    senderId: ID;
    senderName: string;
    senderRole: UserRole;
    content: string;
    timestamp: string;
    isRead: boolean;
    type: MessageType;
    metadata?: Record<string, any>;
}

export interface CoreConversation {
    id: ID;
    participants: CoreUser[];
    lastMessage?: CoreMessage;
    unreadCount: number;
    updatedAt: string;
    isActive: boolean;
}

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'reopened';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface CoreTicket {
    id: ID;
    reference: string; // e.g., TKT-123
    subject: string;
    description: string;
    status: TicketStatus;
    priority: Priority;
    creator: CoreUser;
    assignee?: CoreUser;
    category: string;
    createdAt: string;
    updatedAt: string;
    messages: CoreMessage[];
}
