'use client';

import { useEffect, useRef, useMemo } from 'react';
import type { ChatBotMessage } from '../types';
import ChatBotHeader from './ChatBotHeader';
import ChatBotBubble from './ChatBotBubble';
import ChatBotInput from './ChatBotInput';
import ChatBotQuickActions from './ChatBotQuickActions';

interface Props {
    isOpen: boolean;
    isMinimized: boolean;
    messages: ChatBotMessage[];
    isTyping: boolean;
    onClose: () => void;
    onMinimize: () => void;
    onSend: (content: string) => void;
    onBotResponse: (content: string) => void;
    onClear: () => void;
}

export default function ChatBotPanel({
    isOpen,
    isMinimized,
    messages,
    isTyping,
    onClose,
    onMinimize,
    onSend,
    onBotResponse,
    onClear,
}: Props) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const showQuickActions = useMemo(() => {
        return !messages.some((m) => m.role === 'user');
    }, [messages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    if (!isOpen) return null;

    return (
        <div
            className={`fixed bottom-20 right-5 z-[100] w-[360px] max-w-[calc(100vw-2rem)] transition-all duration-300 ease-out ${
                isMinimized
                    ? 'opacity-0 pointer-events-none translate-y-4 scale-95'
                    : 'opacity-100 translate-y-0 scale-100'
            }`}
        >
            <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border-subtle)] overflow-hidden flex flex-col animate-slide-up">
                <ChatBotHeader
                    onMinimize={onMinimize}
                    onClose={onClose}
                    onClear={onClear}
                />

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white dark:bg-[var(--bg-card)] custom-scrollbar" style={{ height: '420px', maxHeight: 'calc(100vh - 280px)' }}>
                    {messages.map((msg) => (
                        <ChatBotBubble key={msg.id} message={msg} />
                    ))}

                        {showQuickActions && !isTyping && (
                            <ChatBotQuickActions onBotResponse={onBotResponse} />
                        )}

                    {isTyping && (
                        <div className="flex gap-2 justify-start animate-slide-down">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-700 to-teal-600 dark:from-[var(--brand-green)] dark:to-[var(--icons-green)] flex items-center justify-center shadow-sm">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                            <div className="bg-gray-100 dark:bg-[var(--bg-muted)] rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                                <div className="flex gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-emerald-500 animate-pulse-dot" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-emerald-500 animate-pulse-dot" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-emerald-500 animate-pulse-dot" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                <ChatBotInput onSend={onSend} disabled={isTyping} />
            </div>
        </div>
    );
}
