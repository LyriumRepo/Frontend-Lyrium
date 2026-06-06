'use client';

import type { ChatBotMessage } from '../types';

interface Props {
    message: ChatBotMessage;
}

export default function ChatBotBubble({ message }: Props) {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';

    if (isSystem) return null;

    return (
        <div className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            {!isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-sm mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
            )}

            <div
                className={`max-w-[280px] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    isUser
                        ? 'bg-sky-500 text-white rounded-br-md'
                        : 'bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-800 dark:text-[var(--text-primary)] rounded-bl-md'
                }`}
            >
                {message.content}
            </div>

            {isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
            )}
        </div>
    );
}
