'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Paperclip, Send, X } from 'lucide-react';

const TEXTAREA_MIN_HEIGHT = 56;
const TEXTAREA_MAX_HEIGHT = 176;
const MAX_ATTACHMENTS = 3;
const ACCEPTED_MIME = 'image/jpeg,image/png,image/webp';

export interface ChatSendPayload {
  text: string;
  attachments?: File[];
  isQuick?: boolean;
}

interface PendingFile {
  file: File;
  previewUrl: string;
}

interface ChatInputProps {
  onSendMessage: (payload: ChatSendPayload) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = 'Escribe una respuesta...',
}: ChatInputProps) {
  const [text, setText] = useState('');
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = `${TEXTAREA_MIN_HEIGHT}px`;
    const next = Math.min(textarea.scrollHeight, TEXTAREA_MAX_HEIGHT);
    textarea.style.height = `${Math.max(next, TEXTAREA_MIN_HEIGHT)}px`;
    textarea.style.overflowY = textarea.scrollHeight > TEXTAREA_MAX_HEIGHT ? 'auto' : 'hidden';
  }, [text]);

  // Revoke preview URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      pendingFiles.forEach((pf) => URL.revokeObjectURL(pf.previewUrl));
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;

    setPendingFiles((prev) => {
      const remaining = MAX_ATTACHMENTS - prev.length;
      const toAdd = selected.slice(0, remaining).map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      return [...prev, ...toAdd];
    });
    // Reset input so the same file can be selected again if removed
    e.target.value = '';
  }, []);

  const removeFile = useCallback((index: number) => {
    setPendingFiles((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const canSend = !disabled && (text.trim().length > 0 || pendingFiles.length > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    onSendMessage({
      text: text.trim(),
      attachments: pendingFiles.length > 0 ? pendingFiles.map((pf) => pf.file) : undefined,
    });
    setText('');
    setPendingFiles((prev) => {
      prev.forEach((pf) => URL.revokeObjectURL(pf.previewUrl));
      return [];
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="flex-1 rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--bg-input)] shadow-inner shadow-slate-200/40 dark:shadow-black/25">
        {/* Image previews strip */}
        {pendingFiles.length > 0 && (
          <div className="flex gap-2 overflow-x-auto px-3 pt-3 pb-1 custom-scrollbar">
            {pendingFiles.map((pf, idx) => (
              <div key={idx} className="relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pf.previewUrl}
                  alt={pf.file.name}
                  className="h-14 w-14 rounded-xl object-cover border border-[var(--border-subtle)]"
                />
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  aria-label={`Quitar ${pf.file.name}`}
                  className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white shadow"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
            {pendingFiles.length < MAX_ATTACHMENTS && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Agregar más imágenes"
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)] transition hover:border-sky-300 hover:text-sky-500"
              >
                <Paperclip className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        <div className="flex items-end px-1.5 py-1.5">
          {pendingFiles.length === 0 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Adjuntar imagen"
              disabled={disabled}
              className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[var(--text-muted)] transition hover:bg-[var(--bg-hover)] hover:text-sky-500 disabled:opacity-40"
            >
              <Paperclip className="h-4 w-4" />
            </button>
          )}

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            aria-label="Escribe una respuesta para el ticket"
            rows={2}
            placeholder={disabled ? 'Enviando...' : placeholder}
            className="flex-1 resize-none bg-transparent px-3 py-3 text-sm font-medium leading-6 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] disabled:opacity-50 [overflow-wrap:anywhere]"
          />
        </div>
      </div>

      <button
        type="submit"
        aria-label="Enviar respuesta"
        disabled={!canSend}
        className="inline-flex h-12 shrink-0 items-center gap-2 rounded-[1.25rem] bg-sky-500 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-[var(--bg-muted)] dark:disabled:text-[var(--text-secondary)]"
      >
        {disabled ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <span className="hidden sm:inline">Enviar</span>
            <Send className="h-3.5 w-3.5" />
          </>
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_MIME}
        multiple
        className="hidden"
        onChange={handleFileChange}
        aria-hidden="true"
      />
    </form>
  );
}