'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSellerChat } from '@/features/seller/chat/hooks/useSellerChat';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import ChatLayout from '@/components/shared/chat/ChatLayout';
import MessageBubble from '@/components/shared/chat/MessageBubble';
import MessageInput from '@/components/shared/chat/MessageInput';
import ConversationList from '@/components/shared/chat/ConversationList';
import BaseLoading from '@/components/ui/BaseLoading';
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
        <div className="flex flex-col h-full">
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
            <div className="p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 shrink-0">
                <div className="flex items-center gap-3">
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
            <div className="flex flex-col h-[calc(100vh-140px)] animate-fadeIn">
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
        <div className="flex flex-col h-[calc(100vh-140px)] animate-fadeIn">
            <ModuleHeader
                title="Chat con Clientes"
                subtitle="Comunicación directa con tus clientes"
                icon="Messages"
                actions={
                    !showNewChatForm ? (
                        <button
                            onClick={() => setShowNewChatForm(true)}
                            className="px-4 py-2 bg-white dark:bg-[var(--bg-secondary)] text-[var(--turquesa-500)] dark:text-[var(--turquesa-500)] rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-[#2A3F33] transition-colors border border-[var(--border-subtle)] shadow-sm"
                        >
                            + Nuevo Chat
                        </button>
                    ) : null
                }
            />

            {showNewChatForm ? (
                <div className="flex-1 flex items-center justify-center px-8">
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
                />
            )}
        </div>
    );
}
