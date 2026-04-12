'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useSellerChat } from '@/features/seller/chat/hooks/useSellerChat';
import Icon from '@/components/ui/Icon';
import ChatOptionsMenu from './components/ChatOptionsMenu';
import BaseLoading from '@/components/ui/BaseLoading';
import ChatLayout from '@/components/shared/chat/ChatLayout';
import MessageBubble from '@/components/shared/chat/MessageBubble';
import MessageInput from '@/components/shared/chat/MessageInput';

interface ChatPageClientProps {
    // TODO Tarea 3: Recibir datos iniciales del Server Component
}

export function ChatPageClient(_props: ChatPageClientProps) {
    const {
        conversations,
        totalConversations,
        activeConversation,
        setActiveConversation,
        isLoading,
        filters,
        setFilters,
        isMobileListVisible,
        setIsMobileListVisible,
        sendMessage,
        clearActiveChat,
        deleteActiveTicket,
        criticalCount
    } = useSellerChat();

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeConversation?.mensajes]);

    const handleSendMessage = (message: string) => {
        sendMessage(message);
    };

    const messages = activeConversation?.mensajes.map(msg => ({
        sender: msg.sender,
        content: msg.contenido,
        timestamp: msg.hora,
    })) || [];

    const listContent = (
        <>
            <div className="p-6 bg-[var(--bg-secondary)]/50 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0">
                        <Icon name="MessageCircle" className="text-white text-2xl font-black w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight truncate">Centro de Atención</h3>
                        <p className="text-xs text-[var(--text-secondary)] font-black uppercase tracking-widest truncate">Soporte en Tiempo Real</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-[var(--bg-card)] p-4 rounded-3xl border border-[var(--border-subtle)] text-center shadow-sm">
                        <div className="text-xl font-black text-[var(--text-primary)]">{totalConversations}</div>
                        <div className="text-xs text-[var(--text-secondary)] font-black uppercase tracking-widest">Total</div>
                    </div>
                    <div className="bg-red-500/10 p-4 rounded-3xl border border-red-500/20 text-center shadow-sm">
                        <div className="text-xl font-black text-red-500">{criticalCount}</div>
                        <div className="text-xs text-red-500 font-black uppercase tracking-widest">Críticos</div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="relative group">
                        <Icon name="Search" className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-sky-500 transition-colors w-4 h-4" />
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => setFilters({ search: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl text-xs font-bold text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all outline-none"
                            placeholder="Buscar por cliente o DNI..."
                        />
                    </div>
                    <select
                        value={filters.category}
                        onChange={(e) => setFilters({ category: e.target.value })}
                        className="w-full text-xs py-3 px-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 font-black uppercase tracking-wider text-[var(--text-primary)] cursor-pointer outline-none shadow-sm"
                    >
                        <option value="all">TODAS LAS CATEGORÍAS</option>
                        <option value="tech">DIAGNÓSTICO TÉCNICO</option>
                        <option value="admin">SOPORTE ADMINISTRATIVO</option>
                        <option value="info">SOLICITUD DE INFO</option>
                        <option value="comment">ELOGIOS Y FEEDBACK</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {conversations.length > 0 ? (
                    conversations.map(conv => (
                        <button
                            key={conv.id}
                            onClick={() => setActiveConversation(conv)}
                            className={`w-full p-4 rounded-3xl border transition-all duration-300 group flex items-center gap-4 ${activeConversation?.id === conv.id
                                ? 'bg-sky-500 border-sky-400 shadow-xl shadow-sky-500/20'
                                : 'border-transparent hover:bg-[var(--bg-secondary)]'
                                }`}
                        >
                            <div className="relative">
                                <Image src={conv.avatar} alt={conv.nombre} width={48} height={48} className="rounded-2xl object-cover border-2 border-[var(--bg-card)] shadow-sm group-hover:scale-105 transition-transform" />
                                {conv.critical && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[var(--bg-card)] flex items-center justify-center text-xs text-white font-black">!</span>}
                            </div>
                            <div className="flex-1 text-left overflow-hidden">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className={`text-xs font-black uppercase tracking-tight truncate ${activeConversation?.id === conv.id ? 'text-white' : 'text-[var(--text-primary)]'}`}>{conv.nombre}</h4>
                                    <span className={`text-xs font-black uppercase ${activeConversation?.id === conv.id ? 'text-white/70' : 'text-[var(--text-secondary)]'}`}>{conv.fecha}</span>
                                </div>
                                <p className={`text-xs font-bold truncate ${activeConversation?.id === conv.id ? 'text-white/80' : 'text-[var(--text-secondary)]'}`}>{conv.ultimoMensaje}</p>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="p-12 text-center opacity-40">
                        <Icon name="MessageSquareOff" className="text-4xl mb-4 text-[var(--text-secondary)] mx-auto w-10 h-10" />
                        <p className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] leading-relaxed">Sin resultados para<br />tu búsqueda</p>
                    </div>
                )}
            </div>
        </>
    );

    const detailContent = !activeConversation ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-fadeIn">
            <div className="w-32 h-32 bg-[var(--bg-card)] rounded-full flex items-center justify-center shadow-xl shadow-black/5 mb-8 border border-[var(--border-subtle)]">
                <Icon name="MessageCircle" className="text-6xl text-sky-500 opacity-20 w-16 h-16" />
            </div>
            <h2 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter">Buzón de Mensajes</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-2 font-black uppercase tracking-widest">Selecciona una conversación para leer</p>
        </div>
    ) : (
        <>
            <div className="p-6 bg-[var(--bg-card)] border-b border-[var(--border-subtle)] flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsMobileListVisible(true)}
                        className="md:hidden p-3 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-2xl hover:bg-sky-500/10 transition-all active:scale-90"
                    >
                        <Icon name="ChevronLeft" className="w-5 h-5" />
                    </button>
                    <Image src={activeConversation.avatar} alt={activeConversation.nombre} width={48} height={48} className="rounded-2xl object-cover border-2 border-emerald-500/20 shadow-sm" />
                    <div>
                        <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">{activeConversation.nombre}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-[var(--text-secondary)] font-black uppercase">{activeConversation.email}</span>
                            <span className="text-xs text-sky-500 font-black bg-sky-500/10 px-2 py-0.5 rounded-lg uppercase tracking-tight">DNI: {activeConversation.dni}</span>
                            {activeConversation.critical && <span className="text-xs bg-red-500/10 text-red-500 font-black px-2 py-0.5 rounded-lg uppercase tracking-widest">Prioridad Alta</span>}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <ChatOptionsMenu onClear={clearActiveChat} onDelete={deleteActiveTicket} />
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar bg-[var(--bg-secondary)]/20">
                <MessageBubble messages={messages} />
                <div ref={messagesEndRef} />
            </div>

            <div className="flex-shrink-0">
                <MessageInput onSend={handleSendMessage} />
            </div>
        </>
    );

    if (isLoading) {
        return (
            <div className="w-full bg-[var(--bg-card)] rounded-[2.5rem] shadow-xl shadow-black/5 border border-[var(--border-subtle)] overflow-hidden flex flex-col md:flex-row animate-fadeIn"
                style={{ height: 'calc(100vh - 160px)', minHeight: '600px' }}>
                <div className="w-full md:w-80 shrink-0 flex items-center justify-center">
                    <BaseLoading message="Cargando conversaciones..." />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-8rem)] h-full overflow-hidden pb-4">
            <ChatLayout
                list={listContent}
                detail={detailContent}
                listWidth="col-span-4"
            />
        </div>
    );
}
