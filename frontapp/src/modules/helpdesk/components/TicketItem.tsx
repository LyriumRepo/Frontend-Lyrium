'use client';

import React from 'react';
import { TicketItemProps } from '../types';

const statusConfig: Record<string, { label: string; class: string }> = {
  open:       { label: 'Abierto',   class: 'bg-emerald-400/15 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400' },
  Abierto:    { label: 'Abierto',   class: 'bg-emerald-400/15 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400' },
  abierto:    { label: 'Abierto',   class: 'bg-emerald-400/15 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400' },
  in_progress:  { label: 'En Proceso', class: 'bg-lime-400/15 text-lime-700 dark:bg-lime-400/10 dark:text-lime-400' },
  'En Proceso': { label: 'En Proceso', class: 'bg-lime-400/15 text-lime-700 dark:bg-lime-400/10 dark:text-lime-400' },
  proceso:      { label: 'En Proceso', class: 'bg-lime-400/15 text-lime-700 dark:bg-lime-400/10 dark:text-lime-400' },
  resolved:  { label: 'Resuelto', class: 'bg-[var(--turquesa-500)]/10 text-[var(--turquesa-500)]' },
  Resuelto:  { label: 'Resuelto', class: 'bg-[var(--turquesa-500)]/10 text-[var(--turquesa-500)]' },
  resuelto:  { label: 'Resuelto', class: 'bg-[var(--turquesa-500)]/10 text-[var(--turquesa-500)]' },
  closed:  { label: 'Cerrado', class: 'bg-red-500/10 text-red-500' },
  Cerrado: { label: 'Cerrado', class: 'bg-red-500/10 text-red-500' },
  cerrado: { label: 'Cerrado', class: 'bg-red-500/10 text-red-500' },
  reopened:  { label: 'Reabierto', class: 'bg-amber-400/15 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400' },
  Reabierto: { label: 'Reabierto', class: 'bg-amber-400/15 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400' },
  reabierto: { label: 'Reabierto', class: 'bg-amber-400/15 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400' },
};

const priorityColors: Record<string, string> = {
  Baja: 'bg-slate-400', baja: 'bg-slate-400',
  Media: 'bg-amber-400', media: 'bg-amber-400',
  Alta: 'bg-orange-500', alta: 'bg-orange-500',
  Critica: 'bg-red-500', critica: 'bg-red-500',
  Crítica: 'bg-red-500',
};

// Mismos colores de marca que usa el módulo de planes del vendedor
// (features/seller/plans/lib/plans.ts → cssColor de cada plan).
const planColors: Record<string, string> = {
  emprende: '#9cb04e',
  crece: '#64c695',
  especial: '#499bbf',
};

function getPlanBadge(plan?: string) {
  if (!plan) return null;
  const color = planColors[plan.trim().toLowerCase()] ?? '#94a3b8';
  return { label: plan, color };
}

const avatarGradients = [
  'from-sky-400 to-blue-500',
  'from-emerald-400 to-teal-500',
  'from-violet-400 to-purple-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500',
  'from-cyan-400 to-sky-500',
];

export function TicketItem({ ticket, isActive, onClick, showPriority = true }: TicketItemProps) {
  const status = statusConfig[ticket.status] || statusConfig.open;
  const hasUnread = ticket.unreadCount > 0 && !isActive;

  const displayName = ticket.requester.company || ticket.requester.name;
  const initial = displayName.charAt(0).toUpperCase();
  const avatarGrad = avatarGradients[parseInt(ticket.id, 10) % avatarGradients.length] ?? avatarGradients[0];
  const planBadge = getPlanBadge(ticket.requester.plan);

  return (
    <button
      type="button"
      onClick={() => onClick(ticket.id)}
      className={`w-full px-5 py-3.5 border-b border-[var(--border-subtle)] text-left transition-all duration-200 relative group ${
        isActive
          ? 'bg-[var(--turquesa-500)]/10'
          : 'hover:bg-[var(--turquesa-500)]/5 hover:pl-7'
      }`}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-[var(--turquesa-500)] rounded-r-full" />
      )}

      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={`w-9 h-9 shrink-0 rounded-full bg-gradient-to-br ${avatarGrad} flex items-center justify-center text-white font-black text-sm shadow-sm transition-transform duration-200 group-hover:scale-105`}>
          {initial}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Row 1: name + time */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-black truncate text-[var(--text-primary)] uppercase tracking-tight">
              {displayName}
            </p>
            <span className="text-[9px] text-[var(--text-muted)] shrink-0 font-medium">
              {ticket.updatedAt}
            </span>
          </div>

          {/* Row 2: ticket id + status badge */}
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[9px] font-black text-[var(--turquesa-500)]">#{ticket.displayId}</span>
            <span className={`rounded px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider ${status.class}`}>
              {status.label}
            </span>
            {planBadge && (
              <span
                className="rounded px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider"
                style={{ backgroundColor: `${planBadge.color}26`, color: planBadge.color }}
                title={`Plan ${planBadge.label}`}
              >
                {planBadge.label}
              </span>
            )}
            {showPriority && ticket.priority && (
              <span className={`h-1.5 w-1.5 rounded-full ${priorityColors[ticket.priority] ?? 'bg-slate-400'}`} title={ticket.priority} />
            )}
          </div>

          {/* Row 3: title + unread badge */}
          <div className="flex items-center justify-between mt-1.5 gap-2">
            <p className={`text-[10px] leading-relaxed truncate ${
              hasUnread
                ? 'font-bold text-[var(--text-primary)]'
                : 'font-medium text-[var(--text-secondary)]'
            }`}>
              {ticket.title}
            </p>
            {hasUnread && (
              <span className="ml-1 px-1.5 py-0.5 bg-[var(--turquesa-500)] text-white text-[9px] font-black rounded-full min-w-[18px] text-center leading-none shrink-0">
                {ticket.unreadCount > 99 ? '99+' : ticket.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
