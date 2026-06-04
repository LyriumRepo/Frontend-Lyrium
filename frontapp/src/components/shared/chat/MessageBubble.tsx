'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';

export interface MessageAttachment {
  id: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  url: string;
  download_url: string;
}

export interface Message {
  id?: string;
  sender: string;
  content: string;
  timestamp: string;
  attachments?: MessageAttachment[];
}

interface MessageBubbleProps {
  messages: Message[];
  currentUserId?: string;
}

const isSentByMe = (message: Message, currentUserId?: string): boolean => {
  if (currentUserId) {
    return message.sender === currentUserId;
  }
  return message.sender === 'user' || message.sender === 'operator';
};

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function formatDateSeparator(iso: string) {
  try {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Hoy';
    if (d.toDateString() === yesterday.toDateString()) return 'Ayer';
    return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return '';
  }
}

export function TypingIndicator() {
  return (
    <div className="flex justify-start animate-fadeIn">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl rounded-tl-none px-5 py-4 shadow-sm max-w-[75%]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#2d5e42]/40 dark:bg-[#4A7C59]/40 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-[#2d5e42]/40 dark:bg-[#4A7C59]/40 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-[#2d5e42]/40 dark:bg-[#4A7C59]/40 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

function shouldShowDateSeparator(prevIso: string | null, currIso: string): boolean {
  if (!prevIso) return true;
  try {
    const prev = new Date(prevIso);
    const curr = new Date(currIso);
    return prev.toDateString() !== curr.toDateString();
  } catch {
    return true;
  }
}

export default function MessageBubble({ messages, currentUserId }: MessageBubbleProps) {
  return (
    <div className="space-y-1 px-4 py-4">
      {messages.map((msg, idx) => {
        const isSent = isSentByMe(msg, currentUserId);
        const prevMsg = idx > 0 ? messages[idx - 1] : null;
        const showDate = shouldShowDateSeparator(prevMsg?.timestamp ?? null, msg.timestamp);

        return (
          <React.Fragment key={msg.id || msg.timestamp + idx}>
            {showDate && (
              <div className="flex justify-center my-4">
                <span className="px-3 py-1 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-full text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-wider">
                  {formatDateSeparator(msg.timestamp)}
                </span>
              </div>
            )}

            <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} ${idx > 0 && !showDate ? 'mt-0.5' : 'mt-2'}`}>
              <div
                className={`max-w-[80%] md:max-w-[70%] ${
                  isSent
                    ? 'bg-[#2d5e42] dark:bg-[#4A7C59] text-white rounded-2xl rounded-br-sm shadow-lg shadow-[#2d5e42]/15 dark:shadow-[#4A7C59]/20'
                    : 'bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-2xl rounded-bl-sm shadow-sm'
                } px-4 py-3 transition-all hover:shadow-md`}
              >
                {msg.content && (
                  <p className={`text-xs md:text-sm leading-relaxed ${isSent ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                    {msg.content}
                  </p>
                )}

                {msg.attachments && msg.attachments.length > 0 && (
                  <div className={`mt-2 space-y-1.5 ${msg.content ? 'border-t border-white/10 pt-2' : ''}`}>
                    {msg.attachments.map((att) => (
                      <a
                        key={att.id}
                        href={att.download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          isSent
                            ? 'bg-white/10 text-white/90 hover:bg-white/20'
                            : 'bg-[#2d5e42]/5 dark:bg-[#4A7C59]/10 text-[var(--text-primary)] hover:bg-[#2d5e42]/10 dark:hover:bg-[#4A7C59]/20'
                        }`}
                      >
                        <Icon name="FileText" className="w-4 h-4 shrink-0" />
                        <span className="truncate">{att.file_name}</span>
                        <Icon name="Download" className="w-3.5 h-3.5 shrink-0 ml-auto" />
                      </a>
                    ))}
                  </div>
                )}

                <div className={`flex items-center gap-1 mt-1.5 ${isSent ? 'justify-end' : 'justify-start'}`}>
                  <span className={`text-[9px] font-medium ${isSent ? 'text-white/60' : 'text-[var(--text-secondary)]'}`}>
                    {formatTime(msg.timestamp)}
                  </span>
                  {isSent && (
                    <Icon name="CheckCheck" className="w-3 h-3 text-emerald-300 dark:text-emerald-400" />
                  )}
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
