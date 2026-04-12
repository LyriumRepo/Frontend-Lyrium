'use client';

import React from 'react';
import { ChatView as UnifiedChatView, ChatViewProps } from '@/modules/chat';
import { adaptAdminTicket } from '@/modules/chat/adapters/adminTicketAdapter';
import { Ticket, Admin, Priority } from '@/lib/types/admin/helpdesk';

interface LegacyChatViewProps {
    ticket: Ticket;
    admins: Admin[];
    onSendMessage: (text: string, attachments?: File[]) => void;
    onPriorityChange: (id: number, priority: Priority) => void;
    onAdminChange: (id: number, adminId: number) => void;
    onEscalate: () => void;
    onCloseTicket: () => void;
    onLoadMore?: () => void;
    isLoadingMore?: boolean;
    hasMoreMessages?: boolean;
}

export const ChatView: React.FC<LegacyChatViewProps> = ({
    ticket,
    admins,
    onSendMessage,
    onPriorityChange,
    onAdminChange,
    onEscalate,
    onCloseTicket,
    onLoadMore,
    isLoadingMore,
    hasMoreMessages,
}) => {
    const unifiedTicket = adaptAdminTicket(ticket as any);

    const handlePriorityChange = (id: string, priority: any) => {
        onPriorityChange(ticket.id, priority);
    };

    const handleAdminChange = (id: string, adminId: string) => {
        onAdminChange(ticket.id, parseInt(adminId));
    };

    return (
        <UnifiedChatView
            ticket={unifiedTicket}
            onSendMessage={({ text, attachments }) => onSendMessage(text, attachments)}
            onPriorityChange={handlePriorityChange}
            onAdminChange={handleAdminChange}
            onEscalate={onEscalate}
            onCloseTicket={onCloseTicket}
            showAdminControls={true}
            onLoadMore={onLoadMore}
            isLoadingMore={isLoadingMore}
            hasMoreMessages={hasMoreMessages}
        />
    );
};
