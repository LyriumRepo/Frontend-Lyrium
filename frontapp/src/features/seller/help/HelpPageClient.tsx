'use client';

import React, { useState } from 'react';
import { useSellerHelp } from '@/features/seller/help/hooks/useSellerHelp';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseLoading from '@/components/ui/BaseLoading';
import { SellerTicket, TicketStatus, TicketCategory } from '@/features/seller/help/types';

function TicketList({
    tickets,
    activeTicketId,
    onSelect
}: {
    tickets: SellerTicket[];
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
        <div className="flex flex-col h-full min-h-0 bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm overflow-hidden">
            {/* ── Cabecera con filtro ── */}
            <div className="p-5 border-b border-[var(--border-subtle)]">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)]">Mis Tickets</h3>
                        <p className="text-[10px] font-medium text-[var(--text-secondary)] mt-0.5">
                            {filteredTickets.length} tickets
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setShowFilter(prev => !prev);
                            setFilterValue('');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-colors shrink-0 ${showFilter
                                ? 'bg-[var(--turquesa-500)] text-white border-[var(--turquesa-500)] shadow-sm'
                                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-gray-200 dark:hover:bg-[#2A3F33]'
                            }`}
                    >
                        Filtrar
                    </button>
                </div>

                {/* ── Panel de filtro ── */}
                {showFilter && (
                    <div className="mt-3 space-y-2 animate-fadeIn">
                        <div className="flex rounded-xl overflow-hidden border border-[var(--border-subtle)] text-[10px] font-bold">
                            <button
                                onClick={() => { setFilterType('asunto'); setFilterValue(''); }}
                                className={`flex-1 py-1.5 uppercase tracking-wider transition-colors ${filterType === 'asunto'
                                        ? 'bg-[var(--turquesa-500)] text-white'
                                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-gray-200 dark:hover:bg-[#2A3F33]'
                                    }`}
                            >
                                Asunto
                            </button>
                            <button
                                onClick={() => { setFilterType('categoria'); setFilterValue(''); }}
                                className={`flex-1 py-1.5 uppercase tracking-wider transition-colors ${filterType === 'categoria'
                                        ? 'bg-[var(--turquesa-500)] text-white'
                                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-gray-200 dark:hover:bg-[#2A3F33]'
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
                                className="w-full px-3 py-1.5 text-sm bg-[var(--bg-secondary)] rounded-xl outline-none text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--turquesa-500)]/20 border border-[var(--border-subtle)]"
                            />
                        ) : (
                            <select
                                value={filterValue}
                                onChange={(e) => setFilterValue(e.target.value)}
                                className="w-full px-3 py-1.5 text-sm bg-[var(--bg-secondary)] rounded-xl outline-none text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--turquesa-500)]/20 border border-[var(--border-subtle)]"
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
            <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-subtle)]">
                {filteredTickets.map((ticket) => (
                    <button
                        key={ticket.id}
                        onClick={() => onSelect(ticket.id)}
                        className={`w-full p-4 text-left transition-colors ${activeTicketId === ticket.id
                            ? 'bg-[var(--turquesa-500)]/10 border-l-2 border-[var(--turquesa-500)]'
                            : 'hover:bg-[var(--bg-secondary)]/50'
                            }`}
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-mono text-[var(--text-muted)]">#{ticket.ticketNumber}</span>
                                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full ${getStatusColor(ticket.status)}`}>
                                        {getStatusLabel(ticket.status)}
                                    </span>
                                </div>
                                <h4 className="text-xs font-black text-[var(--text-primary)] truncate uppercase tracking-tight">{ticket.subject}</h4>
                                <p className="text-[10px] text-[var(--text-secondary)] mt-1 line-clamp-2 font-medium">{ticket.description}</p>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="text-[9px] text-[var(--text-muted)] font-medium">{getCategoryLabel(ticket.category)}</span>
                                    <span className="text-[9px] text-[var(--text-muted)]">•</span>
                                    <span className="text-[9px] text-[var(--text-muted)] font-medium">{formatDate(ticket.createdAt)}</span>
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
    ticket: SellerTicket;
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
        <div className="flex flex-col h-full bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] shadow-xl overflow-hidden">
            {/* Cabecera */}
            <div className="p-5 bg-[var(--bg-secondary)]/50 border-b border-[var(--border-subtle)] flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--turquesa-500)]/20 to-[var(--verde-500)]/10 text-[var(--turquesa-500)] flex items-center justify-center font-black text-sm border border-[var(--turquesa-500)]/20 shadow-md shrink-0">
                        {ticket.subject.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-[var(--text-primary)] leading-none uppercase tracking-tight">{ticket.subject}</h3>
                        <p className="text-[10px] text-[var(--text-muted)] font-semibold mt-1.5 tracking-wide">#{ticket.ticketNumber} · {formatDate(ticket.createdAt)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status === 'open' ? 'Abierto' :
                            ticket.status === 'in_progress' ? 'En proceso' :
                                ticket.status === 'pending' ? 'Pendiente' :
                                    ticket.status === 'resolved' ? 'Resuelto' : 'Cerrado'}
                    </span>
                    {['open', 'in_progress', 'pending'].includes(ticket.status as TicketStatus) && (
                        <button
                            onClick={onCloseTicket}
                            disabled={isClosing}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-bold text-[10px] uppercase tracking-wider border border-rose-200 dark:border-rose-800 hover:bg-rose-100 disabled:opacity-50 transition-all"
                        >
                            {isClosing ? '...' : 'Cerrar'}
                        </button>
                    )}
                </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[var(--bg-card)]/50 custom-scrollbar">
                {ticket.messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                        <div className="w-14 h-14 rounded-full bg-[var(--turquesa-500)]/10 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-[var(--turquesa-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <p className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)] mb-1">Sin mensajes aún</p>
                        <p className="text-xs text-[var(--text-secondary)]">Envía un mensaje para comenzar la conversación</p>
                    </div>
                ) : (
                    ticket.messages.map((msg) => {
                        const isSeller = msg.senderType === 'seller';
                        return (
                            <div key={msg.id} className={`flex ${isSeller ? 'justify-end animate-bubble-in-right' : 'justify-start animate-bubble-in-left'} group/msg`}>
                                <div className={`max-w-[70%] p-4 rounded-3xl relative flex flex-col gap-1.5 shadow-sm transition-all duration-300 hover:shadow-md ${
                                    isSeller
                                        ? 'bg-gradient-to-br from-[var(--turquesa-500)] to-[var(--verde-500)] text-white rounded-tr-none shadow-md shadow-[var(--turquesa-500)]/5'
                                        : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-tl-none border border-[var(--border-subtle)]'
                                }`}>
                                    <div className={`text-[9px] font-black uppercase tracking-wider ${
                                        isSeller ? 'text-white/80' : 'text-[var(--icons-green)]'
                                    }`}>
                                        {msg.senderName} <span className="opacity-75 font-normal">({isSeller ? 'Tú' : 'Soporte'})</span>
                                    </div>
                                    <p className="text-xs font-semibold leading-relaxed break-words">{msg.content}</p>
                                    <div className="flex items-center justify-end mt-1.5">
                                        <span className={`text-[8px] font-bold ${isSeller ? 'text-white/70' : 'text-[var(--text-muted)]'}`}>
                                            {formatTime(msg.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input */}
            {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                <div className="p-4 bg-[var(--bg-secondary)]/50 border-t border-[var(--border-subtle)]">
                    <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-3 items-center relative">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Escribe un mensaje en el canal de soporte..."
                            className="flex-1 pl-4 pr-14 py-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl text-xs font-bold focus:ring-2 focus:ring-[var(--turquesa-500)]/20 outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                            disabled={isSending}
                        />
                        <button
                            type="submit"
                            disabled={isSending || !message.trim()}
                            className="absolute right-2.5 w-11 h-11 rounded-xl bg-[var(--brand-green)] hover:bg-[var(--brand-green-hover)] text-white flex items-center justify-center transition active:scale-95 shadow-md shadow-[var(--brand-green)]/30 border border-[var(--brand-green)]/20 disabled:opacity-50"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </form>
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
        <div className="flex flex-col h-full bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)]">Nuevo Ticket</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Crea una nueva solicitud de soporte</p>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Categoría</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] rounded-xl outline-none text-sm font-medium text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--turquesa-500)]/20 border border-[var(--border-subtle)]"
                        required
                    >
                        <option value="positivo">Comentario Positivo</option>
                        <option value="negativo">Comentario Negativo</option>
                        <option value="informacion">Solicitud de Información</option>
                        <option value="tecnico">Soporte Técnico</option>
                        <option value="critico">Soporte Técnico Crítico</option>
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Asunto</label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Describe brevemente el problema"
                        className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] rounded-xl outline-none text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--turquesa-500)]/20 border border-[var(--border-subtle)]"
                        required
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Descripción</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Explica detalladamente tu problema..."
                        rows={5}
                        className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] rounded-xl outline-none text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--turquesa-500)]/20 border border-[var(--border-subtle)] resize-none"
                        required
                    />
                </div>

                <div className="flex gap-2 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-[#2A3F33] transition-colors border border-[var(--border-subtle)]"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[var(--turquesa-500)] to-[var(--verde-500)] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-[var(--turquesa-500)]/20"
                    >
                        {isSubmitting ? 'Creando...' : 'Crear Ticket'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export function HelpPageClient() {
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
    } = useSellerHelp();

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
                            className="px-4 py-2 bg-white dark:bg-[var(--bg-secondary)] text-[var(--turquesa-500)] rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[var(--turquesa-500)]/10 transition-colors border border-[var(--border-subtle)] shadow-sm"
                        >
                            + Nuevo Ticket
                        </button>
                    ) : null
                }
            />

            <div className="flex-1 flex gap-6 overflow-hidden">
                {!showNewTicketForm && (
                    <div className="w-96 shrink-0">
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
                        <div className="h-full flex items-center justify-center bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)]">
                            <div className="text-center px-8">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--turquesa-500)]/10 to-[var(--verde-500)]/10 flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-[var(--turquesa-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)] mb-1">Selecciona un ticket</p>
                                <p className="text-xs text-[var(--text-secondary)]">O crea uno nuevo si tienes alguna consulta</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
