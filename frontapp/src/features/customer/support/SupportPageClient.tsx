'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useCustomerSupport } from '@/features/customer/support/hooks/useCustomerSupport';
import CustomerModuleHeader from '@/components/layout/customer/CustomerModuleHeader';
import CustomerChatLayout from '@/components/layout/customer/CustomerChatLayout';
import MessageBubble from '@/components/shared/chat/MessageBubble';
import MessageInput from '@/components/shared/chat/MessageInput';
import ConversationList from '@/components/shared/chat/ConversationList';
import BaseLoading from '@/components/ui/BaseLoading';
import Icon from '@/components/ui/Icon';
import type { Message as BubbleMessage } from '@/components/shared/chat/MessageBubble';
import type { Conversation } from '@/components/shared/chat/ConversationList';
import type { TicketStatus, TicketCategory, CustomerTicket } from './types';

const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string }> = {
    abierto:   { label: 'Abierto',    color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 border border-rose-200 dark:border-rose-800' },
    proceso:   { label: 'En proceso', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800' },
    pendiente: { label: 'Pendiente',  color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800' },
    resuelto:  { label: 'Resuelto',   color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' },
    cerrado:   { label: 'Cerrado',    color: 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400 border border-gray-200 dark:border-gray-700' },
};

const CATEGORY_LABELS: Record<TicketCategory, string> = {
    critico:     'Soporte Crítico',
    tecnico:     'Soporte Técnico',
    negativo:    'Comentario Negativo',
    informacion: 'Solicitud de Información',
    positivo:    'Comentario Positivo',
};

const PRIORITY_MAP: Record<string, string> = {
    critico: 'critica', tecnico: 'media', negativo: 'media', informacion: 'baja', positivo: 'baja',
};

const PRIORITY_DOT: Record<string, string> = {
    critica: 'bg-red-500', alta: 'bg-orange-500', media: 'bg-yellow-500', baja: 'bg-emerald-500',
};

const PRIORITY_LABEL: Record<string, string> = {
    critica: 'Crítica', alta: 'Alta', media: 'Media', baja: 'Baja',
};

function safeFormatTime(raw: string | null | undefined): string {
    if (!raw) return '';
    const d = new Date(raw);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

function mapTicketToConversation(ticket: CustomerTicket): Conversation {
    const lastMsg = ticket.messages.at(-1);
    return {
        id: ticket.id,
        name: ticket.subject,
        storeName: ticket.subject,
        lastMessage: lastMsg?.content ?? ticket.description,
        lastMessageTime: safeFormatTime(lastMsg?.createdAt),
        unreadCount: ticket.unreadCount,
        category: CATEGORY_LABELS[ticket.category],
    };
}

// ── CustomSelect ──────────────────────────────────────────────────────────────
interface SelectOption { value: string; label: string }
function CustomSelect({ value, onChange, options, disabled = false }: {
    value: string; onChange: (v: string) => void;
    options: SelectOption[]; disabled?: boolean;
}) {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);
    const selected = options.find(o => o.value === value);
    React.useEffect(() => {
        const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        if (open) document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [open]);
    return (
        <div ref={ref} className={`relative${disabled ? ' opacity-50 pointer-events-none' : ''}`}>
            <button type="button" onClick={() => setOpen(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[var(--bg-secondary)] rounded-2xl outline-none text-sm font-medium text-[var(--text-primary)] border-2 border-[var(--border-subtle)] hover:border-[var(--turquesa-500)] focus:border-[var(--turquesa-500)] cursor-pointer transition-all">
                <span className="truncate">{selected?.label ?? options[0]?.label ?? ''}</span>
                <svg className={`w-4 h-4 shrink-0 text-[var(--text-secondary)] transition-transform duration-200${open ? ' rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {open && (
                <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white dark:bg-[var(--bg-card)] rounded-2xl border-2 border-[var(--border-subtle)] shadow-2xl z-[60] overflow-hidden max-h-[126px] overflow-y-auto scrollbar-none">
                    {options.map(opt => (
                        <button key={opt.value} type="button"
                            onClick={() => { onChange(opt.value); setOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[var(--turquesa-500)]/8 dark:hover:bg-[#1e2d28] ${opt.value === value ? 'font-bold text-[var(--turquesa-500)] bg-[var(--turquesa-500)]/5' : 'font-medium text-[var(--text-primary)]'}`}>
                            {opt.label}
                        </button>
                    ))}
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

    const priority = PRIORITY_MAP[category] ?? 'baja';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !description.trim()) return;
        onSubmit({ subject, description, category });
    };

    return (
        <div className="flex flex-col bg-[var(--bg-card)] rounded-3xl border border-[var(--border-subtle)] shadow-sm">
            <div className="p-4 border-b border-[var(--border-subtle)] rounded-t-3xl">
                <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)]">Nuevo Ticket</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Solicitud de soporte a Lyrium</p>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                        Categoría
                    </label>
                    <CustomSelect
                        value={category}
                        onChange={setCategory}
                        options={[
                            { value: 'informacion', label: 'Solicitud de Información' },
                            { value: 'positivo',    label: 'Comentario Positivo' },
                            { value: 'negativo',    label: 'Comentario Negativo' },
                            { value: 'tecnico',     label: 'Soporte Técnico' },
                            { value: 'critico',     label: 'Soporte Crítico' },
                        ]}
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                        Prioridad
                    </label>
                    <div className="w-full px-4 py-3 bg-[var(--bg-secondary)] rounded-2xl text-sm border-2 border-[var(--border-subtle)] flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[priority] ?? 'bg-gray-400'}`} />
                        <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                            {PRIORITY_LABEL[priority] ?? 'Baja'}
                        </span>
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                        Asunto
                    </label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Describe brevemente el problema"
                        className="w-full px-4 py-3 bg-[var(--bg-secondary)] rounded-2xl outline-none text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] border-2 border-[var(--border-subtle)] focus:border-[var(--turquesa-500)] transition-all"
                        required
                        maxLength={200}
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                        Descripción
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Explica detalladamente tu problema o consulta..."
                        rows={4}
                        className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] rounded-2xl outline-none text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] border-2 border-[var(--border-subtle)] focus:border-[var(--turquesa-500)] transition-all resize-none"
                        required
                        maxLength={5000}
                    />
                    <p className="text-[10px] text-[var(--text-secondary)] text-right mt-1">
                        {description.length}/5000
                    </p>
                </div>

                <div className="flex gap-2 pt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-[var(--bg-hover)] transition-colors border-2 border-[var(--border-subtle)]"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !subject.trim() || !description.trim()}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-[#9cb04e] via-[#64c695] to-[#499bbf] text-white rounded-2xl font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-[#64c695]/20"
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
    } = useCustomerSupport();

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isMobileListVisible, setIsMobileListVisible] = useState(true);
    const [showNewTicketForm, setShowNewTicketForm] = useState(false);
    const [showLegend, setShowLegend] = useState(false);
    const [filterType, setFilterType] = useState<'asunto' | 'categoria'>('asunto');
    const [filterValue, setFilterValue] = useState('');
    const [showFilter, setShowFilter] = useState(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeTicket?.messages]);

    const handleTicketSelect = useCallback((id: string) => {
        setActiveTicketId(id);
        setIsMobileListVisible(false);
    }, [setActiveTicketId]);

    const handleBackToList = useCallback(() => {
        setIsMobileListVisible(true);
    }, []);

    const filteredTickets = tickets.filter(ticket => {
        if (!filterValue) return true;
        if (filterType === 'asunto') return ticket.subject.toLowerCase().includes(filterValue.toLowerCase());
        return ticket.category === filterValue;
    });

    const mappedConversations: Conversation[] = filteredTickets.map(mapTicketToConversation);

    const mappedMessages: BubbleMessage[] = (activeTicket?.messages ?? []).map(msg => {
        const raw = msg.createdAt;
        const d = raw ? new Date(raw) : null;
        const timestamp = d && !isNaN(d.getTime()) ? d.toISOString() : new Date().toISOString();
        return { id: msg.id, sender: msg.senderId, content: msg.content, timestamp, read_at: null };
    });

    const canMessage = activeTicket && activeTicket.status !== 'cerrado';

    // ── List panel ────────────────────────────────────────────────────────────
    const listContent = (
        <div className="flex flex-col h-full min-h-0">
            <div className="p-4 border-b border-[var(--border-subtle)] shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)]">
                            Mis Tickets
                        </h3>
                        <p className="text-[10px] font-medium text-[var(--text-secondary)] mt-0.5">
                            {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={() => { setShowFilter(prev => !prev); setFilterValue(''); }}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-colors shrink-0 ${
                            showFilter
                                ? 'bg-[var(--turquesa-500)] text-white border-[var(--turquesa-500)] shadow-sm'
                                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--bg-hover)]'
                        }`}
                    >
                        Filtrar
                    </button>
                </div>

                {showFilter && (
                    <div className="mt-3 space-y-2 animate-fadeIn">
                        <div className="flex rounded-xl overflow-hidden border border-[var(--border-subtle)] text-[10px] font-bold">
                            <button
                                onClick={() => { setFilterType('asunto'); setFilterValue(''); }}
                                className={`flex-1 py-1.5 uppercase tracking-wider transition-colors ${
                                    filterType === 'asunto'
                                        ? 'bg-[var(--turquesa-500)] text-white'
                                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                                }`}
                            >
                                Asunto
                            </button>
                            <button
                                onClick={() => { setFilterType('categoria'); setFilterValue(''); }}
                                className={`flex-1 py-1.5 uppercase tracking-wider transition-colors ${
                                    filterType === 'categoria'
                                        ? 'bg-[var(--turquesa-500)] text-white'
                                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
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
                            <CustomSelect
                                value={filterValue}
                                onChange={setFilterValue}
                                options={[
                                    { value: '',           label: 'Todas las categorías' },
                                    { value: 'positivo',   label: 'Comentario Positivo' },
                                    { value: 'negativo',   label: 'Comentario Negativo' },
                                    { value: 'informacion',label: 'Solicitud de Información' },
                                    { value: 'tecnico',    label: 'Soporte Técnico' },
                                    { value: 'critico',    label: 'Soporte Crítico' },
                                ]}
                            />
                        )}
                    </div>
                )}
            </div>

            <ConversationList
                conversations={mappedConversations}
                activeId={activeTicketId ?? undefined}
                onSelect={handleTicketSelect}
                accentColor="turquesa"
            />
        </div>
    );

    // ── Detail panel ──────────────────────────────────────────────────────────
    const detailContent = activeTicket ? (
        <div className="flex flex-col h-full min-h-0">
            <div className="px-3 py-2.5 sm:p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={handleBackToList}
                        className="md:hidden -ml-0.5 w-8 h-8 shrink-0 flex items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
                        aria-label="Volver a tickets"
                    >
                        <Icon name="ArrowLeft" className="w-4 h-4" />
                    </button>
                    <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-[#9cb04e] via-[#64c695] to-[#499bbf] flex items-center justify-center text-white shadow-sm">
                        <Icon name="Headset" className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[var(--text-primary)] truncate leading-tight">
                            {activeTicket.subject}
                        </h3>
                        <p className="text-[10px] text-[var(--text-secondary)] truncate">
                            #{activeTicket.ticketNumber}
                            {activeTicket.assignedTo ? ` · ${activeTicket.assignedTo}` : ' · Sin asignar'}
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full ${STATUS_CONFIG[activeTicket.status].color}`}>
                            {STATUS_CONFIG[activeTicket.status].label}
                        </span>
                        {activeTicket.status !== 'cerrado' && (
                            <button
                                onClick={() => handleCloseTicket(activeTicket.id)}
                                disabled={isClosing}
                                className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-bold text-[9px] sm:text-[10px] uppercase tracking-wider border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/30 disabled:opacity-50 transition-all whitespace-nowrap"
                            >
                                {isClosing ? '...' : 'Cerrar'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-[var(--bg-card)]/50 custom-scrollbar">
                {activeTicket.messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-8 py-16">
                        <div className="w-16 h-16 rounded-full bg-[var(--turquesa-500)]/10 flex items-center justify-center mx-auto mb-4">
                            <Icon name="MessageCircle" className="w-8 h-8 text-[var(--turquesa-500)]" />
                        </div>
                        <p className="font-black text-[var(--text-primary)] text-sm">Sin mensajes aún</p>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                            Envía un mensaje para comenzar la conversación
                        </p>
                    </div>
                ) : (
                    <MessageBubble
                        messages={mappedMessages}
                        isSentOverride={(msg) => msg.sender === 'self'}
                        meta={{
                            currentUserName: 'Tú',
                            currentUserRole: 'Cliente',
                            otherName: activeTicket.assignedTo ?? 'Soporte Lyrium',
                            otherRole: 'Agente',
                            showAvatar: true,
                        }}
                    />
                )}
                <div ref={messagesEndRef} />
            </div>

            {canMessage ? (
                <MessageInput
                    onSend={(msg) => handleSendMessage(msg)}
                    placeholder="Escribe un mensaje al soporte..."
                    disabled={isSending}
                />
            ) : (
                <div className="p-4 border-t border-[var(--border-subtle)]/50 bg-white/50 dark:bg-[var(--bg-primary)]/50 backdrop-blur-xl">
                    <div className="flex items-center gap-2 justify-center">
                        <Icon name="Lock" className="w-4 h-4 text-[var(--text-secondary)]" />
                        <p className="text-xs font-bold text-[var(--text-secondary)]">Este ticket está cerrado</p>
                    </div>
                </div>
            )}
        </div>
    ) : (
        <div className="flex-1 flex items-center justify-center">
            <div className="text-center px-8">
                <div className="w-16 h-16 rounded-full bg-[var(--turquesa-500)]/10 flex items-center justify-center mx-auto mb-4">
                    <Icon name="Headset" className="w-8 h-8 text-[var(--turquesa-500)]" />
                </div>
                <p className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)] mb-1">
                    Selecciona un ticket
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                    O crea uno nuevo si tienes alguna consulta
                </p>
            </div>
        </div>
    );

    // ── Loading ───────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="flex flex-col h-[calc(100dvh-108px)] md:h-[calc(100vh-140px)] animate-fadeIn">
                <CustomerModuleHeader
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

    // ── Main render ───────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-[calc(100dvh-108px)] md:h-[calc(100vh-140px)] animate-fadeIn">
            <CustomerModuleHeader
                title="Soporte Lyrium"
                subtitle="Centro de soporte y gestión de incidencias"
                icon="Headset"
                actions={
                    !showNewTicketForm ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowLegend(true)}
                                title="Leyenda"
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-gray-500 dark:text-[var(--text-secondary)] hover:text-[var(--turquesa-500)] dark:hover:text-[var(--icons-green)] hover:border-[var(--turquesa-500)] dark:hover:border-[var(--icons-green)] transition-all shadow-sm"
                            >
                                <Icon name="Info" className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setShowNewTicketForm(true)}
                                className="px-4 py-2 bg-white dark:bg-[var(--bg-secondary)] text-[var(--turquesa-500)] rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[var(--turquesa-500)]/10 dark:hover:bg-[#2A3F33] transition-colors border border-[var(--border-subtle)] shadow-sm"
                            >
                                + Nuevo Ticket
                            </button>
                        </div>
                    ) : null
                }
            />

            {error && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 mb-4">
                    <Icon name="AlertCircle" className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">{error}</p>
                </div>
            )}

            {showNewTicketForm ? (
                <div className="flex-1 overflow-y-auto scrollbar-none">
                    <div className="min-h-full flex items-center justify-center px-4 sm:px-8 py-6">
                        <div className="w-full max-w-xl">
                            <NewTicketForm
                                onSubmit={(data) => {
                                    handleCreateTicket(data);
                                    setShowNewTicketForm(false);
                                }}
                                onCancel={() => setShowNewTicketForm(false)}
                                isSubmitting={isSending}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <CustomerChatLayout
                    list={listContent}
                    detail={detailContent}
                    mobileView={isMobileListVisible ? 'list' : 'detail'}
                />
            )}

            {showLegend && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[70] flex items-end sm:items-center justify-center sm:p-4 sm:pt-20" onClick={() => setShowLegend(false)}>
                    <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-t-[2.5rem] sm:rounded-[3rem] max-w-lg w-full shadow-2xl overflow-hidden max-h-[90dvh] sm:max-h-[calc(100dvh-6rem)] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-[var(--turquesa-500)] to-[var(--turquesa-500)]/70 dark:from-[var(--brand-green-hover)] dark:via-[var(--brand-green)] dark:to-[var(--brand-green-hover)] p-6 md:p-8 text-white relative shrink-0">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                            <div className="relative z-10 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                        <Icon name="Headset" className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tighter">Soporte Lyrium</h3>
                                        <p className="text-[10px] font-bold text-white/70 uppercase tracking-wide">¿Para qué sirve este canal?</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowLegend(false)} className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20">
                                    <Icon name="X" className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>
                        <div className="p-5 md:p-8 space-y-4 overflow-y-auto scrollbar-none">
                            {[
                                { icon: 'Settings', title: 'Problemas técnicos', desc: 'Errores en la plataforma, fallas en el inicio de sesión, problemas con el sitio web o la app.' },
                                { icon: 'Shield', title: 'Seguridad y acceso', desc: 'Cuentas bloqueadas, acceso no autorizado, cambios de contraseña o datos comprometidos.' },
                                { icon: 'CreditCard', title: 'Confirmaciones de pago', desc: 'Consulta si un pago fue procesado correctamente en la plataforma.' },
                                { icon: 'AlertCircle', title: 'No gestiona reclamos comerciales', desc: 'Para devoluciones, reembolsos, cambios, facturación o consultas sobre productos, usa el Chat con Vendedores.' },
                            ].map((item) => (
                                <div key={item.title} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-[var(--bg-muted)]/50 rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)]">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-[var(--bg-secondary)] flex items-center justify-center shadow-sm border border-gray-100 dark:border-[var(--border-subtle)] shrink-0">
                                        <Icon name={item.icon as any} className="w-5 h-5 text-[var(--turquesa-500)] dark:text-[var(--icons-green)]" />
                                    </div>
                                    <div>
                                        <p className="font-black text-sm text-gray-800 dark:text-[var(--text-primary)] mb-0.5">{item.title}</p>
                                        <p className="text-xs text-gray-500 dark:text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-end pt-2">
                                <button onClick={() => setShowLegend(false)} className="px-6 py-3 rounded-2xl bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-600 dark:text-[var(--text-primary)] font-black text-xs uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-[#2A3F33] transition-all">
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
