'use client';

import React from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { useMesaAyuda } from './hooks/useMesaAyuda';
import { HelpDeskModule } from '@/components/admin/helpdesk/HelpDeskModule';
import { Priority, TicketStatus, ActionType } from '@/features/admin/helpdesk/types';

interface HelpdeskFilters {
    search: string;
    status: TicketStatus | '';
    priority: Priority | '';
    auditSearch: string;
    auditDate: string;
    auditType: ActionType | '';
}

interface HelpdeskActions {
    selectTicket: (id: number) => void;
    clearSelection: () => void;
    sendReply: (text: string, attachments?: File[]) => void;
    updateStatus: (status: TicketStatus) => void;
    assignAdmin: (adminId: number) => void;
    updatePriority: (priority: Priority) => void;
    escalateTicket: (reason?: string) => void;
}

interface HelpdeskPageClientProps { }
export function HelpdeskPageClient(_props: HelpdeskPageClientProps) {
    const {
        data,
        loading,
        currentTab,
        setCurrentTab,
        selectedTicket,
        unifiedTickets,
        filteredAudit,
        filters,
        setFilters,
        actions,
        mutations,
        loadingMoreMessages,
        hasMoreMessages,
    } = useMesaAyuda();

    const handleEscalate = () => {
        if (actions) actions.escalateTicket();
    };

    const handleCloseTicket = () => {
        if (actions) actions.updateStatus('cerrado');
    };

    const handleFAQCreate = () => {
        console.log("Create FAQ");
    };

    const handleFAQDetail = (id: number) => {
        console.log("FAQ detail:", id);
    };

    const combinedFilters: HelpdeskFilters = {
        search: filters.search || '',
        status: filters.status || '',
        priority: filters.priority || '',
        auditSearch: '',
        auditDate: '',
        auditType: '',
    };

    const combinedActions: HelpdeskActions & {
        updateTicketPriority: (id: number, p: Priority) => void;
        updateTicketAdmin: (id: number, adminId: number) => void;
    } = {
        selectTicket: (id: number) => actions.selectTicket(id),
        clearSelection: () => actions.clearSelection(),
        sendReply: (text: string, attachments?: File[]) => actions.sendReply(text, false, attachments),
        updateStatus: (status: TicketStatus) => actions.updateStatus(status),
        updateTicketPriority: (_id: number, p: Priority) => actions.updatePriority(p),
        updateTicketAdmin: (_id: number, adminId: number) => actions.assignAdmin(adminId),
        updatePriority: actions.updatePriority,
        assignAdmin: actions.assignAdmin,
        escalateTicket: actions.escalateTicket,
    };

    const handleFilterChange = (newFilters: Partial<HelpdeskFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }) as any);
    };

    return (
        <div className="space-y-6 animate-fadeIn font-industrial">
            <ModuleHeader title="Mesa de Ayuda Admin" subtitle="Gestión centralizada de tickets y soporte" icon="Headset" />
            <HelpDeskModule
                data={data ?? null}
                loading={loading}
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
                selectedTicket={selectedTicket}
                tickets={unifiedTickets}
                filteredAudit={filteredAudit}
                filters={combinedFilters}
                setFilters={handleFilterChange as any}
                actions={combinedActions as any}
                onEscalate={handleEscalate}
                onCloseTicket={handleCloseTicket}
                onFAQCreate={handleFAQCreate}
                onFAQDetail={handleFAQDetail}
                onLoadMore={actions.loadMoreMessages}
                isLoadingMore={loadingMoreMessages}
                hasMoreMessages={hasMoreMessages}
            />
        </div>
    );
}
