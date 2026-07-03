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

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const monthDisplay = `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;

    const calendarCells = generateCalendarDays(currentMonth);
    const today = new Date();

    const filterOptions: { value: AgendaFilterType; label: string; icon: string }[] = [
        { value: 'all',      label: 'Todos',     icon: 'Calendar' },
        { value: 'orders',   label: 'Pedidos',   icon: 'Package'  },
        { value: 'services', label: 'Servicios', icon: 'Clock'    },
    ];

    // ── Navegador de mes — su propia caja debajo del banner ──
    const MonthNav = () => (
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <button
                onClick={prevMonth}
                className="w-9 h-9 flex items-center justify-center hover:bg-[var(--bg-hover)] rounded-xl transition-all text-[var(--text-secondary)]"
            >
                <Icon name="ChevronLeft" className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            </button>
            <span className="font-black text-[var(--text-primary)] text-center uppercase tracking-widest text-[11px] flex-1 sm:flex-none sm:min-w-[120px]">
                {monthDisplay}
            </span>
            <button
                onClick={nextMonth}
                className="w-9 h-9 flex items-center justify-center hover:bg-[var(--bg-hover)] rounded-xl transition-all text-[var(--text-secondary)]"
            >
                <Icon name="ChevronRight" className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            </button>
        </div>
    );

    if (isLoading && events.length === 0) {
        return <BaseLoading message="Sincronizando Agenda..." />;
    }

    return (
        <div className="space-y-4 sm:space-y-6 animate-fadeIn pb-20 sm:pb-12">

            <ModuleHeader
                title="Mi Agenda"
                subtitle="Gestión cronológica de entregas y compromisos"
                icon="CalendarCheck"
            />

            {/* Navegador de mes */}
            <div className="bg-[var(--bg-card)] p-3 rounded-[1.5rem] shadow-sm border border-[var(--border-subtle)] flex justify-center">
                <MonthNav />
            </div>

            {/* ── Leyenda + Filtros ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1">

                {/* Leyenda */}
                <div className="flex items-center gap-4 sm:gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                            <Icon name="Package" className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">Pedidos</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#69BEEB]/10 flex items-center justify-center text-[#69BEEB] border border-[#69BEEB]/20">
                            <Icon name="Clock" className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">Servicios</span>
                    </div>
                </div>

                {/* Filtros — ancho completo en móvil */}
                <div className="flex items-center gap-1 bg-[var(--bg-secondary)]/50 p-1 rounded-xl border border-[var(--border-subtle)] w-full sm:w-auto">
                    {filterOptions.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setFilterType(opt.value)}
                            className={`flex-1 sm:flex-none px-2 sm:px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5
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

            {/* ── Calendario ── */}
            <div className="overflow-hidden rounded-2xl sm:rounded-[2.5rem] border-t-4 border-[#69BEEB]/50 shadow-2xl shadow-[#69BEEB]/10 bg-[var(--bg-card)] will-change-transform">

                {/* Cabecera días de la semana */}
                <div className="grid grid-cols-7 bg-[var(--bg-secondary)]/50 border-b border-[var(--border-subtle)]">
                    {[
                        { short: 'L', full: 'Lun' },
                        { short: 'M', full: 'Mar' },
                        { short: 'X', full: 'Mie' },
                        { short: 'J', full: 'Jue' },
                        { short: 'V', full: 'Vie' },
                        { short: 'S', full: 'Sab' },
                        { short: 'D', full: 'Dom' },
                    ].map(dia => (
                        <div key={dia.full} className="py-3 sm:py-5 text-center text-[10px] sm:text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">
                            {/* Letra única en móvil, abreviatura en desktop */}
                            <span className="sm:hidden">{dia.short}</span>
                            <span className="hidden sm:inline">{dia.full}</span>
                        </div>
                    ))}
                </div>

                {/* Celdas del calendario */}
                <div className="grid grid-cols-7 divide-x divide-y divide-[var(--border-subtle)] min-h-[300px] sm:min-h-[600px]">
                    {calendarCells.map((cell) => {
                        const dateStr   = cell.date.toISOString().split('T')[0];
                        const dayEvents = events.filter(e => e.date === dateStr);
                        const isToday   = cell.date.toDateString() === today.toDateString();
                        const orders    = dayEvents.filter(e => e.type === 'order');
                        const services  = dayEvents.filter(e => e.type === 'service');

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
                                className={`
                                    min-h-[52px] sm:min-h-[140px]
                                    p-1.5 sm:p-3
                                    transition-all relative group
                                    ${cell.isOtherMonth
                                        ? 'bg-[var(--bg-secondary)]/30 opacity-20 pointer-events-none'
                                        : 'hover:bg-[#69BEEB]/10 cursor-pointer active:bg-[#69BEEB]/20'}
                                `}
                            >
                                {/* Número del día */}
                                <span className={`
                                    text-[11px] sm:text-[15px] font-black
                                    inline-flex items-center justify-center
                                    ${isToday
                                        ? 'text-white bg-[#69BEEB] w-5 h-5 sm:w-7 sm:h-7 rounded-[6px] sm:rounded-[10px] shadow-lg shadow-[#69BEEB]/20'
                                        : 'text-[var(--text-primary)]'}
                                `}>
                                    {cell.day}
                                </span>

                                {/* ── MÓVIL: dots de color como indicador de eventos ── */}
                                {dayEvents.length > 0 && (
                                    <div className="flex items-center gap-[3px] mt-1 sm:hidden flex-wrap">
                                        {orders.length > 0 && (
                                            <div className="flex gap-[2px]">
                                                {Array.from({ length: Math.min(orders.length, 2) }).map((_, i) => (
                                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                ))}
                                            </div>
                                        )}
                                        {services.length > 0 && (
                                            <div className="flex gap-[2px]">
                                                {Array.from({ length: Math.min(services.length, 2) }).map((_, i) => (
                                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#69BEEB]" />
                                                ))}
                                            </div>
                                        )}
                                        {/* Si hay más de 4 en total, un dot gris */}
                                        {dayEvents.length > 4 && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-secondary)]/40" />
                                        )}
                                    </div>
                                )}

                                {/* ── DESKTOP: pills de eventos ── */}
                                <div className="hidden sm:block space-y-1.5 mt-2">
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
                                                    : 'border-l-[#69BEEB] bg-[#69BEEB]/10 text-[#69BEEB] hover:bg-[#69BEEB]/20'
                                                }`}
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

            {/* Modales */}
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