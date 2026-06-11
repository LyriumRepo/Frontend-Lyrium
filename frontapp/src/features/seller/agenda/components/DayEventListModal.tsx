'use client';

import React, { useState, useMemo } from 'react';
import ModalPortal from '@/components/ModalPortal';
import Icon from '@/components/ui/Icon';
import type { AgendaEvent, AgendaFilterType } from '@/features/seller/agenda/types';

interface DayEventListModalProps {
    isOpen: boolean;
    date: Date | null;
    allEvents: AgendaEvent[];
    onClose: () => void;
    onSelectEvent: (eventId: string) => void;
}

const ITEMS_PER_PAGE = 8;

const typeIcons: Record<string, string> = { order: 'Package', service: 'Clock' };

function getStatusBadge(event: AgendaEvent): { label: string; class: string } {
    const ORDER_STATUS_MAP: Record<string, { label: string; class: string }> = {
        pending_seller: { label: 'Pendiente', class: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
        confirmed: { label: 'Confirmado', class: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
        processing: { label: 'Procesando', class: 'bg-sky-500/10 text-sky-500 border-sky-500/20' },
        shipped: { label: 'Enviado', class: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
        delivered: { label: 'Entregado', class: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
        cancelled: { label: 'Cancelado', class: 'bg-red-500/10 text-red-500 border-red-500/20' },
    };
    const BOOKING_STATUS_MAP: Record<string, { label: string; class: string }> = {
        pending: { label: 'Reservado', class: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
        confirmed: { label: 'Confirmado', class: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
        completed: { label: 'Completado', class: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
        cancelled: { label: 'Cancelado', class: 'bg-red-500/10 text-red-500 border-red-500/20' },
        no_show: { label: 'No Asistió', class: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
    };
    if (event.type === 'order') {
        const status = event.order_status ?? 'pending_seller';
        return ORDER_STATUS_MAP[status] ?? { label: status, class: 'bg-gray-500/10 text-gray-500 border-gray-500/20' };
    }
    return BOOKING_STATUS_MAP[event.status] ?? { label: event.status, class: 'bg-gray-500/10 text-gray-500 border-gray-500/20' };
}

export default function DayEventListModal({ isOpen, date, allEvents, onClose, onSelectEvent }: DayEventListModalProps) {
    const [filterType, setFilterType] = useState<AgendaFilterType>('all');
    const [page, setPage] = useState(1);

    const dateStr = useMemo(() => {
        return date ? date.toISOString().split('T')[0] : '';
    }, [date]);

    const dayEvents = useMemo(() => {
        return allEvents.filter(e => e.date === dateStr);
    }, [allEvents, dateStr]);

    const filteredEvents = useMemo(() => {
        if (filterType === 'all') return dayEvents;
        const typeMap: Record<string, string> = { orders: 'order', services: 'service' };
        const targetType = typeMap[filterType];
        if (!targetType) return dayEvents;
        return dayEvents.filter(e => e.type === targetType);
    }, [dayEvents, filterType]);

    const serviceEvents = useMemo(() => dayEvents.filter(e => e.type === 'service'), [dayEvents]);
    const orderEvents = useMemo(() => dayEvents.filter(e => e.type === 'order'), [dayEvents]);

    const totalPages = Math.max(1, Math.ceil(filteredEvents.length / ITEMS_PER_PAGE));
    const safePage = Math.min(page, totalPages);
    const paginatedEvents = filteredEvents.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

    if (!isOpen || !date) return null;

    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const dateLabel = date.toLocaleDateString('es-ES', options);

    const filterOptions: { value: AgendaFilterType; label: string; icon: string }[] = [
        { value: 'all', label: 'Todos', icon: 'Calendar' },
        { value: 'orders', label: 'Pedidos', icon: 'Package' },
        { value: 'services', label: 'Servicios', icon: 'Clock' },
    ];

    return (
        <ModalPortal>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-0 sm:p-6">
                <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={onClose} />
                <div className="relative w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-2xl bg-[var(--bg-card)] rounded-none sm:rounded-[2.5rem] flex flex-col overflow-hidden sm:border sm:border-[var(--border-subtle)] sm:shadow-2xl">
                    {/* Header */}
                    <div className="p-5 sm:p-8 flex items-center justify-between border-b border-[var(--border-subtle)]/50 shrink-0">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tighter">{dateLabel}</h2>
                            <p className="text-[10px] sm:text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-1">
                                {dayEvents.length} Actividades Programadas
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl hover:bg-[var(--bg-danger)] hover:text-[var(--text-danger)] transition-all active:scale-90 shrink-0"
                            aria-label="Cerrar"
                        >
                            <Icon name="X" className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Metrics + Filter */}
                    <div className="px-5 sm:px-8 pt-5 space-y-4 shrink-0">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-sky-500/10 p-4 rounded-2xl border border-sky-500/20 flex items-center justify-between">
                                <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">Servicios</span>
                                <span className="text-xl font-black text-[var(--text-primary)]">{serviceEvents.length}</span>
                            </div>
                            <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20 flex items-center justify-between">
                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Pedidos</span>
                                <span className="text-xl font-black text-[var(--text-primary)]">{orderEvents.length}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-[var(--bg-secondary)]/50 p-1 rounded-xl border border-[var(--border-subtle)] w-fit">
                            {filterOptions.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => { setFilterType(opt.value); setPage(1); }}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5
                                        ${filterType === opt.value
                                            ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm border border-[var(--border-subtle)]'
                                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                        }`}
                                >
                                    <Icon name={opt.icon} className="w-3 h-3" />
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Event List */}
                    <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-2.5 custom-scrollbar">
                        {paginatedEvents.length > 0 ? (
                            paginatedEvents.map(event => {
                                const badge = getStatusBadge(event);
                                return (
                                    <button
                                        key={event.id}
                                        onClick={() => onSelectEvent(event.id)}
                                        className="w-full text-left p-4 rounded-2xl bg-[var(--bg-secondary)]/50 border border-[var(--border-subtle)] hover:border-sky-500/30 hover:bg-sky-500/5 transition-all group"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border
                                                ${event.type === 'order'
                                                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                    : 'bg-sky-500/10 text-sky-500 border-sky-500/20'
                                                }`}>
                                                <Icon name={typeIcons[event.type]} className="w-5 h-5 fill-current" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-[var(--text-primary)] truncate">{event.title}</p>
                                                        <p className="text-[11px] font-bold text-[var(--text-secondary)] mt-0.5">
                                                            {event.time} - {event.subtitle}
                                                        </p>
                                                    </div>
                                                    <span className={`shrink-0 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${badge.class}`}>
                                                        {badge.label}
                                                    </span>
                                                </div>
                                            </div>
                                            <Icon name="ChevronRight" className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-sky-500 transition-colors mt-2 shrink-0" />
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="py-16 flex flex-col items-center justify-center text-center gap-4 bg-[var(--bg-secondary)]/30 rounded-2xl border-2 border-dashed border-[var(--border-subtle)]">
                                <div className="w-14 h-14 bg-[var(--bg-card)] rounded-2xl flex items-center justify-center border border-[var(--border-subtle)]">
                                    <Icon name="Calendar" className="text-2xl text-[var(--text-secondary)] w-7 h-7" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">Día Despejado</p>
                                    <p className="text-[10px] font-bold text-[var(--text-secondary)] italic">Sin operaciones programadas</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-5 sm:px-8 pb-5 flex items-center justify-between shrink-0">
                            <span className="text-xs font-bold text-[var(--text-secondary)]">
                                Pág. {safePage} de {totalPages} ({filteredEvents.length} registros)
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={safePage <= 1}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <Icon name="ChevronLeft" className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={safePage >= totalPages}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <Icon name="ChevronRight" className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ModalPortal>
    );
}
