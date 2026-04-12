'use client';

import { useMemo } from 'react';
import { useChatBase, ChatConversation as BaseConversation, ChatFilters as BaseFilters } from '@/modules/chat';
import { LogisticsConversation } from '@/lib/types/logistics';
import { mockLogisticsConversations } from '@/lib/mocks/logistics';

interface LogisticsChatConversation extends BaseConversation {
  vendorId: number;
  orderId: string;
}

function toBaseConversation(conv: LogisticsConversation): LogisticsChatConversation {
  return {
    id: conv.id,
    name: conv.vendorName,
    lastMessage: conv.lastMessage,
    lastMessageTime: conv.lastMessageTime,
    unreadCount: conv.unreadCount,
    messages: conv.messages.map(m => ({
      id: m.id,
      sender: m.sender,
      senderName: m.senderName,
      content: m.content,
      timestamp: m.timestamp,
      read: m.read,
    })),
    vendorId: conv.vendorId,
    orderId: conv.orderId,
  };
}

export function useLogisticsChat() {
  const conversations = useMemo(() => 
    mockLogisticsConversations.map(toBaseConversation), 
  []);

  const chatBase = useChatBase<LogisticsChatConversation>({
    initialConversations: conversations,
    idType: 'string',
    filterFn: (conv, filters) => {
      if (!filters.search) return true;
      const search = filters.search.toLowerCase();
      return conv.name.toLowerCase().includes(search) || 
             conv.orderId.toLowerCase().includes(search);
    },
  });

  const totalUnread = useMemo(() => {
    return conversations.reduce((acc: number, c: LogisticsChatConversation) => acc + c.unreadCount, 0);
  }, [conversations]);

  return {
    conversations: chatBase.conversations,
    selectedConversation: chatBase.activeConversation,
    setSelectedConversation: chatBase.setActiveConversation,
    filters: chatBase.filters as BaseFilters,
    setFilters: chatBase.setFilters,
    totalUnread,
    sendMessage: chatBase.sendMessage,
    messagesEndRef: chatBase.messagesEndRef,
  };
}
