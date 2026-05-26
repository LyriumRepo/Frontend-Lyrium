import { useState, useCallback, useEffect, useRef } from 'react';
import { CustomerConversation, CustomerMessage, CustomerChatFilters, ChatCategory } from '../types';
import { chatApi, ChatSeller } from '@/shared/lib/api/chatRepository';

export function useCustomerChat() {
  const [conversations, setConversations] = useState<CustomerConversation[]>([]);
  const [sellers, setSellers] = useState<ChatSeller[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [filters, setFilters] = useState<CustomerChatFilters>({
    status: 'all',
    search: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId) ?? null;
  const [messages, setMessages] = useState<CustomerMessage[]>([]);

  const totalConversations = conversations.length;
  const criticalCount = conversations.filter(c => c.unreadCount > 0).length;

  const loadConversations = useCallback(async () => {
    try {
      setError(null);
      const data = await chatApi.list();
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar conversaciones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSellers = useCallback(async () => {
    try {
      const data = await chatApi.stores();
      setSellers(data);
    } catch {
    }
  }, []);

  useEffect(() => {
    loadConversations();
    loadSellers();
  }, [loadConversations, loadSellers]);

  useEffect(() => {
    if (activeConversationId) {
      chatApi.getMessages(activeConversationId).then(result => {
        setMessages(result.data);
      }).catch(() => {
        setMessages([]);
      });
    } else {
      setMessages([]);
    }
  }, [activeConversationId]);

  const setActiveConversation = useCallback((id: string | null) => {
    setActiveConversationId(id);
    if (id) {
      chatApi.markRead(id).catch(() => {});
      setConversations(prev => prev.map(c =>
        c.id === id ? { ...c, unreadCount: 0 } : c
      ));
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!activeConversationId || !content.trim()) return;

    setIsSending(true);
    try {
      const newMessage = await chatApi.sendMessage(activeConversationId, content);
      setMessages(prev => [...prev, newMessage]);
      setConversations(prev => prev.map(c =>
        c.id === activeConversationId
          ? { ...c, lastMessage: content, lastMessageTime: newMessage.timestamp }
          : c
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar mensaje');
    } finally {
      setIsSending(false);
    }
  }, [activeConversationId]);

  const clearActiveChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
  }, []);

  const archiveConversation = useCallback(async (id: string) => {
    try {
      await chatApi.archive(id);
      setConversations(prev => prev.map(c =>
        c.id === id ? { ...c, status: 'archived' as const } : c
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al archivar');
    }
  }, []);

  const createConversation = useCallback(async (data: {
    sellerId: string;
    category: ChatCategory;
    subject: string;
  }) => {
    setIsCreating(true);
    try {
      const newConversation = await chatApi.create({
        store_id: data.sellerId,
        category: data.category,
        subject: data.subject,
        message: data.subject,
      });
      setConversations(prev => [newConversation, ...prev]);
      setActiveConversationId(newConversation.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear conversación');
    } finally {
      setIsCreating(false);
    }
  }, []);

  const refresh = useCallback(() => {
    setIsLoading(true);
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    sellers,
    totalConversations,
    activeConversation,
    setActiveConversation,
    messages,
    isLoading,
    error,
    filters,
    setFilters,
    sendMessage,
    isSending,
    clearActiveChat,
    archiveConversation,
    isCreating,
    createConversation,
    criticalCount,
    refresh,
  };
}
