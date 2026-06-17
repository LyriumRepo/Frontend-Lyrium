'use client';

import React, { useMemo, useState } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { useMesaAyuda } from './hooks/useMesaAyuda';
import { TicketList } from '@/modules/helpdesk';
import { ChatView } from '@/modules/chat';
import { adaptAdminTicket } from '@/modules/chat/adapters/adminTicketAdapter';
import { UnifiedTicket, ChatViewProps } from '@/modules/chat/types';
import { TicketListProps } from '@/modules/helpdesk/types';
import { AlertCircle, Loader2, Store, Users } from 'lucide-react';
import type { Priority as AdminPriority } from '@/features/admin/helpdesk/types';

type Channel = 'vendedores' | 'clientes';

export function HelpdeskPageClient() {
  const {
    loading,
    selectedTicket,
    unifiedTickets,
    filters,
    setFilters,
    actions,
    mutations,
    loadingMoreMessages,
    hasMoreMessages,
  } = useMesaAyuda();

  const [channel, setChannel] = useState<Channel>('vendedores');

  const channelTickets = useMemo(
    () =>
      channel === 'vendedores'
        ? unifiedTickets.filter((t) => t.requester.company)
        : unifiedTickets.filter((t) => !t.requester.company),
    [unifiedTickets, channel],
  );

  const unifiedSelectedTicket: UnifiedTicket | null = useMemo(() => {
    if (!selectedTicket) return null;
    return adaptAdminTicket({
      ...selectedTicket,
      estado: (selectedTicket as any).estado || selectedTicket.status,
      prioridad: (selectedTicket as any).prioridad || selectedTicket.priority,
      asunto: selectedTicket.titulo,
      mensajes_sin_leer: selectedTicket.mensajes_sin_leer,
      has_more_messages: (selectedTicket as any).has_more_messages ?? false,
      oldest_message_id: (selectedTicket as any).oldest_message_id,
      survey_required: (selectedTicket as any).survey_required ?? false,
      satisfaction_rating: (selectedTicket as any).satisfaction_rating,
      satisfaction_comment: (selectedTicket as any).satisfaction_comment,
      escalated: (selectedTicket as any).escalated ?? false,
      escalated_to: (selectedTicket as any).escalated_to,
      admin_asignado: (selectedTicket as any).admin_asignado,
      vendedor: (selectedTicket as any).vendedor || {
        id: 0,
        nombre: 'Vendedor',
      },
    } as any);
  }, [selectedTicket]);

  const handleSendMessage: ChatViewProps['onSendMessage'] = ({ text, attachments }) => {
    actions.sendReply(text, false, attachments);
  };

  const handleCloseTicket = () => {
    actions.updateStatus('cerrado');
  };

  const handleSubmitSurvey = async (rating: number, comment: string) => {
    if (!selectedTicket?.id) return;
    try {
      const { ticketApi } = await import('@/lib/api/ticketRepository');
      await ticketApi.seller.submitSurvey(selectedTicket.id, { rating, comment });
    } catch {
      // silent
    }
  };

  const handlePriorityChange: ChatViewProps['onPriorityChange'] = (_id, priority) => {
    const map: Record<string, AdminPriority> = {
      Baja: 'baja',
      Media: 'media',
      Alta: 'alta',
      'Crítica': 'critica',
    };
    actions.updatePriority(map[priority] || 'media');
  };

  const handleAdminChange: ChatViewProps['onAdminChange'] = (_id, adminId) => {
    actions.assignAdmin(Number(adminId));
  };

  const handleEscalate: ChatViewProps['onEscalate'] = () => {
    actions.escalateTicket();
  };

  const handleLoadMore: ChatViewProps['onLoadMore'] = () => {
    actions.loadMoreMessages();
  };

  const handleFilterChange: TicketListProps['onFilterChange'] = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      search: newFilters.search ?? prev.search,
      status: (newFilters.status ?? prev.status) as any,
      priority: (newFilters.priority ?? prev.priority) as any,
    }));
  };

  const handleSelectTicket: TicketListProps['onSelect'] = (id) => {
    actions.selectTicket(Number(id));
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-20">
      <ModuleHeader title="Mesa de Ayuda" subtitle="Gestión de tickets y soporte" icon="Headset" />

      {/* Toggle: Vendedores / Clientes */}
      <div className="flex bg-[var(--bg-secondary)]/80 p-1 rounded-2xl w-full max-w-xs border border-[var(--border-subtle)]/50">
        <button
          onClick={() => setChannel('vendedores')}
          className={`flex-1 py-2.5 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-2 uppercase tracking-wider ${
            channel === 'vendedores'
              ? 'bg-[var(--bg-card)] text-[var(--turquesa-500)] shadow-sm border border-[var(--border-subtle)]/30'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          }`}
        >
          <Store className="w-4 h-4" />
          Vendedores
        </button>
        <button
          onClick={() => setChannel('clientes')}
          className={`flex-1 py-2.5 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-2 uppercase tracking-wider ${
            channel === 'clientes'
              ? 'bg-[var(--bg-card)] text-[var(--turquesa-500)] shadow-sm border border-[var(--border-subtle)]/30'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          }`}
        >
          <Users className="w-4 h-4" />
          Clientes
        </button>
      </div>

      <div
        className="rounded-2xl border border-[var(--border-subtle)] overflow-hidden flex flex-col"
        style={{ height: 'calc(100vh - 210px)', background: 'linear-gradient(160deg, color-mix(in srgb,#9cb04e 5%,var(--bg-card)) 0%, var(--bg-card) 50%, color-mix(in srgb,#499bbf 4%,var(--bg-card)) 100%)' }}
      >
        <div className="h-1 w-full shrink-0 bg-gradient-to-r from-[#9cb04e] via-[#64c695] to-[#499bbf]" />
        <div className="flex h-full overflow-hidden">
          <div className="h-full flex-shrink-0 border-r border-[var(--border-subtle)] w-[240px] min-w-[240px] lg:w-72">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-5 h-5 animate-spin text-[var(--text-muted)]" />
              </div>
            ) : (
              <TicketList
                tickets={channelTickets}
                selectedId={unifiedSelectedTicket?.id ?? null}
                onSelect={handleSelectTicket}
                filters={{
                  search: filters.search || '',
                  status: filters.status || ('' as any),
                  priority: filters.priority || '',
                }}
                onFilterChange={handleFilterChange}
                showPriority
                className="!w-full !rounded-none !border-none h-full"
              />
            )}
          </div>

          <div className="flex-1 h-full min-w-0">
            {unifiedSelectedTicket ? (
              <ChatView
                ticket={unifiedSelectedTicket}
                onSendMessage={handleSendMessage}
                onCloseTicket={handleCloseTicket}
                onSubmitSurvey={handleSubmitSurvey}
                onPriorityChange={handlePriorityChange}
                onAdminChange={handleAdminChange}
                onEscalate={handleEscalate}
                onLoadMore={handleLoadMore}
                isSending={mutations.isSending}
                isClosing={mutations.isUpdatingStatus}
                isLoadingMore={loadingMoreMessages}
                hasMoreMessages={hasMoreMessages}
                showAdminControls
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-[var(--text-muted)]" />
                  </div>
                  <p className="text-sm font-bold text-[var(--text-secondary)]">Selecciona un ticket para ver la conversación</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
