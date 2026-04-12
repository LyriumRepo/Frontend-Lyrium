'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { TicketItemProps } from '../types';

const statusConfig: Record<string, { label: string; class: string; border: string }> = {
  open: { label: 'Abierto', class: 'bg-emerald-400 text-white', border: 'border-emerald-400' },
  Abierto: { label: 'Abierto', class: 'bg-emerald-400 text-white', border: 'border-emerald-400' },
  abierto: { label: 'Abierto', class: 'bg-emerald-400 text-white', border: 'border-emerald-400' },
  in_progress: { label: 'En Proceso', class: 'bg-lime-400 text-white', border: 'border-lime-400' },
  'En Proceso': { label: 'En Proceso', class: 'bg-lime-400 text-white', border: 'border-lime-400' },
  proceso: { label: 'En Proceso', class: 'bg-lime-400 text-white', border: 'border-lime-400' },
  resolved: { label: 'Resuelto', class: 'bg-sky-500 text-white', border: 'border-sky-500' },
  Resuelto: { label: 'Resuelto', class: 'bg-sky-500 text-white', border: 'border-sky-500' },
  resuelto: { label: 'Resuelto', class: 'bg-sky-500 text-white', border: 'border-sky-500' },
  closed: { label: 'Cerrado', class: 'bg-red-500 text-white', border: 'border-red-500' },
  Cerrado: { label: 'Cerrado', class: 'bg-red-500 text-white', border: 'border-red-500' },
  cerrado: { label: 'Cerrado', class: 'bg-red-500 text-white', border: 'border-red-500' },
  reopened: { label: 'Reabierto', class: 'bg-amber-400 text-white', border: 'border-amber-400' },
  Reabierto: { label: 'Reabierto', class: 'bg-amber-400 text-white', border: 'border-amber-400' },
  reabierto: { label: 'Reabierto', class: 'bg-amber-400 text-white', border: 'border-amber-400' },
};

const priorityColors: Record<string, string> = {
  Baja: 'bg-slate-400',
  baja: 'bg-slate-400',
  Media: 'bg-amber-400',
  media: 'bg-amber-400',
  Alta: 'bg-orange-500',
  alta: 'bg-orange-500',
  Critica: 'bg-red-500',
  critica: 'bg-red-500',
};

const categoryLabels: Record<string, { label: string; color: string }> = {
  tech: { label: 'Tecnico', color: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300' },
  admin: { label: 'Admin', color: 'bg-slate-500/10 text-slate-600 dark:bg-slate-400/15 dark:text-slate-300' },
  info: { label: 'Info', color: 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300' },
  comment: { label: 'Elogio', color: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300' },
  followup: { label: 'Seguimiento', color: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300' },
  payments: { label: 'Pagos', color: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300' },
  documentation: { label: 'Tramites', color: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300' },
};

export function TicketItem({ ticket, isActive, onClick, showPriority = true, showCategory = false }: TicketItemProps) {
  const status = statusConfig[ticket.status] || statusConfig.open;
  const cat = ticket.category ? categoryLabels[ticket.category] : null;
  const hasUnreadBadge = ticket.unreadCount > 0 && !isActive;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(ticket.id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(ticket.id); }}
      className={`group cursor-pointer rounded-[1.55rem] border border-transparent border-l-4 bg-[var(--bg-input)]/78 p-4 transition-all hover:border-sky-200 hover:bg-[var(--bg-card)] hover:shadow-[0_18px_36px_-28px_rgba(15,23,42,0.35)] dark:hover:border-[var(--border-focus)] dark:hover:shadow-[0_22px_42px_-30px_rgba(0,0,0,0.7)] ${status.border} ${isActive ? '!border-[var(--border-focus)] !border-l-[var(--border-focus)] !bg-[var(--bg-card)] !shadow-[0_22px_45px_-30px_rgba(15,23,42,0.25)] dark:!shadow-[0_22px_48px_-32px_rgba(0,0,0,0.7)]' : ''}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {showPriority && ticket.priority && (
            <span className={`h-2 w-2 rounded-full ${priorityColors[ticket.priority] || 'bg-slate-400'}`} title={ticket.priority} />
          )}
          <span className="rounded-full bg-sky-500/10 px-2 py-1 text-[10px] font-black uppercase text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
            #{ticket.displayId}
          </span>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1">
          <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider ${status.class}`}>
            {status.label}
          </span>
          {showCategory && cat && (
            <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider ${cat.color}`}>
              {cat.label}
            </span>
          )}
        </div>
      </div>

      <h4
        className={`line-clamp-2 text-sm leading-6 transition-colors [overflow-wrap:anywhere] ${
          hasUnreadBadge
            ? 'font-black text-[var(--text-primary)]'
            : isActive
              ? 'font-black text-[var(--text-primary)]'
              : 'font-semibold text-[var(--text-primary)] group-hover:text-sky-600 dark:group-hover:text-sky-300'
        }`}
      >
        {ticket.title}
      </h4>
      {ticket.description && (
        <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-[var(--text-secondary)] [overflow-wrap:anywhere]">{ticket.description}</p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-3">
        <div className="min-w-0 flex-1">
          <span className="mb-1 block truncate text-[10px] font-black uppercase tracking-[0.18em] text-[var(--text-primary)]">
            {ticket.requester.company || ticket.requester.name}
          </span>
          {showPriority && ticket.priority && (
            <span className="text-[9px] font-bold text-[var(--text-muted)]">Prioridad: {ticket.priority}</span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3 text-[var(--text-muted)]">
          <div className="flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-2 py-1">
            <MessageCircle className="h-4 w-4" />
            <span className="text-[10px] font-black">{ticket.messageCount || 0}</span>
          </div>
          {hasUnreadBadge && (
            <span className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-black leading-none text-white">
              {ticket.unreadCount > 99 ? '99+' : ticket.unreadCount}
            </span>
          )}
          <span className="text-right text-[9px] font-bold text-[var(--text-muted)]">{ticket.updatedAt}</span>
        </div>
      </div>
    </div>
  );
}
