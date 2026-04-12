'use client';

import React from 'react';
import { TicketType } from '@/features/seller/help/types';
import { TicketItem } from '@/modules/helpdesk';
import Icon from '@/components/ui/Icon';
import { UnifiedTicketListItem } from '@/modules/helpdesk/types';

interface TicketFilters {
    search: string;
    category?: TicketType | 'all' | 'critical' | 'tech-critical';
}

interface TicketSidebarProps {
    tickets: UnifiedTicketListItem[];
    activeTicketId: string | null;
    filters: TicketFilters;
    onSetFilters: (filters: Partial<TicketFilters>) => void;
    onSetActiveTicket: (id: string | null) => void;
    onNewTicket: () => void;
}

export default function TicketSidebar({ tickets, activeTicketId, filters, onSetFilters, onSetActiveTicket, onNewTicket }: TicketSidebarProps) {
    return (
        <div className="flex h-full flex-1 min-h-0 flex-col overflow-hidden rounded-[1.9rem] border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)] dark:shadow-[0_22px_48px_-34px_rgba(0,0,0,0.65)]">
            {/* Search & Filter Header */}
            <div className="space-y-2.5 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/80 p-3 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-500">
                        Tickets de soporte
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                            {tickets.length}
                        </span>
                        <button
                            onClick={onNewTicket}
                            aria-label="Crear nuevo ticket"
                            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-sky-600 transition-all hover:border-sky-200 hover:bg-sky-50 dark:hover:border-[var(--border-focus)] dark:hover:bg-[var(--bg-hover)] active:scale-95"
                        >
                            <Icon name="PlusCircle" className="font-bold w-3 h-3" />
                            Nuevo
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] font-bold w-4 h-4" />
                    <input
                        type="text"
                        aria-label="Buscar ticket o ID"
                        placeholder="Buscar ticket o ID..."
                        value={filters.search}
                        onChange={(e) => onSetFilters({ search: e.target.value })}
                        className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-input)] py-2.5 pl-10 pr-4 text-xs font-bold text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-secondary)] focus:border-sky-200 dark:focus:border-[var(--border-focus)]"
                    />
                </div>

                <select
                    aria-label="Filtrar tickets por categoria"
                    value={filters.category}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onSetFilters({ category: e.target.value as TicketFilters['category'] })}
                    className="w-full cursor-pointer rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-input)] px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] outline-none transition-all focus:border-sky-200 dark:focus:border-[var(--border-focus)]"
                >
                    <option value="all">Todas las Categorías</option>
                    <option value="tech">Soporte Técnico</option>
                    <option value="payments">Pagos / Facturas</option>
                    <option value="documentation">Trámites</option>
                    <option value="critical">🆘 Críticos</option>
                </select>
            </div>

            {/* List */}
            <div className="flex-1 min-h-0 space-y-2.5 overflow-y-auto overscroll-y-contain bg-[var(--bg-secondary)]/38 p-3 custom-scrollbar">
                {tickets.length === 0 ? (
                    <div className="rounded-[1.75rem] border border-dashed border-[var(--border-subtle)] bg-[var(--bg-secondary)]/60 py-10 text-center opacity-70">
                        <Icon name="FolderOpen" className="text-4xl mb-2 mx-auto block font-bold w-10 h-10" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Sin resultados</p>
                    </div>
                ) : (
                    tickets.map(ticket => (
                        <TicketItem
                            key={ticket.id}
                            ticket={ticket}
                            isActive={activeTicketId === ticket.id}
                            onClick={(id) => onSetActiveTicket(id)}
                            showCategory={true}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
