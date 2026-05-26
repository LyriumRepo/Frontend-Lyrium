'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useCustomerChat } from '@/features/customer/chat/hooks/useCustomerChat';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import ChatLayout from '@/components/shared/chat/ChatLayout';
import MessageBubble from '@/components/shared/chat/MessageBubble';
import MessageInput from '@/components/shared/chat/MessageInput';
import BaseLoading from '@/components/ui/BaseLoading';
import Icon from '@/components/ui/Icon';
import { ChatCategory } from '@/features/customer/chat/types';

function NewChatForm({
  sellers,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  sellers: { id: string; name: string; store: string }[];
  onSubmit: (data: { sellerId: string; category: ChatCategory; subject: string }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [sellerId, setSellerId] = useState(sellers[0]?.id ?? '');
  const [category, setCategory] = useState<ChatCategory>('informacion');
  const [subject, setSubject] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !sellerId) return;
    onSubmit({ sellerId, category, subject });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[var(--bg-secondary)] rounded-[2.5rem] shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-sky-500 to-sky-300 dark:from-[#1A3A32] dark:to-[var(--brand-green)] p-8 text-white relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
            <Icon name="Messages" className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tighter">Nuevo Chat</h3>
            <p className="text-[10px] font-bold text-sky-100 uppercase tracking-[0.2em]">Inicia una conversación con un vendedor</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">Vendedor</label>
          <select
            value={sellerId}
            onChange={(e) => setSellerId(e.target.value)}
            className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)]"
            required
          >
            <option value="">Seleccionar vendedor...</option>
            {sellers.map(s => (
              <option key={s.id} value={s.id}>{s.store} — {s.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">Categoría</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ChatCategory)}
            className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)]"
            required
          >
            <option value="informacion">Solicitud de Información</option>
            <option value="positivo">Comentario Positivo</option>
            <option value="negativo">Comentario Negativo</option>
            <option value="logistica">Logística</option>
            <option value="facturacion">Soporte de Facturación</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">Asunto</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Describe brevemente el motivo"
            className="w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-gray-50 dark:bg-[var(--bg-muted)] p-4 border-2 border-transparent rounded-2xl outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)]"
            required
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-8 py-4 rounded-2xl bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-600 dark:text-gray-400 font-black text-xs uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-[#2A3F33]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !sellerId}
            className="flex-[2] px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 dark:from-[#1A3A32] dark:to-[var(--brand-green)] text-white font-black text-xs uppercase tracking-[0.2em] hover:shadow-lg disabled:opacity-50"
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
    sellers,
    totalConversations,
    activeConversation,
    setActiveConversation,
    messages,
    isLoading,
    error,
    sendMessage,
    isSending,
    clearActiveChat,
    isCreating,
    createConversation,
    criticalCount,
  } = useCustomerChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  const [filterType, setFilterType] = useState<'tienda' | 'categoria'>('tienda');
  const [filterValue, setFilterValue] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [showNewChatForm, setShowNewChatForm] = useState(false);

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
    <div className="divide-y divide-gray-100 dark:divide-[var(--border-subtle)] h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-100 dark:border-[var(--border-subtle)]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-[var(--text-primary)]">Conversaciones</h3>
            <p className="text-sm text-gray-500 dark:text-[var(--text-muted)]">
              {filteredConversations.length} chats
            </p>
          </div>
          <button
            onClick={() => { setShowFilter(prev => !prev); setFilterValue(''); }}
            className={`p-2 rounded-xl transition-colors text-xs font-medium border ${showFilter
              ? 'bg-sky-100 text-sky-600 border-sky-200 dark:bg-[var(--brand-green)] dark:text-white'
              : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200 dark:bg-[var(--bg-secondary)]'
            }`}
          >
            Filtrar
          </button>
        </div>

        {showFilter && (
          <div className="mt-3 space-y-2">
            <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 text-xs font-medium">
              <button
                onClick={() => { setFilterType('tienda'); setFilterValue(''); }}
                className={`flex-1 py-1.5 transition-colors ${filterType === 'tienda'
                  ? 'bg-sky-500 dark:bg-[var(--brand-green)] text-white'
                  : 'bg-gray-100 dark:bg-[var(--bg-secondary)] text-gray-500'
                }`}
              >
                Tienda
              </button>
              <button
                onClick={() => { setFilterType('categoria'); setFilterValue(''); }}
                className={`flex-1 py-1.5 transition-colors ${filterType === 'categoria'
                  ? 'bg-sky-500 dark:bg-[var(--brand-green)] text-white'
                  : 'bg-gray-100 dark:bg-[var(--bg-secondary)] text-gray-500'
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
                <option value="logistica">Logística</option>
                <option value="facturacion">Soporte de Facturación</option>
              </select>
            )}
          </div>
        )}
      </div>

      {filteredConversations.length === 0 && !isLoading && (
        <div className="p-8 text-center text-gray-500">
          <Icon name="Messages" className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-[#2A3F33]" />
          <p className="text-base font-bold text-gray-800 dark:text-[var(--text-primary)]">Sin conversaciones</p>
          <p className="text-sm mt-1">Inicia un nuevo chat con un vendedor</p>
        </div>
      )}

      {filteredConversations.map((conv) => (
        <button
          key={conv.id}
          onClick={() => {
            setActiveConversation(conv.id);
            setIsMobileListVisible(false);
          }}
          className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-[#1A3A32] transition-colors ${activeConversation?.id === conv.id ? 'bg-sky-50 dark:bg-[#1A3A32]/50' : ''
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 dark:from-[var(--brand-green)] dark:to-[#1A3A32] flex items-center justify-center text-white font-bold text-sm">
              {conv.sellerStore.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 dark:text-[var(--text-primary)] truncate">{conv.sellerStore}</span>
                <span className="text-xs text-gray-400">{formatDate(conv.lastMessageTime)}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-gray-500 dark:text-[var(--text-muted)] truncate">{conv.lastMessage}</span>
                {conv.unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-sky-500 dark:bg-[var(--icons-green)] text-white rounded-full">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
              {conv.category && (
                <div className="mt-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#1A3A32] text-gray-500 dark:text-[#6BAF7B] font-bold uppercase">
                    {{
                      informacion: 'Información',
                      positivo: 'Positivo',
                      negativo: 'Negativo',
                      logistica: 'Logística',
                      facturacion: 'Facturación',
                    }[conv.category as string] ?? conv.category}
                  </span>
                </div>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );

  const chatContent = activeConversation ? (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-secondary)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileListVisible(true)}
            className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1A3A32]"
          >
            <Icon name="ArrowLeft" className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 dark:from-[var(--brand-green)] dark:to-[#1A3A32] flex items-center justify-center text-white font-bold text-sm">
            {activeConversation.sellerStore.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)]">{activeConversation.sellerStore}</h3>
            <p className="text-sm text-gray-500 dark:text-[var(--text-muted)]">{activeConversation.sellerName}</p>
          </div>
          <div className="ml-auto">
            <span className="text-[10px] px-3 py-1 rounded-full bg-gray-100 dark:bg-[#1A3A32] text-gray-500 dark:text-[#6BAF7B] font-bold uppercase tracking-widest">
              {{
                informacion: 'Información',
                positivo: 'Positivo',
                negativo: 'Negativo',
                logistica: 'Logística',
                facturacion: 'Facturación',
              }[activeConversation.category as string] ?? activeConversation.category}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-[var(--bg-muted)]/30">
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <Icon name="AlertCircle" className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {messages.map((msg) => {
          const isCustomer = msg.senderType === 'customer';

          return (
            <div key={msg.id} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[75%] items-end gap-3 ${isCustomer ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm ${
                  isCustomer
                    ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white'
                    : 'bg-gradient-to-br from-sky-400 to-sky-600 dark:from-[var(--brand-green)] dark:to-[#1A3A32] text-white'
                }`}>
                  {isCustomer ? 'Tú' : activeConversation.sellerStore.charAt(0)}
                </div>

                <div className={`relative rounded-3xl px-5 py-3 shadow-sm border backdrop-blur-sm ${
                  isCustomer
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-emerald-400/20 rounded-br-md'
                    : 'bg-white dark:bg-[#1A3A32] text-slate-800 dark:text-[var(--text-primary)] border-gray-200 dark:border-[var(--border-subtle)] rounded-bl-md'
                }`}>
                  <div className="mb-1 flex items-center gap-2">
                    <p className={`text-[11px] font-black uppercase tracking-[0.16em] ${
                      isCustomer ? 'text-emerald-100' : 'text-sky-600 dark:text-[var(--icons-green)]'
                    }`}>
                      {isCustomer ? 'Tú' : activeConversation.sellerName}
                    </p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isCustomer ? 'bg-white/15 text-emerald-50' : 'bg-sky-50 dark:bg-[#2A3F33] text-sky-700 dark:text-[#6BAF7B]'
                    }`}>
                      {isCustomer ? 'Cliente' : 'Vendedor'}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-all">{msg.content}</p>
                  <div className="mt-2 flex justify-end">
                    <p className={`text-[10px] font-medium ${isCustomer ? 'text-emerald-100/80' : 'text-gray-400 dark:text-gray-500'}`}>
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
      <div className="text-center">
        <div className="w-20 h-20 bg-sky-50 dark:bg-[#1A3A32] rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="MessageCircle" className="w-10 h-10 text-sky-400 dark:text-[var(--icons-green)]" />
        </div>
        <p className="text-xl font-black text-slate-800 dark:text-[var(--text-primary)]">Selecciona una conversación</p>
        <p className="text-sm text-slate-500 dark:text-[var(--text-muted)] mt-2">Elige un chat para comenzar a chatear o inicia uno nuevo</p>
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
        actions={
          !showNewChatForm ? (
            <button
              onClick={() => setShowNewChatForm(true)}
              className="px-6 py-3 bg-white dark:bg-[var(--bg-secondary)] text-sky-600 dark:text-[var(--icons-green)] rounded-xl font-black text-xs uppercase tracking-widest border border-gray-200 dark:border-[var(--border-subtle)] hover:bg-sky-50 dark:hover:bg-[#1A3A32] transition-all flex items-center gap-2"
            >
              <Icon name="Plus" className="w-4 h-4" />
              Nuevo Chat
            </button>
          ) : null
        }
      />

      {showNewChatForm ? (
        <div className="flex-1 flex items-center justify-center px-8 py-6">
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
    </div>
  );
}
