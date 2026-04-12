'use client';

import React from 'react';
import { AgendaEvent } from '@/features/seller/agenda/types';
import BaseDrawer from '@/components/ui/BaseDrawer';
import BaseButton from '@/components/ui/BaseButton';
import Icon from '@/components/ui/Icon';

interface DayActivityModalProps {
    isOpen: boolean;
    date: Date | null;
    events: AgendaEvent[];
    onClose: () => void;
}

export default function DayActivityModal({ isOpen, date, events, onClose }: DayActivityModalProps) {
    if (!date) return null;

    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const dateLabel = date.toLocaleDateString('es-ES', options);

    const serviceEvents = events.filter(e => e.type === 'service');
    const orderEvents = events.filter(e => e.type === 'order');

    const footer = (
        <BaseButton
            onClick={onClose}
            className="bg-sky-500 text-white hover:bg-sky-400"
            size="lg"
            fullWidth
        >
            Cerrar Vista de Agenda
        </BaseButton>
    );

    return (
        <BaseDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={dateLabel}
            subtitle={`${events.length} Actividades Programadas`}
            badge="Operacional Diario"
            width="md:w-[650px]"
            accentColor="from-emerald-400/10 via-sky-400/5"
            footer={footer}
        >
            <div className="space-y-12">
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-sky-500/10 p-6 rounded-[2.5rem] border border-sky-500/20 flex flex-col justify-between h-32">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-black text-sky-500 uppercase tracking-widest">Servicios</span>
                            <Icon name="CalendarCheck" className="text-2xl text-sky-500 w-6 h-6" />
                        </div>
                        <p className="text-2xl font-black text-[var(--text-primary)]">{serviceEvents.length}</p>
                    </div>
                    <div className="bg-amber-500/10 p-6 rounded-[2.5rem] border border-amber-500/20 flex flex-col justify-between h-32">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-black text-amber-500 uppercase tracking-widest">Pedidos</span>
                            <Icon name="Package" className="text-2xl text-amber-500 w-6 h-6" />
                        </div>
                        <p className="text-2xl font-black text-[var(--text-primary)]">{orderEvents.length}</p>
                    </div>
                </div>

                {/* Timeline Content */}
                <div className="space-y-8">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-1.5 h-4 bg-[var(--text-primary)] rounded-full"></div>
                        <h4 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Itinerario Detallado</h4>
                    </div>

                    <div className="space-y-4 relative">
                        {events.length > 0 ? (
                            events.map((event, idx) => (
                                <div key={`${event.type}-${event.id}`} className="relative pl-10 group">
                                    {/* Vertical Line Connector */}
                                    {idx !== events.length - 1 && (
                                        <div className="absolute left-[19px] top-10 bottom-[-16px] w-0.5 bg-gradient-to-b from-[var(--border-subtle)] to-transparent"></div>
                                    )}

                                    {/* Icon Marker */}
                                    <div className={`absolute left-0 top-2 w-10 h-10 rounded-2xl flex items-center justify-center text-lg z-10 border-[4px] border-[var(--bg-card)] shadow-xl transition-all group-hover:scale-110
                                        ${event.type === 'order' ? 'bg-amber-500/10 text-amber-500' : 'bg-sky-500/10 text-sky-500'}`}>
                                        <Icon name={event.type === 'order' ? 'Package' : 'Clock'} className="fill-current w-5 h-5 flex-shrink-0" />
                                    </div>

                                    <div className="bg-[var(--bg-card)] p-6 rounded-[2.5rem] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 transition-all hover:shadow-2xl hover:shadow-black/5 hover:border-sky-500/20">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-black text-[var(--text-primary)] text-base tracking-tight">{event.title}</span>
                                                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest
                                                    ${event.type === 'order' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-sky-500/10 text-sky-500 border border-sky-500/20'}`}>
                                                    {event.type === 'order' ? 'Venta' : 'Asesoría'}
                                                </span>
                                            </div>
                                            <p className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-tighter">
                                                {event.time} • {event.subtitle}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm
                                                ${event.status === 'confirmed' || event.status === 'pagado'
                                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                                {event.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-24 flex flex-col items-center justify-center text-center gap-4 bg-[var(--bg-secondary)]/50 rounded-[3rem] border-2 border-dashed border-[var(--border-subtle)]">
                                <div className="w-16 h-16 bg-[var(--bg-card)] rounded-[2rem] flex items-center justify-center shadow-xl shadow-black/5 border border-[var(--border-subtle)]">
                                    <Icon name="Calendar" className="text-3xl text-[var(--text-secondary)] w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-1">Día Despejado</p>
                                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase italic">Sin operaciones programadas en este bloque</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tactical Footer Note */}
                <div className="p-8 bg-sky-500 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -z-0"></div>
                    <div className="flex items-start gap-5 relative z-10">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/10">
                            <Icon name="Zap" className="text-sky-400 text-2xl font-bold w-6 h-6" />
                        </div>
                        <div>
                            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-400 mb-1">Nota Operativa</h5>
                            <p className="text-xs text-white/50 leading-relaxed font-bold">
                                Los eventos listados aquí se sincronizan automáticamente con tus avisos de despacho y agenda de servicios en tiempo real.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </BaseDrawer>
    );
}
