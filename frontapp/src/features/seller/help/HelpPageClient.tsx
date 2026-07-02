'use client';

import React, { useState } from 'react';
import { useSellerHelp } from '@/features/seller/help/hooks/useSellerHelp';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseLoading from '@/components/ui/BaseLoading';
import Icon from '@/components/ui/Icon';
import { SellerTicket, TicketStatus, TicketCategory } from '@/features/seller/help/types';
import { ChatView } from '@/modules/chat';
import type { UnifiedTicket, UnifiedMessage } from '@/modules/chat/types';

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
        <div className="flex flex-col h-full min-h-0 rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm overflow-hidden" style={{ background: 'linear-gradient(180deg, color-mix(in srgb,#9cb04e 4%,var(--bg-card)) 0%, var(--bg-card) 100%)' }}>
          <div className="h-1 w-full shrink-0 bg-gradient-to-r from-[#9cb04e] via-[#64c695] to-[#499bbf]" />
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
                                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--bg-hover)]'
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
                                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                                    }`}
                            >
                                Asunto
                            </button>
                            <button
                                onClick={() => { setFilterType('categoria'); setFilterValue(''); }}
                                className={`flex-1 py-1.5 uppercase tracking-wider transition-colors ${filterType === 'categoria'
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
                    <div className="p-8 text-center text-[var(--text-secondary)]">
                        <p>{filterValue ? 'Sin resultados para este filtro' : 'No hay tickets'}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function toUnifiedHelpTicket(ticket: SellerTicket): UnifiedTicket {
    const statusMap: Record<string, UnifiedTicket['status']> = {
        open: 'open',
        in_progress: 'in_progress',
        pending: 'in_progress',
        resolved: 'resolved',
        closed: 'closed',
    };
    const priorityMap: Record<string, UnifiedTicket['priority']> = {
        baja: 'Baja',
        media: 'Media',
        alta: 'Alta',
        critica: 'Crítica',
    };
    const messages: UnifiedMessage[] = ticket.messages.map(msg => ({
        id: msg.id,
        ticketId: msg.ticketId,
        senderId: msg.senderId,
        senderName: msg.senderName,
        senderRole: msg.senderType === 'seller' ? 'vendor' : 'admin',
        content: msg.content,
        timestamp: new Date(msg.createdAt || Date.now()),
        hour: msg.createdAt
            ? new Date(msg.createdAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
            : '--:--',
    }));
    return {
        id: ticket.id,
        displayId: ticket.ticketNumber,
        title: ticket.subject,
        description: ticket.description,
        status: statusMap[ticket.status] ?? 'open',
        priority: priorityMap[ticket.priority] ?? 'Media',
        assignedTo: { role: 'admin', id: '0', name: 'Soporte Lyrium' },
        requester: { name: 'Tú' },
        createdAt: new Date(ticket.createdAt || Date.now()),
        updatedAt: new Date(ticket.updatedAt || Date.now()),
        messages,
        source: 'seller',
    };
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
                        className="flex-1 px-4 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[var(--bg-hover)] transition-colors border border-[var(--border-subtle)]"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#9cb04e] via-[#64c695] to-[#499bbf] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-[#64c695]/20"
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
    const [showLegend, setShowLegend] = useState(false);

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
                                className="px-4 py-2 bg-white dark:bg-[var(--bg-secondary)] text-[var(--turquesa-500)] rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[var(--turquesa-500)]/10 transition-colors border border-[var(--border-subtle)] shadow-sm"
                            >
                                + Nuevo Ticket
                            </button>
                        </div>
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
                                handleCreateTicket(data as any);
                                setShowNewTicketForm(false);
                            }}
                            onCancel={() => setShowNewTicketForm(false)}
                            isSubmitting={isSending}
                        />
                    ) : activeTicket ? (
                        <ChatView
                            ticket={toUnifiedHelpTicket(activeTicket)}
                            onSendMessage={({ text }) => handleSendMessage(text)}
                            onCloseTicket={() => handleCloseTicket(activeTicket.id)}
                            isSending={isSending}
                            isClosing={isClosing}
                            showAdminControls={false}
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

            {showLegend && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowLegend(false)}>
                    <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-[3rem] max-w-lg w-full shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-[var(--turquesa-500)] to-[var(--turquesa-500)]/70 dark:from-[var(--brand-green-hover)] dark:via-[var(--brand-green)] dark:to-[var(--brand-green-hover)] p-8 text-white relative">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                            <div className="relative z-10 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                        <Icon name="Headset" className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tighter">Soporte Lyrium</h3>
                                        <p className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em]">¿Para qué sirve este canal?</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowLegend(false)} className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20">
                                    <Icon name="X" className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>
                        <div className="p-8 space-y-4">
                            {[
                                { icon: 'Settings', title: 'Incidencias técnicas', desc: 'Reporta errores de la plataforma, fallas en el sistema, problemas con módulos o funcionalidades.' },
                                { icon: 'Shield', title: 'Soporte administrativo', desc: 'Consulta sobre validaciones, configuraciones de tienda, actualizaciones de documentación o estados de aprobación.' },
                                { icon: 'CreditCard', title: 'Facturación y planes', desc: 'Resuelve dudas sobre tu suscripción, planes de vendedor o comisiones.' },
                                { icon: 'AlertCircle', title: 'No gestiona ventas', desc: 'Para coordinar pedidos, devoluciones o postventa con clientes, usa el Chat con Clientes.' },
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
