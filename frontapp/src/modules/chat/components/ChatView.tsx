'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChatViewProps, TicketStatus, TicketPriority, UnifiedMessage } from '../types';
import MessageBubble, { Message } from '@/components/shared/chat/MessageBubble';
import MessageInput from '@/components/shared/chat/MessageInput';
import { AlertTriangle, ArrowLeft, CheckSquare, Headset, Loader2, ShieldCheck, Star } from 'lucide-react';

const scrollbarClass = 'custom-scrollbar';
const EMPTY_QUICK_REPLIES: string[] = [];

// ─── Type bridge: UnifiedMessage → Message (MessageBubble format) ─────────────

function toSafeISO(ts: unknown): string {
  const d = ts instanceof Date ? ts : new Date(String(ts ?? ''));
  return isNaN(d.getTime()) ? new Date(0).toISOString() : d.toISOString();
}

function toMessage(m: UnifiedMessage): Message {
  return {
    id: m.id,
    sender: m.senderRole,
    content: m.content,
    timestamp: toSafeISO(m.timestamp),
    read_at: m.isRead ? 'read' : null,
    attachments: m.attachments?.map(att => ({
      id: att.id,
      file_name: att.name,
      mime_type: att.type === 'image' ? 'image/jpeg' : 'application/octet-stream',
      file_size: 0,
      url: att.url,
      download_url: att.url,
    })),
  };
}

// The helpdesk view always shows vendor/user messages on the right (their side)
// and admin/logistics replies on the left — matching the original ChatMessage behavior.
const helpdeskIsSent = (msg: Message) =>
  msg.sender === 'vendor' || msg.sender === 'user';

// ─── SurveyArea ───────────────────────────────────────────────────────────────

function SurveyArea({ onSubmit }: { onSubmit?: (rating: number, comment: string) => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!onSubmit) return null;

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    await onSubmit(rating, comment);
    setIsSubmitting(false);
  };

  return (
    <div className="animate-fadeIn rounded-b-[2.5rem] border-t-2 border-dashed border-[var(--turquesa-500)]/20 bg-[var(--bg-secondary)]/70 p-8 dark:border-[var(--border-focus)]/40">
      <div className="mx-auto flex max-w-lg flex-col items-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[2rem] bg-[var(--turquesa-500)]/10 text-[var(--turquesa-500)] shadow-sm">
          <Headset className="h-7 w-7" />
        </div>
        <h3 className="mb-2 text-xl font-black tracking-tight text-[var(--text-primary)]">Tu opinion nos ayuda a mejorar</h3>
        <p className="mb-8 text-[11px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Encuesta de satisfaccion</p>

        <div className="mb-8 flex gap-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              aria-label={`Calificar con ${star} estrellas`}
              onClick={() => setRating(star)}
              className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 bg-[var(--bg-card)] text-2xl shadow-sm transition-all ${
                rating >= star ? 'border-[var(--turquesa-500)]/30 text-[var(--turquesa-500)]' : 'border-transparent text-gray-300 hover:text-[var(--turquesa-500)]/50 dark:text-[var(--text-muted)] dark:hover:text-[var(--turquesa-500)]'
              }`}
            >
              <Star className={`h-8 w-8 ${rating >= star ? 'animate-pulse fill-current' : ''}`} />
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          aria-label="Comentario adicional para la encuesta"
          rows={2}
          className="mb-6 w-full rounded-2xl border-none bg-[var(--bg-card)] p-4 text-xs font-medium text-[var(--text-primary)] shadow-sm outline-none placeholder:text-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--turquesa-500)]/10"
          placeholder="Tienes algun comentario adicional? (Opcional)"
        />

        <button
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
          className="min-w-[200px] rounded-[1.5rem] bg-gradient-to-r from-[var(--turquesa-500)] to-[var(--verde-500)] px-12 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-[var(--turquesa-500)]/20 transition-all hover:opacity-90 active:scale-95 disabled:bg-[var(--bg-secondary)] disabled:text-[var(--text-secondary)] disabled:shadow-none"
        >
          {isSubmitting ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'Enviar encuesta y finalizar'}
        </button>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusLabels: Record<string, string> = {
  open: 'Abierto',
  in_progress: 'En Proceso',
  resolved: 'Resuelto',
  closed: 'Cerrado',
  reopened: 'Reabierto',
};

function compareMessagesChronologically(
  left: UnifiedMessage,
  right: UnifiedMessage,
): number {
  const leftId = Number(left.id);
  const rightId = Number(right.id);
  if (Number.isFinite(leftId) && Number.isFinite(rightId) && leftId !== rightId) return leftId - rightId;

  const leftTime = left.timestamp instanceof Date ? left.timestamp.getTime() : Number.NaN;
  const rightTime = right.timestamp instanceof Date ? right.timestamp.getTime() : Number.NaN;
  if (Number.isFinite(leftTime) && Number.isFinite(rightTime) && leftTime !== rightTime) return leftTime - rightTime;

  return 0;
}

function StatusBadge({ status }: { status: TicketStatus }) {
  const statusClasses: Record<string, string> = {
    open: 'bg-emerald-400 text-white',
    in_progress: 'bg-lime-400 text-white',
    resolved: 'bg-[var(--turquesa-500)] text-white',
    closed: 'bg-red-500 text-white',
    reopened: 'bg-amber-400 text-white',
  };
  return (
    <span className={`rounded-md px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider ${statusClasses[status]}`}>
      {statusLabels[status]}
    </span>
  );
}

// ─── ChatView ─────────────────────────────────────────────────────────────────

export function ChatView({
  ticket,
  onSendMessage,
  onCloseTicket,
  onSubmitSurvey,
  onPriorityChange,
  onAdminChange,
  onEscalate,
  onBack,
  onLoadMore,
  isSending = false,
  isClosing = false,
  isLoadingMore = false,
  hasMoreMessages = false,
  showAdminControls = false,
  quickReplies = EMPTY_QUICK_REPLIES,
}: ChatViewProps) {
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const msgContainerRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);
  const isLoadingMoreRef = useRef(isLoadingMore);
  isLoadingMoreRef.current = isLoadingMore;

  const defaultQuickReplies = [
    'Estamos revisando tu caso.',
    'El problema fue escalado al area tecnica.',
    'Por favor adjunta evidencia adicional.',
    'Solicitud resuelta. Podrias confirmar si estas conforme?',
    'Hemos verificado sus documentos y estan correctos.',
  ];
  const effectiveQuickReplies = quickReplies.length > 0 ? quickReplies : defaultQuickReplies;

  const messages = useMemo(
    () => [...ticket.messages].sort(compareMessagesChronologically).map(toMessage),
    [ticket.messages],
  );

  const isClosed = ticket.status === 'closed';
  const showInput = !isClosed && !ticket.surveyRequired;
  const showAdminPanel = showAdminControls && onPriorityChange && onAdminChange;

  const requesterRole = ticket.requester.company ? 'Vendedor' : 'Cliente';

  // Scroll to bottom when ticket changes or new messages arrive (skip during load-more)
  useEffect(() => {
    if (prevScrollHeightRef.current !== 0) return;
    bottomAnchorRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [ticket.id, ticket.messages.length]);

  // Capture scroll height BEFORE load-more renders older messages
  useEffect(() => {
    if (!isLoadingMore) return;
    const container = msgContainerRef.current;
    if (container) prevScrollHeightRef.current = container.scrollHeight;
  }, [isLoadingMore]);

  // Restore scroll position AFTER older messages are prepended
  useEffect(() => {
    const container = msgContainerRef.current;
    if (!container || prevScrollHeightRef.current === 0) return;
    const added = container.scrollHeight - prevScrollHeightRef.current;
    if (added > 0) container.scrollTop += added;
    prevScrollHeightRef.current = 0;
  }, [ticket.messages.length]);

  const handleScroll = useCallback(() => {
    const container = msgContainerRef.current;
    if (!container || !onLoadMore || !hasMoreMessages || isLoadingMoreRef.current) return;
    if (container.scrollTop < 80) onLoadMore();
  }, [onLoadMore, hasMoreMessages]);

  const handleQuickReply = (reply: string) => {
    if (isSending) return;
    onSendMessage({ text: reply, isQuick: true });
    setShowQuickReplies(false);
  };

  return (
    <div className="relative flex h-full flex-1 min-h-0 flex-col overflow-hidden border-[var(--border-subtle)] bg-[var(--bg-card)] overscroll-y-none md:rounded-[2rem] md:border md:shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)] md:dark:shadow-[0_24px_52px_-34px_rgba(0,0,0,0.65)] lg:rounded-[2.5rem]">
      {/* Barra Lyrium */}
      <div className="h-1 w-full shrink-0 bg-gradient-to-r from-[#9cb04e] via-[#64c695] to-[#499bbf]" />

      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/90 px-3 py-3 backdrop-blur-sm sm:px-4">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Volver a tickets"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9cb04e] via-[#64c695] to-[#499bbf] text-white shadow-md shadow-[#64c695]/20 dark:shadow-black/20">
          {ticket.escalated ? <ShieldCheck className="h-4 w-4" /> : <Headset className="h-4 w-4" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-black text-[var(--turquesa-500)]">{ticket.displayId}</span>
            <StatusBadge status={ticket.status} />
            {ticket.surveyRequired && (
              <span className="rounded-md bg-amber-500 px-1.5 py-0.5 text-[8px] font-black uppercase text-white">
                Encuesta
              </span>
            )}
          </div>
          <h2 className="line-clamp-1 text-sm font-black leading-tight tracking-tight text-[var(--text-primary)] [overflow-wrap:anywhere]">
            {ticket.title}
          </h2>
          <p className="line-clamp-1 text-[10px] font-bold text-[var(--text-muted)]">
            {ticket.requester.name}{ticket.requester.company ? ` · ${ticket.requester.company}` : ''}
          </p>
        </div>

        <div className="flex shrink-0 gap-1.5">
          {showAdminPanel && onEscalate && (
            <button
              onClick={onEscalate}
              aria-label="Escalar caso"
              title="Escalar Caso"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-amber-500 transition-all hover:bg-[var(--bg-hover)]"
            >
              <AlertTriangle className="h-4 w-4" />
            </button>
          )}
          {onCloseTicket && !isClosed && (
            <button
              onClick={onCloseTicket}
              disabled={isClosing}
              aria-label="Cerrar ticket"
              title="Cerrar Ticket"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-danger)] text-[var(--text-danger)] transition-all hover:opacity-80 disabled:opacity-50"
            >
              <CheckSquare className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={msgContainerRef}
        onScroll={handleScroll}
        className={`flex-1 min-h-0 overflow-y-auto overscroll-y-contain ${scrollbarClass}`}
        style={{ background: 'linear-gradient(160deg, color-mix(in srgb,#9cb04e 6%,var(--bg-secondary)) 0%, var(--bg-card) 45%, color-mix(in srgb,#499bbf 5%,var(--bg-card)) 100%)' }}
      >
        {isLoadingMore && (
          <div className="flex justify-center pb-2 pt-3">
            <div className="flex items-center gap-2 rounded-full bg-[var(--bg-secondary)] px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
              <Loader2 className="h-3 w-3 animate-spin" />
              Cargando mensajes anteriores...
            </div>
          </div>
        )}
        {hasMoreMessages && !isLoadingMore && (
          <div className="flex justify-center pb-2 pt-3">
            <button
              type="button"
              onClick={onLoadMore}
              className="rounded-full bg-[var(--bg-secondary)] px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--turquesa-500)] transition hover:bg-[var(--bg-hover)]"
            >
              Cargar mensajes anteriores
            </button>
          </div>
        )}

        <MessageBubble
          messages={messages}
          isSentOverride={helpdeskIsSent}
          meta={{
            currentUserName: ticket.requester.name,
            currentUserRole: requesterRole,
            otherName: ticket.assignedTo.name,
            otherRole: 'Soporte Lyrium',
            showAvatar: true,
          }}
        />

        {ticket.surveyRequired && onSubmitSurvey && (
          <SurveyArea onSubmit={onSubmitSurvey} />
        )}
        <div ref={bottomAnchorRef} />
      </div>

      {/* Bottom bar: admin controls + quick replies + input */}
      <div className="sticky bottom-0 z-10 flex shrink-0 flex-col gap-3 border-t border-[var(--border-subtle)] bg-[var(--bg-card)]/95 p-3 backdrop-blur sm:p-4">
        {showAdminPanel && (
          <>
            <button
              type="button"
              onClick={() => setShowOptions(!showOptions)}
              className="w-fit text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] hover:underline"
            >
              {showOptions ? 'Ocultar opciones' : 'Opciones del ticket'}
            </button>
            {showOptions && (
              <div className="flex flex-col gap-3 rounded-lg bg-[var(--bg-secondary)] p-3 text-xs sm:flex-row sm:items-center sm:gap-4">
                {onPriorityChange && ticket.priority && (
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                    <span className="text-[9px] font-black uppercase text-[var(--text-muted)]">Prioridad:</span>
                    <select
                      value={ticket.priority}
                      onChange={(e) => onPriorityChange(ticket.id, e.target.value as TicketPriority)}
                      className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] p-2 text-xs font-black text-[var(--text-primary)] sm:px-2 sm:py-1"
                    >
                      <option value="Baja">Baja</option>
                      <option value="Media">Media</option>
                      <option value="Alta">Alta</option>
                      <option value="Crítica">Critica</option>
                    </select>
                  </div>
                )}
                <div className="hidden h-4 w-px bg-[var(--border-subtle)] sm:block" />
                {onAdminChange && (
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                    <span className="text-[9px] font-black uppercase text-[var(--text-muted)]">Asignado:</span>
                    <select
                      value={ticket.assignedTo.id}
                      onChange={(e) => onAdminChange(ticket.id, e.target.value)}
                      className="max-w-full truncate rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] p-2 text-xs font-black text-[var(--text-primary)] sm:max-w-[140px] sm:px-2 sm:py-1"
                    >
                      <option value={ticket.assignedTo.id}>{ticket.assignedTo.name}</option>
                    </select>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {showInput ? (
          <>
            <button
              type="button"
              onClick={() => setShowQuickReplies(!showQuickReplies)}
              className="w-fit text-[9px] font-black uppercase tracking-[0.2em] text-[var(--turquesa-500)] transition hover:text-[var(--verde-500)]"
            >
              {showQuickReplies ? 'Ocultar respuestas' : 'Respuestas rapidas'}
            </button>

            {showQuickReplies && (
              <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto rounded-[1.25rem] border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/85 p-2">
                {effectiveQuickReplies.map((qr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickReply(qr)}
                    className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1.5 text-[10px] font-bold text-[var(--text-secondary)] transition-all hover:border-[var(--turquesa-500)]/30 hover:bg-[var(--turquesa-500)]/5 hover:text-[var(--turquesa-500)] dark:hover:border-[var(--turquesa-500)]/20 dark:hover:bg-[var(--bg-hover)] dark:hover:text-[var(--turquesa-500)]"
                  >
                    {qr.length > 42 ? `${qr.substring(0, 42)}...` : qr}
                  </button>
                ))}
              </div>
            )}

            <MessageInput
              onSend={(text, files) => onSendMessage({ text, attachments: files })}
              disabled={isSending}
              placeholder="Escribe una respuesta..."
            />
          </>
        ) : isClosed && !ticket.surveyRequired && (
          <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
              Este ticket ha sido resuelto y archivado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
