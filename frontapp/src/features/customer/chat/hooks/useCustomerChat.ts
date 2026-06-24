import { useState, useCallback, useEffect, useRef } from 'react';
import { useEcho } from '@laravel/echo-react';
import { CustomerConversation, CustomerMessage, CustomerChatFilters, ChatCategory } from '../types';
import { chatApi, ChatSeller } from '@/shared/lib/api/chatRepository';
import { useAuth } from '@/shared/lib/context/AuthContext';

export function useCustomerChat(initialConversationId?: string) {
  const { user } = useAuth();
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
  const initialSelectionDone = useRef(false);
  const activeConvRef = useRef<string | null>(null);

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

  // Auto-seleccionar conversación si se proporcionó un ID inicial
  useEffect(() => {
    if (!isLoading && !initialSelectionDone.current && initialConversationId && conversations.length > 0) {
      const exists = conversations.find(c => c.id === initialConversationId);
      if (exists) {
        setActiveConversationId(initialConversationId);
        initialSelectionDone.current = true;
      }
    }
  }, [isLoading, conversations, initialConversationId]);

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

  // Polling: reload conversations every 10s for real-time updates
  useEffect(() => {
    const id = setInterval(() => loadConversations(), 10000);
    return () => clearInterval(id);
  }, [loadConversations]);

  useEffect(() => {
    activeConvRef.current = activeConversationId;
  }, [activeConversationId]);

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

  // WebSocket: mensajes en tiempo real
  useEcho<{ conversation_id: string }>(
    user?.id ? `user.${user.id}` : 'user.__placeholder',
    'NewConversationMessage',
    () => {
      loadConversations();
      const convId = activeConvRef.current;
      if (convId) {
        chatApi.getMessages(convId).then(result => {
          setMessages(result.data);
        }).catch(() => {});
      }
    },
    [loadConversations, user?.id],
  );

  const setActiveConversation = useCallback((id: string | null) => {
    setActiveConversationId(id);
    if (id) {
      chatApi.markRead(id).catch(() => {});
      setConversations(prev => prev.map(c =>
        c.id === id ? { ...c, unreadCount: 0 } : c
      ));
    }
  }, []);

  const sendMessage = useCallback(async (content: string, files?: File[]) => {
    if (!activeConversationId) return;
    if (!content.trim() && (!files || files.length === 0)) return;

    setIsSending(true);
    try {
      const newMessage = files && files.length > 0
        ? await chatApi.sendMessageWithAttachment(activeConversationId, content, files)
        : await chatApi.sendMessage(activeConversationId, content);
      setMessages(prev => [...prev, newMessage]);
      setConversations(prev => prev.map(c =>
        c.id === activeConversationId
          ? { ...c, lastMessage: content || '(archivo adjunto)', lastMessageTime: newMessage.timestamp }
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
