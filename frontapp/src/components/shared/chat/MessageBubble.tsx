'use client';

import React, { useEffect } from 'react';
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
  read_at?: string | null;
  attachments?: MessageAttachment[];
}

export interface MessageMetaConfig {
  currentUserName?: string;
  currentUserRole?: string;
  otherName?: string;
  otherRole?: string;
  showAvatar?: boolean;
}

interface MessageBubbleProps {
  messages: Message[];
  currentUserId?: string;
  onMarkRead?: (messageId: string) => void;
  meta?: MessageMetaConfig;
  isSentOverride?: (message: Message) => boolean;
}

const isSentByMe = (message: Message, currentUserId?: string, override?: (m: Message) => boolean): boolean => {
  if (override) return override(message);
  if (currentUserId) return message.sender === currentUserId;
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

function shouldShowDateSeparator(prevIso: string | null, currIso: string): boolean {
  if (!prevIso) return true;
  try {
    return new Date(prevIso).toDateString() !== new Date(currIso).toDateString();
  } catch {
    return true;
  }
}

export function TypingIndicator() {
  return (
    <div className="flex justify-start animate-fadeIn px-4">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl rounded-tl-none px-5 py-4 shadow-sm max-w-[75%]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--icons-green)]/40 animate-pulse-dot" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-[var(--icons-green)]/40 animate-pulse-dot" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-[var(--icons-green)]/40 animate-pulse-dot" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

// ─── MessageItem: extracted so useEffect lives at top-level (Rules of Hooks) ──

interface MessageItemProps {
  msg: Message;
  idx: number;
  isSent: boolean;
  showDate: boolean;
  isRead: boolean;
  showMeta: boolean;
  onMarkRead?: (id: string) => void;
  meta?: MessageMetaConfig;
  currentUserInitial: string;
  otherInitial: string;
}

function MessageItem({
  msg,
  idx,
  isSent,
  showDate,
  isRead,
  showMeta,
  onMarkRead,
  meta,
  currentUserInitial,
  otherInitial,
}: MessageItemProps) {
  useEffect(() => {
    if (!isSent && msg.id && !isRead && onMarkRead) {
      onMarkRead(msg.id);
    }
  }, [msg.id, isSent, isRead, onMarkRead]);

  return (
    <>
      {showDate && (
        <div className="flex justify-center my-4 animate-fadeIn">
          <span className="px-4 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-full text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-wider shadow-sm">
            {formatDateSeparator(msg.timestamp)}
          </span>
        </div>
      )}

      <div
        className={`flex ${isSent ? 'justify-end' : 'justify-start'} ${showDate ? 'mt-2' : idx > 0 ? 'mt-0.5' : ''} animate-fadeIn`}
        style={{ animationDelay: `${Math.min(idx * 20, 300)}ms` }}
      >
        <div className={`flex max-w-[82%] md:max-w-[68%] items-end gap-2 ${isSent ? 'flex-row-reverse' : 'flex-row'}`}>
          {showMeta && (
            <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-[9px] font-black shadow-sm transition-transform duration-200 ${
              isSent
                ? 'bg-gradient-to-br from-[var(--turquesa-500)] to-[var(--verde-500)] text-white'
                : 'bg-gradient-to-br from-gray-200 to-gray-300 dark:from-[#2A4035] dark:to-[#1A2E25] text-gray-600 dark:text-gray-300'
            }`}>
              {isSent ? currentUserInitial : otherInitial}
            </div>
          )}

          <div className={`${
            isSent
              ? 'bg-gradient-to-br from-[var(--turquesa-500)] to-[var(--verde-500)] text-white rounded-[1.75rem] rounded-br-md shadow-lg shadow-[var(--turquesa-500)]/30 dark:shadow-[var(--turquesa-500)]/20'
              : 'bg-white/80 dark:bg-[#1A2E25]/80 backdrop-blur-md border border-white/20 dark:border-[#2A4035]/50 text-[var(--text-primary)] rounded-[1.75rem] rounded-bl-md shadow-sm'
          } px-5 py-3.5 transition-all duration-200 hover:shadow-md flex-1 min-w-0`}>
            {showMeta && (
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  isSent ? 'text-white/90' : 'text-gray-600 dark:text-gray-300'
                }`}>
                  {isSent ? (meta?.currentUserName ?? 'Tú') : (meta?.otherName ?? '')}
                </span>
                <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                  isSent
                    ? 'bg-white/15 text-white/80'
                    : 'bg-gray-100 dark:bg-[#24382E] text-gray-500 dark:text-gray-400'
                }`}>
                  {isSent ? (meta?.currentUserRole ?? '') : (meta?.otherRole ?? '')}
                </span>
              </div>
            )}

            {msg.content && (
              <p className={`text-sm leading-relaxed ${isSent ? 'text-white' : 'text-gray-800 dark:text-gray-100'} whitespace-pre-wrap break-words`}>
                {msg.content}
              </p>
            )}

            {msg.attachments && msg.attachments.length > 0 && (
              <div className={`mt-2.5 space-y-2 ${msg.content ? 'border-t border-white/10 pt-2.5' : ''}`}>
                {msg.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isSent
                        ? 'bg-white/10 text-white/90 hover:bg-white/20 active:scale-[0.98]'
                        : 'bg-gray-50 dark:bg-[#24382E] text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2A4035] active:scale-[0.98]'
                    }`}
                  >
                    <Icon name="FileText" className="w-4 h-4 shrink-0" />
                    <span className="truncate flex-1">{att.file_name}</span>
                    <span className="text-[9px] opacity-60">{(att.file_size / 1024).toFixed(0)}KB</span>
                    <Icon name="Download" className="w-3.5 h-3.5 shrink-0" />
                  </a>
                ))}
              </div>
            )}

            <div className={`flex items-center gap-1.5 mt-1.5 ${isSent ? 'justify-end' : 'justify-start'}`}>
              <span className={`text-[10px] font-medium ${isSent ? 'text-white/50' : 'text-gray-400 dark:text-gray-500'}`}>
                {formatTime(msg.timestamp)}
              </span>
              {isSent && (
                isRead ? (
                  <div className="relative">
                    <Icon name="CheckCheck" className="w-3.5 h-3.5 text-[var(--turquesaClaro-500)] dark:text-[var(--turquesaClaro-500)] animate-check-pop" />
                    <span className="absolute -top-2 -right-1 w-1.5 h-1.5 bg-[var(--turquesaClaro-500)] rounded-full" />
                  </div>
                ) : (
                  <Icon name="Check" className="w-3.5 h-3.5 text-white/40" />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── MessageBubble: iterates messages, delegates rendering to MessageItem ─────

export default function MessageBubble({ messages, currentUserId, onMarkRead, meta, isSentOverride }: MessageBubbleProps) {
  return (
    <div className="space-y-0.5 px-4 py-4">
      {messages.map((msg, idx) => {
        const isSent = isSentByMe(msg, currentUserId, isSentOverride);
        const prevMsg = idx > 0 ? messages[idx - 1] : null;
        const showDate = shouldShowDateSeparator(prevMsg?.timestamp ?? null, msg.timestamp);
        const isRead = !!msg.read_at;
        const sameSenderAsPrev = prevMsg !== null && isSentByMe(prevMsg, currentUserId, isSentOverride) === isSent;
        const showMeta = (meta?.showAvatar ?? false) && !sameSenderAsPrev;
        const currentUserInitial = (meta?.currentUserName ?? 'T').charAt(0).toUpperCase();
        const otherInitial = (meta?.otherName ?? '?').charAt(0).toUpperCase();

        return (
          <MessageItem
            key={msg.id ?? `${msg.timestamp}-${idx}`}
            msg={msg}
            idx={idx}
            isSent={isSent}
            showDate={showDate}
            isRead={isRead}
            showMeta={showMeta}
            onMarkRead={onMarkRead}
            meta={meta}
            currentUserInitial={currentUserInitial}
            otherInitial={otherInitial}
          />
        );
      })}
    </div>
  );
}
