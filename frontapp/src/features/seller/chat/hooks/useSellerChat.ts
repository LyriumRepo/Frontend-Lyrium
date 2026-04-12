'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChatConversation, ChatMessage, ChatFilters } from '../types';
import { MOCK_CHAT_DATA, getAutoResponse } from '../mock';

export function useSellerChat() {
    const queryClient = useQueryClient();
    const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
    const [filters, setFiltersState] = useState<ChatFilters>({
        search: '',
        category: 'all'
    });
    const [isMobileListVisible, setIsMobileListVisible] = useState(true);

    const { data: conversations = [], isLoading } = useQuery({
        queryKey: ['seller', 'chat', 'list'],
        queryFn: async () => {
            await new Promise(r => setTimeout(r, 800));
            return [...MOCK_CHAT_DATA] as ChatConversation[];
        },
        staleTime: 5 * 60 * 1000,
    });

    const sendMutation = useMutation({
        mutationFn: async ({ conversationId, content }: { conversationId: number; content: string }) => {
            await new Promise(r => setTimeout(r, 400));
            return { conversationId, content };
        },
        onSuccess: ({ conversationId, content }) => {
            const now = new Date();
            const hora = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

            queryClient.setQueryData(['seller', 'chat', 'list'], (old: any) => {
                if (!old) return old;
                return old.map((c: ChatConversation) => {
                    if (c.id === conversationId) {
                        return {
                            ...c,
                            mensajes: [...c.mensajes, { sender: 'user', contenido: content, hora, status: 'sent' }],
                            ultimoMensaje: content,
                            fecha: hora
                        };
                    }
                    return c;
                });
            });

            setTimeout(() => {
                const autoResponse = getAutoResponse(conversationId);
                queryClient.setQueryData(['seller', 'chat', 'list'], (old: any) => {
                    if (!old) return old;
                    return old.map((c: ChatConversation) => {
                        if (c.id === conversationId) {
                            return {
                                ...c,
                                mensajes: [...c.mensajes, autoResponse],
                                ultimoMensaje: autoResponse.contenido,
                                fecha: autoResponse.hora
                            };
                        }
                        return c;
                    });
                });
            }, 1500);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await new Promise(r => setTimeout(r, 600));
            return id;
        },
        onSuccess: (id) => {
            queryClient.setQueryData(['seller', 'chat', 'list'], (old: any) => {
                return old?.filter((c: ChatConversation) => c.id !== id);
            });
            setActiveConversationId(null);
            setIsMobileListVisible(true);
        }
    });

    const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

    const filteredConversations = conversations.filter(conv => {
        const matchesSearch = conv.nombre.toLowerCase().includes(filters.search.toLowerCase()) ||
            conv.dni.includes(filters.search) ||
            conv.ultimoMensaje.toLowerCase().includes(filters.search.toLowerCase());
        const matchesCategory = filters.category === 'all' || conv.type === filters.category;
        return matchesSearch && matchesCategory;
    });

    const criticalCount = conversations.filter(c => c.critical).length;

    return {
        conversations: filteredConversations,
        totalConversations: conversations.length,
        activeConversation,
        setActiveConversation: (conv: ChatConversation | null) => {
            setActiveConversationId(conv?.id || null);
            if (conv && typeof window !== 'undefined' && window.innerWidth < 768) {
                setIsMobileListVisible(false);
            }
        },
        isLoading,
        filters,
        setFilters: (newFilters: Partial<ChatFilters>) => setFiltersState(prev => ({ ...prev, ...newFilters })),
        isMobileListVisible,
        setIsMobileListVisible,
        sendMessage: (content: string) => {
            if (activeConversationId) sendMutation.mutate({ conversationId: activeConversationId, content });
        },
        clearActiveChat: () => {
            if (activeConversationId) {
                queryClient.setQueryData(['seller', 'chat', 'list'], (old: any) =>
                    old.map((c: ChatConversation) => c.id === activeConversationId ? { ...c, mensajes: [] } : c)
                );
            }
        },
        deleteActiveTicket: () => {
            if (activeConversationId) deleteMutation.mutate(activeConversationId);
        },
        criticalCount
    };
}
