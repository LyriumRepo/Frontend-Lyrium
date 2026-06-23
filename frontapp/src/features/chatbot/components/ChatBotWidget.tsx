'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useChatBot } from '../hooks/useChatBot';
import ChatBotPanel from './ChatBotPanel';
import LogoLyrium from '@/components/LogoLyrium';

export default function ChatBotWidget() {
    const pathname = usePathname();
    if (pathname === '/login') return null;
    const {
        isOpen,
        isMinimized,
        messages,
        isTyping,
        toggle,
        minimize,
        close,
        sendMessage,
        addBotResponse,
        clearHistory,
    } = useChatBot();

    useEffect(() => {
        const handler = () => { if (!isOpen) toggle(); };
        window.addEventListener('lyrium:open-chatbot', handler);
        return () => window.removeEventListener('lyrium:open-chatbot', handler);
    }, [isOpen, toggle]);

    return (
        <>
            <ChatBotPanel
                isOpen={isOpen}
                isMinimized={isMinimized}
                messages={messages}
                isTyping={isTyping}
                onClose={close}
                onMinimize={minimize}
                onSend={sendMessage}
                onBotResponse={addBotResponse}
                onClear={clearHistory}
            />

            <button
                onClick={toggle}
                className={`fixed bottom-20 right-6 z-[100] shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 ${
                    isOpen ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100 scale-100'
                }`}
                aria-label="Abrir chat"
            >
                <div className="bg-gradient-to-br from-emerald-700 to-teal-600 dark:from-[var(--brand-green)] dark:to-[var(--icons-green)] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl hover:shadow-2xl hover:from-emerald-600 hover:to-teal-500 dark:hover:from-[var(--icons-green)] dark:hover:to-[var(--brand-green)] transition-all duration-300">
                    <LogoLyrium size="sm" showText={false} frontImg="/img/iconologo.png" />
                </div>
            </button>
        </>
    );
}
