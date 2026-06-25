'use client';

import type { ChatBotMessage } from '../types';
import ChatBotAvatar from './ChatBotAvatar';

interface Props {
    message: ChatBotMessage;
}

export default function ChatBotBubble({ message }: Props) {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';

    if (isSystem) return null;

    return (
        <div className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'} ${isUser ? 'animate-bubble-in-right' : 'animate-bubble-in-left'}`}>
            {!isUser && (
                <div className="mt-1 animate-avatar-appear">
                    <ChatBotAvatar size="sm" />
                </div>
            )}

            <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                    isUser
                        ? 'bg-emerald-700 dark:bg-[var(--brand-green)] text-white rounded-br-md'
                        : 'bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-800 dark:text-[var(--text-primary)] rounded-bl-md'
                }`}
            >
                {message.content}
            </div>

            {isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 dark:from-amber-600 dark:to-amber-700 flex items-center justify-center shadow-sm mt-1 animate-avatar-appear">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
            )}
        </div>
    );
}
