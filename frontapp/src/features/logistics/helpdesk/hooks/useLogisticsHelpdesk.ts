'use client';

import { useState, useMemo } from 'react';
import { LogisticsTicket, LogisticsTicketMessage } from '@/lib/types/logistics';
import { mockLogisticsTickets } from '@/lib/mocks/logistics';
import { useFilteredList, FilterConfig } from '@/shared/hooks/useFilteredList';
import { adaptLogisticsTicketListItem, adaptLogisticsTicketList, UnifiedTicketListItem } from '@/modules/helpdesk';

export interface LogisticsTicketFilters {
    search: string;
    status: 'all' | 'open' | 'in_progress' | 'resolved' | 'closed';
}

const filterConfig: FilterConfig<LogisticsTicket, LogisticsTicketFilters> = {
    search: {
        enabled: true,
        fields: [
            (t: LogisticsTicket) => t.id,
            (t: LogisticsTicket) => t.subject
        ]
    },
    fields: {
        status: {
            type: 'select',
            options: [
                { value: 'all', label: 'Todos' },
                { value: 'open', label: 'Abiertos' },
                { value: 'in_progress', label: 'En Proceso' },
                { value: 'resolved', label: 'Resueltos' },
                { value: 'closed', label: 'Cerrados' }
            ]
        }
    }
};

export function useLogisticsHelpdesk() {
    const [tickets, setTickets] = useState<LogisticsTicket[]>(mockLogisticsTickets);
    const [selectedTicket, setSelectedTicket] = useState<LogisticsTicket | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        filteredData: filteredTickets,
        filters,
        setFilter,
        setSearch,
        clearFilters,
        hasActiveFilters
    } = useFilteredList<LogisticsTicket, LogisticsTicketFilters>({
        data: tickets,
        config: filterConfig,
        initialFilters: { search: '', status: 'all' }
    });

    const setFilters = (newFilters: Partial<LogisticsTicketFilters> | ((prev: LogisticsTicketFilters) => Partial<LogisticsTicketFilters>)) => {
        if (typeof newFilters === 'function') {
            const prevFilters: LogisticsTicketFilters = { search: filters.search ?? '', status: filters.status ?? 'all' };
            const updates = newFilters(prevFilters);
            if (updates.search !== undefined) setSearch(updates.search);
            if (updates.status !== undefined) setFilter('status', updates.status);
        } else {
            if (newFilters.search !== undefined) {
                setSearch(newFilters.search);
            }
            if (newFilters.status !== undefined) {
                setFilter('status', newFilters.status);
            }
        }
    };

    const ticketStats = useMemo(() => {
        return {
            open: tickets.filter(t => t.status === 'open').length,
            inProgress: tickets.filter(t => t.status === 'in_progress').length,
            resolved: tickets.filter(t => t.status === 'resolved').length,
            closed: tickets.filter(t => t.status === 'closed').length,
            total: tickets.length,
        };
    }, [tickets]);

    const createTicket = (subject: string, content: string) => {
        const newTicket: LogisticsTicket = {
            id: `TKT-${Date.now()}`,
            subject,
            status: 'open',
            priority: 'medium',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messages: [{
                id: `tmsg-${Date.now()}`,
                sender: 'operator',
                senderName: 'Operador Logístico',
                content,
                timestamp: new Date().toISOString(),
            }],
        };

        setTickets(prev => [newTicket, ...prev]);
        return newTicket.id;
    };

    const addMessage = (ticketId: string, content: string) => {
        const newMessage: LogisticsTicketMessage = {
            id: `tmsg-${Date.now()}`,
            sender: 'operator',
            senderName: 'Operador Logístico',
            content,
            timestamp: new Date().toISOString(),
        };

        setTickets(prev => prev.map(t => {
            if (t.id !== ticketId) return t;
            return {
                ...t,
                messages: [...t.messages, newMessage],
                updatedAt: new Date().toISOString(),
                status: t.status === 'open' ? 'in_progress' : t.status,
            };
        }));

        if (selectedTicket?.id === ticketId) {
            setSelectedTicket(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    messages: [...prev.messages, newMessage],
                    updatedAt: new Date().toISOString(),
                };
            });
        }
    };

    const typedFilters: LogisticsTicketFilters = {
        search: filters.search ?? '',
        status: filters.status ?? 'all'
    };

    const unifiedTickets: UnifiedTicketListItem[] = adaptLogisticsTicketList(filteredTickets);
    const unifiedSelectedTicket = selectedTicket ? adaptLogisticsTicketListItem(selectedTicket) : null;

    return {
        tickets: filteredTickets,
        unifiedTickets,
        unifiedSelectedTicket,
        allTickets: tickets,
        selectedTicket,
        setSelectedTicket,
        filters: typedFilters,
        setFilters,
        clearFilters,
        ticketStats,
        isLoading,
        createTicket,
        addMessage,
    };
}
