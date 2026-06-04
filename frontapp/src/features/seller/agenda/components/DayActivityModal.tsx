'use client';

import React, { useState, useMemo } from 'react';
import type { AgendaEvent, AgendaFilterType, AgendaOrderItem } from '@/features/seller/agenda/types';
import BaseDrawer from '@/components/ui/BaseDrawer';
import BaseButton from '@/components/ui/BaseButton';
import Icon from '@/components/ui/Icon';

interface DayActivityModalProps {
    isOpen: boolean;
    date: Date | null;
    allEvents: AgendaEvent[];
    onClose: () => void;
}

const ITEMS_PER_PAGE = 10;

interface StatusStyle {
    label: string;
    class: string;
}

const ORDER_STATUS_MAP: Record<string, StatusStyle> = {
    pending_seller: { label: 'Pendiente', class: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    confirmed: { label: 'Confirmado', class: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    processing: { label: 'Procesando', class: 'bg-sky-500/10 text-sky-500 border-sky-500/20' },
    shipped: { label: 'Enviado', class: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
    delivered: { label: 'Entregado', class: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
    cancelled: { label: 'Cancelado', class: 'bg-red-500/10 text-red-500 border-red-500/20' },
};

const BOOKING_STATUS_MAP: Record<string, StatusStyle> = {
    pending: { label: 'Reservado', class: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    confirmed: { label: 'Confirmado', class: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    completed: { label: 'Completado', class: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
    cancelled: { label: 'Cancelado', class: 'bg-red-500/10 text-red-500 border-red-500/20' },
    no_show: { label: 'No Asistió', class: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
};

function getStatusStyle(event: AgendaEvent): StatusStyle {
    if (event.type === 'order') {
        const status = event.order_status ?? 'pending_seller';
        return ORDER_STATUS_MAP[status] ?? { label: status, class: 'bg-gray-500/10 text-gray-500 border-gray-500/20' };
    }
    return BOOKING_STATUS_MAP[event.status] ?? { label: event.status, class: 'bg-gray-500/10 text-gray-500 border-gray-500/20' };
}

function OrderDetailCard({ event }: { event: AgendaEvent }) {
    return (
        <div className="space-y-4 mt-4 pt-4 border-t border-[var(--border-subtle)]/50">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Cliente</span>
                    <p className="text-sm font-bold text-[var(--text-primary)]">{event.customer_name}</p>
                    {event.customer_email && (
                        <p className="text-[10px] text-[var(--text-secondary)]">{event.customer_email}</p>
                    )}
                    {event.customer_phone && (
                        <p className="text-[10px] text-[var(--text-secondary)]">{event.customer_phone}</p>
                    )}
                </div>
                <div>
                    <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Pago</span>
                    <p className="text-sm font-bold text-[var(--text-primary)]">{event.payment_method ?? 'N/A'}</p>
                    <p className="text-[10px] text-[var(--text-secondary)]">
                        Total: S/ {event.total.toFixed(2)}
                    </p>
                    {event.paid_at && (
                        <p className="text-[10px] text-emerald-500">Pagado: {new Date(event.paid_at).toLocaleDateString('es-ES')}</p>
                    )}
                </div>
            </div>

            {/* Shipping */}
            {event.shipping_address && (
                <div>
                    <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Envío</span>
                    <p className="text-xs font-bold text-[var(--text-primary)]">{event.shipping_address}{event.shipping_city ? `, ${event.shipping_city}` : ''}</p>
                    {event.shipment && (
                        <div className="flex gap-4 mt-1 text-[10px] text-[var(--text-secondary)]">
                            {event.shipment.carrier && <span>Transportista: {event.shipment.carrier}</span>}
                            {event.shipment.tracking_number && <span>Tracking: {event.shipment.tracking_number}</span>}
                        </div>
                    )}
                </div>
            )}

            {/* Items */}
            {event.items && event.items.length > 0 && (
                <div>
                    <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Productos ({event.items.length})</span>
                    <div className="mt-2 space-y-2">
                        {event.items.map((item: AgendaOrderItem, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 p-2 rounded-xl bg-[var(--bg-secondary)]/50">
                                {item.image_url && (
                                    <img src={item.image_url} alt={item.product_name} className="w-10 h-10 rounded-lg object-cover bg-[var(--bg-card)]" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-[var(--text-primary)] truncate">{item.product_name}</p>
                                    <p className="text-[10px] text-[var(--text-secondary)]">
                                        {item.quantity} x S/ {Number(item.unit_price).toFixed(2)}
                                    </p>
                                </div>
                                <span className="text-xs font-black text-[var(--text-primary)]">S/ {Number(item.line_total).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Totals */}
            <div className="space-y-1 pt-2 border-t border-[var(--border-subtle)]/30">
                {event.subtotal !== undefined && (
                    <div className="flex justify-between text-[10px]">
                        <span className="text-[var(--text-secondary)]">Subtotal</span>
                        <span className="font-bold text-[var(--text-primary)]">S/ {event.subtotal.toFixed(2)}</span>
                    </div>
                )}
                {event.shipping_cost !== undefined && event.shipping_cost > 0 && (
                    <div className="flex justify-between text-[10px]">
                        <span className="text-[var(--text-secondary)]">Envío</span>
                        <span className="font-bold text-[var(--text-primary)]">S/ {event.shipping_cost.toFixed(2)}</span>
                    </div>
                )}
                {event.discount_amount !== undefined && event.discount_amount > 0 && (
                    <div className="flex justify-between text-[10px]">
                        <span className="text-[var(--text-secondary)]">Descuento</span>
                        <span className="font-bold text-emerald-500">-S/ {event.discount_amount.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between text-xs font-black pt-1 border-t border-[var(--border-subtle)]/30">
                    <span className="text-[var(--text-primary)]">Total</span>
                    <span className="text-[var(--text-primary)]">S/ {event.total.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}

function ServiceDetailCard({ event }: { event: AgendaEvent }) {
    return (
        <div className="space-y-4 mt-4 pt-4 border-t border-[var(--border-subtle)]/50">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Cliente</span>
                    <p className="text-sm font-bold text-[var(--text-primary)]">{event.customer_name}</p>
                    {event.customer_email && (
                        <p className="text-[10px] text-[var(--text-secondary)]">{event.customer_email}</p>
                    )}
                    {event.customer_phone && (
                        <p className="text-[10px] text-[var(--text-secondary)]">{event.customer_phone}</p>
                    )}
                </div>
                <div>
                    <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Horario</span>
                    <p className="text-sm font-bold text-[var(--text-primary)]">{event.time} - {event.end_time ?? '--:--'}</p>
                    {event.duration_minutes && (
                        <p className="text-[10px] text-[var(--text-secondary)]">Duración: {event.duration_minutes} min</p>
                    )}
                </div>
            </div>

            {/* Specialist */}
            {event.specialist && (
                <div>
                    <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Especialista</span>
                    <div className="flex items-center gap-3 mt-1">
                        <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500 font-black text-sm border border-sky-500/20 overflow-hidden">
                            {event.specialist.foto ? (
                                <img src={event.specialist.foto} alt="" className="w-full h-full object-cover" />
                            ) : (
                                event.specialist.nombres?.[0] ?? '?'
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-[var(--text-primary)]">{event.specialist.nombres} {event.specialist.apellidos}</p>
                            {event.specialist.especialidad && (
                                <p className="text-[10px] text-[var(--text-secondary)]">{event.specialist.especialidad}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Payment */}
            <div>
                <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Pago</span>
                <p className="text-sm font-bold text-[var(--text-primary)]">{event.payment_method ?? 'N/A'}</p>
                <p className="text-[10px] text-[var(--text-secondary)]">Monto: S/ {event.total.toFixed(2)}</p>
            </div>

            {/* Notes */}
            {(event.notes || event.seller_notes) && (
                <div>
                    <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Observaciones</span>
                    {event.notes && <p className="text-xs text-[var(--text-primary)] mt-1">{event.notes}</p>}
                    {event.seller_notes && (
                        <p className="text-xs text-[var(--text-secondary)] mt-1 italic">Nota interna: {event.seller_notes}</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default function DayActivityModal({ isOpen, date, allEvents, onClose }: DayActivityModalProps) {
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

    if (!date) return null;

    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const dateLabel = date.toLocaleDateString('es-ES', options);

    const totalPages = Math.max(1, Math.ceil(filteredEvents.length / ITEMS_PER_PAGE));
    const safePage = Math.min(page, totalPages);
    const paginatedEvents = filteredEvents.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

    const serviceEvents = dayEvents.filter(e => e.type === 'service');
    const orderEvents = dayEvents.filter(e => e.type === 'order');

    const filterOptions: { value: AgendaFilterType; label: string }[] = [
        { value: 'all', label: 'Todos' },
        { value: 'orders', label: 'Pedidos' },
        { value: 'services', label: 'Servicios' },
    ];

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
            subtitle={`${dayEvents.length} Actividades Programadas`}
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

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 bg-[var(--bg-secondary)]/50 p-1 rounded-xl border border-[var(--border-subtle)] w-fit">
                    {filterOptions.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => { setFilterType(opt.value); setPage(1); }}
                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all
                                ${filterType === opt.value
                                    ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm border border-[var(--border-subtle)]'
                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Timeline Content */}
                <div className="space-y-8">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-1.5 h-4 bg-[var(--text-primary)] rounded-full"></div>
                        <h4 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Itinerario Detallado</h4>
                        {filterType !== 'all' && (
                            <span className="text-[10px] font-bold text-[var(--text-secondary)]">
                                ({filteredEvents.length} {filterType === 'orders' ? 'pedidos' : 'servicios'})
                            </span>
                        )}
                    </div>

                    <div className="space-y-4 relative">
                        {paginatedEvents.length > 0 ? (
                            paginatedEvents.map((event, idx) => (
                                <div key={event.id} className="relative pl-10 group">
                                    {idx !== paginatedEvents.length - 1 && (
                                        <div className="absolute left-[19px] top-10 bottom-[-16px] w-0.5 bg-gradient-to-b from-[var(--border-subtle)] to-transparent"></div>
                                    )}
                                    <div className={`absolute left-0 top-2 w-10 h-10 rounded-2xl flex items-center justify-center text-lg z-10 border-[4px] border-[var(--bg-card)] shadow-xl transition-all group-hover:scale-110
                                        ${event.type === 'order' ? 'bg-amber-500/10 text-amber-500' : 'bg-sky-500/10 text-sky-500'}`}>
                                        <Icon name={event.type === 'order' ? 'Package' : 'Clock'} className="fill-current w-5 h-5 flex-shrink-0" />
                                    </div>
                                    <div className="bg-[var(--bg-card)] p-6 rounded-[2.5rem] border border-[var(--border-subtle)] transition-all hover:shadow-2xl hover:shadow-black/5 hover:border-sky-500/20">
                                        {/* Header */}
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-black text-[var(--text-primary)] text-base tracking-tight">{event.title}</span>
                                                    <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest
                                                        ${event.type === 'order' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-sky-500/10 text-sky-500 border border-sky-500/20'}`}>
                                                        {event.type === 'order' ? 'Venta' : 'Asesoria'}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-tighter">
                                                    {event.time} - {event.subtitle}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${getStatusStyle(event).class}`}>
                                                    {getStatusStyle(event).label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Detail section */}
                                        {event.type === 'order' ? (
                                            <OrderDetailCard event={event} />
                                        ) : (
                                            <ServiceDetailCard event={event} />
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-24 flex flex-col items-center justify-center text-center gap-4 bg-[var(--bg-secondary)]/50 rounded-[3rem] border-2 border-dashed border-[var(--border-subtle)]">
                                <div className="w-16 h-16 bg-[var(--bg-card)] rounded-[2rem] flex items-center justify-center shadow-xl shadow-black/5 border border-[var(--border-subtle)]">
                                    <Icon name="Calendar" className="text-3xl text-[var(--text-secondary)] w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-1">Dia Despejado</p>
                                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase italic">Sin operaciones programadas en este bloque</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
                        <span className="text-xs font-bold text-[var(--text-secondary)]">
                            Pág. {safePage} de {totalPages} ({filteredEvents.length} registros)
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={safePage <= 1}
                                className="w-9 h-9 flex items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <Icon name="ChevronLeft" className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={safePage >= totalPages}
                                className="w-9 h-9 flex items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <Icon name="ChevronRight" className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

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
                                Los eventos listados aqui se sincronizan automaticamente con tus avisos de despacho y agenda de servicios en tiempo real.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </BaseDrawer>
    );
}
