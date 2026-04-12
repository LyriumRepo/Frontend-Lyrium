'use client';

import React from 'react';
import { TicketList, UnifiedTicketListItem, TicketFilters } from '@/modules/helpdesk';
import { ChatView } from './ChatView';
import { FAQView, AuditTable } from './HelpDeskSections';
import { Ticket, Priority, TicketStatus, ActionType, MesaAyudaData, AuditEntry } from '@/lib/types/admin/helpdesk';
import { MessageSquare, LayoutGrid, BookOpen, ShieldCheck, ChevronLeft } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';

const TabButton: React.FC<{
    id: 'todos' | 'asignados' | 'faq' | 'auditoria';
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ id, label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-8 py-3.5 rounded-[1.7rem] text-[10px] font-black transition-all flex items-center gap-2 font-industrial uppercase tracking-wider ${isActive ? 'bg-[var(--bg-card)] shadow-md text-sky-600' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)]/50'
            }`}
    >
        {icon} {label}
    </button>
);

interface HelpDeskModuleProps {
    data: MesaAyudaData | null;
    loading: boolean;
    currentTab: 'todos' | 'asignados' | 'faq' | 'auditoria';
    setCurrentTab: (tab: 'todos' | 'asignados' | 'faq' | 'auditoria') => void;
    selectedTicket: Ticket | null;
    tickets: UnifiedTicketListItem[];
    filteredAudit: AuditEntry[];
    filters: {
        search: string;
        status: TicketStatus | '';
        priority: Priority | '';
        auditSearch: string;
        auditDate: string;
        auditType: ActionType | '';
    };
    setFilters: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
    actions: {
        selectTicket: (id: number) => void;
        clearSelection: () => void;
        sendReply: (text: string, attachments?: File[]) => void;
        updateTicketPriority: (id: number, p: Priority) => void;
        updateTicketAdmin: (id: number, adminId: number) => void;
    };
    onEscalate: () => void;
    onCloseTicket: () => void;
    onFAQCreate: () => void;
    onFAQDetail: (id: number) => void;
    onLoadMore?: () => void;
    isLoadingMore?: boolean;
    hasMoreMessages?: boolean;
}

export const HelpDeskModule: React.FC<HelpDeskModuleProps> = ({
    data, loading, currentTab, setCurrentTab,
    selectedTicket, tickets, filteredAudit,
    filters, setFilters, actions,
    onEscalate, onCloseTicket, onFAQCreate, onFAQDetail,
    onLoadMore, isLoadingMore, hasMoreMessages,
}) => {
    const showMobileDetail = Boolean(selectedTicket);

    if (loading || !data) {
        return (
            <div className="relative min-h-[calc(100vh-8rem)] lg:h-[calc(100vh-8rem)]">
                {/* Tab Navigation Skeleton */}
                <div className="flex bg-[var(--bg-secondary)]/80 backdrop-blur-md p-1.5 rounded-[2rem] gap-1 shadow-inner border border-[var(--border-subtle)]/50 w-full max-w-full overflow-x-auto mx-auto mb-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={`helpdesk-tab-${i}`} className="h-10 w-32 rounded-[1.7rem]" />
                    ))}
                </div>

                <div className="flex flex-col gap-4 lg:flex-row lg:gap-6 lg:h-full">
                    <div className="w-full lg:w-1/3 space-y-4">
                        <Skeleton className="h-full rounded-[2.5rem]" />
                    </div>
                    <div className="flex-1 space-y-6">
                        <Skeleton className="h-[200px] rounded-[2.5rem]" />
                        <Skeleton className="flex-1 rounded-[2.5rem]" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-[calc(100vh-8rem)] lg:h-[calc(100vh-8rem)]">
            {/* Tab Navigation */}
            <div className="flex bg-[var(--bg-secondary)]/80 backdrop-blur-md p-1.5 rounded-[2rem] gap-1 shadow-inner border border-[var(--border-subtle)]/50 w-full max-w-full overflow-x-auto mx-auto mb-4">
                <TabButton id="todos" label="Todos los Casos" icon={<LayoutGrid className="w-4 h-4" />} isActive={currentTab === 'todos'} onClick={() => setCurrentTab('todos')} />
                <TabButton id="asignados" label="Mis Asignados" icon={<MessageSquare className="w-4 h-4" />} isActive={currentTab === 'asignados'} onClick={() => setCurrentTab('asignados')} />
                <TabButton id="faq" label="Base de Conocimiento" icon={<BookOpen className="w-4 h-4" />} isActive={currentTab === 'faq'} onClick={() => setCurrentTab('faq')} />
                <TabButton id="auditoria" label="Auditoría Forense" icon={<ShieldCheck className="w-4 h-4" />} isActive={currentTab === 'auditoria'} onClick={() => setCurrentTab('auditoria')} />
            </div>

            {/* Main Content Areas */}
            {currentTab === 'faq' ? (
                <FAQView
                    articles={data.faq}
                    onCreateClick={onFAQCreate}
                    onSearchChange={(q) => console.log('Search FAQ:', q)}
                    onDetailClick={onFAQDetail}
                />
            ) : currentTab === 'auditoria' ? (
                <AuditTable
                    entries={filteredAudit}
                    filters={{
                        search: filters.auditSearch,
                        date: filters.auditDate,
                        type: filters.auditType as ActionType
                    }}
                    onFilterChange={(f) => setFilters(prev => ({ ...prev, ...f }))}
                />
            ) : (
                <div className="flex flex-col gap-4 animate-fadeIn lg:flex-row lg:gap-6 lg:h-full">
                    <TicketList
                        className={showMobileDetail ? 'hidden lg:flex' : 'flex'}
                        tickets={tickets}
                        selectedId={selectedTicket ? String(selectedTicket.id) : null}
                        onSelect={(id: string) => actions.selectTicket(Number(id))}
                        filters={{
                            search: filters.search,
                            status: (filters.status || '') as TicketFilters['status'],
                            priority: (filters.priority || '') as TicketFilters['priority']
                        }}
                        onFilterChange={(f: Partial<TicketFilters>) => setFilters((prev) => ({ ...prev, ...f }))}
                        showPriority={true}
                    />
                    {selectedTicket ? (
                        <div className="flex-1 flex flex-col gap-3 min-h-0">
                            <button
                                type="button"
                                onClick={actions.clearSelection}
                                className="lg:hidden inline-flex items-center gap-2 self-start rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--text-muted)] shadow-sm"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Volver a la lista
                            </button>
                            <ChatView
                                ticket={selectedTicket as any}
                                admins={data.admins}
                                onSendMessage={actions.sendReply}
                                onPriorityChange={actions.updateTicketPriority}
                                onAdminChange={actions.updateTicketAdmin}
                                onEscalate={onEscalate}
                                onCloseTicket={onCloseTicket}
                                onLoadMore={onLoadMore}
                                isLoadingMore={isLoadingMore}
                                hasMoreMessages={hasMoreMessages}
                            />
                        </div>
                    ) : (
                        <div className="hidden lg:flex flex-1 bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm overflow-hidden flex-col">
                            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-subtle)] bg-[var(--glass-bg)] backdrop-blur-sm rounded-[2.5rem]">
                                <div className="w-24 h-24 bg-sky-500/10 text-sky-500/30 rounded-full flex items-center justify-center mb-6">
                                    <MessageSquare className="w-12 h-12" />
                                </div>
                                <h3 className="text-xl font-black text-[var(--text-muted)] tracking-tight font-industrial uppercase">Selecciona un caso para gestionar</h3>
                                <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-2 font-industrial">La trazabilidad garantiza un mejor servicio</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default HelpDeskModule;
