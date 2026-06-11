'use client';

import React, { useState } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import DayActivityModal from './components/DayActivityModal';
import DayEventListModal from './components/DayEventListModal';
import Icon from '@/components/ui/Icon';
import BaseLoading from '@/components/ui/BaseLoading';
import { useAgenda, generateCalendarDays } from '@/features/seller/agenda/hooks/useAgenda';
import type { AgendaFilterType } from '@/features/seller/agenda/types';

export function AgendaPageClient() {
    const { events, currentMonth, isLoading, filterType, setFilterType, nextMonth, prevMonth } = useAgenda();
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const monthDisplay = `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;

    const calendarCells = generateCalendarDays(currentMonth);
    const today = new Date();

    const filterOptions: { value: AgendaFilterType; label: string; icon: string }[] = [
        { value: 'all', label: 'Todos', icon: 'Calendar' },
        { value: 'orders', label: 'Pedidos', icon: 'Package' },
        { value: 'services', label: 'Servicios', icon: 'Clock' },
    ];

    const headerActions = (
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
            <button
                onClick={prevMonth}
                className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-xl transition-all text-white/90"
            >
                <Icon name="ChevronLeft" className="text-xl w-5 h-5 flex-shrink-0" />
            </button>
            <span className="text-[11px] font-black text-white min-w-[120px] text-center uppercase tracking-widest">
                {monthDisplay}
            </span>
            <button
                onClick={nextMonth}
                className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-xl transition-all text-white/90"
            >
                <Icon name="ChevronRight" className="text-xl w-5 h-5 flex-shrink-0" />
            </button>
        </div>
    );

    if (isLoading && events.length === 0) {
        return <BaseLoading message="Sincronizando Agenda..." />;
    }

    return (
        <div className="space-y-8 animate-fadeIn pb-12">
            <ModuleHeader
                title="Mi Agenda"
                subtitle="Gestión cronológica de entregas y compromisos"
                icon="CalendarCheck"
                actions={headerActions}
            />

            {/* Icon Legend & Filter */}
            <div className="flex items-center justify-between px-4 mb-2">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                            <Icon name="Package" className="text-lg w-5 h-5 fill-current" />
                        </div>
                        <span className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">Pedidos</span>
                    </div>
                    <div className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500 border border-sky-500/20">
                            <Icon name="Clock" className="text-lg w-5 h-5 fill-current" />
                        </div>
                        <span className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">Servicios</span>
                    </div>
                </div>
                {/* Filter Tabs */}
                <div className="flex items-center gap-1 bg-[var(--bg-secondary)]/50 p-1 rounded-xl border border-[var(--border-subtle)]">
                    {filterOptions.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setFilterType(opt.value)}
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

            <div className="glass-card !p-0 overflow-hidden border-t-4 border-emerald-500/50 shadow-2xl shadow-emerald-500/10 rounded-[2.5rem] bg-[var(--bg-card)]">
                <div className="grid grid-cols-7 bg-[var(--bg-secondary)]/50 border-b border-[var(--border-subtle)]">
                    {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'].map(dia => (
                        <div key={dia} className="py-5 text-center text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">
                            {dia}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 divide-x divide-y divide-[var(--border-subtle)] min-h-[600px]">
                    {calendarCells.map((cell) => {
                        const dateStr = cell.date.toISOString().split('T')[0];
                        const dayEvents = events.filter(e => e.date === dateStr);
                        const isToday = cell.date.toDateString() === today.toDateString();

                        return (
                            <div
                                role="button"
                                tabIndex={0}
                                key={`${dateStr}-${cell.day}`}
                                onClick={() => {
                                    if (!cell.isOtherMonth) {
                                        setSelectedDate(cell.date);
                                        setSelectedEventId(null);
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (!cell.isOtherMonth && (e.key === 'Enter' || e.key === ' ')) {
                                        setSelectedDate(cell.date);
                                        setSelectedEventId(null);
                                    }
                                }}
                                className={`min-h-[140px] p-3 transition-all relative group
                                    ${cell.isOtherMonth ? 'bg-[var(--bg-secondary)]/30 opacity-20 pointer-events-none' : 'hover:bg-emerald-500/5 cursor-pointer'}
                                `}
                            >
                                <span className={`text-[15px] font-black mb-3 inline-flex items-center justify-center
                                    ${isToday ? 'text-white bg-sky-500 w-7 h-7 rounded-[10px] shadow-lg shadow-sky-500/20' : 'text-[var(--text-primary)]'}
                                `}>
                                    {cell.day}
                                </span>

                                <div className="space-y-1.5 mt-2">
                                    {dayEvents.slice(0, 2).map(event => (
                                        <div
                                            key={event.id}
                                            role="button"
                                            tabIndex={0}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedDate(cell.date);
                                                setSelectedEventId(event.id);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.stopPropagation();
                                                    setSelectedDate(cell.date);
                                                    setSelectedEventId(event.id);
                                                }
                                            }}
                                            className={`text-xs font-extrabold p-1.5 px-2 rounded-lg border-l-[3px] shadow-sm flex items-center gap-1.5 whitespace-nowrap overflow-hidden cursor-pointer
                                                ${event.type === 'order'
                                                    ? 'border-l-amber-500 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                                                    : 'border-l-sky-500 bg-sky-500/10 text-sky-500 hover:bg-sky-500/20'}
                                            `}
                                        >
                                            <Icon name={event.type === 'order' ? 'Package' : 'Clock'} className="w-3 h-3 flex-shrink-0 fill-current" />
                                            <span className="truncate">{event.time} - {event.subtitle}</span>
                                        </div>
                                    ))}
                                    {dayEvents.length > 2 && (
                                        <div className="flex items-center justify-center gap-1 pt-1">
                                            <span className="text-sm font-black tracking-[0.3em] text-[var(--text-secondary)]/60">···</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <DayEventListModal
                isOpen={selectedDate !== null}
                date={selectedDate}
                allEvents={events}
                onClose={() => { setSelectedDate(null); setSelectedEventId(null); }}
                onSelectEvent={(id) => setSelectedEventId(id)}
            />

            <DayActivityModal
                isOpen={selectedEventId !== null}
                eventId={selectedEventId}
                allEvents={events}
                onClose={() => setSelectedEventId(null)}
            />
        </div>
    );
}
