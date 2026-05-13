'use client';

import React, { useState } from 'react';
import { useCustomerSupport } from '@/features/customer/support/hooks/useCustomerSupport';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseLoading from '@/components/ui/BaseLoading';
import { CustomerTicket, TicketStatus, TicketCategory } from '@/features/customer/support/types';

function TicketList({
    tickets,
    activeTicketId,
    onSelect
}: {
    tickets: CustomerTicket[];
    activeTicketId: string | null;
    onSelect: (id: string) => void;
}) {
    const getStatusColor = (status: TicketStatus) => {
        switch (status) {
            case 'open': return 'bg-red-100 text-red-700';
            case 'in_progress': return 'bg-amber-100 text-amber-700';
            case 'pending': return 'bg-blue-100 text-blue-700';
            case 'resolved': return 'bg-emerald-100 text-emerald-700';
            case 'closed': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: TicketStatus) => {
        switch (status) {
            case 'open': return 'Abierto';
            case 'in_progress': return 'En proceso';
            case 'pending': return 'Pendiente';
            case 'resolved': return 'Resuelto';
            case 'closed': return 'Cerrado';
            default: return status;
        }
    };

    const getCategoryLabel = (category: TicketCategory) => {
        switch (category) {
            case 'critico': return 'Soporte Técnico Critico';
            case 'tecnico': return 'Soporte Técnico';
            case 'negativo': return 'Comentario Negativo';
            case 'informacion': return 'Solicitud de Información';
            case 'positivo': return 'Comentario Positivo';
            default: return category;
        }
    };

    const formatDate = (dateStr: string) => {
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
        <div className="flex flex-col h-full min-h-0 bg-[var(--bg-card)] rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            {/* ── Cabecera con filtro ── */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Mis Tickets</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-300">
                            {filteredTickets.length} tickets
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setShowFilter(prev => !prev);
                            setFilterValue('');
                        }}
                        className={`p-2 rounded-xl transition-colors text-xs font-medium border ${showFilter
                                ? 'bg-sky-100 text-sky-600 border-sky-200 dark:bg-[var(--brand-green)] dark:text-white dark:border-transparent'
                                : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200 dark:bg-[var(--bg-secondary)] dark:border-transparent'
                            }`}
                    >
                        Filtrar
                    </button>
                </div>

                {/* ── Panel de filtro ── */}
                {showFilter && (
                    <div className="mt-3 space-y-2">
                        {/* Tabs Asunto / Categoría */}
                        <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 text-xs font-medium">
                            <button
                                onClick={() => { setFilterType('asunto'); setFilterValue(''); }}
                                className={`flex-1 py-1.5 transition-colors ${filterType === 'asunto'
                                        ? 'bg-sky-500 dark:bg-[var(--brand-green)] text-white'
                                        : 'bg-gray-100 dark:bg-[var(--bg-secondary)] text-gray-500 hover:bg-gray-200'
                                    }`}
                            >
                                Asunto
                            </button>
                            <button
                                onClick={() => { setFilterType('categoria'); setFilterValue(''); }}
                                className={`flex-1 py-1.5 transition-colors ${filterType === 'categoria'
                                        ? 'bg-sky-500 dark:bg-[var(--brand-green)] text-white'
                                        : 'bg-gray-100 dark:bg-[var(--bg-secondary)] text-gray-500 hover:bg-gray-200'
                                    }`}
                            >
                                Categoría
                            </button>
                        </div>

                        {/* Input según tipo */}
                        {filterType === 'asunto' ? (
                            <input
                                type="text"
                                value={filterValue}
                                onChange={(e) => setFilterValue(e.target.value)}
                                placeholder="Buscar por asunto..."
                                className="w-full px-3 py-1.5 text-sm bg-gray-100 dark:bg-[var(--bg-secondary)] rounded-xl outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-[var(--icons-green)]"
                            />
                        ) : (
                            <select
                                value={filterValue}
                                onChange={(e) => setFilterValue(e.target.value)}
                                className="w-full px-3 py-1.5 text-sm bg-gray-100 dark:bg-[var(--bg-secondary)] rounded-xl outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-[var(--icons-green)]"
                            >
                                <option value="">Todas las categorías</option>
                                <option value="positivo">Comentario Positivo</option>
                                <option value="negativo">Comentario Negativo</option>
                                <option value="informacion">Solicitud de Información</option>
                                <option value="tecnico">Soporte Técnico</option>
                                <option value="critico">Soporte Técnico Crítico</option>
                            </select>
                        )}
                    </div>
                )}
            </div>

            {/* ── Lista filtrada ── */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {filteredTickets.map((ticket) => (
                    <button
                        key={ticket.id}
                        onClick={() => onSelect(ticket.id)}
                        className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-[var(--brand-green)] transition-colors ${activeTicketId === ticket.id ? 'bg-sky-50 dark:bg-[var(--brand-green-hover)]' : ''
                            }`}
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-mono text-gray-400 dark:text-gray-300">#{ticket.ticketNumber}</span>
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                                        {getStatusLabel(ticket.status)}
                                    </span>
                                </div>
                                <h4 className="font-medium text-gray-900 dark:text-white truncate">{ticket.subject}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{ticket.description}</p>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="text-xs text-gray-400">{getCategoryLabel(ticket.category)}</span>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-xs text-gray-400">{formatDate(ticket.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    </button>
                ))}
                {filteredTickets.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        <p>{filterValue ? 'Sin resultados para este filtro' : 'No hay tickets'}</p>
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
    isClosing
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
            case 'open': return 'bg-red-100 text-red-700';
            case 'in_progress': return 'bg-amber-100 text-amber-700';
            case 'pending': return 'bg-blue-100 text-blue-700';
            case 'resolved': return 'bg-emerald-100 text-emerald-700';
            case 'closed': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="flex flex-col h-full bg-[var(--bg-card)] rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{ticket.subject}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-300">#{ticket.ticketNumber} • {formatDate(ticket.createdAt)}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status === 'open' ? 'Abierto' :
                            ticket.status === 'in_progress' ? 'En proceso' :
                                ticket.status === 'pending' ? 'Pendiente' :
                                    ticket.status === 'resolved' ? 'Resuelto' : 'Cerrado'}
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-[var(--bg-secondary)]">
                {ticket.messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        <p>No hay mensajes aún</p>
                        <p className="text-sm">Envía un mensaje para comenzar la conversación</p>
                    </div>
                ) : (
                    ticket.messages.map((msg) => {
                        const isCustomer = msg.senderType === 'customer';

                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`flex max-w-[50%] items-end gap-3 ${isCustomer ? 'flex-row-reverse' : 'flex-row'
                                        }`}
                                >
                                    <div
                                        className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm ${isCustomer
                                            ? 'bg-sky-500 text-white'
                                            : 'bg-emerald-500 text-white'
                                            }`}
                                    >
                                        {msg.senderName
                                            .split(' ')
                                            .map((w) => w[0])
                                            .slice(0, 2)
                                            .join('')}
                                    </div>

                                    <div
                                        className={`relative rounded-3xl px-4 py-3 shadow-sm border backdrop-blur-sm ${isCustomer
                                            ? 'bg-gradient-to-br from-sky-500 to-sky-600 text-white border-sky-400/20 rounded-br-md'
                                            : 'bg-white dark:bg-gray-100 text-slate-800 border-gray-200 rounded-bl-md'
                                            }`}
                                    >
                                        <div className="mb-1 flex items-center gap-2">
                                            <p
                                                className={`text-[11px] font-black uppercase tracking-[0.16em] ${isCustomer ? 'text-sky-100' : 'text-emerald-600'
                                                    }`}
                                            >
                                                {msg.senderName}
                                            </p>
                                            <span
                                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isCustomer
                                                    ? 'bg-white/15 text-sky-50'
                                                    : 'bg-emerald-50 text-emerald-700'
                                                    }`}
                                            >
                                                {isCustomer ? 'Tú' : 'Soporte'}
                                            </span>
                                        </div>

                                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-all">
                                            {msg.content}
                                        </p>

                                        <div className="mt-2 flex justify-end">
                                            <p
                                                className={`text-[10px] font-medium ${isCustomer ? 'text-sky-100/80' : 'text-gray-400'
                                                    }`}
                                            >
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

            {ticket.status !== 'resolved' && (
                <div className="p-3 border-t border-gray-100 dark:border-white/10">
                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Escribe un mensaje..."
                            className="flex-1 min-w-0 px-4 py-2.5 bg-white dark:bg-[var(--bg-secondary)] rounded-full outline-none border-2 border-gray-300 dark:border-transparent focus:ring-2 focus:ring-sky-500 dark:focus:ring-[var(--icons-green)]"
                            disabled={isSending}
                        />

                        <button
                            onClick={handleSend}
                            disabled={isSending || !message.trim()}
                            className="shrink-0 px-4 py-2.5 bg-sky-500 dark:bg-[var(--brand-green)] text-white rounded-full font-medium disabled:opacity-50 hover:bg-sky-600 dark:hover:bg-[var(--brand-green-hover)] border border-sky-200 dark:border-[var(--border-subtle)] transition-colors"
                        >
                            {isSending ? 'Enviando...' : 'Enviar'}
                        </button>

                        {['open', 'in_progress', 'pending'].includes(ticket.status as TicketStatus) && (
                            <button
                                onClick={onCloseTicket}
                                disabled={isClosing}
                                className="shrink-0 inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition-all duration-200 hover:border-red-300 hover:bg-red-100 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                            >
                                {isClosing ? "Cerrando..." : "Cerrar ticket"}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function NewTicketForm({
    onSubmit,
    onCancel,
    isSubmitting
}: {
    onSubmit: (data: { subject: string; description: string; category: string }) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}) {
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('positivo');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ subject, description, category });
    };

    return (
        <div className="flex flex-col h-full bg-[var(--bg-card)] rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 dark:text-white">Nuevo Ticket</h3>
                <p className="text-sm text-gray-500 dark:text-gray-300">Crea una nueva solicitud de soporte</p>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Categoría</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-100 dark:bg-[var(--bg-secondary)] rounded-xl outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-[var(--icons-green)]"
                        required
                    >
                        <option value="positivo">Comentario Positivo</option>
                        <option value="negativo">Comentario Negativo</option>
                        <option value="informacion">Solicitud de Información</option>
                        <option value="tecnico">Soporte Técnico</option>
                        <option value="critico">Soporte Técnico Critico</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Asunto</label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Describe brevemente el problema"
                        className="w-full px-4 py-2 bg-gray-100 dark:bg-[var(--bg-secondary)] rounded-xl outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-[var(--icons-green)]"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Explica detalladamente tu problema..."
                        rows={5}
                        className="w-full px-4 py-2 bg-gray-100 dark:bg-[var(--bg-secondary)] rounded-xl outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-[var(--icons-green)] resize-none"
                        required
                    />
                </div>

                <div className="flex gap-2 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 dark:bg-[var(--brand-green)] dark:hover:bg-[var(--brand-green-hover)] border dark:border-[var(--border-subtle)] transition-colors disabled:opacity-50"
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
        handleSendMessage,
        handleCreateTicket,
        handleCloseTicket,
        openTicketsCount
    } = useCustomerSupport();

    const [showNewTicketForm, setShowNewTicketForm] = useState(false);

    if (isLoading) {
        return (
            <div className="flex flex-col h-[calc(100vh-140px)] animate-fadeIn">
                <ModuleHeader
                    title="Mesa de Ayuda"
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
                            className="px-4 py-2 bg-white text-sky-600 dark:text-[var(--brand-green)] rounded-xl font-medium hover:bg-sky-50 transition-colors"
                        >
                            + Nuevo Ticket
                        </button>
                    ) : null
                }
            />

            <div className="flex-1 flex gap-4 overflow-hidden">
                {!showNewTicketForm && (
                    <div className="w-[290px] shrink-0">
                        <TicketList
                            tickets={tickets}
                            activeTicketId={activeTicketId}
                            onSelect={setActiveTicketId}
                        />
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
                        <div className="h-full flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <p className="text-lg mb-2">Selecciona un ticket</p>
                                <p className="text-sm">O crea uno nuevo si tienes alguna consulta</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
