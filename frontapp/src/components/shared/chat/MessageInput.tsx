'use client';

import React, { useState, useId } from 'react';
import Icon from '@/components/ui/Icon';

interface MessageInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
}

export default function MessageInput({ onSend, placeholder = 'Escribe un mensaje...' }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const inputId = useId();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSend(message);
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 border-t border-[var(--border-subtle)]" aria-label="Formulario de mensaje">
      <div className="flex gap-3 bg-[var(--bg-secondary)] p-2 pl-6 rounded-[2.5rem] border border-[var(--border-subtle)] focus-within:border-emerald-500/30 focus-within:ring-4 focus-within:ring-emerald-500/5 transition-all">
        <label htmlFor={inputId} className="sr-only">Escribir mensaje</label>
        <input
          id={inputId}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          aria-label="Escribir mensaje"
          className="flex-1 px-2 bg-transparent border-none text-xs font-bold text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:ring-0 outline-none"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          aria-label="Enviar mensaje"
          className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <Icon name="Send" className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
