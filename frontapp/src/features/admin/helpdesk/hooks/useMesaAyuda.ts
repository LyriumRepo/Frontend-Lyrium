'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEcho } from '@laravel/echo-react';
import {
    AdminTicketFilters,
    MesaAyudaData,
    Priority,
    Ticket,
    TicketStatus,
} from '@/features/admin/helpdesk/types';
import { MOCK_HELPDESK_DATA } from '@/lib/mocks/helpdeskData';
import { UnifiedTicketListItem, adaptAdminTicketList } from '@/modules/helpdesk';
import { ticketApi } from '@/lib/api/ticketRepository';
import { useToast } from '@/shared/lib/context/ToastContext';
import { useAuth } from '@/shared/lib/context/AuthContext';

interface TicketInboxUpdatedEvent {
    ticket_id: number;
    unread_count: number;
    preview_text: string;
    total_messages: number;
    updated_at: string;
}

function sortTicketsByRecentActivity(tickets: Ticket[]): Ticket[] {
    return [...tickets].sort((left, right) => {
        const leftTime = left.fecha_actualizacion ? new Date(left.fecha_actualizacion).getTime() : 0;
        const rightTime = right.fecha_actualizacion ? new Date(right.fecha_actualizacion).getTime() : 0;
        return rightTime - leftTime;
    });
}

export const useMesaAyuda = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const { user } = useAuth();
    const [currentTab, setCurrentTab] = useState<'todos' | 'asignados' | 'faq' | 'auditoria'>('todos');
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
    const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
    const [filters, setFilters] = useState<AdminTicketFilters>({
        search: '',
        status: '',
        priority: '',
    });

    const updateCachedTicket = useCallback((ticketId: number, patch: Partial<Ticket>) => {
        queryClient.setQueryData(['admin', 'helpdesk'], (old: MesaAyudaData | undefined) => {
            if (!old) {
                return old;
            }

            return {
                ...old,
                tickets: sortTicketsByRecentActivity(old.tickets.map((ticket) => (
                    ticket.id === ticketId
                        ? { ...ticket, ...patch }
                        : ticket
                ))),
            };
        });

        queryClient.setQueryData(['admin', 'helpdesk', 'ticket', ticketId], (old: Ticket | null | undefined) => {
            if (!old) {
                return old;
            }

            return {
                ...old,
                ...patch,
            };
        });
    }, [queryClient]);

    const refreshTicketData = async (ticketId?: number | null) => {
        await queryClient.invalidateQueries({ queryKey: ['admin', 'helpdesk'] });

        if (ticketId) {
            await queryClient.invalidateQueries({ queryKey: ['admin', 'helpdesk', 'ticket', ticketId] });
            await queryClient.refetchQueries({ queryKey: ['admin', 'helpdesk', 'ticket', ticketId] });
        }

        await queryClient.refetchQueries({ queryKey: ['admin', 'helpdesk'] });
    };

    const { data: helpdeskData, isLoading, error, refetch } = useQuery({
        queryKey: ['admin', 'helpdesk'],
        queryFn: async () => {
            try {
                const tickets = await ticketApi.admin.list();
                return {
                    ...MOCK_HELPDESK_DATA,
                    tickets: tickets || MOCK_HELPDESK_DATA.tickets,
                } as MesaAyudaData;
            } catch {
                return MOCK_HELPDESK_DATA as MesaAyudaData;
            }
        },
        staleTime: 2 * 60 * 1000,
        retry: 2,
    });

    const { data: selectedTicketDetail } = useQuery({
        queryKey: ['admin', 'helpdesk', 'ticket', selectedTicketId],
        queryFn: async () => {
            if (!selectedTicketId) {
                return null;
            }

            return ticketApi.admin.get(selectedTicketId);
        },
        enabled: !!selectedTicketId,
        staleTime: 30 * 1000,
        retry: 1,
    });

    useEffect(() => {
        if (!selectedTicketDetail) {
            return;
        }

        updateCachedTicket(selectedTicketDetail.id, {
            estado: selectedTicketDetail.estado,
            prioridad: selectedTicketDetail.prioridad,
            fecha_actualizacion: selectedTicketDetail.fecha_actualizacion,
            mensajes_sin_leer: selectedTicketDetail.mensajes_sin_leer,
            total_mensajes: selectedTicketDetail.total_mensajes,
            admin_asignado: selectedTicketDetail.admin_asignado,
            escalated_to: selectedTicketDetail.escalated_to,
        });
    }, [selectedTicketDetail, updateCachedTicket]);

    const sendReplyMutation = useMutation({
        mutationFn: async ({ text, attachments }: { text: string; isQuick: boolean; attachments?: File[] }) => {
            if (!selectedTicketId) {
                throw new Error('No ticket selected');
            }

            return ticketApi.admin.sendMessage(selectedTicketId, { content: text || undefined, attachments });
        },
        onSuccess: async () => {
            await refreshTicketData(selectedTicketId);
        },
        onError: () => {
            showToast('Error al enviar la respuesta. Intenta de nuevo.', 'error');
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ ticketId, status }: { ticketId: number; status: TicketStatus }) => {
            return ticketApi.admin.updateStatus(ticketId, status);
        },
        onSuccess: async (_result, variables) => {
            updateCachedTicket(variables.ticketId, {
                estado: variables.status,
                fecha_actualizacion: new Date().toISOString(),
            });
            await refreshTicketData(variables.ticketId);
            showToast('Estado actualizado correctamente', 'success');
        },
        onError: () => {
            showToast('Error al actualizar el estado. Intenta de nuevo.', 'error');
        },
    });

    const assignAdminMutation = useMutation({
        mutationFn: async ({ ticketId, adminId }: { ticketId: number; adminId: number }) => {
            return ticketApi.admin.assign(ticketId, adminId);
        },
        onSuccess: async () => {
            await refreshTicketData(selectedTicketId);
            showToast('Ticket asignado correctamente', 'success');
        },
        onError: () => {
            showToast('Error al asignar el ticket. Intenta de nuevo.', 'error');
        },
    });

    const updatePriorityMutation = useMutation({
        mutationFn: async ({ ticketId, priority }: { ticketId: number; priority: Priority }) => {
            return ticketApi.admin.updatePriority(ticketId, priority);
        },
        onSuccess: async () => {
            await refreshTicketData(selectedTicketId);
            showToast('Prioridad actualizada correctamente', 'success');
        },
        onError: () => {
            showToast('Error al actualizar la prioridad. Intenta de nuevo.', 'error');
        },
    });

    const escalateTicketMutation = useMutation({
        mutationFn: async ({ ticketId, reason }: { ticketId: number; reason?: string }) => {
            return ticketApi.admin.escalate(ticketId, reason);
        },
        onSuccess: async () => {
            await refreshTicketData(selectedTicketId);
            showToast('Ticket escalado correctamente', 'success');
        },
        onError: () => {
            showToast('Error al escalar el ticket. Intenta de nuevo.', 'error');
        },
    });

    // WebSocket: escucha mensajes nuevos en el ticket seleccionado (admin ve respuestas del seller en tiempo real)
    useEcho(
        `ticket.${selectedTicketId ?? null}`,
        'TicketMessageReceived',
        () => {
            if (!selectedTicketId) return;
            void queryClient.invalidateQueries({ queryKey: ['admin', 'helpdesk', 'ticket', selectedTicketId] });
            void queryClient.invalidateQueries({ queryKey: ['admin', 'helpdesk'] });
        },
        [selectedTicketId]
    );

    // WebSocket: el seller leyó los mensajes → actualizar checkmarks
    useEcho(
        `ticket.${selectedTicketId ?? null}`,
        '.TicketMessagesRead',
        () => {
            if (!selectedTicketId) return;
            void queryClient.invalidateQueries({ queryKey: ['admin', 'helpdesk', 'ticket', selectedTicketId] });
        },
        [selectedTicketId]
    );

    useEcho<TicketInboxUpdatedEvent>(
        `user.${user?.id ?? null}`,
        '.TicketInboxUpdated',
        (event) => {
            updateCachedTicket(event.ticket_id, {
                mensajes_sin_leer: event.unread_count,
                ultimo_mensaje: event.preview_text,
                total_mensajes: event.total_messages,
                fecha_actualizacion: event.updated_at,
            });
            void queryClient.invalidateQueries({ queryKey: ['admin', 'helpdesk'] });
            void queryClient.refetchQueries({ queryKey: ['admin', 'helpdesk'] });
        },
        [queryClient, updateCachedTicket, user?.id]
    );

    const selectedTicket = useMemo(() => {
        const summaryTicket = helpdeskData?.tickets.find((ticket) => ticket.id === selectedTicketId) || null;
        return selectedTicketDetail || summaryTicket;
    }, [helpdeskData?.tickets, selectedTicketDetail, selectedTicketId]);

    const filteredTickets = useMemo(() => {
        if (!helpdeskData) {
            return [];
        }

        const tickets = helpdeskData.tickets.map((ticket) => {
            if (selectedTicketDetail && ticket.id === selectedTicketDetail.id) {
                return {
                    ...ticket,
                    ...selectedTicketDetail,
                    mensajes: ticket.mensajes,
                };
            }

            return ticket;
        });

        return tickets.filter((ticket) => {
            const search = filters.search.toLowerCase();
            const matchSearch = !filters.search
                || ticket.id_display?.toLowerCase().includes(search)
                || ticket.numero?.toLowerCase().includes(search)
                || ticket.vendedor?.nombre?.toLowerCase().includes(search)
                || ticket.titulo?.toLowerCase().includes(search);
            const matchStatus = !filters.status || ticket.estado === filters.status;
            const matchPriority = !filters.priority || ticket.prioridad === filters.priority;

            return matchSearch && matchStatus && matchPriority;
        });
    }, [helpdeskData, filters.priority, filters.search, filters.status, selectedTicketDetail]);

    const filteredAudit = useMemo(() => {
        if (!helpdeskData) {
            return [];
        }

        return helpdeskData.auditoria.filter((entry) => {
            const search = filters.search.toLowerCase();
            const matchSearch = !filters.search
                || entry.tienda?.toLowerCase().includes(search)
                || entry.responsable?.toLowerCase().includes(search);

            return matchSearch;
        });
    }, [helpdeskData, filters.search]);

    const unifiedTickets: UnifiedTicketListItem[] = adaptAdminTicketList(filteredTickets);

    return {
        data: helpdeskData,
        loading: isLoading,
        error,
        currentTab,
        setCurrentTab,
        selectedTicket,
        unifiedTickets,
        filteredTickets,
        filteredAudit,
        filters,
        setFilters,
        actions: {
            selectTicket: (id: number) => setSelectedTicketId(id),
            clearSelection: () => setSelectedTicketId(null),
            sendReply: (text: string, isQuick: boolean = false, attachments?: File[]) => {
                if (selectedTicketId) {
                    void sendReplyMutation.mutateAsync({ text, isQuick, attachments });
                }
            },
            updateStatus: (status: TicketStatus) => {
                if (selectedTicketId) {
                    void updateStatusMutation.mutateAsync({ ticketId: selectedTicketId, status });
                }
            },
            assignAdmin: (adminId: number) => {
                if (selectedTicketId) {
                    void assignAdminMutation.mutateAsync({ ticketId: selectedTicketId, adminId });
                }
            },
            updatePriority: (priority: Priority) => {
                if (selectedTicketId) {
                    void updatePriorityMutation.mutateAsync({ ticketId: selectedTicketId, priority });
                }
            },
            escalateTicket: (reason?: string) => {
                if (selectedTicketId) {
                    void escalateTicketMutation.mutateAsync({ ticketId: selectedTicketId, reason });
                }
            },
            loadMoreMessages: async () => {
                if (!selectedTicketId || loadingMoreMessages) return;
                const detail = queryClient.getQueryData<Ticket>(['admin', 'helpdesk', 'ticket', selectedTicketId]);
                const oldestId = detail?.oldest_message_id;
                if (!detail?.has_more_messages || !oldestId) return;

                setLoadingMoreMessages(true);
                try {
                    const { messages: older, hasMore } = await ticketApi.admin.getMessages(
                        selectedTicketId,
                        oldestId
                    );
                    queryClient.setQueryData(
                        ['admin', 'helpdesk', 'ticket', selectedTicketId],
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
        },
        loadingMoreMessages,
        hasMoreMessages: selectedTicketDetail?.has_more_messages ?? false,
        mutations: {
            isSending: sendReplyMutation.isPending,
            isUpdatingStatus: updateStatusMutation.isPending,
            isAssigning: assignAdminMutation.isPending,
            isUpdatingPriority: updatePriorityMutation.isPending,
            isEscalating: escalateTicketMutation.isPending,
        },
        refresh: refetch,
    };
};
