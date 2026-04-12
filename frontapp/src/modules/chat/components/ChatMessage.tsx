'use client';

import Image from 'next/image';
import { Check, CheckCheck } from 'lucide-react';
import { UnifiedMessage } from '../types';

interface ChatMessageProps {
  message: UnifiedMessage;
}

const parseMarkdown = (text: string) => {
  return text.split('\n').map((line, i) => (
    <span key={`line-${line.slice(0, 10)}-${i}`} className="block break-words [overflow-wrap:anywhere]">
      {line.split('**').map((part, idx) => (
        idx % 2 === 1 ? <b key={`bold-${part.slice(0, 5)}-${idx}`}>{part}</b> :
          part.split('*').map((p, pIdx) => (
            pIdx % 2 === 1 ? <i key={`italic-${p.slice(0, 5)}-${pIdx}`}>{p}</i> : p
          ))
      ))}
    </span>
  ));
};

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.senderRole === 'vendor' || message.senderRole === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
      <div className={`flex max-w-[85%] flex-col space-y-2 md:max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2 px-1">
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--text-muted)]">
            {message.isQuickReply && '[QR] '}
            {message.isEscalation && '[ESC] '}
            {message.senderName}
          </span>
          <span className="text-[9px] font-bold tracking-[0.18em] text-[var(--text-muted)]">
            {message.hour}
          </span>
        </div>

        <div
          className={`relative max-w-full rounded-[1.75rem] border p-4 text-sm font-medium leading-7 shadow-sm transition-all ${
            isUser
              ? 'rounded-tr-sm border-emerald-400/40 bg-gradient-to-br from-emerald-500 to-emerald-400 text-white dark:border-emerald-300/20 dark:from-[#3f7a55] dark:to-[#2d5c3d]'
              : 'rounded-tl-sm border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)]'
          }`}
        >
          <div className="pr-7 break-words whitespace-pre-wrap [overflow-wrap:anywhere]">
            {parseMarkdown(message.content)}
          </div>

          {isUser && (
            <span className="absolute bottom-2 right-3 flex items-center gap-0.5">
              {message.isRead ? (
                <CheckCheck className="h-3.5 w-3.5 text-blue-200" aria-label="Visto" />
              ) : (
                <Check className="h-3.5 w-3.5 text-white/60" aria-label="Enviado" />
              )}
            </span>
          )}
        </div>

        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.attachments.map((file) => (
              <div key={file.id || file.url} className="max-w-[200px] overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-sm">
                {file.type === 'image' ? (
                  <Image
                    src={file.url}
                    alt={file.name}
                    width={180}
                    height={120}
                    className="max-h-32 max-w-full cursor-pointer object-cover transition hover:opacity-90"
                    onClick={() => window.open(file.url, '_blank')}
                  />
                ) : (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-3 text-[10px] font-bold text-[var(--text-primary)] transition hover:bg-[var(--bg-hover)]"
                  >
                    File {file.name}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
