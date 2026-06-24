'use client';

import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/Icon';

interface Props {
    onSend: (content: string) => void;
    disabled: boolean;
}

const MAX_LENGTH = 2000;

export default function ChatBotInput({ onSend, disabled }: Props) {
    const [value, setValue] = useState('');
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!disabled && inputRef.current) {
            inputRef.current.focus();
        }
    }, [disabled]);

    const handleSubmit = () => {
        const trimmed = value.trim();
        if (!trimmed || disabled) return;
        onSend(trimmed);
        setValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const charCount = value.length;
    const isOverLimit = charCount > MAX_LENGTH;

    return (
        <div className="border-t border-[var(--border-subtle)] p-3 bg-white dark:bg-[var(--bg-card)]">
            <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                    <textarea
                        ref={inputRef}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Escribe tu consulta..."
                        rows={1}
                        disabled={disabled}
                        className="w-full resize-none rounded-xl border border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-primary)] px-3 py-2.5 text-sm text-gray-800 dark:text-[var(--text-primary)] placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-shadow"
                        style={{ minHeight: '40px', maxHeight: '120px' }}
                        onInput={(e) => {
                            const target = e.currentTarget;
                            target.style.height = 'auto';
                            target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                        }}
                    />
                    {charCount > 0 && (
                        <span className={`absolute right-2.5 bottom-2 text-[10px] font-medium ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}>
                            {charCount}/{MAX_LENGTH}
                        </span>
                    )}
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={disabled || !value.trim() || isOverLimit}
                    aria-label="Enviar mensaje"
                    className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-[var(--brand-green)] dark:hover:bg-[var(--brand-green-hover)] disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed active:scale-95 hover:shadow-md"
                >
                    <Icon name="Send" className="text-lg" />
                </button>
            </div>
        </div>
    );
}
