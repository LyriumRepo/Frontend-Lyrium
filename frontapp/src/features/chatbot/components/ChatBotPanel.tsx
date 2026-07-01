'use client';

import { useEffect, useRef } from 'react';
import type { ChatBotMessage } from '../types';
import ChatBotHeader from './ChatBotHeader';
import ChatBotBubble from './ChatBotBubble';
import ChatBotInput from './ChatBotInput';
import ChatBotAvatar from './ChatBotAvatar';

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
    onWhatsAppClick?: () => void;
    tooltipText?: string;
    tooltipVisible?: boolean;
    tooltipShown?: boolean;
    tooltipAnimKey?: number;
}

export default function ChatBotPanel({
    isOpen,
    isMinimized,
    messages,
    isTyping,
    onClose,
    onMinimize,
    onSend,
    onClear,
    onWhatsAppClick,
    tooltipText,
    tooltipVisible,
    tooltipShown,
    tooltipAnimKey,
}: Props) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    if (!isOpen) return null;

    return (
        /*
         * Este div es `fixed` — crea su propio contexto de posicionamiento.
         * El tooltip se renderiza aquí como `absolute`, FUERA del div interior
         * que tiene `overflow-hidden`. Así nunca queda recortado.
         */
        <div
            className={`fixed bottom-20 right-5 z-[100] w-[560px] max-w-[calc(100vw-2rem)] transition-all duration-300 ease-out ${
                isMinimized
                    ? 'opacity-0 pointer-events-none translate-y-4 scale-95'
                    : 'opacity-100 translate-y-0 scale-100'
            }`}
        >
            {/* ── Tooltip anclado al área del avatar ───────────────────────
             * `absolute bottom-full` = justo encima del panel.
             * `left-4` = alineado con el avatar (px-4 del header).
             * No toca `overflow-hidden` → nunca se recorta.
             * ─────────────────────────────────────────────────────────── */}
            {tooltipShown && (
                <>
                    <style>{`
                        @keyframes lyrio-float {
                            0%, 100% { transform: translateY(0px); }
                            50%       { transform: translateY(-5px); }
                        }
                        @keyframes lyrio-fadein {
                            from { opacity: 0; transform: translateY(4px) scale(0.96); }
                            to   { opacity: 1; transform: translateY(0)   scale(1); }
                        }
                        .lyrio-float  { animation: lyrio-float  2.8s ease-in-out infinite; }
                        .lyrio-fadein { animation: lyrio-fadein 0.28s ease-out forwards; }
                    `}</style>

                    <div
                        key={tooltipAnimKey}
                        className={`absolute right-full top-3 mr-4 z-10 pointer-events-none select-none
                            lyrio-fadein lyrio-float
                            transition-opacity duration-200
                            ${tooltipVisible ? 'opacity-100' : 'opacity-0'}`}
                        style={{ minWidth: 'max-content' }}
                    >
                        <div className="bg-white border border-emerald-200 rounded-2xl px-4 py-2.5 shadow-lg">
                            <p className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                {tooltipText}
                            </p>
                        </div>
                        {/* Puntitos apuntando a la derecha → hacia el avatar */}
                        <div className="absolute bg-white border border-emerald-200 rounded-full"
                             style={{ width: 9, height: 9, top: 14, right: -12 }} />
                        <div className="absolute bg-white border border-emerald-200 rounded-full"
                             style={{ width: 6, height: 6, top: 18, right: -21 }} />
                        <div className="absolute bg-white border border-emerald-200 rounded-full"
                             style={{ width: 4, height: 4, top: 22, right: -29 }} />
                    </div>
                </>
            )}

            {/* ── Panel interior con overflow-hidden para bordes redondeados ── */}
            <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border-subtle)] overflow-hidden flex flex-col animate-slide-up">
                <ChatBotHeader onMinimize={onMinimize} onClose={onClose} onClear={onClear} />

                <div
                    className="overflow-y-auto p-4 space-y-3 bg-white dark:bg-[var(--bg-card)] custom-scrollbar"
                    style={{ minHeight: '80px', maxHeight: '200px' }}
                >
                    {messages.map((msg) => (
                        <ChatBotBubble key={msg.id} message={msg} onWhatsAppClick={onWhatsAppClick} />
                    ))}

                    {isTyping && (
                        <div className="flex gap-2 justify-start animate-slide-down">
                            <ChatBotAvatar size="sm" />
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
