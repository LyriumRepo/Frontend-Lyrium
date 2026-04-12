'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';

export interface ChatMessage {
  id: string;
  sender: string;
  senderName?: string;
  content: string;
  timestamp: string;
  read?: boolean;
}

export interface ChatConversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: ChatMessage[];
  category?: string;
  [key: string]: unknown;
}

export interface ChatFilters {
  search: string;
  category?: string;
  [key: string]: string | undefined;
}

export interface UseChatBaseOptions<T extends ChatConversation> {
  initialConversations?: T[];
  filterFields?: (keyof T | ((item: T, search: string) => boolean))[];
  filterFn?: (conv: T, filters: ChatFilters) => boolean;
  autoResponse?: (conversationId: string, message: string) => ChatMessage | null;
  onMessageSent?: (conversationId: string, message: string) => void;
  idType?: 'string' | 'number';
}

export interface UseChatBaseReturn<T extends ChatConversation> {
  conversations: T[];
  totalConversations: number;
  activeConversation: T | null;
  activeConversationId: string | number | null;
  setActiveConversation: (conv: T | null) => void;
  filters: ChatFilters;
  setFilters: (newFilters: Partial<ChatFilters>) => void;
  sendMessage: (content: string) => void;
  clearActiveChat: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  setConversations: React.Dispatch<React.SetStateAction<T[]>>;
}

export function useChatBase<T extends ChatConversation = ChatConversation>(
  options: UseChatBaseOptions<T>
): UseChatBaseReturn<T> {
  const {
    initialConversations = [],
    filterFields = ['name', 'lastMessage'],
    filterFn,
    autoResponse,
    idType = 'string',
  } = options;

  const [conversations, setConversations] = useState<T[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | number | null>(null);
  const [filters, setFiltersState] = useState<ChatFilters>({ search: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef<number>(0);

  const activeConversation = useMemo(() => {
    if (!activeConversationId) return null;
    return conversations.find(c => c.id === String(activeConversationId)) || null;
  }, [conversations, activeConversationId]);

  const filteredConversations = useMemo(() => {
    let result = [...conversations];
    
    if (filters.search || filters.category) {
      const search = filters.search?.toLowerCase() || '';
      result = result.filter(c => {
        if (filterFn) {
          return filterFn(c, filters);
        }
        return filterFields.some(field => {
          if (typeof field === 'function') {
            return field(c, search);
          }
          const value = c[field];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(search);
          }
          return false;
        });
      });
    }
    
    return result.sort((a, b) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );
  }, [conversations, filters, filterFields, filterFn]);

  const setFilters = useCallback((newFilters: Partial<ChatFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters, search: newFilters.search ?? prev.search }));
  }, []);

  const setActiveConversation = useCallback((conv: T | null) => {
    prevMessagesLengthRef.current = 0;
    setActiveConversationId(conv?.id || null);
    
    if (conv) {
      setConversations(prev => prev.map(c => {
        if (c.id === conv.id) {
          return { ...c, unreadCount: 0 } as T;
        }
        return c;
      }));
    }
  }, []);

  useEffect(() => {
    const currentLength = activeConversation?.messages?.length || 0;
    if (currentLength > prevMessagesLengthRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
    prevMessagesLengthRef.current = currentLength;
  }, [activeConversation?.messages?.length]);

  const sendMessage = useCallback((content: string) => {
    if (!activeConversationId) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: idType === 'number' ? 'user' : 'operator',
      senderName: idType === 'number' ? 'Cliente' : 'Operador',
      content,
      timestamp: new Date().toISOString(),
      read: true,
    };

    setConversations(prev => prev.map(c => {
      if (c.id === String(activeConversationId)) {
        return {
          ...c,
          messages: [...(c.messages || []), newMessage],
          lastMessage: content,
          lastMessageTime: newMessage.timestamp,
        } as T;
      }
      return c;
    }));

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    if (autoResponse) {
      setTimeout(() => {
        const response = autoResponse(String(activeConversationId), content);
        if (response) {
          setConversations(prev => prev.map(c => {
            if (c.id === String(activeConversationId)) {
              return {
                ...c,
                messages: [...(c.messages || []), response],
                lastMessage: response.content,
                lastMessageTime: response.timestamp,
              } as T;
            }
            return c;
          }));
        }
      }, 1500);
    }
  }, [activeConversationId, idType, autoResponse]);

  const clearActiveChat = useCallback(() => {
    if (activeConversationId) {
      setConversations(prev => prev.map(c => {
        if (c.id === String(activeConversationId)) {
          return { ...c, messages: [] } as T;
        }
        return c;
      }));
    }
  }, [activeConversationId]);

  return {
    conversations: filteredConversations,
    totalConversations: conversations.length,
    activeConversation,
    activeConversationId,
    setActiveConversation,
    filters,
    setFilters,
    sendMessage,
    clearActiveChat,
    messagesEndRef,
    setConversations,
  };
}
