import { useState, useCallback, useEffect, useRef } from 'react';
import { useEcho } from '@laravel/echo-react';
import { SellerConversation, SellerMessage, SellerChatFilters, ChatCategory } from '../types';
import { chatApi, ChatCustomer } from '@/shared/lib/api/chatRepository';

export function useSellerChat() {
  const [conversations, setConversations] = useState<SellerConversation[]>([]);
  const [customers, setCustomers] = useState<ChatCustomer[]>([]);
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [filters, setFilters] = useState<SellerChatFilters>({
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
  const [messages, setMessages] = useState<SellerMessage[]>([]);

  const totalConversations = conversations.length;
  const criticalCount = conversations.filter(c => c.unreadCount > 0).length;

  const loadConversations = useCallback(async () => {
    try {
      setError(null);
      const data = await chatApi.list();
      const mapped: SellerConversation[] = data.map(c => ({
        id: c.id,
        customerId: c.customerId ?? c.sellerId,
        customerName: c.customerName ?? 'Cliente',
        lastMessage: c.lastMessage,
        lastMessageTime: c.lastMessageTime,
        unreadCount: c.unreadCount,
        status: c.status,
        category: c.category as ChatCategory | undefined,
        subject: c.subject,
      }));
      setConversations(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar conversaciones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadStores = useCallback(async () => {
    try {
      const data = await chatApi.myStores();
      setStores(data);
    } catch {
    }
  }, []);

  const loadCustomers = useCallback(async () => {
    try {
      const data = await chatApi.customers();
      setCustomers(data);
    } catch {
    }
  }, []);

  // Polling: reload conversations every 10s
  useEffect(() => {
    pollingRef.current = setInterval(() => {
      loadConversations();
    }, 10000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [loadConversations]);

  useEffect(() => {
    loadConversations();
    loadCustomers();
    loadStores();
  }, [loadConversations, loadCustomers, loadStores]);

  useEffect(() => {
    activeConvRef.current = activeConversationId;
  }, [activeConversationId]);

  const reloadMessages = useCallback((convId: string) => {
    chatApi.getMessages(convId).then(result => {
      setMessages(result.data.map(m => ({
        id: m.id,
        conversationId: m.conversationId,
        senderId: m.senderId,
        senderName: m.senderName,
        senderType: m.senderType as 'seller' | 'customer',
        content: m.content,
        timestamp: m.timestamp,
        read: m.read,
      })));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeConversationId) {
      reloadMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId, reloadMessages]);

  // WebSocket: mensajes en tiempo real
  // Use a placeholder channel when stores haven't loaded yet to avoid subscribing to "store.0"
  const primaryStoreId = stores[0]?.id ?? null;
  useEcho<{ conversation_id: string }>(
    primaryStoreId ? `store.${primaryStoreId}` : 'store.__placeholder',
    'NewConversationMessage',
    () => {
      loadConversations();
      const convId = activeConvRef.current;
      if (convId) reloadMessages(convId);
    },
    [loadConversations, reloadMessages, primaryStoreId],
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
      setMessages(prev => [...prev, {
        id: newMessage.id,
        conversationId: newMessage.conversationId,
        senderId: newMessage.senderId,
        senderName: newMessage.senderName,
        senderType: newMessage.senderType as 'seller' | 'customer',
        content: newMessage.content,
        timestamp: newMessage.timestamp,
        read: newMessage.read,
      }]);
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
    storeId: string;
    customerId: string;
    category: ChatCategory;
    subject: string;
  }) => {
    setIsCreating(true);
    try {
      const newConversation = await chatApi.create({
        store_id: data.storeId,
        customer_user_id: data.customerId,
        category: data.category,
        subject: data.subject,
        message: data.subject,
      });
      const mapped: SellerConversation = {
        id: newConversation.id,
        customerId: newConversation.customerId ?? data.customerId,
        customerName: newConversation.customerName ?? 'Cliente',
        lastMessage: newConversation.lastMessage,
        lastMessageTime: newConversation.lastMessageTime,
        unreadCount: 0,
        status: 'active',
        category: data.category,
        subject: data.subject,
      };
      setConversations(prev => [mapped, ...prev]);
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
    customers,
    stores,
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
