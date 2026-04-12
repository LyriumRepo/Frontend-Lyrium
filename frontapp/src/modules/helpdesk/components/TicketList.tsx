'use client';

import React from 'react';
import { useId } from 'react';
import { TicketListProps, TicketFilters, TicketStatus, TicketPriority } from '../types';
import { TicketItem } from './TicketItem';
import { Search } from 'lucide-react';

const scrollbarClass = 'scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent';

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
          <div className="p-4 border-b border-[var(--border-subtle)]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-4 h-4" aria-hidden="true" />
              <label htmlFor={searchId} className="sr-only">Buscar tickets</label>
              <input
                id={searchId}
                type="text"
                placeholder="Buscar por #Ticket, Vendedor o Asunto..."
                value={filters.search}
                onChange={(e) => onFilterChange({ search: e.target.value })}
                aria-label="Buscar tickets por número, vendedor o asunto"
                className="w-full pl-12 pr-4 py-3 bg-[var(--bg-input)] border-none rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 p-4 border-b border-[var(--border-subtle)] sm:grid-cols-2 sm:gap-4">
            <div>
              <label htmlFor={statusId} className="sr-only">Filtrar por estado</label>
              <select
                id={statusId}
                value={filters.status}
                onChange={(e) => onFilterChange({ status: e.target.value as TicketStatus | '' })}
                aria-label="Filtrar por estado"
                className="w-full px-4 py-3 bg-[var(--bg-input)] border-none rounded-xl text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider"
              >
                <option value="">Todos los Estados</option>
                <option value="open">Abierto</option>
                <option value="in_progress">En Proceso</option>
                <option value="resolved">Resuelto</option>
                <option value="closed">Cerrado</option>
              </select>
            </div>
            {showPriority && (
              <div>
                <label htmlFor={priorityId} className="sr-only">Filtrar por prioridad</label>
                <select
                  id={priorityId}
                  value={filters.priority}
                  onChange={(e) => onFilterChange({ priority: e.target.value as TicketPriority | '' })}
                  aria-label="Filtrar por prioridad"
                  className="w-full px-4 py-3 bg-[var(--bg-input)] border-none rounded-xl text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider"
                >
                  <option value="">Todas las Prioridades</option>
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

      <div className={`flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 ${scrollbarClass}`}>
        <div className="flex items-center justify-between px-1 sm:px-2 mb-2">
          <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
            {tickets.length} Casos
          </h3>
        </div>
        
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
          <div className="p-10 text-center text-[var(--text-muted)] font-bold italic text-sm">
            No se encontraron casos con los filtros aplicados
          </div>
        )}
      </div>
    </div>
  );
}
