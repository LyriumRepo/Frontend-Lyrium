import React, { useState } from 'react';
import Icon from '@/components/ui/Icon';

interface MessageInputProps {
    onSend: (content: string) => void;
}

export default function MessageInput({ onSend }: MessageInputProps) {
    const [text, setText] = useState('');

    const handleSend = () => {
        if (!text.trim()) return;
        onSend(text);
        setText('');
    };

    return (
        <div className="flex items-center gap-4 bg-[var(--bg-secondary)] p-2 pl-6 rounded-[2rem] border border-[var(--border-subtle)] shadow-inner group">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] resize-none py-4 max-h-32 outline-none"
                placeholder="Escribe tu respuesta estratégica..."
                rows={1}
            />
            <div className="flex gap-2 pr-2">
                <button className="p-3 text-[var(--text-secondary)] hover:text-sky-500 transition-colors">
                    <Icon name="Paperclip" className="text-xl w-6 h-6" />
                </button>
                <button
                    onClick={handleSend}
                    className="w-12 h-12 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95 flex items-center justify-center translate-y-0 group-focus-within:translate-y-[-2px]"
                >
                    <Icon name="Send" className="text-xl w-6 h-6" />
                </button>
            </div>
        </div>
    );
}
