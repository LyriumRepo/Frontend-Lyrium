'use client';

import React, { useState, useId, useRef } from 'react';
import Icon from '@/components/ui/Icon';

interface MessageInputProps {
  onSend: (message: string, files?: File[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function MessageInput({ onSend, placeholder = 'Escribe un mensaje...', disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed && files.length === 0) return;
    onSend(trimmed, files.length > 0 ? files : undefined);
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

  return (
    <form onSubmit={handleSubmit} className="p-6 border-t border-[var(--border-subtle)]" aria-label="Formulario de mensaje">
      {files.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-[#1A3A32] rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[var(--border-subtle)]">
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
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1A3A32] transition-all"
        >
          <Icon name="Paperclip" className="w-5 h-5" />
        </button>

        <button
          type="submit"
          disabled={(!message.trim() && files.length === 0) || disabled}
          aria-label="Enviar mensaje"
          className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <Icon name="Send" className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
