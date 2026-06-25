'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useCustomerChat } from '@/features/customer/chat/hooks/useCustomerChat';
import { useAuth } from '@/shared/lib/context/AuthContext';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import ChatLayout from '@/components/shared/chat/ChatLayout';
import MessageBubble from '@/components/shared/chat/MessageBubble';
import MessageInput from '@/components/shared/chat/MessageInput';
import ConversationList from '@/components/shared/chat/ConversationList';
import BaseLoading from '@/components/ui/BaseLoading';
import Icon from '@/components/ui/Icon';
import { ChatCategory } from '@/features/customer/chat/types';
import type { ChatSeller } from '@/shared/lib/api/chatRepository';
import type { Message as BubbleMessage } from '@/components/shared/chat/MessageBubble';
import type { Conversation } from '@/components/shared/chat/ConversationList';

function NewChatForm({
    onSubmit,
    onCancel,
    isSubmitting,
    sellers = []
}: {
    onSubmit: (data: { sellerId: string; category: ChatCategory; subject: string }) => void;
    onCancel: () => void;
    isSubmitting: boolean;
    sellers: ChatSeller[];
}) {
    const [sellerId, setSellerId] = useState(sellers[0]?.id ?? '');
    const [category, setCategory] = useState<ChatCategory>('informacion');
    const [subject, setSubject] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim()) return;
        onSubmit({ sellerId, category, subject });
    };

    return (
        <div className="flex flex-col h-full bg-[var(--bg-card)] rounded-3xl border border-[var(--border-subtle)] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)]">Nuevo Chat</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Inicia una conversación con un vendedor</p>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Vendedor</label>
                    <select
                        value={sellerId}
                        onChange={(e) => setSellerId(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] rounded-xl outline-none text-sm font-medium text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--turquesa-500)]/20 border border-[var(--border-subtle)]"
                        required
                    >
                        {sellers.map(s => (
                            <option key={s.id} value={s.id}>{s.store} — {s.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Categoría</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as ChatCategory)}
                        className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] rounded-xl outline-none text-sm font-medium text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--turquesa-500)]/20 border border-[var(--border-subtle)]"
                        required
                    >
                        <option value="informacion">Solicitud de Información</option>
                        <option value="positivo">Comentario Positivo</option>
                        <option value="negativo">Comentario Negativo</option>
                        <option value="logistica">Logística </option>
                        <option value="facturacion">Soporte de Facturación </option>
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Asunto</label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Describe brevemente el motivo"
                        className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] rounded-xl outline-none text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--turquesa-500)]/20 border border-[var(--border-subtle)]"
                        required
                    />
                </div>

                <div className="flex gap-2 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-[var(--bg-secondary)] text-gray-700 dark:text-[var(--text-secondary)] rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-300 dark:hover:bg-[#2A3F33] transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[var(--turquesa-500)] to-[var(--verde-500)] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-[var(--turquesa-500)]/20"
                    >
                        {isSubmitting ? 'Iniciando...' : 'Iniciar Chat'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export function ChatPageClient({ conversationId }: { conversationId?: string }) {
    const { user } = useAuth();
    const {
        conversations,
        sellers,
        totalConversations,
        activeConversation,
        setActiveConversation,
        messages,
        isLoading,
        filters,
        setFilters,
        sendMessage,
        clearActiveChat,
        isCreating,
        createConversation,
        criticalCount
    } = useCustomerChat(conversationId);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isMobileListVisible, setIsMobileListVisible] = useState(true);
    const [filterType, setFilterType] = useState<'tienda' | 'categoria'>('tienda');
    const [filterValue, setFilterValue] = useState('');
    const [showFilter, setShowFilter] = useState(false);
    const [showNewChatForm, setShowNewChatForm] = useState(false);
    const [showLegend, setShowLegend] = useState(false);
    const [isLegendClosing, setIsLegendClosing] = useState(false);

    const handleCloseLegend = useCallback(() => {
        if (isLegendClosing) return;
        setIsLegendClosing(true);
        setTimeout(() => {
            setShowLegend(false);
            setIsLegendClosing(false);
        }, 250);
    }, [isLegendClosing]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (message: string) => {
        sendMessage(message);
    };

    const handleConversationSelect = useCallback((id: string) => {
        setActiveConversation(id);
        setIsMobileListVisible(false);
    }, [setActiveConversation]);

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    };

    const filteredConversations = conversations.filter(conv => {
        if (!filterValue) return true;
        if (filterType === 'tienda') {
            return conv.sellerStore.toLowerCase().includes(filterValue.toLowerCase());
        }
        return conv.category === filterValue;
    });

    const mappedConversations: Conversation[] = filteredConversations.map(conv => ({
        id: conv.id,
        name: conv.sellerStore,
        storeName: conv.sellerStore,
        lastMessage: conv.lastMessage,
        lastMessageTime: conv.lastMessageTime,
        unreadCount: conv.unreadCount,
        category: conv.category,
        isActive: activeConversation?.id === conv.id,
    }));

    const mappedMessages: BubbleMessage[] = messages.map(msg => ({
        id: msg.id,
        sender: msg.senderId,
        content: msg.content,
        timestamp: msg.timestamp,
        read_at: msg.read ? msg.timestamp : null,
        attachments: msg.attachments,
    }));

    const listContent = (
        <div className={`flex-col h-full ${(!activeConversation || isMobileListVisible) ? 'flex' : 'hidden'} sm:flex`}>
            <div className="p-4 border-b border-[var(--border-subtle)] shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)]">Conversaciones</h3>
                        <p className="text-[10px] font-medium text-[var(--text-secondary)] mt-0.5">
                            {filteredConversations.length} chats
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setShowFilter(prev => !prev);
                            setFilterValue('');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-colors shrink-0 ${
                            showFilter
                                ? 'bg-[var(--turquesa-500)] text-white border-[var(--turquesa-500)] shadow-sm'
                                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-gray-200 dark:hover:bg-[#2A3F33]'
                        }`}
                    >
                        Filtrar
                    </button>
                </div>

                {showFilter && (
                    <div className="mt-3 space-y-2">
                        <div className="flex rounded-xl overflow-hidden border border-[var(--border-subtle)] text-[10px] font-bold">
                            <button
                                onClick={() => { setFilterType('tienda'); setFilterValue(''); }}
                                className={`flex-1 py-1.5 uppercase tracking-wider transition-colors ${
                                    filterType === 'tienda'
                                        ? 'bg-[var(--turquesa-500)] text-white'
                                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-gray-200 dark:hover:bg-[#2A3F33]'
                                }`}
                            >
                                Tienda
                            </button>
                            <button
                                onClick={() => { setFilterType('categoria'); setFilterValue(''); }}
                                className={`flex-1 py-1.5 uppercase tracking-wider transition-colors ${
                                    filterType === 'categoria'
                                        ? 'bg-[var(--turquesa-500)] text-white'
                                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-gray-200 dark:hover:bg-[#2A3F33]'
                                }`}
                            >
                                Categoría
                            </button>
                        </div>

                        {filterType === 'tienda' ? (
                            <input
                                type="text"
                                value={filterValue}
                                onChange={(e) => setFilterValue(e.target.value)}
                                placeholder="Buscar tienda..."
                                className="w-full px-3 py-1.5 text-sm bg-[var(--bg-secondary)] rounded-xl outline-none text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--turquesa-500)]/20 border border-[var(--border-subtle)]"
                            />
                        ) : (
                            <select
                                value={filterValue}
                                onChange={(e) => setFilterValue(e.target.value)}
                                className="w-full px-3 py-1.5 text-sm bg-[var(--bg-secondary)] rounded-xl outline-none text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--turquesa-500)]/20 border border-[var(--border-subtle)]"
                            >
                                <option value="">Todas las categorías</option>
                                <option value="informacion">Solicitud de Información</option>
                                <option value="positivo">Comentario Positivo</option>
                                <option value="negativo">Comentario Negativo</option>
                                <option value="logistica">Logística </option>
                                <option value="facturacion">Soporte de Facturación</option>
                            </select>
                        )}
                    </div>
                )}
            </div>

            <ConversationList
                conversations={mappedConversations}
                activeId={activeConversation?.id}
                onSelect={handleConversationSelect}
                accentColor="turquesa"
            />
        </div>
    );

    const chatContent = activeConversation ? (
        <div className={`flex-col h-full ${(activeConversation && !isMobileListVisible) ? 'flex' : 'hidden'} sm:flex`}>
            <div className="p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-[var(--turquesa-500)] to-[var(--verde-500)] flex items-center justify-center text-white font-black text-sm shadow-sm">
                        {activeConversation.sellerName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)] truncate">
                            {activeConversation.sellerStore}
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)]">{activeConversation.sellerName}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-[var(--bg-card)]/50 custom-scrollbar">
                <MessageBubble
                    messages={mappedMessages}
                    isSentOverride={(msg) => {
                        const original = messages.find(m => m.id === msg.id);
                        return original?.senderType === 'customer';
                    }}
                    meta={{
                        currentUserName: 'Tú',
                        currentUserRole: 'Cliente',
                        otherName: activeConversation.sellerName,
                        otherRole: 'Vendedor',
                        showAvatar: true,
                    }}
                />
                <div ref={messagesEndRef} />
            </div>

            <MessageInput onSend={handleSendMessage} placeholder="Escribe un mensaje..." />
        </div>
    ) : (
        <div className="flex-1 flex items-center justify-center">
            <div className="text-center px-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--turquesa-500)]/10 to-[var(--verde-500)]/10 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[var(--turquesa-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <p className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)] mb-1">Selecciona una conversación</p>
                <p className="text-xs text-[var(--text-secondary)]">Elige un chat de la lista para comenzar</p>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className="flex flex-col h-[calc(100vh-140px)] animate-fadeIn">
                <ModuleHeader
                    title="Chat con Vendedores"
                    subtitle="Comunicación directa con los vendedores"
                    icon="MessageSquare"
                />
                <div className="flex-1 flex items-center justify-center">
                    <BaseLoading message="Cargando conversaciones..." />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] animate-fadeIn">
            <ModuleHeader
                title="Chat con Vendedores"
                subtitle="Comunicación directa con los vendedores"
                icon="MessageSquare"
                actions={
                    !showNewChatForm ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowLegend(true)}
                                title="Leyenda"
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-gray-500 dark:text-[var(--text-secondary)] hover:text-[var(--turquesa-500)] dark:hover:text-[var(--icons-green)] hover:border-[var(--turquesa-500)] dark:hover:border-[var(--icons-green)] transition-all shadow-sm"
                            >
                                <Icon name="Info" className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setShowNewChatForm(true)}
                                className="px-4 py-2 bg-white dark:bg-[var(--bg-secondary)] text-[var(--turquesa-500)] dark:text-[var(--turquesa-500)] rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-[#2A3F33] transition-colors border border-[var(--border-subtle)] shadow-sm"
                            >
                                + Nuevo Chat
                            </button>
                        </div>
                    ) : null
                }
            />

            {showNewChatForm ? (
                <div className="flex-1 flex items-center justify-center px-8">
                    <div className="w-full max-w-xl">
                        <NewChatForm
                            sellers={sellers}
                            onSubmit={(data) => {
                                createConversation(data);
                                setShowNewChatForm(false);
                            }}
                            onCancel={() => setShowNewChatForm(false)}
                            isSubmitting={isCreating}
                        />
                    </div>
                </div>
            ) : (
                <ChatLayout
                    list={listContent}
                    detail={chatContent}
                />
            )}

            {(showLegend || isLegendClosing) && (
                <div className={`fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 ${isLegendClosing ? 'animate-fade-out-overlay' : 'animate-fadeIn'}`} onClick={handleCloseLegend}>
                    <div className={`bg-white dark:bg-[var(--bg-secondary)] rounded-[3rem] max-w-lg w-full max-h-[80vh] shadow-2xl overflow-hidden ${isLegendClosing ? 'animate-scale-out' : 'animate-scaleIn'} flex flex-col`} onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-[var(--turquesa-500)] to-[var(--turquesa-500)]/70 dark:from-[var(--brand-green-hover)] dark:via-[var(--brand-green)] dark:to-[var(--brand-green-hover)] p-8 text-white relative flex-shrink-0">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                            <div className="relative z-10 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                        <Icon name="MessageSquare" className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tighter">Chat con Vendedores</h3>
                                        <p className="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em]">¿Para qué sirve este canal?</p>
                                    </div>
                                </div>
                                <button onClick={handleCloseLegend} className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20">
                                    <Icon name="X" className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>
                        <div className="p-8 space-y-4 overflow-y-auto">
                            {[
                                { icon: 'Package', title: 'Pedidos y logística', desc: 'Consulta el estado de tu pedido, tiempos de entrega y datos del envío directamente con la tienda.' },
                                { icon: 'RotateCcw', title: 'Devoluciones, cambios y reembolsos', desc: 'Gestiona devoluciones, cambios de producto o solicitudes de reembolso con el vendedor.' },
                                { icon: 'AlertTriangle', title: 'Reclamos y postventa', desc: 'Reporta productos defectuosos, diferencias con lo pedido o cualquier incidencia comercial.' },
                                { icon: 'Store', title: 'Cada tienda opera de forma independiente', desc: 'El vendedor administra sus propias operaciones. Para problemas de la plataforma, usa Soporte Lyrium.' },
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
                                <button onClick={handleCloseLegend} className="px-6 py-3 rounded-2xl bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-600 dark:text-[var(--text-primary)] font-black text-xs uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-[#2A3F33] transition-all">
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
