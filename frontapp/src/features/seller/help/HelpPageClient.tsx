'use client';

import React, { useState } from 'react';
import { useSellerHelp } from '@/features/seller/help/hooks/useSellerHelp';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseLoading from '@/components/ui/BaseLoading';
import Icon from '@/components/ui/Icon';
import { SellerTicket, TicketCategory } from '@/features/seller/help/types';
import { ChatView } from '@/modules/chat';
import type { UnifiedTicket, UnifiedMessage } from '@/modules/chat/types';
import ChatLayout from '@/components/shared/chat/ChatLayout';
import ConversationList from '@/components/shared/chat/ConversationList';
import type { Conversation } from '@/components/shared/chat/ConversationList';


function getCategoryLabel(category: TicketCategory): string {
    switch (category) {
        case 'admin': return 'Soporte Crítico';
        case 'tech': return 'Soporte Técnico';
        case 'comment': return 'Comentario';
        case 'info': return 'Solicitud de Información';
        case 'followup': return 'Seguimiento';
        case 'payments': return 'Pagos';
        case 'documentation': return 'Documentación';
        default: return category;
    }
}

function mapSellerTicketToConversation(ticket: SellerTicket): Conversation {
    const lastMsg = ticket.messages.at(-1);
    return {
        id: ticket.id,
        name: ticket.subject,
        storeName: ticket.subject,
        lastMessage: lastMsg?.content ?? ticket.description,
        lastMessageTime: lastMsg?.createdAt
            ? new Date(lastMsg.createdAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
            : '',
        unreadCount: 0,
        category: getCategoryLabel(ticket.category),
    };
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
    const [category, setCategory] = useState('info');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({ subject, description, category });
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
                        <option value="info">Solicitud de Información</option>
                        <option value="tech">Soporte Técnico</option>
                        <option value="admin">Soporte Crítico / Administrativo</option>
                        <option value="comment">Comentario</option>
                        <option value="payments">Pagos y Facturación</option>
                        <option value="followup">Seguimiento</option>
                        <option value="documentation">Documentación</option>
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

                {submitError && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                        <span className="text-rose-500 text-xs shrink-0 mt-0.5">⚠</span>
                        <p className="text-xs font-semibold text-rose-700 dark:text-rose-400">{submitError}</p>
                    </div>
                )}

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
                        className="flex-1 px-4 py-2.5 bg-[#2E6A4F] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-50 shadow-sm"
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
        error: hookError,
        handleSendMessage,
        handleCreateTicket,
        handleCloseTicket,
        openTicketsCount
    } = useSellerHelp();

    const [showNewTicketForm, setShowNewTicketForm] = useState(false);
    const [showLegend, setShowLegend] = useState(false);
    const [ticketError, setTicketError] = useState<string | null>(null);
    const [mobileShowChat, setMobileShowChat] = useState(false);

    if (isLoading) {
        return (
            <div className="flex flex-col flex-1 min-h-0 animate-fadeIn">
                <div className="shrink-0 [&>div]:!mb-3">
                    <ModuleHeader
                        title="Soporte Lyrium"
                        subtitle="Centro de soporte y gestión de incidencias"
                        icon="Headset"
                    />
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <BaseLoading message="Cargando tickets de soporte..." />
                </div>
            </div>
        );
    }

    const mappedConversations: Conversation[] = tickets.map(mapSellerTicketToConversation);

    const listContent = (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-[var(--border-subtle)] shrink-0">
                <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)]">Mis Tickets</h3>
                <p className="text-[10px] font-medium text-[var(--text-secondary)] mt-0.5">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</p>
            </div>
            <ConversationList
                conversations={mappedConversations}
                activeId={activeTicketId ?? undefined}
                onSelect={(id) => { setActiveTicketId(id); setMobileShowChat(true); }}
                accentColor="turquesa"
            />
        </div>
    );

    const detailContent = activeTicket ? (
        <ChatView
            ticket={toUnifiedHelpTicket(activeTicket)}
            onSendMessage={({ text }) => handleSendMessage(text)}
            onCloseTicket={() => handleCloseTicket(activeTicket.id)}
            onBack={() => setMobileShowChat(false)}
            isSending={isSending}
            isClosing={isClosing}
            showAdminControls={false}
        />
    ) : (
        <div className="h-full flex items-center justify-center">
            <div className="text-center px-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--turquesa-500)]/10 to-[var(--verde-500)]/10 flex items-center justify-center mx-auto mb-4">
                    <Icon name="Headset" className="w-8 h-8 text-[var(--turquesa-500)]" />
                </div>
                <p className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)] mb-1">Selecciona un ticket</p>
                <p className="text-xs text-[var(--text-secondary)]">O crea uno nuevo si tienes alguna consulta</p>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] animate-fadeIn">
            <div className="shrink-0 [&>div]:!mb-3">
                <ModuleHeader
                    title="Soporte Lyrium"
                    subtitle="Centro de soporte y gestión de incidencias"
                    icon="Headset"
                />
            </div>

            {showNewTicketForm ? (
                <div className="flex-1 flex items-start justify-center pt-4 px-4 overflow-y-auto">
                    <div className="w-full max-w-xl">
                        <NewTicketForm
                            onSubmit={async (data) => {
                                setTicketError(null);
                                const ok = await handleCreateTicket(data);
                                if (ok) setShowNewTicketForm(false);
                                else setTicketError(hookError || 'No se pudo crear el ticket. Inténtalo de nuevo.');
                            }}
                            onCancel={() => { setShowNewTicketForm(false); setTicketError(null); }}
                            isSubmitting={isSending}
                            submitError={ticketError}
                        />
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-2 mb-2 shrink-0">
                        <button
                            onClick={() => setShowLegend(true)}
                            title="Leyenda"
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--turquesa-500)] hover:border-[var(--turquesa-500)] transition-all shadow-sm"
                        >
                            <Icon name="Info" className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => { setShowNewTicketForm(true); setTicketError(null); }}
                            className="px-4 py-2 bg-[var(--bg-card)] text-[var(--turquesa-500)] rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[var(--turquesa-500)]/10 transition-colors border border-[var(--border-subtle)] shadow-sm"
                        >
                            + Nuevo Ticket
                        </button>
                    </div>
                    <ChatLayout list={listContent} detail={detailContent} />
                </>
            )}

            {showLegend && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowLegend(false)}>
                    <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-[3rem] max-w-lg w-full max-h-[80vh] shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-[var(--turquesa-500)] to-[var(--turquesa-500)]/70 dark:from-[var(--brand-green-hover)] dark:via-[var(--brand-green)] dark:to-[var(--brand-green-hover)] p-8 text-white relative flex-shrink-0">
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
                        <div className="p-8 space-y-4 overflow-y-auto">
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
