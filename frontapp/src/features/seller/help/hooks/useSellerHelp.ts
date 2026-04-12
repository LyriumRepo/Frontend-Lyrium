'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEcho } from '@laravel/echo-react';
import { Ticket, CreateTicketPayload, TicketFilters } from '../types';
import { ticketApi } from '@/lib/api/ticketRepository';
import { useToast } from '@/shared/lib/context/ToastContext';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { adaptSellerTicketListItem, adaptSellerTicketList, UnifiedTicketListItem } from '@/modules/helpdesk';

interface TicketInboxUpdatedEvent {
    ticket_id: number;
    unread_count: number;
    preview_text: string;
    total_messages: number;
}

export function useSellerHelp() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const { user } = useAuth();
    const [activeTicketId, setActiveTicketId] = useState<number | null>(null);
    const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
    const [filters, setFiltersState] = useState<TicketFilters>({
        search: '',
        category: 'all',
    });

    const refreshTicketData = async (ticketId?: number | null) => {
        await queryClient.invalidateQueries({ queryKey: ['seller', 'help', 'tickets'] });

        if (ticketId) {
            await queryClient.invalidateQueries({ queryKey: ['seller', 'help', 'ticket', ticketId] });
        }
    };

    const { data: tickets = [], isLoading, refetch, error } = useQuery({
        queryKey: ['seller', 'help', 'tickets'],
        queryFn: async () => {
            return ticketApi.seller.list();
        },
        staleTime: 5 * 60 * 1000,
        retry: 2,
    });

    const { data: activeTicketDetail } = useQuery({
        queryKey: ['seller', 'help', 'ticket', activeTicketId],
        queryFn: async () => {
            if (!activeTicketId) {
                return null;
            }

            return ticketApi.seller.get(activeTicketId);
        },
        enabled: !!activeTicketId,
        staleTime: 30 * 1000,
        retry: 1,
    });

    const sendMessageMutation = useMutation({
        mutationFn: async ({ ticketId, text, attachments }: { ticketId: number; text: string; attachments?: File[] }) => {
            return ticketApi.seller.sendMessage(ticketId, { content: text || undefined, attachments });
        },
        onSuccess: async (_result, variables) => {
            await refreshTicketData(variables.ticketId);
        },
        onError: () => {
            showToast('Error al enviar el mensaje. Intenta de nuevo.', 'error');
        },
    });

    const createTicketMutation = useMutation({
        mutationFn: async (formData: CreateTicketPayload) => {
            return ticketApi.seller.create(formData);
        },
        onSuccess: async (newTicket) => {
            queryClient.setQueryData(['seller', 'help', 'tickets'], (old: Ticket[] | undefined) => [newTicket, ...(old || [])]);
            setActiveTicketId(newTicket.id);
            await refreshTicketData(newTicket.id);
            showToast('Ticket generado con exito. Un especialista lo revisara pronto.', 'success');
        },
        onError: () => {
            showToast('Error al crear el ticket. Intenta de nuevo.', 'error');
        },
    });

    const closeTicketMutation = useMutation({
        mutationFn: async (ticketId: number) => {
            return ticketApi.seller.close(ticketId);
        },
        onSuccess: async (_result, ticketId) => {
            await refreshTicketData(ticketId);
            showToast('Ticket finalizado. Por favor completa la encuesta de satisfaccion.', 'info');
        },
        onError: () => {
            showToast('Error al cerrar el ticket. Intenta de nuevo.', 'error');
        },
    });

    const submitSurveyMutation = useMutation({
        mutationFn: async ({ ticketId, rating, comment }: { ticketId: number; rating: number; comment: string }) => {
            return ticketApi.seller.submitSurvey(ticketId, { rating, comment });
        },
        onSuccess: async (_result, variables) => {
            await refreshTicketData(variables.ticketId);
            showToast('Gracias por tu feedback. Nos ayuda a mejorar.', 'success');
        },
        onError: () => {
            showToast('Error al enviar la encuesta. Intenta de nuevo.', 'error');
        },
    });

    // WebSocket: escucha mensajes nuevos en el ticket activo (seller ve respuestas del admin en tiempo real)
    useEcho(
        `ticket.${activeTicketId ?? null}`,
        'TicketMessageReceived',
        () => {
            if (!activeTicketId) return;
            void queryClient.invalidateQueries({ queryKey: ['seller', 'help', 'ticket', activeTicketId] });
            void queryClient.invalidateQueries({ queryKey: ['seller', 'help', 'tickets'] });
        },
        [activeTicketId]
    );

    // WebSocket: el admin leyó los mensajes → actualizar checkmarks
    useEcho(
        `ticket.${activeTicketId ?? null}`,
        '.TicketMessagesRead',
        () => {
            if (!activeTicketId) return;
            void queryClient.invalidateQueries({ queryKey: ['seller', 'help', 'ticket', activeTicketId] });
        },
        [activeTicketId]
    );

    useEcho<TicketInboxUpdatedEvent>(
        `user.${user?.id ?? null}`,
        '.TicketInboxUpdated',
        (event) => {
            queryClient.setQueryData(['seller', 'help', 'tickets'], (old: Ticket[] | undefined) => old?.map((ticket) => (
                ticket.id === event.ticket_id
                    ? {
                        ...ticket,
                        mensajes_sin_leer: event.unread_count,
                        ultimo_mensaje: event.preview_text,
                        mensajes_count: event.total_messages,
                    }
                    : ticket
            )) ?? old);
            void queryClient.invalidateQueries({ queryKey: ['seller', 'help', 'tickets'] });
            void queryClient.refetchQueries({ queryKey: ['seller', 'help', 'tickets'] });
        },
        [queryClient, user?.id]
    );

    const activeTicket = activeTicketDetail || tickets.find((ticket) => ticket.id === activeTicketId) || null;

    const filteredTickets = tickets.filter((ticket) => {
        const title = ticket.titulo?.toLowerCase() || '';
        const displayId = ticket.id_display || '';
        const search = filters.search.toLowerCase();
        const matchesSearch = title.includes(search) || displayId.includes(filters.search);

        let matchesCategory = true;
        if (filters.category === 'critical') {
            matchesCategory = ticket.critical === true;
        } else if (filters.category === 'tech-critical') {
            matchesCategory = ticket.type === 'tech' && ticket.critical === true;
        } else if (filters.category !== 'all') {
            matchesCategory = ticket.type === filters.category;
        }

        if (filters.status) {
            matchesCategory = matchesCategory && (ticket.status === filters.status || ticket.estado === filters.status);
        }

        return matchesSearch && matchesCategory;
    });

    const unifiedTickets: UnifiedTicketListItem[] = adaptSellerTicketList(filteredTickets);
    const unifiedActiveTicket = activeTicket ? adaptSellerTicketListItem(activeTicket) : null;

    return {
        tickets: filteredTickets,
        unifiedTickets,
        unifiedActiveTicket,
        activeTicket,
        activeTicketId,
        setActiveTicketId,
        isLoading,
        error,
        isSending: sendMessageMutation.isPending,
        isClosing: closeTicketMutation.isPending,
        isCreating: createTicketMutation.isPending,
        isSubmittingSurvey: submitSurveyMutation.isPending,
        filters,
        setFilters: (newFilters: Partial<TicketFilters>) =>
            setFiltersState((prev: TicketFilters) => ({ ...prev, ...newFilters })),
        handleSendMessage: (text: string, attachments?: File[]) => {
            if (activeTicketId) {
                sendMessageMutation.mutate({ ticketId: activeTicketId, text, attachments });
            }
        },
        handleLoadMoreMessages: async () => {
            if (!activeTicketId || !activeTicket?.oldest_message_id || loadingMoreMessages) return;
            setLoadingMoreMessages(true);
            try {
                const { messages: older, hasMore } = await ticketApi.seller.getMessages(
                    activeTicketId,
                    activeTicket.oldest_message_id
                );
                queryClient.setQueryData(
                    ['seller', 'help', 'ticket', activeTicketId],
                    (old: Ticket | null | undefined) => {
                        if (!old) return old;
                        return {
                            ...old,
                            mensajes: [...older, ...old.mensajes],
                            oldest_message_id: older.length > 0 ? older[0].id : old.oldest_message_id,
                            has_more_messages: hasMore,
                        };
                    }
                );
            } finally {
                setLoadingMoreMessages(false);
            }
        },
        hasMoreMessages: activeTicket?.has_more_messages ?? false,
        loadingMoreMessages,
        handleCreateTicket: (formData: CreateTicketPayload) => createTicketMutation.mutate(formData),
        handleCloseTicket: () => {
            if (activeTicketId) {
                closeTicketMutation.mutate(activeTicketId);
            }
        },
        handleSubmitSurvey: (rating: number, comment: string) => {
            if (activeTicketId) {
                submitSurveyMutation.mutate({ ticketId: activeTicketId, rating, comment });
            }
        },
        refresh: refetch,
    };
}
