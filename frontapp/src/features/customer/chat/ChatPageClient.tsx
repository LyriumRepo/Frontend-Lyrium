'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useCustomerChat } from '@/features/customer/chat/hooks/useCustomerChat';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import ChatLayout from '@/components/shared/chat/ChatLayout';
import MessageBubble from '@/components/shared/chat/MessageBubble';
import MessageInput from '@/components/shared/chat/MessageInput';
import BaseLoading from '@/components/ui/BaseLoading';

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
        criticalCount
    } = useCustomerChat();

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isMobileListVisible, setIsMobileListVisible] = useState(true);

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

    const listContent = (
        <div className="divide-y divide-gray-100 h-full overflow-y-auto">
            <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Conversaciones</h3>
                <p className="text-sm text-gray-500">{totalConversations} chats</p>
            </div>
            {conversations.map((conv) => (
                <button
                    key={conv.id}
                    onClick={() => {
                        setActiveConversation(conv.id);
                        setIsMobileListVisible(false);
                    }}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        activeConversation?.id === conv.id ? 'bg-sky-50' : ''
                    }`}
                >
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-semibold">
                            {conv.sellerName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900 truncate">{conv.sellerStore}</span>
                                <span className="text-xs text-gray-400">{formatDate(conv.lastMessageTime)}</span>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-sm text-gray-500 truncate">{conv.lastMessage}</span>
                                {conv.unreadCount > 0 && (
                                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-sky-500 text-white rounded-full">
                                        {conv.unreadCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </button>
            ))}
            {conversations.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                    <p>No hay conversaciones</p>
                </div>
            )}
        </div>
    );

    const chatContent = activeConversation ? (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-semibold">
                        {activeConversation.sellerName.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{activeConversation.sellerStore}</h3>
                        <p className="text-sm text-gray-500">{activeConversation.sellerName}</p>
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.senderType === 'customer' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] p-4 rounded-2xl shadow-sm ${
                            msg.senderType === 'customer'
                                ? 'bg-emerald-500 text-white rounded-tr-none'
                                : 'bg-sky-500 text-white rounded-tl-none'
                        }`}>
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-[8px] mt-1 ${msg.senderType === 'customer' ? 'text-emerald-200' : 'text-sky-200'}`}>
                                {formatTime(msg.timestamp)}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="border-t border-gray-200 p-4">
                <MessageInput onSend={handleSendMessage} placeholder="Escribe un mensaje..." />
            </div>
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
            />
            <ChatLayout
                list={listContent}
                detail={chatContent}
            />
        </div>
    );
}
