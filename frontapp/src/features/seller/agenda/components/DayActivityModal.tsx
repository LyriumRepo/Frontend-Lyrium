'use client';

import React, { useMemo } from 'react';
import ModalPortal from '@/components/ModalPortal';
import Icon from '@/components/ui/Icon';
import type { AgendaEvent, AgendaOrderItem } from '@/features/seller/agenda/types';

interface DayActivityModalProps {
    isOpen: boolean;
    eventId: string | null;
    allEvents: AgendaEvent[];
    onClose: () => void;
}

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

            <div>
                <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Pago</span>
                <p className="text-sm font-bold text-[var(--text-primary)]">{event.payment_method ?? 'N/A'}</p>
                <p className="text-[10px] text-[var(--text-secondary)]">Monto: S/ {event.total.toFixed(2)}</p>
            </div>

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

export default function DayActivityModal({ isOpen, eventId, allEvents, onClose }: DayActivityModalProps) {
    const event = useMemo(() => {
        if (!eventId) return null;
        return allEvents.find(e => e.id === eventId) ?? null;
    }, [eventId, allEvents]);

    if (!isOpen) return null;

    const statusStyle = event ? getStatusStyle(event) : null;
    const pageTitle = event?.customer_name ?? 'Cliente';
    const pageSubtitle = event
        ? `${event.time} · ${event.type === 'order' ? `Pedido #${event.order_number ?? ''}` : `Servicio #${event.booking_id ?? event.service_id ?? ''}`}`
        : '';

    return (
        <ModalPortal>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-0 sm:p-6">
                <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={onClose} />
                <div className="relative w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-2xl bg-[var(--bg-card)] rounded-none sm:rounded-[2.5rem] flex flex-col overflow-hidden sm:border sm:border-[var(--border-subtle)] sm:shadow-2xl">
                    {/* Header */}
                    <div className="p-5 sm:p-8 flex items-center justify-between border-b border-[var(--border-subtle)]/50 shrink-0 gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <button
                                onClick={onClose}
                                className="w-10 h-10 flex items-center justify-center bg-[var(--bg-secondary)]/50 border border-[var(--border-subtle)] rounded-xl hover:bg-[var(--bg-secondary)] transition-all active:scale-90 shrink-0"
                                aria-label="Volver"
                            >
                                <Icon name="ChevronLeft" className="w-5 h-5" />
                            </button>
                            <div className="min-w-0">
                                <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)] tracking-tighter truncate">{pageTitle}</h2>
                                {pageSubtitle && (
                                    <p className="text-[10px] sm:text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-0.5">
                                        {pageSubtitle}
                                    </p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl hover:bg-[var(--bg-danger)] hover:text-[var(--text-danger)] transition-all active:scale-90 shrink-0"
                            aria-label="Cerrar"
                        >
                            <Icon name="X" className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-5 sm:p-8 custom-scrollbar">
                        {event ? (
                            <div className="space-y-6">
                                {/* Status badge */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${statusStyle!.class}`}>
                                        {statusStyle!.label}
                                    </span>
                                </div>

                                {/* Detail sections */}
                                {event.type === 'order' ? (
                                    <OrderDetailCard event={event} />
                                ) : (
                                    <ServiceDetailCard event={event} />
                                )}
                            </div>
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center text-center gap-4">
                                <div className="w-16 h-16 bg-[var(--bg-card)] rounded-[2rem] flex items-center justify-center shadow-xl border border-[var(--border-subtle)]">
                                    <Icon name="Calendar" className="text-3xl text-[var(--text-secondary)] w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">Evento no encontrado</p>
                                    <p className="text-[10px] font-bold text-[var(--text-secondary)] italic">Es posible que haya sido eliminado</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
}
