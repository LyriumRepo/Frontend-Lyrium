'use client';

import React, { useState } from 'react';
import { useCustomerSupport } from '@/features/customer/support/hooks/useCustomerSupport';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseLoading from '@/components/ui/BaseLoading';
import Icon from '@/components/ui/Icon';
import { CustomerTicket, TicketStatus, TicketCategory } from '@/features/customer/support/types';

function TicketList({
  tickets,
  activeTicketId,
  onSelect,
}: {
  tickets: CustomerTicket[];
  activeTicketId: string | null;
  onSelect: (id: string) => void;
}) {
  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'abierto': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'proceso': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
      case 'pendiente': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'resuelto': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'cerrado': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: TicketStatus) => {
    switch (status) {
      case 'abierto': return 'Abierto';
      case 'proceso': return 'En proceso';
      case 'pendiente': return 'Pendiente';
      case 'resuelto': return 'Resuelto';
      case 'cerrado': return 'Cerrado';
      default: return status;
    }
  };

  const getCategoryLabel = (category: TicketCategory) => {
    switch (category) {
      case 'critico': return 'Soporte Crítico';
      case 'tecnico': return 'Soporte Técnico';
      case 'negativo': return 'Comentario Negativo';
      case 'informacion': return 'Solicitud de Información';
      case 'positivo': return 'Comentario Positivo';
      default: return category;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
  };

  const [filterType, setFilterType] = useState<'asunto' | 'categoria'>('asunto');
  const [filterValue, setFilterValue] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const filteredTickets = tickets.filter(ticket => {
    if (!filterValue) return true;
    if (filterType === 'asunto') {
      return ticket.subject.toLowerCase().includes(filterValue.toLowerCase());
    }
    return ticket.category === filterValue;
  });

  return (
    <div className="flex flex-col h-full min-h-0 bg-white dark:bg-[var(--bg-secondary)] rounded-[2.5rem] shadow-2xl overflow-hidden">
      <div className="p-4 border-b border-gray-100 dark:border-[var(--border-subtle)]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-[var(--text-primary)]">Mis Tickets</h3>
            <p className="text-sm text-gray-500 dark:text-[var(--text-muted)]">
              {filteredTickets.length} tickets
            </p>
          </div>
          <button
            onClick={() => { setShowFilter(prev => !prev); setFilterValue(''); }}
            className={`p-2 rounded-xl transition-colors text-xs font-medium border ${showFilter
              ? 'bg-sky-100 text-sky-600 border-sky-200 dark:bg-[var(--brand-green)] dark:text-white'
              : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200 dark:bg-[var(--bg-muted)]'
            }`}
          >
            Filtrar
          </button>
        </div>

        {showFilter && (
          <div className="mt-3 space-y-2">
            <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 text-xs font-medium">
              <button
                onClick={() => { setFilterType('asunto'); setFilterValue(''); }}
                className={`flex-1 py-1.5 transition-colors ${filterType === 'asunto'
                  ? 'bg-sky-500 dark:bg-[var(--brand-green)] text-white'
                  : 'bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-500'
                }`}
              >
                Asunto
              </button>
              <button
                onClick={() => { setFilterType('categoria'); setFilterValue(''); }}
                className={`flex-1 py-1.5 transition-colors ${filterType === 'categoria'
                  ? 'bg-sky-500 dark:bg-[var(--brand-green)] text-white'
                  : 'bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-500'
                }`}
              >
                Categoría
              </button>
            </div>

            {filterType === 'asunto' ? (
              <input
                type="text"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                placeholder="Buscar por asunto..."
                className="w-full px-3 py-1.5 text-sm bg-gray-100 dark:bg-[var(--bg-muted)] rounded-xl outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-[var(--icons-green)]"
              />
            ) : (
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-gray-100 dark:bg-[var(--bg-muted)] rounded-xl outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-[var(--icons-green)]"
              >
                <option value="">Todas las categorías</option>
                <option value="positivo">Comentario Positivo</option>
                <option value="negativo">Comentario Negativo</option>
                <option value="informacion">Solicitud de Información</option>
                <option value="tecnico">Soporte Técnico</option>
                <option value="critico">Soporte Crítico</option>
              </select>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-[var(--border-subtle)]">
        {filteredTickets.map((ticket) => (
          <button
            key={ticket.id}
            onClick={() => onSelect(ticket.id)}
            className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-[#1A3A32] transition-colors ${activeTicketId === ticket.id ? 'bg-sky-50 dark:bg-[#1A3A32]/50' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-gray-400 dark:text-gray-500 font-bold">#{ticket.ticketNumber}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${getStatusColor(ticket.status)}`}>
                    {getStatusLabel(ticket.status)}
                  </span>
                  {ticket.unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-sky-500 text-white rounded-full">
                      {ticket.unreadCount}
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-gray-900 dark:text-[var(--text-primary)] truncate">{ticket.subject}</h4>
                <p className="text-sm text-gray-500 dark:text-[var(--text-muted)] mt-1 line-clamp-2">{ticket.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">{getCategoryLabel(ticket.category)}</span>
                  {ticket.assignedTo && (
                    <>
                      <span className="text-[10px] text-gray-300 dark:text-gray-600">•</span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">{ticket.assignedTo}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
        {filteredTickets.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Icon name="Ticket" className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-[#2A3F33]" />
            <p className="font-bold text-gray-800 dark:text-[var(--text-primary)]">Sin tickets</p>
            <p className="text-sm mt-1">{filterValue ? 'Sin resultados para este filtro' : 'Crea un nuevo ticket de soporte'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TicketChat({
  ticket,
  onSendMessage,
  onCloseTicket,
  isSending,
  isClosing,
}: {
  ticket: CustomerTicket;
  onSendMessage: (content: string) => void;
  onCloseTicket: () => void;
  isSending: boolean;
  isClosing: boolean;
}) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'abierto': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'proceso': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
      case 'pendiente': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'resuelto': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'cerrado': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const statusLabel = ticket.status === 'abierto' ? 'Abierto'
    : ticket.status === 'proceso' ? 'En proceso'
    : ticket.status === 'pendiente' ? 'Pendiente'
    : ticket.status === 'resuelto' ? 'Resuelto' : 'Cerrado';

  const canMessage = ticket.status !== 'cerrado';

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[var(--bg-secondary)] rounded-[2.5rem] shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-sky-500 to-sky-300 dark:from-[#1A3A32] dark:to-[var(--brand-green)] p-6 text-white relative">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <Icon name="Headset" className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tighter">{ticket.subject}</h3>
              <p className="text-[10px] font-bold text-sky-100 uppercase tracking-[0.2em]">
                #{ticket.ticketNumber}
              </p>
            </div>
          </div>
          <span className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full ${getStatusColor(ticket.status)}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-[var(--bg-muted)]/30">
        {ticket.messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-sky-50 dark:bg-[#1A3A32] rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="MessageCircle" className="w-8 h-8 text-sky-400 dark:text-[var(--icons-green)]" />
            </div>
            <p className="font-bold text-gray-800 dark:text-[var(--text-primary)]">Sin mensajes aún</p>
            <p className="text-sm text-gray-500 dark:text-[var(--text-muted)] mt-1">Envía un mensaje para comenzar la conversación</p>
          </div>
        ) : (
          ticket.messages.map((msg) => {
            const isCustomer = msg.senderType === 'customer';

            return (
              <div key={msg.id} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[75%] items-end gap-3 ${isCustomer ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm ${
                    isCustomer
                      ? 'bg-gradient-to-br from-sky-400 to-sky-600 dark:from-[var(--brand-green)] dark:to-[#1A3A32] text-white'
                      : 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white'
                  }`}>
                    {msg.senderName.split(' ').map(w => w[0]).slice(0, 2).join('')}
                  </div>

                  <div className={`relative rounded-3xl px-5 py-3 shadow-sm border backdrop-blur-sm ${
                    isCustomer
                      ? 'bg-gradient-to-br from-sky-500 to-sky-600 text-white border-sky-400/20 rounded-br-md'
                      : 'bg-white dark:bg-[#1A3A32] text-slate-800 dark:text-[var(--text-primary)] border-gray-200 dark:border-[var(--border-subtle)] rounded-bl-md'
                  }`}>
                    <div className="mb-1 flex items-center gap-2">
                      <p className={`text-[11px] font-black uppercase tracking-[0.16em] ${
                        isCustomer ? 'text-sky-100' : 'text-emerald-600 dark:text-[var(--icons-green)]'
                      }`}>
                        {msg.senderName}
                      </p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isCustomer ? 'bg-white/15 text-sky-50' : 'bg-emerald-50 dark:bg-[#2A3F33] text-emerald-700 dark:text-[#6BAF7B]'
                      }`}>
                        {isCustomer ? 'Tú' : 'Soporte'}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-all">{msg.content}</p>
                    <div className="mt-2 flex justify-end">
                      <p className={`text-[10px] font-medium ${isCustomer ? 'text-sky-100/80' : 'text-gray-400 dark:text-gray-500'}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {canMessage && (
        <div className="p-4 border-t border-gray-100 dark:border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Escribe un mensaje..."
              className="flex-1 text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-2xl outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)]"
              disabled={isSending}
            />
            <button
              onClick={handleSend}
              disabled={isSending || !message.trim()}
              className="px-6 py-4 bg-gradient-to-r from-sky-500 to-sky-600 dark:from-[#1A3A32] dark:to-[var(--brand-green)] text-white rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-50 hover:shadow-lg transition-all flex items-center gap-2"
            >
              {isSending ? (
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Icon name="Send" className="w-4 h-4" />
                  Enviar
                </>
              )}
            </button>
            <button
              onClick={onCloseTicket}
              disabled={isClosing}
              className="px-6 py-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-black text-xs uppercase tracking-widest border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 transition-all"
            >
              {isClosing ? 'Cerrando...' : 'Cerrar'}
            </button>
          </div>
        </div>
      )}

      {!canMessage && (
        <div className="p-4 border-t border-gray-100 dark:border-[var(--border-subtle)] bg-gray-50/50 dark:bg-[var(--bg-muted)]/50">
          <div className="flex items-center gap-3 justify-center">
            <Icon name="Lock" className="w-4 h-4 text-gray-400" />
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Este ticket está cerrado</p>
          </div>
        </div>
      )}
    </div>
  );
}

function NewTicketForm({
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  onSubmit: (data: { subject: string; description: string; category: string }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('informacion');
  const [priority, setPriority] = useState('baja');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    onSubmit({ subject, description, category });
  };

  return (
    <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-[2.5rem] shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-sky-500 to-sky-300 dark:from-[#1A3A32] dark:to-[var(--brand-green)] p-8 text-white relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
            <Icon name="Headset" className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tighter">Nuevo Ticket</h3>
            <p className="text-[10px] font-bold text-sky-100 uppercase tracking-[0.2em]">Solicitud de Soporte</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">Categoría</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                const priorityMap: Record<string, string> = {
                  'critico': 'critica',
                  'tecnico': 'media',
                  'negativo': 'media',
                  'informacion': 'baja',
                  'positivo': 'baja',
                };
                setPriority(priorityMap[e.target.value] || 'baja');
              }}
              className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)]"
              required
            >
              <option value="informacion">Solicitud de Información</option>
              <option value="positivo">Comentario Positivo</option>
              <option value="negativo">Comentario Negativo</option>
              <option value="tecnico">Soporte Técnico</option>
              <option value="critico">Soporte Crítico</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">Prioridad</label>
            <div className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-gray-100 dark:border-[var(--border-subtle)] rounded-2xl flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                priority === 'critica' ? 'bg-red-500' :
                priority === 'alta' ? 'bg-orange-500' :
                priority === 'media' ? 'bg-yellow-500' : 'bg-green-500'
              }`} />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                {priority === 'critica' ? 'Crítica' :
                 priority === 'alta' ? 'Alta' :
                 priority === 'media' ? 'Media' : 'Baja'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">Asunto</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Describe brevemente el problema"
            className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)]"
            required
            maxLength={200}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explica detalladamente tu problema o consulta..."
            rows={6}
            className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)] resize-none"
            required
            maxLength={5000}
          />
          <p className="text-[10px] text-gray-400 text-right">{description.length}/5000</p>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-8 py-4 rounded-2xl bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-600 dark:text-gray-400 font-black text-xs uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-[#2A3F33]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !subject.trim() || !description.trim()}
            className="flex-[2] px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 dark:from-[#1A3A32] dark:to-[var(--brand-green)] text-white font-black text-xs uppercase tracking-[0.2em] hover:shadow-lg disabled:opacity-50"
          >
            {isSubmitting ? 'Creando...' : 'Crear Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function SupportPageClient() {
  const {
    tickets,
    activeTicket,
    activeTicketId,
    setActiveTicketId,
    isLoading,
    isSending,
    isClosing,
    error,
    handleSendMessage,
    handleCreateTicket,
    handleCloseTicket,
    openTicketsCount,
  } = useCustomerSupport();

  const [showNewTicketForm, setShowNewTicketForm] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-140px)] animate-fadeIn">
        <ModuleHeader
          title="Soporte Lyrium"
          subtitle="Centro de soporte y gestión de incidencias"
          icon="Headset"
        />
        <div className="flex-1 flex items-center justify-center">
          <BaseLoading message="Cargando tickets de soporte..." />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-fadeIn">
      <ModuleHeader
        title="Soporte Lyrium"
        subtitle="Centro de soporte y gestión de incidencias"
        icon="Headset"
        actions={
          !showNewTicketForm && !activeTicket ? (
            <button
              onClick={() => setShowNewTicketForm(true)}
              className="px-6 py-3 bg-white dark:bg-[var(--bg-secondary)] text-sky-600 dark:text-[var(--icons-green)] rounded-xl font-black text-xs uppercase tracking-widest border border-gray-200 dark:border-[var(--border-subtle)] hover:bg-sky-50 dark:hover:bg-[#1A3A32] transition-all flex items-center gap-2"
            >
              <Icon name="Plus" className="w-4 h-4" />
              Nuevo Ticket
            </button>
          ) : null
        }
      />

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-4">
          <Icon name="AlertCircle" className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex-1 flex gap-4 overflow-hidden">
        {!showNewTicketForm && (
          <div className="w-[320px] shrink-0 hidden md:block">
            <TicketList
              tickets={tickets}
              activeTicketId={activeTicketId}
              onSelect={setActiveTicketId}
            />
          </div>
        )}

        {showNewTicketForm && (
          <div className="w-[320px] shrink-0 hidden md:block">
            <div className="flex flex-col h-full bg-white dark:bg-[var(--bg-secondary)] rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-sky-500 to-sky-300 dark:from-[#1A3A32] dark:to-[var(--brand-green)] p-6 text-white">
                <h3 className="font-black tracking-tighter">Nuevo Ticket</h3>
                <p className="text-[10px] font-bold text-sky-100 uppercase tracking-[0.2em]">Selecciona para crear</p>
              </div>
              <div className="flex-1 flex items-center justify-center p-6 text-center text-gray-500">
                <div>
                  <Icon name="ArrowRight" className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">Completa el formulario</p>
                  <p className="text-xs mt-1">Llena los datos a la derecha</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          {showNewTicketForm ? (
            <NewTicketForm
              onSubmit={(data) => {
                handleCreateTicket(data);
                setShowNewTicketForm(false);
              }}
              onCancel={() => setShowNewTicketForm(false)}
              isSubmitting={isSending}
            />
          ) : activeTicket ? (
            <TicketChat
              ticket={activeTicket}
              onSendMessage={handleSendMessage}
              onCloseTicket={() => handleCloseTicket(activeTicket.id)}
              isSending={isSending}
              isClosing={isClosing}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-sky-50 dark:bg-[#1A3A32] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon name="Headset" className="w-10 h-10 text-sky-400 dark:text-[var(--icons-green)]" />
                </div>
                <p className="text-xl font-black text-slate-800 dark:text-[var(--text-primary)]">Selecciona un ticket</p>
                <p className="text-sm text-slate-500 dark:text-[var(--text-muted)] mt-2">
                  O crea uno nuevo si tienes alguna consulta
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
