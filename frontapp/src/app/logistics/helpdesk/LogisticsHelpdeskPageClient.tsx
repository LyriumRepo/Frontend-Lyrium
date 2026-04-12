'use client';

import React from 'react';
import { HelpdeskLayout, adaptLogisticsTicketList } from '@/modules/helpdesk';
import { adaptLogisticsTicket } from '@/modules/chat/adapters/logisticsTicketAdapter';
import { useLogisticsHelpdesk } from '@/features/logistics/helpdesk/hooks/useLogisticsHelpdesk';
import { TicketFilters } from '@/modules/helpdesk/types';

export function LogisticsHelpdeskPageClient() {
    const {
        allTickets,
        selectedTicket,
        setSelectedTicket,
        filters,
        setFilters,
        createTicket,
        addMessage,
    } = useLogisticsHelpdesk();

    const unifiedTickets = adaptLogisticsTicketList(allTickets);
    const unifiedSelectedTicket = selectedTicket ? adaptLogisticsTicket(selectedTicket) : null;

    const handleFilterChange = (newFilters: Partial<TicketFilters>) => {
        const status = newFilters.status;
        if (status !== undefined) {
            setFilters({ status: status === '' ? 'all' : status as 'open' | 'in_progress' | 'resolved' | 'closed' });
        }
        if (newFilters.search !== undefined) {
            setFilters({ search: newFilters.search });
        }
    };

    const handleSendMessage = async (text: string, _isQuick?: boolean) => {
        if (!selectedTicket) return;
        await new Promise(resolve => setTimeout(resolve, 300));
        addMessage(selectedTicket.id, text);
    };

    const ticketFilters: TicketFilters = {
        search: filters.search,
        status: filters.status === 'all' ? '' : filters.status as TicketFilters['status'],
        priority: '',
    };

    return (
        <HelpdeskLayout
            title="Helpdesk Logística"
            subtitle="Soporte y tickets de logística"
            icon="Headset"
            tickets={unifiedTickets}
            selectedTicket={unifiedSelectedTicket}
            filters={ticketFilters}
            onSelectTicket={(id) => {
                const ticket = allTickets.find(t => t.id === id);
                if (ticket) setSelectedTicket(ticket);
            }}
            onFilterChange={handleFilterChange}
            onSendMessage={handleSendMessage}
            onCreateTicket={createTicket}
            showPriority={true}
            showAdminControls={false}
            height="calc(100vh - 200px)"
        />
    );
}
