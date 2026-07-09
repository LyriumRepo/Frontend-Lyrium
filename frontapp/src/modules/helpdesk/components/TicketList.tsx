'use client';

import React, { useId } from 'react';
import { TicketListProps, TicketFilters, TicketStatus, TicketPriority } from '../types';
import { TicketItem } from './TicketItem';
import { Search } from 'lucide-react';

const scrollbarClass = 'custom-scrollbar scrollbar-thin';

const defaultFilters: TicketFilters = {
  search: '',
  status: '',
  priority: '',
};

export function TicketList({
  tickets,
  selectedId,
  onSelect,
  onFilterChange,
  filters = defaultFilters,
  className = '',
  showFilters = true,
  showPriority = true,
}: TicketListProps) {
  const searchId = useId();
  const statusId = useId();
  const priorityId = useId();

  return (
    <div className={`w-full lg:w-5/12 bg-[var(--bg-card)] rounded-[2rem] lg:rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm overflow-hidden flex flex-col min-h-[calc(100vh-13rem)] lg:min-h-0 lg:h-full ${className}`}>
      {showFilters && (
        <>
          <div className="px-5 py-4 border-b border-[var(--border-subtle)] shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)]">Tickets</h3>
                <p className="text-[10px] font-medium text-[var(--text-secondary)] mt-0.5">{tickets.length} casos</p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-3.5 h-3.5" aria-hidden="true" />
              <label htmlFor={searchId} className="sr-only">Buscar tickets</label>
              <input
                id={searchId}
                type="text"
                placeholder="Buscar por ticket, vendedor o asunto..."
                value={filters.search}
                onChange={(e) => onFilterChange({ search: e.target.value })}
                aria-label="Buscar tickets por número, vendedor o asunto"
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-xs font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[var(--turquesa-500)]/20 outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2 px-5 py-3 border-b border-[var(--border-subtle)] shrink-0">
            <div className="flex-1">
              <label htmlFor={statusId} className="sr-only">Filtrar por estado</label>
              <select
                id={statusId}
                value={filters.status}
                onChange={(e) => onFilterChange({ status: e.target.value as TicketStatus | '' })}
                aria-label="Filtrar por estado"
                className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-wider outline-none focus:ring-2 focus:ring-[var(--turquesa-500)]/20"
              >
                <option value="">Todos los estados</option>
                <option value="open">Abierto</option>
                <option value="in_progress">En Proceso</option>
                <option value="resolved">Resuelto</option>
                <option value="closed">Cerrado</option>
              </select>
            </div>
            {showPriority && (
              <div className="flex-1">
                <label htmlFor={priorityId} className="sr-only">Filtrar por prioridad</label>
                <select
                  id={priorityId}
                  value={filters.priority}
                  onChange={(e) => onFilterChange({ priority: e.target.value as TicketPriority | '' })}
                  aria-label="Filtrar por prioridad"
                  className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-wider outline-none focus:ring-2 focus:ring-[var(--turquesa-500)]/20"
                >
                  <option value="">Todas las prioridades</option>
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                  <option value="Crítica">Crítica</option>
                </select>
              </div>
            )}
          </div>
        </>
      )}

      <div className={`flex-1 overflow-y-auto ${scrollbarClass}`} role="listbox" aria-label="Lista de tickets">
        {tickets.map((ticket) => (
          <TicketItem
            key={ticket.id}
            ticket={ticket}
            isActive={selectedId === ticket.id}
            onClick={onSelect}
            showPriority={showPriority}
          />
        ))}

        {tickets.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-center px-6">
            <p className="text-xs text-[var(--text-muted)] font-black uppercase tracking-widest">
              Sin casos encontrados
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
