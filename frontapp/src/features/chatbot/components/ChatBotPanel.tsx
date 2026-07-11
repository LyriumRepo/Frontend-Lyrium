'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import type { ChatBotMessage } from '../types';
import ChatBotHeader from './ChatBotHeader';
import ChatBotBubble from './ChatBotBubble';
import ChatBotInput from './ChatBotInput';
import ChatBotAvatar from './ChatBotAvatar';
import { useMobileKeyboardViewport } from '../hooks/useMobileKeyboardViewport';

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
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [showScrollBottom, setShowScrollBottom] = useState(false);
    const mobileKeyboardViewport = useMobileKeyboardViewport();

    const handleScroll = useCallback(() => {
        const el = messagesContainerRef.current;
        if (!el) return;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        setShowScrollBottom(distanceFromBottom > 100);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    if (!isOpen) return null;

    return (
        /*
         * Este div es `fixed` — crea su propio contexto de posicionamiento.
         * El tooltip se renderiza aquí como `absolute`, FUERA del div interior
         * que tiene `overflow-hidden`. Así nunca queda recortado.
         *
         * Cuando el teclado de iOS está abierto, `visualViewport` reporta el
         * alto real visible (que no coincide con `85vh`) — ahí sobreescribimos
         * top/height/bottom por estilo inline para que el input no quede tapado.
         */
        <div
            className={`fixed z-[100] transition-all duration-300 ease-out
                inset-x-0 bottom-0 h-[85vh] h-[80dvh] max-h-[640px] pb-[env(safe-area-inset-bottom)]
                sm:inset-auto sm:bottom-20 sm:right-5 sm:h-auto sm:max-h-none sm:w-[560px] sm:max-w-[calc(100vw-2rem)] sm:pb-0 ${
                isMinimized
                    ? 'opacity-0 pointer-events-none translate-y-4 scale-95'
                    : 'opacity-100 translate-y-0 scale-100'
            }`}
            style={mobileKeyboardViewport ? {
                top: mobileKeyboardViewport.top,
                height: mobileKeyboardViewport.height,
                bottom: 'auto',
                maxHeight: 'none',
                paddingBottom: 0,
            } : undefined}
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
                        className={`absolute z-10 left-4 right-4 top-2
                            sm:left-auto sm:right-full sm:top-3 sm:mr-4
                            pointer-events-none select-none
                            lyrio-fadein lyrio-float
                            transition-opacity duration-200
                            ${tooltipVisible ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <div className="bg-white border border-emerald-200 rounded-2xl px-4 py-2.5 shadow-lg sm:w-max sm:max-w-xs">
                            <p className="text-sm font-medium text-gray-700 text-center sm:text-left whitespace-normal sm:whitespace-nowrap">
                                {tooltipText}
                            </p>
                        </div>
                        {/* Puntitos apuntando a la derecha → hacia el avatar (solo layout de escritorio) */}
                        <div className="hidden sm:block absolute bg-white border border-emerald-200 rounded-full"
                             style={{ width: 9, height: 9, top: 14, right: -12 }} />
                        <div className="hidden sm:block absolute bg-white border border-emerald-200 rounded-full"
                             style={{ width: 6, height: 6, top: 18, right: -21 }} />
                        <div className="hidden sm:block absolute bg-white border border-emerald-200 rounded-full"
                             style={{ width: 4, height: 4, top: 22, right: -29 }} />
                    </div>
                </>
            )}

            {/* ── Panel interior con overflow-hidden para bordes redondeados ── */}
            <div className="h-full bg-white dark:bg-[var(--bg-card)] rounded-t-2xl sm:rounded-2xl shadow-2xl border border-[var(--border-subtle)] overflow-hidden flex flex-col animate-slide-up">
                <ChatBotHeader onMinimize={onMinimize} onClose={onClose} onClear={onClear} />

                <div
                    ref={messagesContainerRef}
                    onScroll={handleScroll}
                    className="relative flex-1 min-h-0 sm:flex-none sm:min-h-[80px] sm:max-h-[200px] overflow-y-auto p-4 space-y-3 bg-white dark:bg-[var(--bg-card)] custom-scrollbar"
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

                    {showScrollBottom && (
                        <button
                            onClick={scrollToBottom}
                            className="sticky bottom-2 ml-auto flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 dark:from-[var(--brand-green)] dark:to-[var(--icons-green)] text-white shadow-lg hover:scale-110 active:scale-95 transition-all duration-200"
                            aria-label="Ir al último mensaje"
                        >
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <ChatBotInput onSend={onSend} disabled={isTyping} />
            </div>
        </div>
    );
}
