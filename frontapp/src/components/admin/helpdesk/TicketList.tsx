import React from 'react';
import { TicketList as UnifiedTicketList, TicketFilters } from '@/modules/helpdesk';
import { adaptAdminTicketListItem } from '@/modules/helpdesk/adapters/adminAdapter';
import { Ticket, TicketStatus, Priority } from '@/lib/types/admin/helpdesk';

interface LegacyTicketListProps {
    tickets: Ticket[];
    selectedId: number | null;
    onSelect: (id: number) => void;
    onFilterChange: (filters: { search?: string; status?: TicketStatus | ''; priority?: Priority | '' }) => void;
    filters: { search: string; status: TicketStatus | ''; priority: Priority | '' };
    className?: string;
}

export const TicketList: React.FC<LegacyTicketListProps> = ({
    tickets,
    selectedId,
    onSelect,
    onFilterChange,
    filters,
    className = ''
}) => {
    const unifiedTickets = tickets.map((t) => adaptAdminTicketListItem(t as any));

    const statusToUnified: Record<string, string> = {
        'Abierto': 'open',
        'En Proceso': 'in_progress',
        'Resuelto': 'resolved',
        'Cerrado': 'closed',
        'Reabierto': 'reopened',
    };

    const unifiedFilters: TicketFilters = {
        search: filters.search,
        status: (filters.status ? (statusToUnified[filters.status] || 'open') : '') as TicketFilters['status'],
        priority: filters.priority || '',
    };

    const handleSelect = (id: string) => {
        onSelect(parseInt(id));
    };

    const handleFilterChange = (newFilters: Partial<TicketFilters>) => {
        const legacyFilters: any = {};
        if (newFilters.search !== undefined) legacyFilters.search = newFilters.search;
        if (newFilters.status !== undefined) {
            const statusMap: Record<string, string> = {
                'open': 'Abierto',
                'in_progress': 'En Proceso',
                'resolved': 'Resuelto',
                'closed': 'Cerrado',
            };
            legacyFilters.status = newFilters.status ? (statusMap[newFilters.status] || newFilters.status) : '';
        }
        if (newFilters.priority !== undefined) legacyFilters.priority = newFilters.priority;
        onFilterChange(legacyFilters);
    };

    return (
        <UnifiedTicketList
            tickets={unifiedTickets}
            selectedId={selectedId ? String(selectedId) : null}
            onSelect={handleSelect}
            onFilterChange={handleFilterChange}
            filters={unifiedFilters}
            className={className}
            showPriority={true}
        />
    );
};
