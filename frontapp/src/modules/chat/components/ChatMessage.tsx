'use client';

import Image from 'next/image';
import { Check, CheckCheck } from 'lucide-react';
import { UnifiedMessage } from '../types';

interface ChatMessageProps {
  message: UnifiedMessage;
  showAvatar?: boolean;
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

export function ChatMessage({ message, showAvatar = true }: ChatMessageProps) {
  const isUser = message.senderRole === 'vendor' || message.senderRole === 'user';

  return (
    <div
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} ${isUser ? 'animate-bubble-in-right' : 'animate-bubble-in-left'}`}
    >
      <div className={`flex max-w-[82%] md:max-w-[68%] items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

        {/* Avatar (solo en el último mensaje del grupo) o espacio reservado para alineación */}
        {showAvatar ? (
          <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-[9px] font-black shadow-sm animate-avatar-appear ${
            isUser
              ? 'bg-[#2E6A4F] text-white'
              : 'bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)]'
          }`}>
            {message.senderName?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
        ) : (
          <div className="w-8 h-8 shrink-0" aria-hidden="true" />
        )}

        <div
          className={`${
            isUser
              ? 'bg-[#2E6A4F] text-white rounded-[1.75rem] rounded-br-md shadow-sm'
              : 'bg-white/80 dark:bg-[#1E2925] backdrop-blur-md border border-white/20 dark:border-[#2A4035]/50 text-[var(--text-primary)] rounded-[1.75rem] rounded-bl-md shadow-sm'
          } px-5 py-3.5 transition-all duration-200 hover:shadow-md flex-1 min-w-0`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            {(message.isQuickReply || message.isEscalation) && (
              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                isUser ? 'bg-white/15 text-white/80' : 'bg-gray-100 dark:bg-[#24382E] text-gray-500 dark:text-gray-400'
              }`}>
                {message.isEscalation ? 'Escalado' : 'Rápida'}
              </span>
            )}
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              isUser ? 'text-white/80' : 'text-gray-600 dark:text-gray-300'
            }`}>
              {message.senderName}
            </span>
          </div>

          <div className="text-sm font-medium leading-relaxed break-words whitespace-pre-wrap [overflow-wrap:anywhere]">
            {parseMarkdown(message.content)}
          </div>

          {message.attachments && message.attachments.length > 0 && (
            <div className={`mt-2.5 space-y-2 ${message.content ? 'border-t border-white/10 pt-2.5' : ''}`}>
              {message.attachments.map((file) => (
                <div key={file.id || file.url} className={`overflow-hidden rounded-xl ${isUser ? 'bg-white/10' : 'bg-gray-50 dark:bg-[#24382E]'}`}>
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
                      className={`flex items-center gap-2 p-3 text-[10px] font-bold transition hover:opacity-80 ${
                        isUser ? 'text-white/90' : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {file.name}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className={`flex items-center gap-1.5 mt-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <span className={`text-[10px] font-medium ${isUser ? 'text-white/50' : 'text-gray-400 dark:text-gray-500'}`}>
              {message.hour}
            </span>
            {isUser && (
              message.isRead ? (
                <CheckCheck className="h-3.5 w-3.5 text-[var(--turquesaClaro-500)]" aria-label="Visto" />
              ) : (
                <Check className="h-3.5 w-3.5 text-white/40" aria-label="Enviado" />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
