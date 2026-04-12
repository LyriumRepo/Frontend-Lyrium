'use client';

import React from 'react';
import { ChatView as UnifiedChatView } from '@/modules/chat';
import { adaptSellerTicket } from '@/modules/chat/adapters/sellerTicketAdapter';
import { Ticket } from '@/features/seller/help/types';

interface TicketChatViewProps {
    ticket: Ticket | null;
    isSending: boolean;
    isClosing: boolean;
    onSendMessage: (params: { text: string; attachments?: File[] }) => void;
    onCloseTicket: () => void;
    onSubmitSurvey: (params: { rating: number; comment: string }) => void;
    onBack?: () => void;
    onLoadMore?: () => void;
    isLoadingMore?: boolean;
    hasMoreMessages?: boolean;
}

export default function TicketChatView({
    ticket,
    isSending,
    isClosing,
    onSendMessage,
    onCloseTicket,
    onSubmitSurvey,
    onBack,
    onLoadMore,
    isLoadingMore,
    hasMoreMessages,
}: TicketChatViewProps) {
    if (!ticket) return null;

    const unifiedTicket = adaptSellerTicket(ticket);

    return (
        <UnifiedChatView
            key={unifiedTicket.id}
            ticket={unifiedTicket}
            onSendMessage={({ text, attachments }) => onSendMessage({ text, attachments })}
            onCloseTicket={onCloseTicket}
            onSubmitSurvey={(rating, comment) => onSubmitSurvey({ rating, comment })}
            onBack={onBack}
            onLoadMore={onLoadMore}
            isSending={isSending}
            isClosing={isClosing}
            isLoadingMore={isLoadingMore}
            hasMoreMessages={hasMoreMessages}
            quickReplies={[
                "Quiero que un asesor me contacte.",
                "Necesito información sobre mi solicitud.",
                "Quiero cancelar mi solicitud."
            ]}
        />
    );
}
