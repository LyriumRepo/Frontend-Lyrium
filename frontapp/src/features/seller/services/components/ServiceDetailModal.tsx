'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ServiceCalendar from './ServiceCalendar';
import Image from 'next/image';
import {
    Service,
    Specialist,
    Appointment,
    WEEK_DAY_SHORT,
    countTotalSessions,
    calculateSessions,
    serviceEtiquetasFromService,
} from '@/features/seller/services/types';
import BaseDrawer from '@/components/ui/BaseDrawer';
import Icon from '@/components/ui/Icon';
import BaseButton from '@/components/ui/BaseButton';

type Client = {
    id: number;
    nombres: string;
    apellidos: string;
    dni: string;
    telefono?: string;
    email?: string;
    direccion?: string;
};

type AppointmentWithClient = Appointment & {
    clientId?: number;
};

interface ServiceDetailModalProps {
    service: Service | null;
    specialists: Specialist[];
    clients: Client[];
    appointments: AppointmentWithClient[];
    isOpen: boolean;
    onClose: () => void;
    onEdit: (service: Service) => void;
    onReschedule: (appointment: AppointmentWithClient) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getAvatarChars(sp: Specialist): string {
    return (
        (sp.nombres?.charAt(0)?.toUpperCase() ?? '') +
        (sp.apellidos?.charAt(0)?.toUpperCase() ?? '')
    );
}

function buildScheduleSubtitle(service: Service): string {
    if (!service.diasAtencion || service.diasAtencion.length === 0) return 'Sin horario configurado';
    const days = service.diasAtencion.map((d) => WEEK_DAY_SHORT[d.dia]).join(', ');
    const total = countTotalSessions(service.diasAtencion, service.duracion);
    const dur = service.duracion < 60
        ? `${service.duracion} min`
        : `${service.duracion / 60}h`;
    return `${days}  ·  ${total} sesión${total !== 1 ? 'es' : ''}  ·  ${dur} c/u`;
}

/** Servicio considerado activo si tiene días + al menos un especialista asignado */
function isServiceActive(service: Service): boolean {
    return service.diasAtencion.length > 0 && service.especialistasAsignados.length > 0;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ServiceDetailModal({
    service,
    specialists,
    clients,
    appointments,
    isOpen,
    onClose,
    onEdit,
    onReschedule,
}: ServiceDetailModalProps) {
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!service || !mounted) return null;

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    // Especialistas asignados resueltos
    const assignedSpecialists = service.especialistasAsignados
        .map((id) => specialists.find((s) => s.id === id))
        .filter((s): s is Specialist => !!s);

    // Citas de este servicio
    const serviceAppointments = appointments.filter((a) => a.serviceId === service.id);

    const active = isServiceActive(service);
    const scheduleSubtitle = buildScheduleSubtitle(service);
    const totalSessions = countTotalSessions(service.diasAtencion, service.duracion);

    const footer = (
        <div className="flex flex-col sm:flex-row gap-3 w-full">
            <BaseButton variant="ghost" onClick={onClose} className="flex-1 !rounded-2xl">
                Cerrar
            </BaseButton>
            <BaseButton
                onClick={() => { onEdit(service); onClose(); }}
                variant="primary"
                leftIcon="Pencil"
                className="flex-[2] !rounded-2xl"
                size="md"
            >
                Editar Servicio
            </BaseButton>
        </div>
    );

    return createPortal(
        <BaseDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={service.denominacion}
            subtitle={scheduleSubtitle}
            badge="Detalle de Servicio"
            width="md:w-[650px]"
            accentColor="from-sky-500/10 via-indigo-500/5"
            footer={footer}
        >
            <div className="space-y-8">

                {/* ── Estado + Staff ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* Estado operativo */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest px-1">
                            Estado
                        </p>
                        {/* ↓ rounded-[2.5rem] igual que la versión original */}
                        <div className={`flex items-center gap-4 p-5 rounded-[2.5rem] border transition-all
                            ${active
                                ? 'bg-emerald-500/8 border-emerald-500/25'
                                : 'bg-gray-500/15 dark:bg-gray-300/15  border-gray-500/50 dark:border-gray-300/50'
                            }`}
                        >
                            {/* Dot + ping: contenedor ajustado al tamaño del dot */}
                            <div className="relative flex-shrink-0 w-4 h-4">
                                <div className={`w-4 h-4 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-400 dark:bg-gray-300/70'}`} />
                                {active && (
                                    <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                                )}
                            </div>
                            <div>
                                <p className={`text-sm font-bold ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-300'}`}>
                                    {active ? 'Activo en tienda' : 'Configuración incompleta'}
                                </p>
                                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                                    {active ? 'Visible al público' : 'Asigna días o especialistas'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Staff */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest px-1">
                            Especialistas ({assignedSpecialists.length})
                        </p>
                        {/* ↓ rounded-[2.5rem] igual que estado */}
                        <div className="flex -space-x-3 p-5 bg-[var(--bg-secondary)]/40 rounded-[2.5rem] border border-[var(--border-subtle)] min-h-[5rem] items-center px-6">
                            {assignedSpecialists.length === 0 ? (
                                <p className="text-xs text-[var(--text-secondary)] italic">Sin especialistas asignados</p>
                            ) : (
                                assignedSpecialists.map((esp) => (
                                    <div
                                        key={esp.id}
                                        className="relative w-11 h-11 rounded-2xl bg-[var(--bg-card)] border-2 border-[var(--bg-card)] flex items-center justify-center text-sm font-black overflow-hidden shadow-md hover:-translate-y-2 hover:z-10 transition-all cursor-pointer ring-1 ring-[var(--border-subtle)]"
                                        title={`${esp.nombres} ${esp.apellidos} · ${esp.especialidad}`}
                                    >
                                        {esp.foto
                                            ? <Image src={esp.foto} fill sizes="44px" className="object-cover" alt={`${esp.nombres} ${esp.apellidos}`} />
                                            : <span className="text-sky-500 dark:text-[var(--icons-green)]">{getAvatarChars(esp)}</span>
                                        }
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Etiquetas ── */}
                {(() => {
                    const etiquetas = serviceEtiquetasFromService(service);
                    const has = etiquetas.nuevo || etiquetas.descuento || etiquetas.oferta || etiquetas.edicionLimitada;
                    if (!has) return null;
                    return (
                        <div className="flex gap-2 flex-wrap">
                            {etiquetas.nuevo && (
                                <span className="px-2 py-1 rounded-md text-xs font-black uppercase tracking-wider" style={{ background: '#ADEBB3', color: '#0d3318' }}>Nuevo</span>
                            )}
                            {etiquetas.descuento && (
                                <span className="px-2 py-1 rounded-md text-xs font-black uppercase tracking-wider" style={{ background: 'linear-gradient(135deg,#dc2626,#f87171)', color: 'white' }}>-{etiquetas.descuento.valor}%</span>
                            )}
                            {etiquetas.oferta && (
                                <span className="px-2 py-1 rounded-md text-xs font-black uppercase tracking-wider" style={{ background: 'linear-gradient(135deg,#991b1b,#dc2626)', color: 'white' }}>−{etiquetas.oferta.valor}% Oferta</span>
                            )}
                            {etiquetas.edicionLimitada && (
                                <span className="px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider" style={{ background: '#59a6cb', color: '#1a2e3a' }}>Ed. Limitada</span>
                            )}
                        </div>
                    );
                })()}

                {/* ── Disponibilidad ── */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1 h-4 bg-sky-500 dark:bg-[var(--icons-green)] rounded-full" />
                            Horario semanal
                        </h3>
                        <button
                            onClick={() => setIsCalendarOpen(true)}
                            className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-500 dark:text-[var(--icons-green)] hover:opacity-70 transition-opacity"
                        >
                            <Icon name="CalendarDays" className="w-3.5 h-3.5" />
                            Ver calendario del servicio
                        </button>
                    </div>

                    {service.diasAtencion.length === 0 ? (
                        <div className="py-10 text-center text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)]/30 rounded-[2.5rem] border border-dashed border-[var(--border-subtle)]">
                            Sin días configurados — edita el servicio para agregar horarios
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2">
                            {service.diasAtencion.map((dayObj) => {
                                const totalSes = dayObj.bloques.reduce(
                                    (t, b) => t + calculateSessions(b, service.duracion).length, 0
                                );
                                return (
                                    <div
                                        key={dayObj.dia}
                                        className="flex items-center justify-between px-5 py-3.5 bg-[var(--bg-secondary)]/40 hover:bg-[var(--bg-secondary)]/70 rounded-[2.5rem] border border-[var(--border-subtle)] transition-colors"
                                    >
                                        {/* Día */}
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-sky-500 dark:bg-[var(--icons-green)] flex-shrink-0" />
                                            <span className="text-sm font-semibold text-[var(--text-primary)] capitalize">
                                                {dayObj.dia}
                                            </span>
                                        </div>
                                        {/* Métricas */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-[var(--text-secondary)]">
                                                {dayObj.bloques.length} {dayObj.bloques.length !== 1 ? 'bloques' : 'bloque'}
                                            </span>
                                            <span className="text-xs font-semibold text-sky-600 dark:text-[var(--icons-green)] bg-sky-500/10 dark:bg-[var(--icons-green)]/10 border border-sky-500/20 dark:border-[var(--icons-green)]/20 px-2.5 py-0.5 rounded-lg">
                                                {totalSes} sesión{totalSes !== 1 ? 'es' : ''}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <ServiceCalendar
                        isOpen={isCalendarOpen}
                        service={service}
                        specialists={specialists}
                        clients={clients}
                        appointments={appointments}
                        onClose={() => setIsCalendarOpen(false)}
                        onReschedule={onReschedule}
                    />
                </div>

                {/* ── Configuración del servicio ── */}
                <div className="rounded-2xl overflow-hidden border border-[var(--border-subtle)]">

                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 bg-sky-500 dark:bg-[var(--brand-green)]">
                        <div className="flex items-center gap-2.5">
                            <Icon name="ShieldCheck" className="text-white/80 w-4 h-4" />
                            <span className="text-xs font-bold text-white uppercase tracking-widest">
                                Configuración del servicio
                            </span>
                        </div>
                        <span className="text-[11px] font-semibold text-white bg-white/10 px-3 py-1 rounded-full border border-white/20">
                            Auto gestionado
                        </span>
                    </div>

                    {/* Grid 2×2 con divisores */}
                    <div className="grid grid-cols-2 divide-x divide-y divide-[var(--border-subtle)] bg-[var(--bg-secondary)]/20">

                        {/* Días activos */}
                        <div className="p-5 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                                <Icon name="CalendarDays" className="w-3.5 h-3.5 text-sky-500 dark:text-[var(--icons-green)]" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Días activos</span>
                            </div>
                            <p className="text-base font-bold text-[var(--text-primary)] leading-tight">
                                {service.diasAtencion.length > 0
                                    ? service.diasAtencion.map((d) => WEEK_DAY_SHORT[d.dia]).join(' · ')
                                    : <span className="text-[var(--text-secondary)] font-normal text-sm">Sin configurar</span>
                                }
                            </p>
                        </div>

                        {/* Cupos */}
                        <div className="p-5 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                                <Icon name="Users" className="w-3.5 h-3.5 text-sky-500 dark:text-[var(--icons-green)]" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Cupos por sesión</span>
                            </div>
                            <p className="text-base font-bold text-[var(--text-primary)]">
                                {service.cupos}
                                <span className="text-xs font-normal text-[var(--text-secondary)] ml-1.5">
                                    · {totalSessions} sesión{totalSessions !== 1 ? 'es' : ''} en total
                                </span>
                            </p>
                        </div>

                        {/* Duración */}
                        <div className="p-5 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                                <Icon name="Clock" className="w-3.5 h-3.5 text-sky-500 dark:text-[var(--icons-green)]" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Duración</span>
                            </div>
                            <p className="text-base font-bold text-[var(--text-primary)]">
                                {service.duracion < 60
                                    ? `${service.duracion} min`
                                    : `${service.duracion / 60} h`
                                }
                                <span className="text-xs font-normal text-[var(--text-secondary)] ml-1.5">por sesión</span>
                            </p>
                        </div>

                        {/* Precio */}
                        <div className="p-5 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                                <Icon name="Banknote" className="w-3.5 h-3.5 text-sky-500 dark:text-[var(--icons-green)]" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Precio</span>
                            </div>
                            <p className="text-base font-bold text-[var(--text-primary)]">
                                S/. {service.precio.toFixed(2)}
                                <span className="text-xs font-normal text-[var(--text-secondary)] ml-1.5">por sesión</span>
                            </p>
                        </div>

                    </div>
                </div>

            </div>
        </BaseDrawer>,
        modalRoot,
    );
}