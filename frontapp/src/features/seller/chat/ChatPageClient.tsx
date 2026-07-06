'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSellerChat } from '@/features/seller/chat/hooks/useSellerChat';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import ChatLayout from '@/components/shared/chat/ChatLayout';
import MessageBubble from '@/components/shared/chat/MessageBubble';
import MessageInput from '@/components/shared/chat/MessageInput';
import ConversationList from '@/components/shared/chat/ConversationList';
import BaseLoading from '@/components/ui/BaseLoading';
import Icon from '@/components/ui/Icon';
import { ChatCategory } from '@/features/seller/chat/types';
import type { Message as BubbleMessage } from '@/components/shared/chat/MessageBubble';
import type { Conversation } from '@/components/shared/chat/ConversationList';
import type { ChatCustomer } from '@/shared/lib/api/chatRepository';

function NewChatForm({
    onSubmit,
    onCancel,
    isSubmitting,
    stores = [],
    customers = []
}: {
    onSubmit: (data: { storeId: string; customerId: string; category: ChatCategory; subject: string }) => void;
    onCancel: () => void;
    isSubmitting: boolean;
    stores: { id: string; name: string }[];
    customers: ChatCustomer[];
}) {
    const [storeId, setStoreId] = useState(stores[0]?.id ?? '');
    const [customerId, setCustomerId] = useState(customers[0]?.id ?? '');
    const [category, setCategory] = useState<ChatCategory>('informacion');
    const [subject, setSubject] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !storeId) return;
        onSubmit({ storeId, customerId, category, subject });
    };

    return (
        <div className="flex flex-col h-full bg-[var(--bg-card)] rounded-3xl border border-[var(--border-subtle)] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)]">Nuevo Chat</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Inicia una conversación con un cliente</p>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Tu Tienda</label>
                    <select
                        value={storeId}
                        onChange={(e) => setStoreId(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] rounded-xl outline-none text-sm font-medium text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--turquesa-500)]/20 border border-[var(--border-subtle)]"
                        required
                    >
                        {stores.length === 0 && <option value="">Sin tiendas</option>}
                        {stores.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Cliente</label>
                    <select
                        value={customerId}
                        onChange={(e) => setCustomerId(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] rounded-xl outline-none text-sm font-medium text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--turquesa-500)]/20 border border-[var(--border-subtle)]"
                        required
                    >
                        {customers.length === 0 && <option value="">Sin clientes</option>}
                        {customers.map(c => (
                            <option key={c.id} value={c.id}>{c.name} — {c.email}</option>
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

export function ChatPageClient() {
    const {
        conversations,
        customers,
        stores,
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
    } = useSellerChat();

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isMobileListVisible, setIsMobileListVisible] = useState(true);
    const [filterType, setFilterType] = useState<'cliente' | 'categoria'>('cliente');
    const [filterValue, setFilterValue] = useState('');
    const [showFilter, setShowFilter] = useState(false);
    const [showNewChatForm, setShowNewChatForm] = useState(false);
    const [showLegend, setShowLegend] = useState(false);

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

    const filteredConversations = conversations.filter(conv => {
        if (!filterValue) return true;
        if (filterType === 'cliente') {
            return conv.customerName.toLowerCase().includes(filterValue.toLowerCase());
        }
        return conv.category === filterValue;
    });

    const mappedConversations: Conversation[] = filteredConversations.map(conv => ({
        id: conv.id,
        name: conv.customerName,
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
    }));

    const listContent = (
        <div className={`flex-col h-full ${(!activeConversation || isMobileListVisible) ? 'flex' : 'hidden'} lg:flex`}>
            {/* Barra de acciones: Nuevo Chat + Leyenda */}
            {!showNewChatForm && (
                <div className="px-4 pt-3 pb-2 flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => setShowNewChatForm(true)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-[var(--turquesa-500)] to-[var(--verde-500)] text-white rounded-xl font-bold text-[10px] uppercase tracking-wider hover:opacity-90 transition-all shadow-sm"
                    >
                        <Icon name="Plus" className="w-3.5 h-3.5" />
                        Nuevo Chat
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
                                onClick={() => { setFilterType('cliente'); setFilterValue(''); }}
                                className={`flex-1 py-1.5 uppercase tracking-wider transition-colors ${
                                    filterType === 'cliente'
                                        ? 'bg-[var(--turquesa-500)] text-white'
                                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-gray-200 dark:hover:bg-[#2A3F33]'
                                }`}
                            >
                                Cliente
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

                        {filterType === 'cliente' ? (
                            <input
                                type="text"
                                value={filterValue}
                                onChange={(e) => setFilterValue(e.target.value)}
                                placeholder="Buscar cliente..."
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
        <div className="flex flex-col h-full">
            <div className="p-4 md:p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 shrink-0">
                <div className="flex items-center gap-3">
                    {/* Botón regreso — solo visible en mobile/tablet */}
                    <button
                        onClick={() => setIsMobileListVisible(true)}
                        className="lg:hidden w-8 h-8 shrink-0 flex items-center justify-center rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--turquesa-500)] hover:border-[var(--turquesa-500)] transition-all"
                        title="Volver a conversaciones"
                    >
                        <Icon name="ChevronLeft" className="w-4 h-4" />
                    </button>
                    <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-[var(--turquesa-500)] to-[var(--verde-500)] flex items-center justify-center text-white font-black text-sm shadow-sm">
                        {activeConversation.customerName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)] truncate">
                            {activeConversation.customerName}
                        </h3>
                        {activeConversation.subject && (
                            <p className="text-xs text-[var(--text-secondary)]">{activeConversation.subject}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-[var(--bg-card)]/50 custom-scrollbar">
                <MessageBubble
                    messages={mappedMessages}
                    isSentOverride={(msg) => {
                        const original = messages.find(m => m.id === msg.id);
                        return original?.senderType === 'seller';
                    }}
                    meta={{
                        currentUserName: 'Tú',
                        currentUserRole: 'Vendedor',
                        otherName: activeConversation.customerName,
                        otherRole: 'Cliente',
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
            <div className="flex flex-col h-[calc(100svh-120px)] md:h-[calc(100vh-140px)] animate-fadeIn">
                <ModuleHeader
                    title="Chat con Clientes"
                    subtitle="Comunicación directa con tus clientes"
                    icon="Messages"
                />
                <div className="flex-1 flex items-center justify-center">
                    <BaseLoading message="Cargando conversaciones..." />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100svh-120px)] md:h-[calc(100vh-140px)] animate-fadeIn">
            <ModuleHeader
                title="Chat con Clientes"
                subtitle="Comunicación directa con tus clientes"
                icon="Messages"
            />

            {showNewChatForm ? (
                <div className="flex-1 flex items-center justify-center px-4 md:px-8">
                    <div className="w-full max-w-xl">
                        <NewChatForm
                            stores={stores}
                            customers={customers}
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
                    isMobileListVisible={isMobileListVisible}
                />
            )}

            {showLegend && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowLegend(false)}>
                    <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-[3rem] max-w-lg w-full max-h-[80vh] shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-[var(--turquesa-500)] to-[var(--turquesa-500)]/70 dark:from-[var(--brand-green-hover)] dark:via-[var(--brand-green)] dark:to-[var(--brand-green-hover)] p-8 text-white relative flex-shrink-0">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                            <div className="relative z-10 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                        <Icon name="MessageSquare" className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tighter">Chat con Clientes</h3>
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
                                { icon: 'Package', title: 'Pedidos y logística', desc: 'Resuelve dudas de tus clientes sobre pedidos, coordina entregas y confirma detalles del envío.' },
                                { icon: 'RotateCcw', title: 'Devoluciones, cambios y reembolsos', desc: 'Atiende solicitudes de devolución, cambio de producto o reembolso que te hayan hecho los clientes.' },
                                { icon: 'AlertTriangle', title: 'Reclamos y postventa', desc: 'Gestiona reportes de productos defectuosos, diferencias con lo pedido o incidencias comerciales de tus clientes.' },
                                { icon: 'Receipt', title: 'Problemas de facturación', desc: 'Atiende consultas de tus clientes sobre comprobantes electrónicos (boleta o factura). Los errores de pago o cargos incorrectos los gestiona el administrador de Lyrium.' },
                                { icon: 'Store', title: 'Cada tienda opera de forma independiente', desc: 'Este canal es para operaciones comerciales. Para incidencias técnicas de la plataforma, usa Soporte Lyrium.' },
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