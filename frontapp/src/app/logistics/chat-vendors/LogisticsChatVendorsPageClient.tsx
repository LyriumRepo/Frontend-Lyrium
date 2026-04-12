'use client';

import { useState } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import ChatLayout from '@/components/shared/chat/ChatLayout';
import ConversationList from '@/components/shared/chat/ConversationList';
import MessageBubble from '@/components/shared/chat/MessageBubble';
import MessageInput from '@/components/shared/chat/MessageInput';
import { useLogisticsChat } from '@/features/logistics/chat/hooks/useLogisticsChat';

export function LogisticsChatVendorsPageClient() {
  const {
    conversations,
    selectedConversation,
    setSelectedConversation,
    filters,
    setFilters,
    sendMessage,
    messagesEndRef,
  } = useLogisticsChat();

  const handleSend = (text: string) => {
    if (!selectedConversation) return;
    sendMessage(text);
  };

  const list = (
    <>
      <div className="p-4 border-b border-[var(--border-subtle)]">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar conversaciones..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="w-full pl-4 pr-4 py-3 bg-[var(--bg-secondary)]/50 border-none rounded-2xl text-xs font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-sky-500/20"
          />
        </div>
      </div>
      <ConversationList
        conversations={conversations.map(c => ({
          id: c.id,
          name: c.name,
          lastMessage: c.lastMessage,
          unreadCount: c.unreadCount,
        }))}
        activeId={selectedConversation?.id}
        onSelect={(id) => {
          const conv = conversations.find(c => c.id === id);
          if (conv) setSelectedConversation(conv);
        }}
        accentColor="sky"
      />
    </>
  );

  const detail = selectedConversation ? (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 p-4 border-b border-[var(--border-subtle)]">
        <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-500">
          <span className="text-lg font-black">📦</span>
        </div>
        <div>
          <h3 className="text-sm font-black text-[var(--text-primary)]">{selectedConversation.name}</h3>
          <p className="text-xs text-[var(--text-secondary)]">Pedido: {selectedConversation.orderId}</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        <MessageBubble 
          messages={selectedConversation.messages.map(m => ({
            id: m.id,
            sender: m.sender,
            content: m.content,
            timestamp: m.timestamp,
          }))} 
        />
        <div ref={messagesEndRef} />
      </div>
      
      <MessageInput
        onSend={handleSend}
        placeholder="Escribe un mensaje..."
      />
    </div>
  ) : (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <span className="text-6xl opacity-20">💬</span>
        <p className="text-sm font-bold text-[var(--text-secondary)] mt-4">Selecciona una conversación</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">Elige un vendedor para iniciar</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-20 max-w-7xl mx-auto">
      <ModuleHeader 
        title="Chat con Vendedores" 
        subtitle="Comunicación directa con vendedores" 
        icon="MessageCircle" 
      />
      <ChatLayout list={list} detail={detail} />
    </div>
  );
}
