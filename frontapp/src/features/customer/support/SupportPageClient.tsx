'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useCustomerSupport } from '@/features/customer/support/hooks/useCustomerSupport';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import ChatLayout from '@/components/shared/chat/ChatLayout';
import MessageBubble from '@/components/shared/chat/MessageBubble';
import MessageInput from '@/components/shared/chat/MessageInput';
import ConversationList from '@/components/shared/chat/ConversationList';
import BaseLoading from '@/components/ui/BaseLoading';
import Icon from '@/components/ui/Icon';
import BaseModal from '@/components/ui/BaseModal';
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
    payments:    'Pagos y Facturación',
};

const PRIORITY_MAP: Record<string, string> = {
    critico: 'critica', tecnico: 'media', negativo: 'media', informacion: 'baja', positivo: 'baja', payments: 'media',
};

const PRIORITY_DOT: Record<string, string> = {
    critica: 'bg-red-500', alta: 'bg-orange-500', media: 'bg-yellow-500', baja: 'bg-emerald-500',
};

const PRIORITY_LABEL: Record<string, string> = {
    critica: 'Crítica', alta: 'Alta', media: 'Media', baja: 'Baja',
};

function mapTicketToConversation(ticket: CustomerTicket): Conversation {
    const lastMsg = ticket.messages.at(-1);
    return {
        id: ticket.id,
        name: ticket.subject,
        storeName: ticket.subject,
        lastMessage: lastMsg?.content ?? ticket.description,
        lastMessageTime: lastMsg?.createdAt
            ? new Date(lastMsg.createdAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
            : '',
        unreadCount: ticket.unreadCount,
        category: CATEGORY_LABELS[ticket.category],
    };
}

function NewTicketForm({
    onSubmit,
    onCancel,
    isSubmitting,
    submitError,
}: {
    onSubmit: (data: { subject: string; description: string; category: string }) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
    submitError?: string | null;
}) {
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('informacion');

    const priority = PRIORITY_MAP[category] ?? 'baja';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !description.trim()) return;
        await onSubmit({ subject, description, category });
    };

    return (
        <div className="flex flex-col bg-[var(--bg-card)] rounded-3xl border border-[var(--border-subtle)] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)]">Nuevo Ticket</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Solicitud de soporte a Lyrium</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                        Categoría
                    </label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] rounded-xl outline-none text-sm font-medium text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--turquesa-500)]/20 border border-[var(--border-subtle)]"
                        required
                    >
                        <option value="informacion">Solicitud de Información</option>
                        <option value="positivo">Comentario Positivo</option>
                        <option value="negativo">Comentario Negativo</option>
                        <option value="tecnico">Soporte Técnico</option>
                        <option value="payments">Pagos y Facturación</option>
                        <option value="critico">Soporte Crítico</option>
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                        Prioridad
                    </label>
                    <div className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] rounded-xl text-sm border border-[var(--border-subtle)] flex items-center gap-2">
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
                        className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] rounded-xl outline-none text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--turquesa-500)]/20 border border-[var(--border-subtle)]"
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
                        rows={6}
                        className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] rounded-xl outline-none text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--turquesa-500)]/20 border border-[var(--border-subtle)] resize-none"
                        required
                        maxLength={5000}
                    />
                    <p className="text-[10px] text-[var(--text-secondary)] text-right mt-1">
                        {description.length}/5000
                    </p>
                </div>

                {submitError && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                        <span className="text-rose-500 text-xs shrink-0 mt-0.5">⚠</span>
                        <p className="text-xs font-semibold text-rose-700 dark:text-rose-400">{submitError}</p>
                    </div>
                )}

                <div className="flex gap-2 pt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[var(--bg-hover)] transition-colors border border-[var(--border-subtle)]"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !subject.trim() || !description.trim()}
                        className="flex-1 px-4 py-2.5 bg-[var(--brand-green)] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-50 shadow-sm"
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
    const [showNewTicketForm, setShowNewTicketForm] = useState(false);
    const [ticketError, setTicketError] = useState<string | null>(null);
    const [showLegend, setShowLegend] = useState(false);
    const [filterType, setFilterType] = useState<'asunto' | 'categoria'>('asunto');
    const [filterValue, setFilterValue] = useState('');
    const [showFilter, setShowFilter] = useState(false);
    const [isMobileListVisible, setIsMobileListVisible] = useState(true);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeTicket?.messages]);

    const handleTicketSelect = useCallback((id: string) => {
        setActiveTicketId(id);
        setIsMobileListVisible(false);
    }, [setActiveTicketId]);

    const filteredTickets = tickets.filter(ticket => {
        if (!filterValue) return true;
        if (filterType === 'asunto') return ticket.subject.toLowerCase().includes(filterValue.toLowerCase());
        return ticket.category === filterValue;
    });

    const mappedConversations: Conversation[] = filteredTickets.map(mapTicketToConversation);

    const mappedMessages: BubbleMessage[] = (activeTicket?.messages ?? []).map(msg => ({
        id: msg.id,
        sender: msg.senderId,
        content: msg.content,
        timestamp: msg.createdAt || new Date().toISOString(),
        read_at: null,
    }));

    const canMessage = activeTicket && activeTicket.status !== 'cerrado';

    // ── List panel ────────────────────────────────────────────────────────────
    const listContent = (
        <div className={`flex-col h-full ${(!activeTicketId || isMobileListVisible) ? 'flex' : 'hidden'} lg:flex`}>
            {/* Barra de acciones: Nuevo Ticket + Leyenda */}
            {!showNewTicketForm && (
                <div className="px-4 pt-3 pb-2 flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => { setShowNewTicketForm(true); setTicketError(null); }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-[var(--turquesa-500)] to-[var(--verde-500)] text-white rounded-xl font-bold text-[10px] uppercase tracking-wider hover:opacity-90 transition-all shadow-sm"
                    >
                        <Icon name="Plus" className="w-3.5 h-3.5" />
                        Nuevo Ticket
                    </button>
                    <button
                        onClick={() => setShowLegend(true)}
                        title="Leyenda"
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--turquesa-500)] hover:border-[var(--turquesa-500)] transition-all shadow-sm shrink-0"
                    >
                        <Icon name="Info" className="w-4 h-4" />
                    </button>
                </div>
            )}
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
                                <option value="payments">Pagos y Facturación</option>
                                <option value="critico">Soporte Crítico</option>
                            </select>
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
        <div className={`flex-col h-full ${(activeTicket && !isMobileListVisible) ? 'flex' : 'hidden'} lg:flex`}>
            <div className="p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 shrink-0">
                <div className="flex items-center gap-3">
                    {/* Botón regreso — solo visible en mobile/tablet */}
                    <button
                        onClick={() => setIsMobileListVisible(true)}
                        className="lg:hidden w-8 h-8 shrink-0 flex items-center justify-center rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--turquesa-500)] hover:border-[var(--turquesa-500)] transition-all"
                        title="Volver a tickets"
                    >
                        <Icon name="ChevronLeft" className="w-4 h-4" />
                    </button>
                    <div className="w-10 h-10 shrink-0 rounded-full bg-[var(--brand-green)] flex items-center justify-center text-white shadow-sm">
                        <Icon name="Headset" className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)] truncate">
                            {activeTicket.subject}
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)]">
                            #{activeTicket.ticketNumber}
                            {activeTicket.assignedTo && ` · ${activeTicket.assignedTo}`}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full ${STATUS_CONFIG[activeTicket.status].color}`}>
                            {STATUS_CONFIG[activeTicket.status].label}
                        </span>
                        {activeTicket.status !== 'cerrado' && (
                            <button
                                onClick={() => handleCloseTicket(activeTicket.id)}
                                disabled={isClosing}
                                className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-bold text-[10px] uppercase tracking-wider border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/30 disabled:opacity-50 transition-all"
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
                            otherRole: 'Soporte Lyrium',
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

    // ── Main render ───────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-[calc(100vh-140px)] animate-fadeIn">
            <ModuleHeader
                title="Soporte Lyrium"
                subtitle="Centro de soporte y gestión de incidencias"
                icon="Headset"
            />

            {error && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 mb-4">
                    <Icon name="AlertCircle" className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">{error}</p>
                </div>
            )}

            {showNewTicketForm ? (
                <div className="flex-1 flex items-center justify-center px-8">
                    <div className="w-full max-w-xl">
                        <NewTicketForm
                            onSubmit={async (data) => {
                                setTicketError(null);
                                const ok = await handleCreateTicket(data);
                                if (ok) {
                                    setShowNewTicketForm(false);
                                } else {
                                    setTicketError(error || 'No se pudo crear el ticket. Inténtalo de nuevo.');
                                }
                            }}
                            onCancel={() => { setShowNewTicketForm(false); setTicketError(null); }}
                            isSubmitting={isSending}
                            submitError={ticketError}
                        />
                    </div>
                </div>
            ) : (
                <ChatLayout list={listContent} detail={detailContent} isMobileListVisible={isMobileListVisible} />
            )}

            <BaseModal
                isOpen={showLegend}
                onClose={() => setShowLegend(false)}
                title="Soporte Lyrium"
                subtitle="¿Para qué sirve este canal?"
                size="lg"
                accentColor="from-[var(--turquesa-500)] to-[var(--turquesa-500)]/70"
            >
                <div className="space-y-4">
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
                </div>
            </BaseModal>
        </div>
    );
}
