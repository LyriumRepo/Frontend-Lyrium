'use client';

import React, { useState, useId, useRef } from 'react';
import Icon from '@/components/ui/Icon';

interface MessageInputProps {
  onSend: (message: string, files?: File[]) => void;
  placeholder?: string;
  disabled?: boolean;
  typing?: boolean;
}

export default function MessageInput({ onSend, placeholder = 'Escribe un mensaje...', disabled = false, typing = false }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed && files.length === 0) return;
    onSend(trimmed, files.length > 0 ? files : undefined);
    setSending(true);
    setTimeout(() => setSending(false), 400);
    setMessage('');
    setFiles([]);
  };

  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const MAX_FILES = 10;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const oversized = selected.filter(f => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      alert(`Archivos demasiado grandes (máx 10MB): ${oversized.map(f => f.name).join(', ')}`);
    }
    const validFiles = selected.filter(f => f.size <= MAX_FILE_SIZE);
    const combined = [...files, ...validFiles];
    if (combined.length > MAX_FILES) {
      alert(`Solo se permiten hasta ${MAX_FILES} archivos adjuntos.`);
    }
    setFiles(combined.slice(0, MAX_FILES));
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'Image';
    if (['pdf'].includes(ext || '')) return 'FileText';
    if (['doc', 'docx'].includes(ext || '')) return 'FileCode';
    if (['xls', 'xlsx'].includes(ext || '')) return 'File';
    return 'File';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-[var(--border-subtle)] bg-[var(--bg-primary)]" aria-label="Formulario de mensaje">
      {typing && (
        <div className="px-6 py-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[var(--text-secondary)] font-medium italic">Alguien está escribiendo</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#2d5e42]/40 dark:bg-[#4A7C59]/40 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[#2d5e42]/40 dark:bg-[#4A7C59]/40 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[#2d5e42]/40 dark:bg-[#4A7C59]/40 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="px-6 pt-4 pb-2 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-[#1a3a2a]/60 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[var(--border-subtle)]">
              <Icon name={getFileIcon(file.name)} className="w-4 h-4 shrink-0" />
              <span className="truncate max-w-[120px]">{file.name}</span>
              <span className="text-gray-400 dark:text-gray-500">{formatSize(file.size)}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="ml-1 p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-[#2A3F33] transition-colors"
              >
                <Icon name="X" className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 flex gap-3 items-end">
        <div className="flex-1 flex items-center gap-2 bg-[var(--bg-secondary)] px-4 rounded-2xl border border-[var(--border-subtle)] focus-within:border-[#2d5e42]/30 dark:focus-within:border-[#4A7C59]/50 focus-within:ring-2 focus-within:ring-[#2d5e42]/10 dark:focus-within:ring-[#4A7C59]/20 transition-all">
          <label htmlFor={inputId} className="sr-only">Escribir mensaje</label>
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label="Escribir mensaje"
            className="flex-1 py-3 bg-transparent border-none text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:ring-0 outline-none"
          />

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Adjuntar archivos"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Adjuntar archivos"
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1A3A32] transition-all shrink-0"
          >
            <Icon name="Paperclip" className="w-4.5 h-4.5" />
          </button>
        </div>

        <button
          type="submit"
          disabled={(!message.trim() && files.length === 0) || disabled}
          aria-label="Enviar mensaje"
          className={`w-11 h-11 bg-[#2d5e42] dark:bg-[#4A7C59] text-white rounded-2xl flex items-center justify-center hover:bg-[#1a3a2a] dark:hover:bg-[#3D6B4A] hover:scale-105 active:scale-90 transition-all shadow-lg shadow-[#2d5e42]/20 dark:shadow-[#4A7C59]/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 shrink-0 ${sending ? 'animate-pulse scale-95' : ''}`}
        >
          {sending ? (
            <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Icon name="Send" className="w-4.5 h-4.5" />
          )}
        </button>
      </div>
    </form>
  );
}
