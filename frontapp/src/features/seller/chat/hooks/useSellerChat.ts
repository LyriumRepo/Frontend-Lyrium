'use client';

import { useState, useEffect, useRef } from 'react';
import { chatApi, ChatConversation as ApiConversation, ChatMessage as ApiMessage } from '@/shared/lib/api/chatRepository';
import { ChatConversation, ChatMessage, ChatFilters } from '../types';

const CATEGORY_LABELS: Record<string, string> = {
    informacion: 'info',
    positivo: 'comment',
    negativo: 'comment',
    logistica: 'admin',
    facturacion: 'admin',
};

function formatTime(iso: string): string {
    try {
        const d = new Date(iso);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
        if (diffDays === 0) return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
        if (diffDays === 1) return 'AYER';
        if (diffDays < 7) return d.toLocaleDateString('es-PE', { weekday: 'long' }).toUpperCase();
        return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
    } catch {
        return iso;
    }
}

function mapConversation(api: ApiConversation): ChatConversation {
    return {
        id: parseInt(api.id, 10),
        nombre: api.customerName ?? api.sellerName,
        email: api.customerEmail ?? '',
        dni: api.customerDocumentNumber ?? '',
        avatar: api.customerAvatar ?? api.sellerAvatar ?? '',
        ultimoMensaje: api.lastMessage,
        fecha: formatTime(api.lastMessageTime),
        type: (CATEGORY_LABELS[api.category ?? ''] ?? 'info') as ChatConversation['type'],
        critical: false,
        mensajes: [],
    };
}

function mapMessage(msg: ApiMessage, isFromCustomer: boolean): ChatMessage {
    return {
        id: parseInt(msg.id, 10),
        sender: isFromCustomer ? 'other' : 'user',
        contenido: msg.content,
        hora: msg.timestamp,
        status: msg.read ? 'read' : 'sent',
    };
}

export function useSellerChat() {
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
    const [filters, setFiltersState] = useState<ChatFilters>({
        search: '',
        category: 'all'
    });
    const [isMobileListVisible, setIsMobileListVisible] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [messagesCache, setMessagesCache] = useState<Record<number, ChatMessage[]>>({});
    const messagesCacheRef = useRef<Record<number, ChatMessage[]>>({});

    useEffect(() => {
        messagesCacheRef.current = messagesCache;
    }, [messagesCache]);

    const activeConversation = conversations.find(c => c.id === activeConversationId) ?? null;

    useEffect(() => {
        setIsLoading(true);
        chatApi.list()
            .then(data => {
                setConversations(data.map(mapConversation));
            })
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        if (activeConversationId && !messagesCacheRef.current[activeConversationId]) {
            chatApi.getMessages(String(activeConversationId))
                .then(result => {
                    const apiMsgs = result.data;
                    const msgs = apiMsgs.map(m => mapMessage(m, m.senderType === 'customer'));
                    setMessagesCache(prev => ({ ...prev, [activeConversationId!]: msgs }));
                })
                .catch(() => {});
        }
    }, [activeConversationId]);

    const filteredConversations = conversations.filter(conv => {
        const matchesSearch = conv.nombre.toLowerCase().includes(filters.search.toLowerCase()) ||
            conv.dni.includes(filters.search) ||
            conv.ultimoMensaje.toLowerCase().includes(filters.search.toLowerCase());
        const matchesCategory = filters.category === 'all' || conv.type === filters.category;
        return matchesSearch && matchesCategory;
    });

    const criticalCount = 0;

    return {
        conversations: filteredConversations,
        totalConversations: conversations.length,
        activeConversation: activeConversation
            ? { ...activeConversation, mensajes: messagesCache[activeConversationId!] ?? [] }
            : null,
        setActiveConversation: (conv: ChatConversation | null) => {
            setActiveConversationId(conv?.id ?? null);
            if (conv && typeof window !== 'undefined' && window.innerWidth < 768) {
                setIsMobileListVisible(false);
            }
        },
        isLoading,
        filters,
        setFilters: (newFilters: Partial<ChatFilters>) => setFiltersState(prev => ({ ...prev, ...newFilters })),
        isMobileListVisible,
        setIsMobileListVisible,
        sendMessage: async (content: string) => {
            if (!activeConversationId || !content.trim()) return;
            const apiMsg = await chatApi.sendMessage(String(activeConversationId), content).catch(() => null);
            if (!apiMsg) return;
            const msg = mapMessage(apiMsg, apiMsg.senderType === 'customer');
            setMessagesCache(prev => ({
                ...prev,
                [activeConversationId!]: [...(prev[activeConversationId!] ?? []), msg],
            }));
            setConversations(prev => prev.map(c =>
                c.id === activeConversationId
                    ? { ...c, ultimoMensaje: content, fecha: formatTime(apiMsg.timestamp) }
                    : c
            ));
        },
        clearActiveChat: () => {
            if (activeConversationId) {
                setMessagesCache(prev => ({ ...prev, [activeConversationId]: [] }));
            }
        },
        deleteActiveTicket: async () => {
            if (!activeConversationId) return;
            await chatApi.archive(String(activeConversationId)).catch(() => {});
            setConversations(prev => prev.filter(c => c.id !== activeConversationId));
            setActiveConversationId(null);
            setIsMobileListVisible(true);
        },
        criticalCount,
    };
}
