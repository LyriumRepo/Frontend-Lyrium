'use client';

import { useChatBot } from '../hooks/useChatBot';
import ChatBotPanel from './ChatBotPanel';
import Icon from '@/components/ui/Icon';

export default function ChatBotWidget() {
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
                className={`fixed bottom-20 right-6 z-[100] shadow-lg transition-all duration-300 hover:scale-110 ${
                    isOpen ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100 scale-100'
                }`}
            >
                <div className="bg-gradient-to-br from-sky-500 to-sky-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:shadow-xl">
                    <Icon name="MessageCircle" className="text-[26px]" />
                </div>
            </button>
        </>
    );
}
