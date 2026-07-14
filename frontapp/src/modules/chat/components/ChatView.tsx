'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChatViewProps, TicketStatus, TicketPriority, UnifiedMessage } from '../types';
import MessageBubble, { Message } from '@/components/shared/chat/MessageBubble';
import MessageInput from '@/components/shared/chat/MessageInput';
import { AlertTriangle, ArrowLeft, CheckSquare, Headset, Loader2, MessageSquareText, ShieldCheck, Star, SlidersHorizontal, UserCog } from 'lucide-react';

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
  const [showPriorityPopover, setShowPriorityPopover] = useState(false);
  const [showAssigneePopover, setShowAssigneePopover] = useState(false);
  const msgContainerRef = useRef<HTMLDivElement>(null);
  const priorityRef = useRef<HTMLDivElement>(null);
  const assigneeRef = useRef<HTMLDivElement>(null);
  const quickRepliesRef = useRef<HTMLDivElement>(null);
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

  const isSentFn = useMemo(() => {
    if (ticket.source === 'seller' || ticket.source === 'logistics') {
      return (msg: Message) => msg.sender === 'vendor' || msg.sender === 'user';
    }
    return (msg: Message) => msg.sender === 'admin' || msg.sender === 'logistics';
  }, [ticket.source]);

  const metaConfig = useMemo(() => {
    if (ticket.source === 'seller') {
      return {
        currentUserName: 'Tú',
        currentUserRole: 'Vendedor',
        otherName: ticket.assignedTo.name,
        otherRole: 'Soporte Lyrium',
        showAvatar: true,
      };
    }
    if (ticket.source === 'logistics') {
      return {
        currentUserName: 'Tú',
        currentUserRole: 'Operador',
        otherName: ticket.assignedTo.name,
        otherRole: 'Soporte Lyrium',
        showAvatar: true,
      };
    }
    const requesterRole = ticket.requester.company ? 'Vendedor' : 'Cliente';
    return {
      currentUserName: ticket.assignedTo.name,
      currentUserRole: 'Soporte Lyrium',
      otherName: ticket.requester.name,
      otherRole: requesterRole,
      showAvatar: true,
    };
  }, [ticket.source, ticket.requester.name, ticket.requester.company, ticket.assignedTo.name]);

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

  // Close popovers on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (priorityRef.current && !priorityRef.current.contains(e.target as Node)) setShowPriorityPopover(false);
      if (assigneeRef.current && !assigneeRef.current.contains(e.target as Node)) setShowAssigneePopover(false);
      if (quickRepliesRef.current && !quickRepliesRef.current.contains(e.target as Node)) setShowQuickReplies(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <div className="relative flex flex-col flex-1 min-h-0 w-full overflow-hidden bg-[var(--bg-card)] overscroll-y-none">
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
          isSentOverride={isSentFn}
          meta={metaConfig}
        />

        {ticket.surveyRequired && onSubmitSurvey && (
          <SurveyArea onSubmit={onSubmitSurvey} />
        )}
        <div ref={bottomAnchorRef} />
      </div>

      {/* Bottom bar: compact toolbar + input */}
      <div className="sticky bottom-0 z-10 shrink-0 border-t border-[var(--border-subtle)] bg-[var(--bg-card)]/95 backdrop-blur">
        {/* Admin toolbar — single compact row */}
        {showAdminPanel && showInput && (
          <div className="flex items-center gap-1 border-b border-[var(--border-subtle)]/60 px-3 py-2 sm:px-4">
            {/* Priority */}
            {onPriorityChange && ticket.priority && (
              <div className="relative" ref={priorityRef}>
                <button
                  type="button"
                  onClick={() => { setShowPriorityPopover(!showPriorityPopover); setShowAssigneePopover(false); setShowQuickReplies(false); }}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-bold text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Prioridad</span>
                  <span className={`rounded px-1 py-0.5 text-[7px] font-black uppercase tracking-wider ${
                    ticket.priority === 'Crítica' ? 'bg-red-500/15 text-red-500' :
                    ticket.priority === 'Alta' ? 'bg-amber-500/15 text-amber-600' :
                    ticket.priority === 'Media' ? 'bg-[var(--turquesa-500)]/15 text-[var(--turquesa-500)]' :
                    'bg-emerald-500/15 text-emerald-600'
                  }`}>
                    {ticket.priority}
                  </span>
                </button>
                {showPriorityPopover && (
                  <div className="absolute bottom-full left-0 mb-2 w-36 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-1.5 shadow-xl z-20">
                    {(['Baja', 'Media', 'Alta', 'Crítica'] as TicketPriority[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => { onPriorityChange(ticket.id, p); setShowPriorityPopover(false); }}
                        className={`w-full rounded-lg px-3 py-1.5 text-left text-[11px] font-bold transition-colors ${
                          ticket.priority === p
                            ? 'bg-[var(--turquesa-500)]/10 text-[var(--turquesa-500)]'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="h-4 w-px bg-[var(--border-subtle)]" />

            {/* Assignee */}
            {onAdminChange && (
              <div className="relative" ref={assigneeRef}>
                <button
                  type="button"
                  onClick={() => { setShowAssigneePopover(!showAssigneePopover); setShowPriorityPopover(false); setShowQuickReplies(false); }}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-bold text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <UserCog className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline truncate max-w-[80px]">{ticket.assignedTo.name}</span>
                </button>
                {showAssigneePopover && (
                  <div className="absolute bottom-full left-0 mb-2 w-44 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-1.5 shadow-xl z-20">
                    <button
                      type="button"
                      onClick={() => { onAdminChange(ticket.id, ticket.assignedTo.id); setShowAssigneePopover(false); }}
                      className="w-full rounded-lg px-3 py-1.5 text-left text-[11px] font-bold text-[var(--turquesa-500)] bg-[var(--turquesa-500)]/10"
                    >
                      {ticket.assignedTo.name} (actual)
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="h-4 w-px bg-[var(--border-subtle)]" />

            {/* Quick replies */}
            <div className="relative" ref={quickRepliesRef}>
              <button
                type="button"
                onClick={() => { setShowQuickReplies(!showQuickReplies); setShowPriorityPopover(false); setShowAssigneePopover(false); }}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-bold text-[var(--turquesa-500)] hover:bg-[var(--turquesa-500)]/5 transition-colors"
              >
                <MessageSquareText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Respuestas</span>
              </button>
              {showQuickReplies && (
                <div className="absolute bottom-full left-0 mb-2 w-72 max-h-48 overflow-y-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-2 shadow-xl z-20 custom-scrollbar">
                  <div className="flex flex-wrap gap-1.5">
                    {effectiveQuickReplies.map((qr, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => { handleQuickReply(qr); setShowQuickReplies(false); }}
                        className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-2.5 py-1 text-[9px] font-bold text-[var(--text-secondary)] transition-all hover:border-[var(--turquesa-500)]/30 hover:text-[var(--turquesa-500)]"
                      >
                        {qr.length > 35 ? `${qr.substring(0, 35)}...` : qr}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Input area */}
        {showInput ? (
          <div className="p-3 sm:p-4">
            <MessageInput
              onSend={(text, files) => onSendMessage({ text, attachments: files })}
              disabled={isSending}
              placeholder="Escribe una respuesta..."
            />
          </div>
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
