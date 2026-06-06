'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSellerChat } from '@/features/seller/chat/hooks/useSellerChat';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import ChatLayout from '@/components/shared/chat/ChatLayout';
import MessageInput from '@/components/shared/chat/MessageInput';
import BaseLoading from '@/components/ui/BaseLoading';
import Icon from '@/components/ui/Icon';
import ChatOptionsMenu from './components/ChatOptionsMenu';

const CATEGORY_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  info: { label: 'Información', bg: 'bg-[var(--turquesa-500)]/10 dark:bg-[var(--turquesa-500)]/10', text: 'text-[var(--turquesa-500)] dark:text-[var(--turquesa-500)]' },
  comment: { label: 'Comentario', bg: 'bg-[var(--verde-500)]/10 dark:bg-[var(--verde-500)]/10', text: 'text-[var(--verde-500)] dark:text-[var(--verde-500)]' },
  admin: { label: 'Soporte', bg: 'bg-[var(--icons-green)]/10 dark:bg-[var(--icons-green)]/10', text: 'text-[var(--icons-green)] dark:text-[var(--icons-green)]' },
};

export function ChatPageClient() {
  const {
    conversations,
    totalConversations,
    activeConversation,
    setActiveConversation,
    isLoading,
    isSending,
    filters,
    setFilters,
    isMobileListVisible,
    setIsMobileListVisible,
    sendMessage,
    clearActiveChat,
    deleteActiveTicket,
    criticalCount,
  } = useSellerChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.mensajes]);

  const handleSendMessage = (message: string, files?: File[]) => {
    sendMessage(message, files);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  };

  const messages = activeConversation?.mensajes ?? [];

  const listContent = (
    <div className="divide-y divide-gray-100 dark:divide-[var(--border-subtle)] h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-100 dark:border-[var(--border-subtle)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-[var(--text-primary)] text-sm">Conversaciones</h3>
            <p className="text-xs text-gray-500 dark:text-[var(--text-muted)]">{conversations.length} chats</p>
          </div>
          <button
            onClick={() => setShowFilter(prev => !prev)}
            className={`p-2 rounded-xl transition-all duration-200 text-xs font-medium border ${showFilter
              ? 'bg-[var(--turquesa-500)]/10 text-[var(--turquesa-500)] border-[var(--turquesa-500)]/30 dark:bg-[var(--turquesa-500)]/10 dark:text-[var(--turquesa-500)] dark:border-[var(--turquesa-500)]/30'
              : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200 dark:bg-[var(--bg-secondary)] dark:text-gray-400 dark:border-[var(--border-subtle)]'
            }`}
          >
            <Icon name="Filter" className="w-4 h-4" />
          </button>
        </div>

        <div className="relative mb-4">
          <Icon name="Search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[var(--text-muted)]" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            placeholder="Buscar por cliente o DNI..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-[var(--bg-muted)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--turquesa-500)]/20 focus:border-[var(--turquesa-500)] dark:focus:border-[var(--turquesa-500)] transition-all"
          />
        </div>

        {showFilter && (
          <select
            value={filters.category}
            onChange={(e) => setFilters({ category: e.target.value })}
            className="w-full text-xs py-2.5 px-3 bg-gray-50 dark:bg-[var(--bg-muted)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-xl font-semibold text-gray-700 dark:text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--turquesa-500)]/20 focus:border-[var(--turquesa-500)]"
          >
            <option value="all">Todas las categorías</option>
            <option value="info">Información</option>
            <option value="comment">Comentarios</option>
            <option value="admin">Soporte Administrativo</option>
          </select>
        )}
      </div>

      {conversations.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <Icon name="MessageSquareOff" className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-[var(--text-muted)]" />
          <p className="text-base font-bold text-gray-800 dark:text-[var(--text-primary)]">Sin conversaciones</p>
          <p className="text-sm mt-1">No hay chats activos con clientes</p>
        </div>
      )}

      {conversations.map((conv, index) => {
        const catStyle = CATEGORY_STYLES[conv.type] ?? CATEGORY_STYLES.info;

        return (
          <button
            key={conv.id}
            style={{ animationDelay: `${Math.min(index * 30, 400)}ms` }}
            onClick={() => {
              setActiveConversation(conv);
              setIsMobileListVisible(false);
            }}
            className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-[#1A3A32] transition-all duration-200 hover:pl-6 animate-list-item-slide ${
              activeConversation?.id === conv.id ? 'bg-[var(--turquesa-500)]/10 dark:bg-[#1A3A32]/50' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--turquesa-500)] to-[var(--verde-500)] dark:from-[var(--brand-green)] dark:to-[var(--icons-green)] flex items-center justify-center text-white font-bold text-sm animate-avatar-appear">
                  {conv.nombre.charAt(0).toUpperCase()}
                </div>
                {conv.critical && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-[var(--bg-secondary)] flex items-center justify-center">
                    <span className="text-[8px] text-white font-black">!</span>
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 dark:text-[var(--text-primary)] text-sm truncate">{conv.nombre}</span>
                  <span className="text-[10px] text-gray-400 dark:text-[var(--text-muted)] shrink-0 ml-2">{conv.fecha}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-[var(--text-muted)] truncate mt-0.5">{conv.ultimoMensaje}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${catStyle.bg} ${catStyle.text}`}>
                    {catStyle.label}
                  </span>
                  {conv.dni && (
                    <span className="text-[9px] text-gray-400 dark:text-[var(--text-muted)] font-medium">DNI: {conv.dni}</span>
                  )}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );

  const chatContent = activeConversation ? (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-secondary)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileListVisible(true)}
            className="md:hidden p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1A3A32]"
          >
            <Icon name="ArrowLeft" className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--turquesa-500)] to-[var(--verde-500)] dark:from-[var(--brand-green)] dark:to-[var(--icons-green)] flex items-center justify-center text-white font-bold text-sm shrink-0 animate-avatar-appear">
            {activeConversation.nombre.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)] text-sm truncate">{activeConversation.nombre}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              {activeConversation.email && (
                <span className="text-[10px] text-gray-500 dark:text-[var(--text-muted)] truncate">{activeConversation.email}</span>
              )}
              {activeConversation.dni && (
                <span className="text-[9px] font-bold text-[var(--turquesa-500)] dark:text-[var(--turquesa-500)] bg-[var(--turquesa-500)]/10 dark:bg-[var(--turquesa-500)]/10 px-2 py-0.5 rounded-md">DNI: {activeConversation.dni}</span>
              )}
              {activeConversation.critical && (
                <span className="text-[9px] font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-md">Prioridad Alta</span>
              )}
            </div>
          </div>
          <ChatOptionsMenu onClear={clearActiveChat} onDelete={deleteActiveTicket} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-[var(--bg-muted)]/30">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-[#1A3A32] rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="MessageCircle" className="w-8 h-8 text-gray-300 dark:text-[var(--text-muted)]" />
              </div>
              <p className="text-sm font-bold text-gray-500 dark:text-[var(--text-muted)]">No hay mensajes aún</p>
              <p className="text-xs text-gray-400 dark:text-[var(--text-muted)] mt-1">Responde al cliente para iniciar la conversación</p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isSeller = msg.sender === 'user';

          return (
            <div key={msg.id ?? msg.hora} className={`flex ${isSeller ? 'justify-end' : 'justify-start'} ${isSeller ? 'animate-bubble-in-right' : 'animate-bubble-in-left'}`}
              style={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }}>
              <div className={`flex max-w-[75%] items-end gap-3 ${isSeller ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 ${
                  isSeller
                    ? 'bg-gradient-to-br from-[var(--turquesa-500)] to-[var(--verde-500)] text-white'
                    : 'bg-gradient-to-br from-[var(--verde-500)] to-[var(--turquesaClaro-500)] dark:from-[var(--brand-green)] dark:to-[var(--icons-green)] text-white'
                }`}>
                  {isSeller ? 'Tú' : activeConversation.nombre.charAt(0).toUpperCase()}
                </div>

                <div className={`relative rounded-3xl px-5 py-3 shadow-sm border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
                  isSeller
                    ? 'bg-gradient-to-br from-[var(--turquesa-500)] to-[var(--verde-500)] text-white border-transparent rounded-br-md'
                    : 'bg-white dark:bg-[#1A3A32] text-slate-800 dark:text-[var(--text-primary)] border-gray-200 dark:border-[var(--border-subtle)] rounded-bl-md'
                }`}>
                  <div className="mb-1 flex items-center gap-2">
                    <p className={`text-[11px] font-black uppercase tracking-[0.16em] ${
                      isSeller ? 'text-white/80' : 'text-[var(--icons-green)] dark:text-[var(--icons-green)]'
                    }`}>
                      {isSeller ? 'Tú' : activeConversation.nombre}
                    </p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isSeller ? 'bg-white/15 text-white/80' : 'bg-[var(--icons-green)]/10 dark:bg-[#2A3F33] text-[var(--icons-green)] dark:text-[#6BAF7B]'
                    }`}>
                      {isSeller ? 'Vendedor' : 'Cliente'}
                    </span>
                  </div>
                  {msg.contenido && <p className="text-sm leading-relaxed whitespace-pre-wrap break-all">{msg.contenido}</p>}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {msg.attachments.map((att) => {
                        const isImage = att.mime_type?.startsWith('image/');
                        return (
                          <a
                            key={att.id}
                            href={att.download_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-[0.98] ${
                              isSeller
                                ? 'bg-white/15 text-white/80 hover:bg-white/25'
                                : 'bg-gray-100 dark:bg-[#2A3F33] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#3A4F43]'
                            }`}
                          >
                            {isImage ? (
                              <img src={att.url} alt={att.file_name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                            ) : (
                              <Icon name="FileText" className="w-4 h-4 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <span className="truncate block">{att.file_name}</span>
                              {att.file_size != null && (
                                <span className="text-[10px] opacity-60">
                                  {att.file_size < 1048576
                                    ? `${(att.file_size / 1024).toFixed(1)} KB`
                                    : `${(att.file_size / 1048576).toFixed(1)} MB`}
                                </span>
                              )}
                            </div>
                            <Icon name="Download" className="w-3.5 h-3.5 shrink-0 ml-auto" />
                          </a>
                        );
                      })}
                    </div>
                  )}
                  <div className="mt-2 flex justify-end">
                    <p className={`text-[10px] font-medium ${isSeller ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'}`}>
                      {formatTime(msg.hora)}
                      {isSeller && (
                        <span className="ml-1.5">
                          {msg.status === 'read' ? (
                            <Icon name="CheckCheck" className="w-3 h-3 text-[var(--turquesaClaro-500)] dark:text-[var(--turquesaClaro-500)] animate-check-pop" />
                          ) : (
                            <Icon name="Check" className="w-3 h-3 text-white/40 dark:text-gray-500" />
                          )}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-secondary)]">
        <MessageInput
          onSend={handleSendMessage}
          placeholder="Escribe un mensaje..."
          disabled={isSending}
        />
      </div>
    </div>
  ) : (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center animate-slide-up">
        <div className="w-20 h-20 bg-[var(--icons-green)]/10 dark:bg-[#1A3A32] rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="MessageCircle" className="w-10 h-10 text-[var(--icons-green)] dark:text-[var(--icons-green)]" />
        </div>
        <p className="text-xl font-black text-slate-800 dark:text-[var(--text-primary)]">Selecciona una conversación</p>
        <p className="text-sm text-slate-500 dark:text-[var(--text-muted)] mt-2">Elige un chat para comenzar a atender al cliente</p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in">
        <ModuleHeader
          title="Chat con Clientes"
          subtitle="Atención y soporte directo con los clientes"
          icon="MessageCircle"
        />
        <div className="flex-1 flex items-center justify-center">
          <BaseLoading message="Cargando conversaciones..." />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in">
      <ModuleHeader
        title="Chat con Clientes"
        subtitle="Atención y soporte directo con los clientes"
        icon="MessageCircle"
        actions={
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              <div className="px-4 py-2 bg-white dark:bg-[var(--bg-secondary)] rounded-xl border border-gray-200 dark:border-[var(--border-subtle)] shadow-sm">
                <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  {totalConversations} Conversaciones
                </span>
              </div>
              {criticalCount > 0 && (
                <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                  <span className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">
                    {criticalCount} Críticos
                  </span>
                </div>
              )}
            </div>
          </div>
        }
      />

      <div className="flex-1 min-h-0">
        <ChatLayout
          list={listContent}
          detail={chatContent}
          listWidth="col-span-4"
        />
      </div>
    </div>
  );
}
