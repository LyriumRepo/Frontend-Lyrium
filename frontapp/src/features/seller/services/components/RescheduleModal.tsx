'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
    Appointment,
    Service,
    Specialist,
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

type EspecialistaHorario = {
    id: number;
    dias: { dia: WeekDay; bloques: number[] }[];
};

type ServiceWithHorarios = Service & { especialistaHorarios?: EspecialistaHorario[] };

interface RescheduleModalProps {
    appointment: AppointmentWithClient | null;
    service: Service;
    specialists: Specialist[];
    appointments: AppointmentWithClient[];
    clients: Client[];
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (
        appointmentId: number,
        newFecha: string,
        newSession: { inicio: string; fin: string },
        newSpecialistId: number | undefined,
    ) => void;
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

function toDateStr(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getAttendanceDay(date: Date, service: Service): AttendanceDay | null {
    const wd = JS_TO_WD[date.getDay()];
    return service.diasAtencion.find((d) => d.dia === wd) ?? null;
}

/** Días que le corresponden al especialista según especialistaHorarios */
function getSpecialistWeekdays(service: Service, specialistId: number): Set<WeekDay> {
    const horarios = (service as ServiceWithHorarios).especialistaHorarios;
    if (!horarios) return new Set();
    const entry = horarios.find((h) => h.id === specialistId);
    if (!entry) return new Set();
    return new Set(entry.dias.map((d) => d.dia));
}

/**
 * Bloques (TimeBlock[]) que el especialista cubre para un día concreto.
 * Si no hay especialistaHorarios se devuelven todos los bloques del día.
 */
function getSpecialistBlocksForDay(service: Service, specialistId: number, weekDay: WeekDay): AttendanceDay['bloques'] {
    const attDay = service.diasAtencion.find((d) => d.dia === weekDay);
    if (!attDay) return [];

    const horarios = (service as ServiceWithHorarios).especialistaHorarios;
    if (!horarios) return attDay.bloques;

    const entry = horarios.find((h) => h.id === specialistId);
    if (!entry) return attDay.bloques;

    const dayEntry = entry.dias.find((d) => d.dia === weekDay);
    if (!dayEntry) return [];

    // dayEntry.bloques son índices dentro de attDay.bloques
    return dayEntry.bloques
        .map((idx) => attDay.bloques[idx])
        .filter(Boolean);
}

function getAvatarChars(sp: Specialist): string {
    return (sp.nombres?.charAt(0)?.toUpperCase() ?? '') + (sp.apellidos?.charAt(0)?.toUpperCase() ?? '');
}

export default function RescheduleModal({
    appointment,
    service,
    specialists,
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
    const [selectedSpecialistId, setSelectedSpecialistId] = useState<number | undefined>(undefined);
    const [isSpecialistMenuOpen, setIsSpecialistMenuOpen] = useState(false);
    const specialistMenuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (isOpen && appointment) {
            setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
            setSelectedDate(null);
            setSelectedSession(null);
            setSelectedSpecialistId(appointment.specialistId);
        }
    }, [isOpen, appointment]);

    useEffect(() => {
        if (!isSpecialistMenuOpen) return;
        const handlePointerDown = (e: MouseEvent) => {
            if (specialistMenuRef.current && !specialistMenuRef.current.contains(e.target as Node))
                setIsSpecialistMenuOpen(false);
        };
        const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsSpecialistMenuOpen(false); };
        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isSpecialistMenuOpen]);

    if (!appointment) return null;

    const client = clients.find((c) => c.id === appointment.clientId);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const calDays = getCalendarDays(year, month);

    const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const maxMonth = new Date(today.getFullYear() + 1, today.getMonth(), 1);
    const canGoPrev = currentMonth > todayMonth;
    const canGoNext = currentMonth < maxMonth;

    const serviceSpecialists = specialists.filter((sp) =>
        service.especialistasAsignados.includes(sp.id)
    );
    const currentSpecialist = appointment.specialistId
        ? specialists.find((sp) => sp.id === appointment.specialistId) ?? null
        : null;
    const activeSpecialist = selectedSpecialistId
        ? serviceSpecialists.find((sp) => sp.id === selectedSpecialistId) ?? null
        : null;

    // Weekdays disponibles para el especialista seleccionado
    const specialistWeekdays: Set<WeekDay> | null = selectedSpecialistId
        ? getSpecialistWeekdays(service, selectedSpecialistId)
        : null;

    // Un día es seleccionable si tiene diasAtencion Y el especialista lo cubre
    function isDayAvailable(date: Date): boolean {
        const attDay = getAttendanceDay(date, service);
        if (!attDay) return false;
        if (!specialistWeekdays) return true; // sin horarios → mostrar todos
        const wd = JS_TO_WD[date.getDay()];
        return specialistWeekdays.has(wd);
    }

    // Sesiones del día seleccionado filtradas por los bloques del especialista
    const selectedWeekDay = selectedDate ? JS_TO_WD[selectedDate.getDay()] : null;
    const allSessions = selectedDate && selectedWeekDay && selectedSpecialistId
        ? getSpecialistBlocksForDay(service, selectedSpecialistId, selectedWeekDay)
            .flatMap((b) => calculateSessions(b, service.duracion))
        : selectedDate
            ? (() => {
                const attDay = getAttendanceDay(selectedDate, service);
                return attDay ? attDay.bloques.flatMap((b) => calculateSessions(b, service.duracion)) : [];
            })()
            : [];

    const selectedFecha = selectedDate ? toDateStr(selectedDate) : null;

    const occupiedStarts = new Set(
        appointments
            .filter(
                (a) =>
                    a.serviceId === service.id &&
                    a.fecha === selectedFecha &&
                    a.id !== appointment.id &&
                    (selectedSpecialistId === undefined || a.specialistId === selectedSpecialistId),
            )
            .map((a) => a.sesion.inicio),
    );

    const canConfirm = !!selectedDate && !!selectedSession;
    const specialistChanged = selectedSpecialistId !== appointment.specialistId;

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Reprogramar Cita"
            subtitle="Selecciona un nuevo horario disponible"
            size="lg"
            accentColor="from-[#69BEEB] dark:from-[#66D6A8] to-[#5AAFE6] dark:to-[#4EC7B8]"
        >
            <div className="p-6 space-y-5">

                {/* Cita actual */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[var(--bg-secondary)]/60 border border-[var(--border-subtle)]">
                    <div className="w-9 h-9 rounded-xl bg-[#69BEEB]/10 dark:bg-[#66D6A8]/10 border border-[#69BEEB]/20 dark:border-[#66D6A8]/20 flex items-center justify-center text-[#69BEEB] dark:text-[#66D6A8] flex-shrink-0">
                        <Icon name="CalendarClock" className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Cita actual</p>
                        <p className="text-sm font-black text-[var(--text-primary)] truncate">
                            {client ? `${client.nombres} ${client.apellidos}` : 'Sin cliente'}
                        </p>
                        {currentSpecialist && (
                            <p className="text-[10px] font-bold text-[var(--text-secondary)] truncate">
                                {currentSpecialist.nombres} {currentSpecialist.apellidos}
                                {currentSpecialist.especialidad ? ` · ${currentSpecialist.especialidad}` : ''}
                            </p>
                        )}
                    </div>
                    <div className="text-right flex-shrink-0">
                        <p className="text-[11px] font-black font-mono text-[var(--text-primary)]">
                            {appointment.sesion.inicio} – {appointment.sesion.fin}
                        </p>
                        <p className="text-[9px] font-bold text-[var(--text-secondary)] mt-0.5">{appointment.fecha}</p>
                    </div>
                </div>

                {/* Selector de especialista */}
                <div ref={specialistMenuRef} className="relative">
                    <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2">
                        Especialista para la nueva cita
                    </p>
                    <button
                        type="button"
                        onClick={() => setIsSpecialistMenuOpen((prev) => !prev)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all ${
                            specialistChanged
                                ? 'border-[#69BEEB]/40 dark:border-[#66D6A8]/40 bg-[#69BEEB]/8 dark:bg-[#66D6A8]/8'
                                : 'border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 hover:border-[#69BEEB]/30 dark:hover:border-[#66D6A8]/70'
                        }`}
                    >
                        <div className="relative w-8 h-8 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-[10px] font-black text-[#69BEEB] dark:text-[#66D6A8] border border-[var(--border-subtle)] overflow-hidden flex-shrink-0">
                            {activeSpecialist?.foto ? (
                                <Image src={activeSpecialist.foto} fill sizes="32px" className="object-cover" alt="" />
                            ) : (
                                <span>{activeSpecialist ? getAvatarChars(activeSpecialist) : '??'}</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                                {activeSpecialist
                                    ? `${activeSpecialist.nombres} ${activeSpecialist.apellidos}`
                                    : 'Sin especialista'}
                            </p>
                            {activeSpecialist?.especialidad && (
                                <p className="text-[10px] text-[var(--text-secondary)] truncate">{activeSpecialist.especialidad}</p>
                            )}
                        </div>
                        {specialistChanged && (
                            <span className="text-[8px] font-black text-[#69BEEB] dark:text-[#66D6A8] bg-[#69BEEB]/10 dark:bg-[#66D6A8]/10 border border-[#69BEEB]/20 dark:border-[#66D6A8]/20 px-2 py-0.5 rounded-md uppercase tracking-widest flex-shrink-0">
                                Cambiado
                            </span>
                        )}
                        <Icon name={isSpecialistMenuOpen ? 'ChevronUp' : 'ChevronDown'} className="w-4 h-4 text-[var(--text-secondary)] flex-shrink-0" />
                    </button>

                    {isSpecialistMenuOpen && (
                        <div className="absolute left-0 top-[calc(100%+0.5rem)] z-20 w-full overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-2xl">
                            <div className="px-3 py-2 border-b border-[var(--border-subtle)]">
                                <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[var(--text-secondary)]">
                                    Selecciona un especialista
                                </p>
                            </div>
                            <div className="max-h-56 overflow-auto p-2 space-y-0.5">
                                {serviceSpecialists.map((sp) => {
                                    const isSelected = selectedSpecialistId === sp.id;
                                    const isOriginal = sp.id === appointment.specialistId;
                                    return (
                                        <button
                                            key={sp.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedSpecialistId(sp.id);
                                                setIsSpecialistMenuOpen(false);
                                                setSelectedDate(null);
                                                setSelectedSession(null);
                                            }}
                                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                                                isSelected ? 'bg-[#69BEEB]/10 dark:bg-[#66D6A8]/10' : 'hover:bg-[var(--bg-secondary)]'
                                            }`}
                                        >
                                            <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[10px] font-black text-[#69BEEB] dark:text-[#66D6A8]">
                                                {sp.foto ? (
                                                    <Image src={sp.foto} fill sizes="36px" className="object-cover" alt="" />
                                                ) : (
                                                    <span>{getAvatarChars(sp)}</span>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className={`truncate text-sm font-bold ${isSelected ? 'text-[#69BEEB] dark:text-[#66D6A8]' : 'text-[var(--text-primary)]'}`}>
                                                        {sp.nombres} {sp.apellidos}
                                                    </p>
                                                    {isOriginal && (
                                                        <span className="text-[8px] font-black text-[var(--text-secondary)] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] px-1.5 py-0.5 rounded uppercase tracking-widest">
                                                            Actual
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="truncate text-[11px] text-[var(--text-secondary)]">
                                                    {sp.especialidad || 'Especialista disponible'}
                                                </p>
                                            </div>
                                            {isSelected && <Icon name="Check" className="h-4 w-4 text-[#69BEEB] dark:text-[#66D6A8] flex-shrink-0" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* Mini calendario */}
                    <div className="space-y-3">
                        <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Nueva fecha</p>

                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => { if (canGoPrev) { setCurrentMonth(new Date(year, month - 1, 1)); setSelectedDate(null); setSelectedSession(null); } }}
                                disabled={!canGoPrev}
                                className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center hover:bg-[#69BEEB]/10 dark:hover:bg-[#66D6A8]/10 hover:text-[#69BEEB] dark:hover:text-[#66D6A8] disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                            >
                                <Icon name="ChevronLeft" className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">
                                {MONTH_NAMES[month]} {year}
                            </span>
                            <button
                                onClick={() => { if (canGoNext) { setCurrentMonth(new Date(year, month + 1, 1)); setSelectedDate(null); setSelectedSession(null); } }}
                                disabled={!canGoNext}
                                className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center hover:bg-[#69BEEB]/10 dark:hover:bg-[#66D6A8]/10 hover:text-[#69BEEB] dark:hover:text-[#66D6A8] disabled:opacity-25 disabled:cursor-not-allowed transition-all"
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
                                const isAvailable = isDayAvailable(date);
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
                                            ${isSelectable && !isSelected ? 'hover:bg-[#69BEEB]/10 dark:hover:bg-[#66D6A8]/10 hover:text-[#69BEEB] dark:hover:text-[#66D6A8] cursor-pointer' : ''}
                                            ${isSelected ? 'bg-[#69BEEB] dark:bg-[#4EC7B8] text-white shadow-md shadow-[#69BEEB]/20 dark:shadow-[#66D6A8]/20' : ''}
                                            ${isToday && !isSelected ? 'ring-2 ring-[#69BEEB] dark:ring-[#66D6A8] ring-offset-1 ring-offset-[var(--bg-card)]' : ''}
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
                                                        ? 'bg-[#69BEEB]/10 dark:bg-[#66D6A8]/10 border-[#69BEEB]/30 dark:border-[#66D6A8]/30 ring-2 ring-[#69BEEB]/20 dark:ring-[#66D6A8]/20 cursor-pointer'
                                                        : 'bg-[var(--bg-secondary)]/50 border-[var(--border-subtle)] hover:border-[#69BEEB]/30 dark:hover:border-[#66D6A8]/30 hover:bg-[#69BEEB]/5 dark:hover:bg-[#66D6A8]/5 cursor-pointer'
                                                }
                                            `}
                                        >
                                            <span className={`text-[11px] font-black font-mono ${isSelected ? 'text-[#69BEEB] dark:text-[#66D6A8]' : 'text-[var(--text-primary)]'}`}>
                                                {ses.inicio} – {ses.fin}
                                            </span>
                                            {occupied ? (
                                                <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Ocupada</span>
                                            ) : isSelected ? (
                                                <Icon name="CheckCircle2" className="w-4 h-4 text-[#69BEEB] dark:text-[#66D6A8]" />
                                            ) : (
                                                <span className="text-[9px] font-black text-[#69BEEB] dark:text-[#66D6A8] uppercase tracking-widest">Libre</span>
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
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#69BEEB]/8 dark:bg-[#66D6A8]/8 border border-[#69BEEB]/20 dark:border-[#66D6A8]/20">
                        <Icon name="CheckCircle2" className="w-4 h-4 text-[#69BEEB] dark:text-[#66D6A8] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-black text-[#69BEEB] dark:text-[#66D6A8] uppercase tracking-widest">Nuevo horario seleccionado</p>
                            <p className="text-sm font-black text-[var(--text-primary)]">
                                {selectedSession!.inicio} – {selectedSession!.fin}
                            </p>
                            <p className="text-[10px] font-bold text-[var(--text-secondary)]">{formatFecha(selectedDate!)}</p>
                            {activeSpecialist && (
                                <p className="text-[10px] font-bold text-[var(--text-secondary)] mt-0.5">
                                    {activeSpecialist.nombres} {activeSpecialist.apellidos}
                                    {specialistChanged && (
                                        <span className="ml-1.5 text-[#69BEEB] dark:text-[#66D6A8]">(cambiado)</span>
                                    )}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-2.5 pt-1">
                    <BaseButton
                        onClick={() => {
                            if (selectedDate && selectedSession) {
                                onConfirm(appointment.id, toDateStr(selectedDate), selectedSession, selectedSpecialistId);
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