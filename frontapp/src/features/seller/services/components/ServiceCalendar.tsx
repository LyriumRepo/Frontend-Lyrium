'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import {
  Service,
  Specialist,
  Appointment,
  AttendanceDay,
  WeekDay,
  calculateSessions,
} from '@/features/seller/services/types';
import Icon from '@/components/ui/Icon';

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

interface ServiceCalendarProps {
  service: Service;
  specialists: Specialist[];
  clients: Client[];
  appointments: AppointmentWithClient[];
  isOpen: boolean;
  onClose: () => void;
  onReschedule: (appointment: AppointmentWithClient) => void;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const DAY_HEADERS: { label: string; weekDay: WeekDay }[] = [
  { label: 'Lun', weekDay: 'Lunes' },
  { label: 'Mar', weekDay: 'Martes' },
  { label: 'Mié', weekDay: 'Miércoles' },
  { label: 'Jue', weekDay: 'Jueves' },
  { label: 'Vie', weekDay: 'Viernes' },
  { label: 'Sáb', weekDay: 'Sábado' },
  { label: 'Dom', weekDay: 'Domingo' },
];

const JS_TO_MON_BASED: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 6 };
const JS_TO_WEEKDAY: Record<number, WeekDay> = {
  1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves',
  5: 'Viernes', 6: 'Sábado', 0: 'Domingo',
};

const SESSIONS_PER_PAGE = 3;

function getCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = JS_TO_MON_BASED[firstDay.getDay()];
  const days: (Date | null)[] = Array(startOffset).fill(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function formatFecha(date: Date): string {
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return `${dayNames[date.getDay()]} ${date.getDate()} de ${MONTH_NAMES[date.getMonth()]}`;
}

function getAttendanceDay(date: Date, service: Service): AttendanceDay | null {
  const weekDay = JS_TO_WEEKDAY[date.getDay()];
  return service.diasAtencion.find((d) => d.dia === weekDay) ?? null;
}

function toDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getApptsForDate(date: Date, service: Service, appointments: AppointmentWithClient[]): AppointmentWithClient[] {
  const fecha = toDateStr(date);
  return appointments.filter((a) => a.serviceId === service.id && a.fecha === fecha);
}

function isPastDate(date: Date, today: Date): boolean {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return d < t;
}

function getAvatarChars(sp: Specialist): string {
  return (sp.nombres?.charAt(0)?.toUpperCase() ?? '') + (sp.apellidos?.charAt(0)?.toUpperCase() ?? '');
}

function getClientChars(client: Client): string {
  return (client.nombres?.charAt(0)?.toUpperCase() ?? '') + (client.apellidos?.charAt(0)?.toUpperCase() ?? '');
}

function getBlockLabel(index: number): string {
  if (index === 0) return '1er Bloque';
  if (index === 1) return '2do Bloque';
  if (index === 2) return '3er Bloque';
  return `${index + 1}° Bloque`;
}


type AttendanceDayExtended = AttendanceDay & Record<string, unknown>;

function asNumberList(value: unknown): number[] {
  if (value == null) return [];
  const values = Array.isArray(value) ? value : [value];

  const ids = values.flatMap((item) => {
    if (typeof item === 'number' && Number.isFinite(item)) return [item];
    if (typeof item === 'string' && item.trim() !== '' && !Number.isNaN(Number(item))) return [Number(item)];
    if (typeof item === 'object' && item !== null) {
      const maybeId =
        (item as { id?: unknown }).id ??
        (item as { specialistId?: unknown }).specialistId ??
        (item as { especialistaId?: unknown }).especialistaId;
      if (typeof maybeId === 'number' && Number.isFinite(maybeId)) return [maybeId];
      if (typeof maybeId === 'string' && maybeId.trim() !== '' && !Number.isNaN(Number(maybeId))) {
        return [Number(maybeId)];
      }
    }
    return [];
  });

  return Array.from(new Set(ids));
}

function getAttendanceSpecialistIds(att: AttendanceDay | null): number[] {
  if (!att) return [];
  const data = att as AttendanceDayExtended;

  const candidateValues = [
    data.especialistasAsignados,
    data.especialistas,
    data.especialistaIds,
    data.especialistIds,
    data.specialistIds,
    data.specialistId,
    data.especialistaId,
    data.idEspecialista,
    data.assignedSpecialistIds,
  ];

  for (const value of candidateValues) {
    const ids = asNumberList(value);
    if (ids.length > 0) return ids;
  }

  return [];
}

export default function ServiceCalendar({
  service,
  specialists,
  clients,
  appointments,
  isOpen,
  onClose,
  onReschedule,
}: ServiceCalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState(0);
  const [selectedSessionPage, setSelectedSessionPage] = useState(1);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithClient | null>(null);
  const [showRescheduleWarning, setShowRescheduleWarning] = useState(false);
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<number | null>(null);
  const [isSpecialistMenuOpen, setIsSpecialistMenuOpen] = useState(false);
  const specialistMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!selectedDate) return;
    const att = getAttendanceDay(selectedDate, service);
    if (!att || att.bloques.length === 0) {
      setSelectedBlockIndex(0);
      setSelectedSessionPage(1);
      setSelectedAppointment(null);
      return;
    }
    setSelectedBlockIndex((prev) => Math.min(prev, att.bloques.length - 1));
    setSelectedSessionPage(1);
  }, [selectedDate, service]);

  useEffect(() => {
    setSelectedBlockIndex(0);
    setSelectedSessionPage(1);
    setSelectedAppointment(null);
    setShowRescheduleWarning(false);
  }, [currentMonth]);

  useEffect(() => {
    if (!isSpecialistMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (specialistMenuRef.current && !specialistMenuRef.current.contains(event.target as Node)) {
        setIsSpecialistMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsSpecialistMenuOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSpecialistMenuOpen]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const calDays = getCalendarDays(year, month);

  const serviceSpecialists = specialists.filter((sp) =>
    service.especialistasAsignados.includes(sp.id)
  );
  const activeSpecialist = selectedSpecialistId
    ? serviceSpecialists.find((sp) => sp.id === selectedSpecialistId) ?? null
    : null;
  const specialistSelectorLabel = activeSpecialist
    ? `${activeSpecialist.nombres} ${activeSpecialist.apellidos}`
    : 'Todos los Especialistas';

  const filteredAppointments = selectedSpecialistId
    ? appointments.filter((a) => a.specialistId === selectedSpecialistId)
    : appointments;

  // Weekdays covered by the selected specialist, derived from their schedule (especialistaHorarios)
  type EspecialistaHorario = { id: number; dias: { dia: WeekDay }[] };
  const specialistWeekdays: Set<WeekDay> | null = (() => {
    if (!selectedSpecialistId) return null;
    const horarios = (service as Service & { especialistaHorarios?: EspecialistaHorario[] }).especialistaHorarios;
    if (!horarios) return null;
    const entry = horarios.find((h) => h.id === selectedSpecialistId);
    if (!entry) return new Set<WeekDay>(); // specialist has no schedule → no days
    return new Set(entry.dias.map((d) => d.dia));
  })();

  const goToPrev = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
    setSelectedDate(null);
    setSelectedBlockIndex(0);
    setSelectedSessionPage(1);
    setSelectedAppointment(null);
    setShowRescheduleWarning(false);
  };

  const goToNext = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
    setSelectedDate(null);
    setSelectedBlockIndex(0);
    setSelectedSessionPage(1);
    setSelectedAppointment(null);
    setShowRescheduleWarning(false);
  };

  const handleDayClick = (date: Date) => {
    const att = getAttendanceDay(date, service);
    if (!att) return;

    if (selectedSpecialistId) {
      const horarios = (service as Service & { especialistaHorarios?: { id: number; dias: { dia: WeekDay }[] }[] }).especialistaHorarios;
      const entry = horarios?.find((h) => h.id === selectedSpecialistId);
      const weekDay = JS_TO_WEEKDAY[date.getDay()];
      if (!entry || !entry.dias.some((d) => d.dia === weekDay)) return;
    }

    setSelectedDate(date);
    setSelectedBlockIndex(0);
    setSelectedSessionPage(1);
    setSelectedAppointment(null);
    setShowRescheduleWarning(false);
  };

  const selectedAtt = selectedDate ? getAttendanceDay(selectedDate, service) : null;
  const selectedAppts = selectedDate ? getApptsForDate(selectedDate, service, filteredAppointments) : [];
  const selectedBlocks = selectedAtt && selectedSpecialistId
    ? (() => {
        const horarios = (service as Service & { especialistaHorarios?: { id: number; dias: { dia: WeekDay; bloques: number[] }[] }[] }).especialistaHorarios;
        const entry = horarios?.find((h) => h.id === selectedSpecialistId);
        const dayEntry = entry?.dias.find((d) => d.dia === selectedAtt.dia);
        if (!dayEntry) return [];
        return dayEntry.bloques.map((bi) => selectedAtt.bloques[bi]).filter(Boolean);
      })()
    : (selectedAtt?.bloques ?? []);
  const currentBlock = selectedBlocks[selectedBlockIndex] ?? null;
  const blockSessions = currentBlock ? calculateSessions(currentBlock, service.duracion) : [];

  const currentBlockAppointments = currentBlock
    ? selectedAppts.filter((a) => {
        const sessions = calculateSessions(currentBlock, service.duracion);
        return sessions.some((s) => s.inicio === a.sesion.inicio);
      })
    : [];

  const selectedAppointmentSpecialist = selectedAppointment
    ? specialists.find((s) => s.id === selectedAppointment.specialistId) ?? null
    : null;

  const selectedAppointmentClient = selectedAppointment?.clientId
    ? clients.find((c) => c.id === selectedAppointment.clientId) ?? null
    : null;

  // Whether the currently selected date is in the past
  const selectedDateIsPast = selectedDate ? isPastDate(selectedDate, today) : false;

  // Whether the appointment shown in the detail modal is completed
  const detailApptIsPast = selectedAppointment
    ? (() => {
        // Find the date object for selectedAppointment.fecha by checking selectedDate
        // selectedDate is always set when selectedAppointment is set
        return selectedDate ? isPastDate(selectedDate, today) : false;
      })()
    : false;

  const handleSpecialistSelection = (specialistId: number | null) => {
    setSelectedSpecialistId(specialistId);
    setIsSpecialistMenuOpen(false);
    setSelectedDate(null);
    setSelectedBlockIndex(0);
    setSelectedSessionPage(1);
    setSelectedAppointment(null);
    setShowRescheduleWarning(false);
  };

  if (!isOpen) return null;

  const totalSessionPages = Math.max(1, Math.ceil(blockSessions.length / SESSIONS_PER_PAGE));
  const paginatedSessions = blockSessions.slice(
    (selectedSessionPage - 1) * SESSIONS_PER_PAGE,
    selectedSessionPage * SESSIONS_PER_PAGE
  );

  const handlePrevBlock = () => {
    if (!selectedBlocks.length) return;
    setSelectedBlockIndex((prev) => Math.max(0, prev - 1));
    setSelectedSessionPage(1);
  };

  const handleNextBlock = () => {
    if (!selectedBlocks.length) return;
    setSelectedBlockIndex((prev) => Math.min(selectedBlocks.length - 1, prev + 1));
    setSelectedSessionPage(1);
  };

  const sessionToShow = selectedBlocks.length > 0 ? currentBlock : null;

  const handleRescheduleClick = () => {
    if (detailApptIsPast) {
      setShowRescheduleWarning(true);
    } else {
      onReschedule(selectedAppointment!);
      setSelectedAppointment(null);
    }
  };

  const handleRescheduleConfirm = () => {
    onReschedule(selectedAppointment!);
    setSelectedAppointment(null);
    setShowRescheduleWarning(false);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-3 md:p-4">
      <div className="bg-[var(--bg-card)] rounded-none sm:rounded-[2rem] w-full h-full sm:h-auto sm:max-w-6xl sm:max-h-[90vh] overflow-hidden flex flex-col border-0 sm:border border-[var(--border-subtle)] shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 md:px-8 py-3.5 sm:py-4 md:py-5 border-b border-[var(--border-subtle)] flex-shrink-0">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base md:text-lg font-black text-[var(--text-primary)] tracking-tight truncate">
              {service.denominacion}
            </h2>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.28em]">
                Calendario de Sesiones
              </p>

              <div ref={specialistMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsSpecialistMenuOpen((prev) => !prev)}
                  className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.26em] transition-all ${
                    selectedSpecialistId === null
                      ? 'border-[#69BEEB]/25 dark:border-[#66D6A8]/20 bg-[#69BEEB]/10 dark:bg-[#66D6A8]/10 text-[#69BEEB] dark:text-[#66D6A8] shadow-sm shadow-[#69BEEB]/10 dark:shadow-[#66D6A8]/10'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:border-[#69BEEB]/30 dark:hover:border-[#66D6A8]/30 hover:text-[#69BEEB] dark:hover:text-[#66D6A8]'
                  }`}
                  aria-haspopup="listbox"
                  aria-expanded={isSpecialistMenuOpen}
                >
                  <span className={`flex h-5 min-w-5 items-center justify-center rounded-lg text-[8px] font-black ${
                    selectedSpecialistId === null ? 'bg-[#69BEEB]/15 dark:bg-[#66D6A8]/10 text-[#69BEEB] dark:text-[#66D6A8]' : 'bg-[var(--bg-card)] text-[var(--text-secondary)]'
                  }`}>
                    {activeSpecialist ? getAvatarChars(activeSpecialist) : 'AA'}
                  </span>
                  <span className="max-w-[180px] truncate normal-case tracking-normal">
                    {specialistSelectorLabel}
                  </span>
                  <Icon name={isSpecialistMenuOpen ? 'ChevronUp' : 'ChevronDown'} className="w-3.5 h-3.5 opacity-80" />
                </button>

                {isSpecialistMenuOpen && (
                  <div className="absolute left-0 top-[calc(100%+0.5rem)] z-20 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-2xl">
                    <div className="px-3 py-2 border-b border-[var(--border-subtle)]">
                      <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[var(--text-secondary)]">
                        Selecciona un especialista
                      </p>
                    </div>

                    <div className="max-h-72 overflow-auto p-2">
                      <button
                        type="button"
                        onClick={() => handleSpecialistSelection(null)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                          selectedSpecialistId === null
                            ? 'bg-[#69BEEB]/10 dark:bg-[#66D6A8]/10 text-[#69BEEB] dark:text-[#66D6A8]'
                            : 'hover:bg-[var(--bg-secondary)]'
                        }`}
                      >
                        <span className={`flex h-9 w-9 items-center justify-center rounded-xl border text-[10px] font-black ${
                          selectedSpecialistId === null
                            ? 'border-[#69BEEB]/20 dark:border-[#66D6A8]/20 bg-[#69BEEB]/15 dark:bg-[#66D6A8]/10 text-[#69BEEB] dark:text-[#66D6A8]'
                            : 'border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                        }`}>
                          AA
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                            Todos los Especialistas
                          </p>
                          <p className="truncate text-[11px] text-[var(--text-secondary)]">
                            Ver el calendario general
                          </p>
                        </div>
                        {selectedSpecialistId === null && (
                          <Icon name="Check" className="h-4 w-4 text-[#69BEEB] dark:text-[#66D6A8]" />
                        )}
                      </button>

                      <div className="my-2 h-px bg-[var(--border-subtle)]" />

                      {serviceSpecialists.map((sp) => {
                        const isSelected = selectedSpecialistId === sp.id;
                        return (
                          <button
                            key={sp.id}
                            type="button"
                            onClick={() => handleSpecialistSelection(sp.id)}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                              isSelected
                                ? 'bg-[#69BEEB]/10 dark:bg-[#66D6A8]/10 text-[#69BEEB] dark:text-[#66D6A8]'
                                : 'hover:bg-[var(--bg-secondary)]'
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
                              <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                                {sp.nombres} {sp.apellidos}
                              </p>
                              <p className="truncate text-[11px] text-[var(--text-secondary)]">
                                {sp.especialidad || 'Especialista disponible'}
                              </p>
                            </div>
                            {isSelected && <Icon name="Check" className="h-4 w-4 text-[#69BEEB] dark:text-[#66D6A8]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center hover:bg-rose-500/10 hover:text-rose-500 transition-all"
          >
            <Icon name="X" className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden">

          {/* Calendario */}
          <div className="flex-1 px-4 md:px-6 py-4 md:py-5 flex flex-col gap-3 md:gap-4 md:overflow-hidden">

            {/* Month nav */}
            <div className="flex items-center justify-between">
              <button
                onClick={goToPrev}
                className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center hover:bg-[#69BEEB]/10 dark:hover:bg-[#66D6A8]/10 hover:text-[#69BEEB] dark:hover:text-[#66D6A8] transition-all"
              >
                <Icon name="ChevronLeft" className="w-4 h-4" />
              </button>
              <h3 className="text-xs md:text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.24em] text-center">
                {MONTH_NAMES[month]} {year}
              </h3>
              <button
                onClick={goToNext}
                className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center hover:bg-[#69BEEB]/10 dark:hover:bg-[#66D6A8]/10 hover:text-[#69BEEB] dark:hover:text-[#66D6A8] transition-all"
              >
                <Icon name="ChevronRight" className="w-4 h-4" />
              </button>
            </div>

            {/* Days header */}
            <div className="grid grid-cols-7 gap-1">
              {DAY_HEADERS.map(({ label, weekDay }) => {
                const isServiceDay = service.diasAtencion.some((d) => d.dia === weekDay);
                return (
                  <div
                    key={label}
                    className={`text-center text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] py-1 ${
                      isServiceDay ? 'text-[#69BEEB] dark:text-[#66D6A8]' : 'text-[var(--text-secondary)] opacity-40'
                    }`}
                  >
                    {label}
                  </div>
                );
              })}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calDays.map((date, idx) => {
                if (!date) return <div key={`empty-${idx}`} className="h-8 md:h-9" />;

                const att = getAttendanceDay(date, service);
                const isAvailable = !!att && (
                  !specialistWeekdays || specialistWeekdays.has(JS_TO_WEEKDAY[date.getDay()])
                );
                const dayAppts = getApptsForDate(date, service, filteredAppointments);
                const hasAppts = dayAppts.length > 0;
                const isToday = date.toDateString() === today.toDateString();
                const isSelected = selectedDate?.toDateString() === date.toDateString();
                const isPast = isPastDate(date, today);

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => handleDayClick(date)}
                    disabled={!isAvailable}
                    className={`
                      relative h-8 md:h-9 w-full
                      rounded-lg md:rounded-xl flex flex-col items-center justify-center gap-0.5
                      text-[11px] md:text-xs font-black transition-all
                      ${!isAvailable ? 'text-[var(--text-secondary)] opacity-25 cursor-not-allowed' : ''}
                      ${isAvailable && !isSelected ? 'hover:bg-[#69BEEB]/10 dark:hover:bg-[#66D6A8]/10 hover:text-[#69BEEB] dark:hover:text-[#66D6A8] cursor-pointer' : ''}
                      ${isAvailable && isPast && !isSelected ? 'opacity-70' : ''}
                      ${isSelected ? 'bg-[#69BEEB] dark:bg-[#4EC7B8] !text-white shadow-lg shadow-[#69BEEB]/20 dark:shadow-[#66D6A8]/20' : ''}
                      ${isToday && !isSelected ? 'ring-2 ring-[#69BEEB] dark:ring-[#66D6A8] ring-offset-1 ring-offset-[var(--bg-card)]' : ''}
                    `}
                  >
                    <span className="leading-none">{date.getDate()}</span>
                    {hasAppts && (
                      <div className={`w-1 h-1 rounded-full ${
                        isSelected ? 'bg-white' : isPast ? 'bg-emerald-400' : 'bg-[#69BEEB] dark:bg-[#66D6A8]'
                      }`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 md:gap-6 pt-2 md:pt-3 border-t border-[var(--border-subtle)] flex-wrap">
              <span className="flex items-center gap-2 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                <span className="w-3 h-3 rounded-lg bg-[#69BEEB]/20 dark:bg-[#66D6A8]/20 border border-[#69BEEB]/30 dark:border-[#66D6A8]/30" />
                Disponible
              </span>
              <span className="flex items-center gap-2 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-[#69BEEB] dark:bg-[#66D6A8]" />
                Con citas
              </span>
              <span className="flex items-center gap-2 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Completado
              </span>
              <span className="flex items-center gap-2 text-[9px] font-black text-[var(--text-secondary)] opacity-40 uppercase tracking-widest">
                <span className="w-3 h-3 rounded-lg border border-[var(--border-subtle)]" />
                No disponible
              </span>
            </div>
          </div>

          {/* Right panel */}
          <div className="w-full md:w-[320px] lg:w-[340px] flex-shrink-0 border-t md:border-t-0 md:border-l border-[var(--border-subtle)] flex flex-col md:overflow-hidden bg-[var(--bg-card)]">
            {!selectedDate ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 md:p-8 text-center">
                <div className="w-14 h-14 rounded-[1.5rem] bg-[var(--bg-secondary)] flex items-center justify-center border border-[var(--border-subtle)]">
                  <Icon name="CalendarSearch" className="w-6 h-6 text-[var(--text-secondary)]" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                    Selecciona un día
                  </p>
                  <p className="text-[9px] font-bold text-[var(--text-secondary)] mt-1 uppercase tracking-widest">
                    Cualquier día con disponibilidad
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col md:overflow-hidden">

                {/* Selected day header */}
                <div className={`px-5 py-4 border-b border-[var(--border-subtle)] flex-shrink-0 ${
                  selectedDateIsPast ? 'bg-emerald-500/5' : 'bg-[var(--bg-secondary)]/30'
                }`}>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest">
                      {formatFecha(selectedDate)}
                    </p>
                    {selectedDateIsPast && (
                      <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md uppercase tracking-widest">
                        Completado
                      </span>
                    )}
                  </div>
                  {selectedAppts.length > 0 ? (
                    <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${
                      selectedDateIsPast ? 'text-emerald-500' : 'text-[#69BEEB] dark:text-[#66D6A8]'
                    }`}>
                      {selectedAppts.length} cita{selectedAppts.length !== 1 ? 's' : ''}{' '}
                      {selectedDateIsPast ? 'completada' : 'agendada'}{selectedAppts.length !== 1 ? 's' : ''}
                    </p>
                  ) : (
                    <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-0.5">
                      Sin citas {selectedDateIsPast ? 'registradas' : 'agendadas'}
                    </p>
                  )}
                </div>

                <div className="flex-1 flex flex-col md:overflow-hidden">
                  <div className="p-4 pb-3 flex-shrink-0">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <button
                        onClick={handlePrevBlock}
                        disabled={selectedBlocks.length <= 1 || selectedBlockIndex === 0}
                        className="w-8 h-8 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center hover:bg-[#69BEEB]/10 dark:hover:bg-[#66D6A8]/10 hover:text-[#69BEEB] dark:hover:text-[#66D6A8] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        aria-label="Bloque anterior"
                      >
                        <Icon name="ChevronLeft" className="w-4 h-4" />
                      </button>
                      <div className="flex-1 min-w-0 text-center">
                        <p className="text-[12px] font-semibold text-[var(--text-primary)]">
                          {selectedBlocks.length > 0 && sessionToShow
                            ? `Bloques del día · ${getBlockLabel(selectedBlockIndex)}`
                            : 'Sin bloques disponibles'}
                        </p>
                      </div>
                      <button
                        onClick={handleNextBlock}
                        disabled={selectedBlocks.length <= 1 || selectedBlockIndex >= selectedBlocks.length - 1}
                        className="w-8 h-8 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center hover:bg-[#69BEEB]/10 dark:hover:bg-[#66D6A8]/10 hover:text-[#69BEEB] dark:hover:text-[#66D6A8] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        aria-label="Bloque siguiente"
                      >
                        <Icon name="ChevronRight" className="w-4 h-4" />
                      </button>
                    </div>

                    {currentBlock && (
                      <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                        selectedDateIsPast
                          ? 'border-emerald-500/20 bg-emerald-500/5'
                          : 'border-[#69BEEB]/20 dark:border-[#66D6A8]/20 bg-[#69BEEB]/5 dark:bg-[#66D6A8]/10'
                      }`}>
                        <div>
                          <p className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">
                            {currentBlock.inicio} – {currentBlock.fin}
                          </p>
                          {currentBlockAppointments.length > 0 ? (
                            <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${
                              selectedDateIsPast ? 'text-emerald-500' : 'text-[#69BEEB] dark:text-[#66D6A8]'
                            }`}>
                              {currentBlockAppointments.length}{' '}
                              {selectedDateIsPast ? 'completada' : 'agendada'}{currentBlockAppointments.length !== 1 ? 's' : ''}
                            </p>
                          ) : (
                            <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-1">
                              Sin citas en este bloque
                            </p>
                          )}
                        </div>
                        <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                          {selectedBlockIndex + 1}/{Math.max(selectedBlocks.length, 1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {currentBlock ? (
                    <div className="flex-1 flex flex-col border-t border-[var(--border-subtle)] md:overflow-hidden">
                      <div className="px-4 pt-4 pb-2 flex-shrink-0">
                        <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-1">
                          Sesiones · {currentBlock.inicio}–{currentBlock.fin}
                        </p>
                      </div>

                      <div className="flex-1 overflow-hidden px-4 pb-3">
                        <div className="space-y-2">
                          {paginatedSessions.map((ses) => {
                            const appt = selectedAppts.find((a) => a.sesion.inicio === ses.inicio);
                            const isCompleted = selectedDateIsPast;

                            if (isCompleted) {
                              return (
                                <button
                                  key={ses.inicio}
                                  type="button"
                                  onClick={() => appt && setSelectedAppointment(appt)}
                                  disabled={!appt}
                                  className={`w-full rounded-xl border p-3.5 text-left transition-all ${
                                    appt
                                      ? 'bg-emerald-500/8 border-emerald-500/20 hover:brightness-105 hover:shadow-sm cursor-pointer'
                                      : 'bg-[var(--bg-secondary)]/30 border-[var(--border-subtle)] cursor-default opacity-50'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="text-[11px] font-black font-mono text-[var(--text-primary)]">
                                      {ses.inicio} – {ses.fin}
                                    </span>
                                    {appt ? (
                                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border bg-emerald-500/10 border-emerald-500/20 text-emerald-600">
                                        Completada
                                      </span>
                                    ) : (
                                      <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                                        Expirada
                                      </span>
                                    )}
                                  </div>
                                </button>
                              );
                            }

                            return (
                              <button
                                key={ses.inicio}
                                type="button"
                                onClick={() => appt && setSelectedAppointment(appt)}
                                disabled={!appt}
                                className={`w-full rounded-xl border p-3.5 text-left transition-all ${
                                  appt
                                    ? 'bg-[#69BEEB]/10 dark:bg-[#66D6A8]/10 border-[#69BEEB]/20 dark:border-[#66D6A8]/20 text-[#69BEEB] dark:text-[#66D6A8] hover:brightness-110 hover:shadow-md cursor-pointer'
                                    : 'bg-[var(--bg-secondary)]/50 border-[var(--border-subtle)] cursor-default'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-[11px] font-black font-mono text-[var(--text-primary)]">
                                    {ses.inicio} – {ses.fin}
                                  </span>
                                  {appt ? (
                                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border bg-[#69BEEB]/10 dark:bg-[#66D6A8]/10 border-[#69BEEB]/20 dark:border-[#66D6A8]/20 text-[#69BEEB] dark:text-[#66D6A8]">
                                      Agendada
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                                      Libre
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {blockSessions.length > SESSIONS_PER_PAGE && (
                        <div className="px-4 pb-4 pt-1 flex-shrink-0">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {Array.from({ length: totalSessionPages }, (_, i) => i + 1).map((page) => (
                              <button
                                key={page}
                                onClick={() => setSelectedSessionPage(page)}
                                className={`min-w-8 h-8 px-2 rounded-lg text-[10px] font-black transition-all border ${
                                  page === selectedSessionPage
                                    ? 'bg-[#69BEEB] dark:bg-[#4EC7B8] text-white border-[#69BEEB] dark:border-[#4EC7B8] shadow-sm shadow-[#69BEEB]/20 dark:shadow-[#66D6A8]/20'
                                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[#69BEEB]/30 dark:hover:border-[#66D6A8]/30 hover:text-[#69BEEB] dark:hover:text-[#66D6A8]'
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center p-8 text-center">
                      <div>
                        <p className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                          No hay bloques para este día
                        </p>
                        <p className="text-[9px] font-bold text-[var(--text-secondary)] mt-1 uppercase tracking-widest">
                          Selecciona otra fecha con disponibilidad
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[1.5rem] sm:rounded-[2rem] border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-2xl">

            <div className={`flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)] ${
              detailApptIsPast ? 'bg-emerald-500/5' : ''
            }`}>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-[var(--text-primary)] uppercase tracking-tight">
                    Detalle de sesión
                  </h3>
                  {detailApptIsPast && (
                    <span className="text-[8px] font-black text-[#69BEEB] dark:text-[#66D6A8] bg-[#69BEEB]/10 dark:bg-[#66D6A8]/10 border border-[#69BEEB]/20 dark:border-[#66D6A8]/20 px-2 py-0.5 rounded-md uppercase tracking-widest">
                      Completada
                    </span>
                  )}
                </div>
                <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-0.5">
                  {selectedAppointment.sesion.inicio} – {selectedAppointment.sesion.fin}
                </p>
              </div>
              <button
                onClick={() => { setSelectedAppointment(null); setShowRescheduleWarning(false); }}
                className="w-9 h-9 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center hover:bg-rose-500/10 hover:text-rose-500 transition-all"
              >
                <Icon name="X" className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-end gap-3">
                <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                  {selectedAppointment.cuposOcupados} cupo{selectedAppointment.cuposOcupados !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/40 p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">
                      Especialista
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-[10px] font-black text-[#69BEEB] dark:text-[#66D6A8] border border-[var(--border-subtle)] overflow-hidden flex-shrink-0">
                        {selectedAppointmentSpecialist?.foto ? (
                          <Image src={selectedAppointmentSpecialist.foto} fill sizes="36px" className="object-cover" alt="" />
                        ) : (
                          <span>{selectedAppointmentSpecialist ? getAvatarChars(selectedAppointmentSpecialist) : '??'}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                          {selectedAppointmentSpecialist
                            ? `${selectedAppointmentSpecialist.nombres} ${selectedAppointmentSpecialist.apellidos}`
                            : 'Sin especialista'}
                        </p>
                        {selectedAppointmentSpecialist?.especialidad && (
                          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 truncate">
                            {selectedAppointmentSpecialist.especialidad}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">
                      Cliente
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-[10px] font-black text-[#69BEEB] dark:text-[#66D6A8] border border-[var(--border-subtle)] overflow-hidden flex-shrink-0">
                        <span>{selectedAppointmentClient ? getClientChars(selectedAppointmentClient) : '??'}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                          {selectedAppointmentClient
                            ? `${selectedAppointmentClient.nombres} ${selectedAppointmentClient.apellidos}`
                            : 'Sin cliente'}
                        </p>
                        {selectedAppointmentClient && (
                          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 truncate">
                            DNI {selectedAppointmentClient.dni}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">Fecha</p>
                    <p className="text-sm font-bold text-[var(--text-primary)]">{selectedAppointment.fecha}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">Sesión</p>
                    <p className="text-sm font-bold text-[var(--text-primary)]">
                      {selectedAppointment.sesion.inicio} – {selectedAppointment.sesion.fin}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reschedule warning (completed session) */}
              {showRescheduleWarning ? (
                <div className="rounded-2xl border border-[#69BEEB]/25 dark:border-[#66D6A8]/25 bg-[#69BEEB]/8 dark:bg-[#66D6A8]/8 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 dark:bg-[#66D6A8]/10 border border-emerald-500/25 dark:border-[#66D6A8]/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon name="AlertTriangle" className="w-4 h-4 text-[#69BEEB] dark:text-[#66D6A8]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-[#69BEEB] dark:text-[#66D6A8] uppercase tracking-widest">Sesión ya completada</p>
                      <p className="text-[11px] font-semibold text-[var(--text-secondary)] mt-1 leading-snug">
                        Esta sesión ya expiró. ¿Deseas reprogramarla de todas formas?
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowRescheduleWarning(false)}
                      className="flex-1 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:opacity-80 transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleRescheduleConfirm}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-500 dark:bg-[#4EC7B8] text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all"
                    >
                      Sí, reprogramar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleRescheduleClick}
                  className={`w-full py-3 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] hover:opacity-90 transition-all ${
                    detailApptIsPast ? 'bg-[#69BEEB] dark:bg-[#4EC7B8]' : 'bg-[#69BEEB] dark:bg-[#4EC7B8]'
                  }`}
                >
                  Reprogramar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}