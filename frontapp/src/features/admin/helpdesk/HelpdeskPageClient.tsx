'use client';

import React, { useMemo, useState } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { useMesaAyuda } from './hooks/useMesaAyuda';
import { TicketList } from '@/modules/helpdesk';
import { ChatView } from '@/modules/chat';
import { adaptAdminTicket } from '@/modules/chat/adapters/adminTicketAdapter';
import { UnifiedTicket, ChatViewProps } from '@/modules/chat/types';
import { TicketListProps } from '@/modules/helpdesk/types';
import { AlertCircle, ArrowLeft, Loader2, Settings2, Store, Users, Info, X } from 'lucide-react';
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
  const [showLegend, setShowLegend] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);

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
    setMobileShowChat(true);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 animate-fadeIn px-4">
      <div className="shrink-0 [&>div]:!mb-3">
        <ModuleHeader
          title="Soporte Lyrium"
          subtitle="Gestión de tickets y soporte"
          icon="Headset"
        />
      </div>

      {/* Toggle: Vendedores / Clientes + botón leyenda */}
      <div className="flex items-center gap-3 shrink-0 mb-2">
        <div className="flex bg-[var(--bg-secondary)]/80 p-1 rounded-2xl border border-[var(--border-subtle)]/50">
          <button
            onClick={() => setChannel('vendedores')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-2 uppercase tracking-wider ${
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
            className={`flex-1 py-2.5 px-4 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-2 uppercase tracking-wider ${
              channel === 'clientes'
                ? 'bg-[var(--bg-card)] text-[var(--turquesa-500)] shadow-sm border border-[var(--border-subtle)]/30'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            <Users className="w-4 h-4" />
            Clientes
          </button>
        </div>

        <button
          onClick={() => setShowLegend(true)}
          title="¿Qué puedo hacer aquí?"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--icons-green)] hover:border-[var(--icons-green)] transition-all shadow-sm shrink-0"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Panel principal — patrón WhatsApp: flex-row, cada columna ocupa h-full */}
      <div
        className="flex-1 min-h-0 rounded-2xl border border-[var(--border-subtle)] overflow-hidden flex flex-row"
        style={{ background: 'linear-gradient(160deg, color-mix(in srgb,#9cb04e 5%,var(--bg-card)) 0%, var(--bg-card) 50%, color-mix(in srgb,#499bbf 4%,var(--bg-card)) 100%)' }}
      >
        {/* Columna izquierda: lista de tickets — oculta en móvil cuando hay chat abierto */}
        <div className={`flex flex-col flex-shrink-0 border-r border-[var(--border-subtle)] overflow-hidden transition-opacity duration-300 ease-in-out sm:w-[200px] sm:min-w-[200px] md:w-[220px] md:min-w-[220px] lg:w-60 xl:w-72 sm:opacity-100 ${mobileShowChat ? 'w-0 min-w-0 opacity-0 pointer-events-none sm:pointer-events-auto' : 'w-full opacity-100 pointer-events-auto'}`}>
          <div className="h-1 w-full shrink-0 bg-gradient-to-r from-[#9cb04e] via-[#64c695] to-[#499bbf]" />
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
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
              className="!w-full !rounded-none !border-none !min-h-0 flex-1 overflow-hidden"
            />
          )}
        </div>

        {/* Columna derecha: chat — ocupa toda la pantalla en móvil */}
        <div className={`flex flex-col min-w-0 min-h-0 transition-opacity duration-300 ease-in-out sm:flex-1 sm:opacity-100 ${!mobileShowChat ? 'w-0 min-w-0 opacity-0 pointer-events-none' : 'flex-1 opacity-100 pointer-events-auto'}`}>
          <div className="h-1 w-full shrink-0 bg-gradient-to-r from-[#9cb04e] via-[#64c695] to-[#499bbf]" />
          {/* ChatView o estado vacío — flex-1 min-h-0 para que el área de mensajes haga scroll sin bloquear */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
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
                onBack={() => setMobileShowChat(false)}
                isSending={mutations.isSending}
                isClosing={mutations.isUpdatingStatus}
                isLoadingMore={loadingMoreMessages}
                hasMoreMessages={hasMoreMessages}
                showAdminControls
              />
            ) : (
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-[var(--text-muted)]" />
                    </div>
                    <p className="text-sm font-bold text-[var(--text-secondary)]">Selecciona un ticket para ver la conversación</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showLegend && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4 pt-[calc(60px+1rem)] sm:pt-4"
          onClick={() => setShowLegend(false)}
        >
          {/* Bottom sheet en móvil, card centrado en sm+ */}
          <div
            className="w-full max-w-sm sm:max-w-md bg-[var(--bg-card)] rounded-[2rem] shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header — mismos colores que HelpPageClient */}
            <div className="bg-gradient-to-r from-[var(--turquesa-500)] to-[var(--turquesa-500)]/70 dark:from-[var(--brand-green-hover)] dark:via-[var(--brand-green)] dark:to-[var(--brand-green-hover)] p-8 text-white relative shrink-0">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tighter">Mesa de Ayuda</h3>
                    <p className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em]">¿Qué puedes hacer aquí?</p>
                  </div>
                </div>
                <button onClick={() => setShowLegend(false)} aria-label="Cerrar leyenda" className="min-w-[44px] min-h-[44px] rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Items — scrollable en móvil */}
            <div className="p-8 space-y-4 overflow-y-auto flex-1">
              {[
                { icon: Store, title: 'Tickets de vendedores', desc: 'Gestiona incidencias técnicas, consultas administrativas y solicitudes de soporte de las tiendas registradas en Lyrium.' },
                { icon: Users, title: 'Tickets de clientes', desc: 'Atiende reclamos, consultas y problemas de los compradores que no pudieron ser resueltos por el vendedor.' },
                { icon: AlertCircle, title: 'Asignar y escalar', desc: 'Asigna tickets a administradores específicos o escálalos a un nivel superior cuando requieren atención prioritaria.' },
                { icon: Settings2, title: 'Prioridad y estado', desc: 'Actualiza la prioridad (Baja, Media, Alta, Crítica) y el estado del ticket (abierto, en proceso, resuelto, cerrado) en tiempo real.' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4 p-4 bg-[var(--bg-muted)]/50 rounded-2xl border border-[var(--border-subtle)]">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center shadow-sm border border-[var(--border-subtle)] shrink-0">
                    <item.icon className="w-5 h-5 text-[var(--icons-green)]" />
                  </div>
                  <div>
                    <p className="font-black text-sm text-[var(--text-primary)] mb-0.5">{item.title}</p>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
              <div className="flex justify-end pt-2">
                <button onClick={() => setShowLegend(false)} className="px-6 py-3 rounded-2xl bg-[var(--bg-muted)] text-[var(--text-primary)] font-black text-xs uppercase tracking-widest hover:bg-[var(--bg-hover)] transition-all">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
