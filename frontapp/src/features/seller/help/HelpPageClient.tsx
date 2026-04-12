'use client';

import React, { useState } from 'react';
import { LifeBuoy, PlusCircle, X } from 'lucide-react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import TicketSidebar from './components/TicketSidebar';
import TicketChatView from './components/TicketChatView';
import NewTicketForm from './components/NewTicketForm';
import RegisteredStoreInfo from './components/RegisteredStoreInfo';
import BaseLoading from '@/components/ui/BaseLoading';
import BaseButton from '@/components/ui/BaseButton';
import { useSellerHelp } from '@/features/seller/help/hooks/useSellerHelp';
type NewTicketPayload = Parameters<React.ComponentProps<typeof NewTicketForm>['onCreateTicket']>[0];

export function HelpPageClient() {
    const {
        unifiedTickets,
        activeTicket,
        activeTicketId,
        setActiveTicketId,
        isLoading,
        isSending,
        isClosing,
        filters,
        setFilters,
        handleSendMessage,
        handleCreateTicket,
        handleCloseTicket,
        handleSubmitSurvey,
        handleLoadMoreMessages,
        hasMoreMessages,
        loadingMoreMessages,
    } = useSellerHelp();

    const [activeTab, setTab] = useState<'soporte' | 'tienda'>('soporte');
    const [showNewTicketForm, setShowNewTicketForm] = useState(false);
    const hasActiveTicket = Boolean(activeTicketId && activeTicket);
    const openTicketCount = unifiedTickets.filter((ticket) => {
        const status = String(ticket.status).toLowerCase();
        return ['open', 'abierto', 'in_progress', 'en proceso', 'proceso', 'reopened', 'reabierto'].includes(status);
    }).length;
    const unreadThreadCount = unifiedTickets.filter((ticket) => (ticket.unreadCount || 0) > 0).length;
    const unreadMessageCount = unifiedTickets.reduce((total, ticket) => total + (ticket.unreadCount || 0), 0);

    const closeNewTicketForm = () => setShowNewTicketForm(false);

    const createTicket = async (data: NewTicketPayload) => {
        await handleCreateTicket(data);
        closeNewTicketForm();
    };

    const headerActions = (
        <div className="hidden md:block">
            <BaseButton
                variant="action"
                leftIcon="PlusCircle"
                onClick={() => setShowNewTicketForm(true)}
            >
                Nuevo Ticket
            </BaseButton>
        </div>
    );

    if (isLoading) {
        return (
            <div className="flex h-full min-h-0 flex-col animate-fadeIn md:-my-8">
                <ModuleHeader
                    title="Mesa de Ayuda"
                    subtitle="Centro de soporte y gestion de incidencias"
                    icon="Headset"
                />
                <div className="flex flex-1 items-center justify-center">
                    <BaseLoading message="Cargando tickets de soporte..." />
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden animate-fadeIn md:-my-8">
            <ModuleHeader
                title="Mesa de Ayuda"
                subtitle="Centro de soporte y gestion de incidencias"
                icon="Headset"
                actions={headerActions}
            />

            <div className="mb-4 flex w-full max-w-md shrink-0 gap-1 overflow-x-auto rounded-3xl border border-[var(--border-subtle)]/50 bg-[var(--bg-secondary)]/50 p-1.5 shadow-sm no-scrollbar">
                <button
                    onClick={() => setTab('soporte')}
                    className={`flex-1 whitespace-nowrap rounded-xl px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all sm:px-6 ${
                        activeTab === 'soporte'
                            ? 'bg-[var(--bg-card)] text-sky-600 shadow-sm'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                >
                    Centro de Soporte
                </button>
                <button
                    onClick={() => setTab('tienda')}
                    className={`flex-1 whitespace-nowrap rounded-xl px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all sm:px-6 ${
                        activeTab === 'tienda'
                            ? 'bg-[var(--bg-card)] text-sky-600 shadow-sm'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                >
                    Datos Registrados
                </button>
            </div>

            <div className="relative flex-1 min-h-0 overflow-hidden">
                {activeTab === 'soporte' ? (
                    <>
                        <div className="absolute inset-0 flex min-h-0 flex-1 flex-col md:hidden">
                            {hasActiveTicket ? (
                                <div className="absolute inset-0 flex min-h-0 flex-1 flex-col overflow-hidden">
                                    <TicketChatView
                                        ticket={activeTicket}
                                        isSending={isSending}
                                        isClosing={isClosing}
                                        onSendMessage={({ text, attachments }) => handleSendMessage(text, attachments)}
                                        onCloseTicket={handleCloseTicket}
                                        onSubmitSurvey={({ rating, comment }) => handleSubmitSurvey(rating, comment)}
                                        onBack={() => setActiveTicketId(null)}
                                        onLoadMore={handleLoadMoreMessages}
                                        isLoadingMore={loadingMoreMessages}
                                        hasMoreMessages={hasMoreMessages}
                                    />
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex min-h-0 flex-1 flex-col overflow-hidden">
                                    <TicketSidebar
                                        tickets={unifiedTickets}
                                        activeTicketId={activeTicketId ? String(activeTicketId) : null}
                                        filters={filters}
                                        onSetFilters={setFilters}
                                        onSetActiveTicket={(id) => {
                                            setActiveTicketId(id ? Number(id) : null);
                                            closeNewTicketForm();
                                        }}
                                        onNewTicket={() => setShowNewTicketForm(true)}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="hidden min-h-0 grid-cols-12 gap-5 overflow-hidden md:grid md:h-[calc(100dvh-16.5rem)] xl:h-[calc(100dvh-15.75rem)]">
                            <div className="col-span-12 h-full min-h-0 overflow-hidden md:col-span-5 xl:col-span-4">
                                <TicketSidebar
                                    tickets={unifiedTickets}
                                    activeTicketId={activeTicketId ? String(activeTicketId) : null}
                                    filters={filters}
                                    onSetFilters={setFilters}
                                    onSetActiveTicket={(id) => {
                                        setActiveTicketId(id ? Number(id) : null);
                                        closeNewTicketForm();
                                    }}
                                    onNewTicket={() => setShowNewTicketForm(true)}
                                />
                            </div>

                            <div className="col-span-12 h-full min-h-0 overflow-hidden md:col-span-7 xl:col-span-8">
                                {showNewTicketForm ? (
                                    <div className="h-full min-h-0 overflow-y-auto">
                                        <NewTicketForm
                                            onCreateTicket={createTicket}
                                            onCancel={closeNewTicketForm}
                                        />
                                    </div>
                                ) : hasActiveTicket ? (
                                    <TicketChatView
                                        ticket={activeTicket}
                                        isSending={isSending}
                                        isClosing={isClosing}
                                        onSendMessage={({ text, attachments }) => handleSendMessage(text, attachments)}
                                        onCloseTicket={handleCloseTicket}
                                        onSubmitSurvey={({ rating, comment }) => handleSubmitSurvey(rating, comment)}
                                    />
                                ) : (
                                    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-[0_20px_45px_-30px_rgba(15,23,42,0.28)] dark:shadow-[0_26px_55px_-34px_rgba(0,0,0,0.6)]">
                                        {/* Stats strip */}
                                        <div className="flex shrink-0 items-center gap-px border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/75">
                                            <div className="flex flex-1 items-center gap-3 px-5 py-4">
                                                <p className="text-2xl font-black text-[var(--text-primary)]">{openTicketCount}</p>
                                                <p className="text-[10px] font-bold uppercase leading-tight tracking-wider text-[var(--text-muted)]">Casos<br/>activos</p>
                                            </div>
                                            <div className="h-8 w-px bg-[var(--border-subtle)]" />
                                            <div className="flex flex-1 items-center gap-3 px-5 py-4">
                                                <p className="text-2xl font-black text-[var(--text-primary)]">{unreadThreadCount}</p>
                                                <p className="text-[10px] font-bold uppercase leading-tight tracking-wider text-[var(--text-muted)]">Sin<br/>revisar</p>
                                            </div>
                                            <div className="h-8 w-px bg-[var(--border-subtle)]" />
                                            <div className="flex flex-1 items-center gap-3 px-5 py-4">
                                                <p className="text-2xl font-black text-sky-500">{unreadMessageCount}</p>
                                                <p className="text-[10px] font-bold uppercase leading-tight tracking-wider text-[var(--text-muted)]">Mensajes<br/>nuevos</p>
                                            </div>
                                        </div>

                                        {/* Empty state */}
                                        <div className="flex flex-1 min-h-0 flex-col items-center justify-center gap-6 p-8 text-center">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-sky-500/10 text-sky-500">
                                                <LifeBuoy className="h-8 w-8" />
                                            </div>
                                            <div className="max-w-xs space-y-2">
                                                <h3 className="text-xl font-black tracking-tight text-[var(--text-primary)]">
                                                    Selecciona un ticket
                                                </h3>
                                                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                                                    Elige un caso de la bandeja izquierda para ver la conversacion y responder.
                                                </p>
                                            </div>
                                            <BaseButton
                                                variant="primary"
                                                leftIcon="PlusCircle"
                                                onClick={() => setShowNewTicketForm(true)}
                                            >
                                                Crear Nuevo Ticket
                                            </BaseButton>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="h-full overflow-y-auto px-2 custom-scrollbar overscroll-y-contain">
                        <RegisteredStoreInfo />
                    </div>
                )}
            </div>

            {activeTab === 'soporte' && showNewTicketForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-3 py-6 backdrop-blur-sm md:hidden">
                    <button
                        type="button"
                        aria-label="Cerrar formulario de ticket"
                        className="absolute inset-0"
                        onClick={closeNewTicketForm}
                    />
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Crear nuevo ticket"
                        tabIndex={-1}
                        className="flex max-h-[88vh] w-full max-w-[26rem] flex-col overflow-hidden rounded-[2.15rem] border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-2xl"
                    >
                        <div className="flex justify-center pt-3">
                            <span className="h-1.5 w-14 rounded-full bg-[var(--border-subtle)]" />
                        </div>
                        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 pb-4 pt-3">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-500">
                                    Mesa de Ayuda
                                </p>
                                <h2 className="text-lg font-black tracking-tight text-[var(--text-primary)]">
                                    Crear nuevo ticket
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={closeNewTicketForm}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                                aria-label="Cerrar formulario de ticket"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <NewTicketForm
                                onCreateTicket={createTicket}
                                onCancel={closeNewTicketForm}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
