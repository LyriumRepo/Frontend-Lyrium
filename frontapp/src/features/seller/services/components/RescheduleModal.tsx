'use client';

import React, { useState, useEffect } from 'react';
import {
    Appointment,
    Service,
    WeekDay,
    AttendanceDay,
    calculateSessions,
} from '@/features/seller/services/types';
import BaseModal from '@/components/ui/BaseModal';
import BaseButton from '@/components/ui/BaseButton';
import Icon from '@/components/ui/Icon';

type Client = {
    id: number;
    nombres: string;
    apellidos: string;
};

type AppointmentWithClient = Appointment & {
    clientId?: number;
};

interface RescheduleModalProps {
    appointment: AppointmentWithClient | null;
    service: Service;
    appointments: AppointmentWithClient[];
    clients: Client[];
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (appointmentId: number, newFecha: string, newSession: { inicio: string; fin: string }) => void;
}

const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const DAY_HEADERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const JS_TO_MON: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 6 };
const JS_TO_WD: Record<number, WeekDay> = {
    1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves',
    5: 'Viernes', 6: 'Sábado', 0: 'Domingo',
};

function getCalendarDays(year: number, month: number): (Date | null)[] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = Array(JS_TO_MON[firstDay.getDay()]).fill(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    while (days.length % 7 !== 0) days.push(null);
    return days;
}

function formatFecha(date: Date): string {
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return `${dayNames[date.getDay()]} ${date.getDate()} de ${MONTH_NAMES[date.getMonth()]}`;
}

function getAttendanceDay(date: Date, service: Service): AttendanceDay | null {
    const wd = JS_TO_WD[date.getDay()];
    return service.diasAtencion.find((d) => d.dia === wd) ?? null;
}

export default function RescheduleModal({
    appointment,
    service,
    appointments,
    clients,
    isOpen,
    onClose,
    onConfirm,
}: RescheduleModalProps) {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedSession, setSelectedSession] = useState<{ inicio: string; fin: string } | null>(null);

    useEffect(() => {
        if (isOpen) {
            setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
            setSelectedDate(null);
            setSelectedSession(null);
        }
    }, [isOpen]);

    if (!appointment) return null;

    const client = clients.find((c) => c.id === appointment.clientId);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const calDays = getCalendarDays(year, month);

    const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const maxMonth = new Date(today.getFullYear() + 1, today.getMonth(), 1);
    const canGoPrev = currentMonth > todayMonth;
    const canGoNext = currentMonth < maxMonth;

    const attDay = selectedDate ? getAttendanceDay(selectedDate, service) : null;
    const allSessions = attDay
        ? attDay.bloques.flatMap((b) => calculateSessions(b, service.duracion))
        : [];

    const selectedFecha = selectedDate ? formatFecha(selectedDate) : null;

    const occupiedStarts = new Set(
        appointments
            .filter(
                (a) =>
                    a.serviceId === service.id &&
                    a.fecha === selectedFecha &&
                    a.id !== appointment.id,
            )
            .map((a) => a.sesion.inicio),
    );

    const canConfirm = !!selectedDate && !!selectedSession;

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Reprogramar Cita"
            subtitle="Selecciona un nuevo horario disponible"
            size="lg"
            accentColor="from-sky-400 to-indigo-500"
        >
            <div className="p-6 space-y-5">

                {/* Cita actual */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[var(--bg-secondary)]/60 border border-[var(--border-subtle)]">
                    <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 flex-shrink-0">
                        <Icon name="CalendarClock" className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Cita actual</p>
                        <p className="text-sm font-black text-[var(--text-primary)] truncate">{client? `${client.nombres} ${client.apellidos}`: 'Sin cliente'}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <p className="text-[11px] font-black font-mono text-[var(--text-primary)]">
                            {appointment.sesion.inicio} – {appointment.sesion.fin}
                        </p>
                        <p className="text-[9px] font-bold text-[var(--text-secondary)] mt-0.5">{appointment.fecha}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* Mini calendario */}
                    <div className="space-y-3">
                        <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Nueva fecha</p>

                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => { if (canGoPrev) { setCurrentMonth(new Date(year, month - 1, 1)); setSelectedDate(null); setSelectedSession(null); } }}
                                disabled={!canGoPrev}
                                className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center hover:bg-sky-500/10 hover:text-sky-500 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                            >
                                <Icon name="ChevronLeft" className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">
                                {MONTH_NAMES[month]} {year}
                            </span>
                            <button
                                onClick={() => { if (canGoNext) { setCurrentMonth(new Date(year, month + 1, 1)); setSelectedDate(null); setSelectedSession(null); } }}
                                disabled={!canGoNext}
                                className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center hover:bg-sky-500/10 hover:text-sky-500 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                            >
                                <Icon name="ChevronRight" className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-0.5">
                            {DAY_HEADERS.map((h) => (
                                <div key={h} className="text-center text-[8px] font-black text-[var(--text-secondary)] uppercase py-1">
                                    {h}
                                </div>
                            ))}
                            {calDays.map((date, idx) => {
                                if (!date) return <div key={`e-${idx}`} className="h-8" />;
                                const isAvailable = !!getAttendanceDay(date, service);
                                const isSelected = selectedDate?.toDateString() === date.toDateString();
                                const isToday = date.toDateString() === today.toDateString();
                                const isPast = date < today && !isToday;
                                const isSelectable = isAvailable && !isPast;
                                return (
                                    <button
                                        key={date.toISOString()}
                                        disabled={!isSelectable}
                                        onClick={() => { setSelectedDate(date); setSelectedSession(null); }}
                                        className={`relative h-8 w-full rounded-lg text-[11px] font-black transition-all
                                            ${!isAvailable && !isPast ? 'text-[var(--text-secondary)] opacity-20 cursor-not-allowed' : ''}
                                            ${isPast ? 'cursor-not-allowed' : ''}
                                            ${isPast && isAvailable ? 'text-[var(--text-secondary)] opacity-35' : ''}
                                            ${isPast && !isAvailable ? 'text-[var(--text-secondary)] opacity-15' : ''}
                                            ${isSelectable && !isSelected ? 'hover:bg-sky-500/10 hover:text-sky-500 cursor-pointer' : ''}
                                            ${isSelected ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' : ''}
                                            ${isToday && !isSelected ? 'ring-2 ring-sky-500 ring-offset-1 ring-offset-[var(--bg-card)]' : ''}
                                        `}
                                    >
                                        <span className={isPast ? 'line-through' : ''}>{date.getDate()}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sesiones disponibles */}
                    <div className="space-y-3">
                        <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                            {selectedDate ? `Sesiones · ${formatFecha(selectedDate)}` : 'Sesiones disponibles'}
                        </p>

                        {!selectedDate ? (
                            <div className="flex flex-col items-center justify-center h-[200px] rounded-2xl border border-dashed border-[var(--border-subtle)] gap-2">
                                <Icon name="CalendarSearch" className="w-6 h-6 text-[var(--text-secondary)] opacity-30" />
                                <p className="text-[9px] font-black text-[var(--text-secondary)] opacity-40 uppercase tracking-widest">
                                    Elige un día primero
                                </p>
                            </div>
                        ) : allSessions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[200px] rounded-2xl border border-dashed border-[var(--border-subtle)] gap-2">
                                <p className="text-[9px] font-black text-[var(--text-secondary)] opacity-40 uppercase tracking-widest">
                                    Sin sesiones para este día
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                                {allSessions.map((ses) => {
                                    const occupied = occupiedStarts.has(ses.inicio);
                                    const isSelected = selectedSession?.inicio === ses.inicio;
                                    return (
                                        <button
                                            key={ses.inicio}
                                            disabled={occupied}
                                            onClick={() => setSelectedSession(ses)}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all
                                                ${occupied
                                                    ? 'opacity-40 cursor-not-allowed bg-[var(--bg-secondary)]/50 border-[var(--border-subtle)]'
                                                    : isSelected
                                                        ? 'bg-sky-500/10 border-sky-500/30 ring-2 ring-sky-500/20 cursor-pointer'
                                                        : 'bg-[var(--bg-secondary)]/50 border-[var(--border-subtle)] hover:border-sky-500/30 hover:bg-sky-500/5 cursor-pointer'
                                                }
                                            `}
                                        >
                                            <span className={`text-[11px] font-black font-mono ${isSelected ? 'text-sky-600' : 'text-[var(--text-primary)]'}`}>
                                                {ses.inicio} – {ses.fin}
                                            </span>
                                            {occupied ? (
                                                <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Ocupada</span>
                                            ) : isSelected ? (
                                                <Icon name="CheckCircle2" className="w-4 h-4 text-sky-500" />
                                            ) : (
                                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Libre</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Resumen nuevo horario */}
                {canConfirm && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-sky-500/8 border border-sky-500/20">
                        <Icon name="CheckCircle2" className="w-4 h-4 text-sky-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-black text-sky-500 uppercase tracking-widest">Nuevo horario seleccionado</p>
                            <p className="text-sm font-black text-[var(--text-primary)]">
                                {selectedSession!.inicio} – {selectedSession!.fin}
                            </p>
                            <p className="text-[10px] font-bold text-[var(--text-secondary)]">{formatFecha(selectedDate!)}</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-2.5 pt-1">
                    <BaseButton
                        onClick={() => {
                            if (selectedDate && selectedSession) {
                                onConfirm(appointment.id, formatFecha(selectedDate), selectedSession);
                                onClose();
                            }
                        }}
                        disabled={!canConfirm}
                        variant="primary"
                        size="lg"
                        fullWidth
                        leftIcon="CheckCircle2"
                    >
                        Confirmar reprogramación
                    </BaseButton>
                    <BaseButton onClick={onClose} variant="ghost" size="lg" fullWidth>
                        Cancelar
                    </BaseButton>
                </div>
            </div>
        </BaseModal>
    );
}