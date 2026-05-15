'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useCustomerChat } from '@/features/customer/chat/hooks/useCustomerChat';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import ChatLayout from '@/components/shared/chat/ChatLayout';
import MessageBubble from '@/components/shared/chat/MessageBubble';
import MessageInput from '@/components/shared/chat/MessageInput';
import BaseLoading from '@/components/ui/BaseLoading';
import { mockSellers } from '@/features/customer/chat/hooks/useCustomerChat';
import { ChatCategory } from '@/features/customer/chat/types';

function NewChatForm({
    onSubmit,
    onCancel,
    isSubmitting
}: {
    onSubmit: (data: { sellerId: string; category: ChatCategory; subject: string }) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}) {
    const [sellerId, setSellerId] = useState(mockSellers[0].id);
    const [category, setCategory] = useState<ChatCategory>('informacion');
    const [subject, setSubject] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim()) return;
        onSubmit({ sellerId, category, subject });
    };

    return (
        <div className="flex flex-col h-full bg-[var(--bg-card)] rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 dark:text-white">Nuevo Chat</h3>
                <p className="text-sm text-gray-500 dark:text-gray-300">Inicia una conversación con un vendedor</p>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Vendedor</label>
                    <select
                        value={sellerId}
                        onChange={(e) => setSellerId(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-100 dark:bg-[var(--bg-secondary)] rounded-xl outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-[var(--icons-green)]"
                        required
                    >
                        {mockSellers.map(s => (
                            <option key={s.id} value={s.id}>{s.store} — {s.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Categoría</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as ChatCategory)}
                        className="w-full px-4 py-2 bg-gray-100 dark:bg-[var(--bg-secondary)] rounded-xl outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-[var(--icons-green)]"
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
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1">Asunto</label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Describe brevemente el motivo"
                        className="w-full px-4 py-2 bg-gray-100 dark:bg-[var(--bg-secondary)] rounded-xl outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-[var(--icons-green)]"
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
    } = useCustomerChat();

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isMobileListVisible, setIsMobileListVisible] = useState(true);
    const [filterType, setFilterType] = useState<'tienda' | 'categoria'>('tienda');
    const [filterValue, setFilterValue] = useState('');
    const [showFilter, setShowFilter] = useState(false);
    const [showNewChatForm, setShowNewChatForm] = useState(false); // ← nuevo

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (message: string) => {
        sendMessage(message);
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Hoy';
        if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
        return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
    };

    const filteredConversations = conversations.filter(conv => {
        if (!filterValue) return true;
        if (filterType === 'tienda') {
            return conv.sellerStore.toLowerCase().includes(filterValue.toLowerCase());
        }
        return conv.category === filterValue;
    });

    const listContent = (
        <div className="divide-y divide-gray-100 h-full overflow-y-auto">
            {/* ── Cabecera con filtro ── */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Conversaciones</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-300">
                            {filteredConversations.length} chats
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
                        {/* Selector de tipo */}
                        <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 text-xs font-medium">
                            <button
                                onClick={() => { setFilterType('tienda'); setFilterValue(''); }}
                                className={`flex-1 py-1.5 transition-colors ${filterType === 'tienda'
                                    ? 'bg-sky-500 dark:bg-[var(--brand-green)] text-white'
                                    : 'bg-gray-100 dark:bg-[var(--bg-secondary)] text-gray-500 hover:bg-gray-200'
                                    }`}
                            >
                                Tienda
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
                        {filterType === 'tienda' ? (
                            <input
                                type="text"
                                value={filterValue}
                                onChange={(e) => setFilterValue(e.target.value)}
                                placeholder="Buscar tienda..."
                                className="w-full px-3 py-1.5 text-sm bg-gray-100 dark:bg-[var(--bg-secondary)] rounded-xl outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-[var(--icons-green)]"
                            />
                        ) : (
                            <select
                                value={filterValue}
                                onChange={(e) => setFilterValue(e.target.value)}
                                className="w-full px-3 py-1.5 text-sm bg-gray-100 dark:bg-[var(--bg-secondary)] rounded-xl outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-[var(--icons-green)]"
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

            {/* ── Lista filtrada ── */}
            {filteredConversations.map((conv) => (
                <button
                    key={conv.id}
                    onClick={() => {
                        setActiveConversation(conv.id);
                        setIsMobileListVisible(false);
                    }}
                    className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-[var(--brand-green)] transition-colors ${activeConversation?.id === conv.id ? 'bg-sky-50 dark:bg-[var(--brand-green-hover)]' : ''
                        }`}
                >
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 dark:text-[var(--brand-green)] font-semibold">
                            {conv.sellerName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900 dark:text-white truncate">{conv.sellerStore}</span>
                                <span className="text-xs text-gray-400">{formatDate(conv.lastMessageTime)}</span>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-sm text-gray-500 dark:text-gray-300 truncate">{conv.lastMessage}</span>
                                {conv.unreadCount > 0 && (
                                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-sky-500 dark:bg-[var(--icons-green)] text-white dark:text-[var(--brand-green-hover)] rounded-full">
                                        {conv.unreadCount}
                                    </span>
                                )}
                            </div>
                            {conv.category && (
                                <div className="mt-1">
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[var(--bg-secondary)] text-gray-500 dark:text-gray-400">
                                        {{
                                            informacion: 'Solicitud de Información',
                                            positivo: 'Comentario Positivo',
                                            negativo: 'Comentario Negativo',
                                            logistica: 'Logística ',
                                            facturacion: 'Soporte de Facturación',
                                        }[conv.category]}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </button>
            ))}

            {filteredConversations.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                    <p>{filterValue ? 'Sin resultados para este filtro' : 'No hay conversaciones'}</p>
                </div>
            )}
        </div>
    );

    const chatContent = activeConversation ? (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-100 bg-white dark:bg-[var(--bg-secondary)]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 dark:text-[var(--brand-green)] font-semibold">
                        {activeConversation.sellerName.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{activeConversation.sellerStore}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-300">{activeConversation.sellerName}</p>
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-[var(--bg-secondary)]">
                {messages.map((msg) => {
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
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-sky-500 text-white'
                                        }`}
                                >
                                    {isCustomer ? 'Tú' : 'V'}
                                </div>

                                <div
                                    className={`relative rounded-3xl px-4 py-3 shadow-sm border backdrop-blur-sm ${isCustomer
                                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-emerald-400/20 rounded-br-md'
                                        : 'bg-white dark:bg-gray-100 text-slate-800 border-gray-200 rounded-bl-md'
                                        }`}
                                >
                                    <div className="mb-1 flex items-center gap-2">
                                        <p
                                            className={`text-[11px] font-black uppercase tracking-[0.16em] ${isCustomer ? 'text-emerald-100' : 'text-sky-600'
                                                }`}
                                        >
                                            {isCustomer ? 'Tú' : activeConversation.sellerName}
                                        </p>
                                        <span
                                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isCustomer
                                                ? 'bg-white/15 text-emerald-50'
                                                : 'bg-sky-50 text-sky-700'
                                                }`}
                                        >
                                            {isCustomer ? 'Cliente' : 'Vendedor'}
                                        </span>
                                    </div>

                                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-all">
                                        {msg.content}
                                    </p>

                                    <div className="mt-2 flex justify-end">
                                        <p
                                            className={`text-[10px] font-medium ${isCustomer ? 'text-emerald-100/80' : 'text-gray-400'
                                                }`}
                                        >
                                            {formatTime(msg.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            <MessageInput onSend={handleSendMessage} placeholder="Escribe un mensaje..." />
        </div>
    ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
                <p className="text-lg mb-2">Selecciona una conversación</p>
                <p className="text-sm">Elige un chat para comenzar a chatear</p>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className="flex flex-col h-[calc(100vh-140px)] animate-fadeIn">
                <ModuleHeader
                    title="Chat con Vendedores"
                    subtitle="Comunicación directa con los vendedores"
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
                title="Chat con Vendedores"
                subtitle="Comunicación directa con los vendedores"
                icon="Messages"
                actions={                               // ← nuevo bloque actions
                    !showNewChatForm ? (
                        <button
                            onClick={() => setShowNewChatForm(true)}
                            className="px-4 py-2 bg-white text-sky-600 dark:text-[var(--brand-green)] rounded-xl font-medium hover:bg-sky-50 transition-colors"
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
