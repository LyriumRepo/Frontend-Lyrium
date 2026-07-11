'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';

// ─── Calendar helpers ─────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const DAY_HEADERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const JS_TO_MON: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 6 };

function getCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  const days: (Date | null)[] = Array(JS_TO_MON[firstDay.getDay()]).fill(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function toISODateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatFechaShort(date: Date): string {
  return `${date.getDate()} de ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

function formatFechaLong(date: Date): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return `${days[date.getDay()]} ${date.getDate()} de ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

// ─── Mock specialists ─────────────────────────────────────────────────────────
// 🔧 TEST DATA — reemplazar con respuesta de:
//    GET /api/specialists/available?date={YYYY-MM-DD}&serviceId={id}
//    Respuesta esperada: SpecialistOption[]

export interface SpecialistOption {
  id: string;
  name: string;
  specialty: string;
  initials: string;
  avatarGradient: string; // clases Tailwind para el gradiente del avatar
  rating: number;
  reviewCount: number;
  slots: string[];        // Horarios disponibles para la fecha seleccionada
}

export const MOCK_SPECIALISTS: SpecialistOption[] = [
  {
    id: 'SP-001',
    name: 'Dr. Carlos Mendoza',
    specialty: 'Medicina General',
    initials: 'CM',
    avatarGradient: 'from-sky-500 to-sky-600',
    rating: 4.8,
    reviewCount: 124,
    slots: ['08:30', '10:00', '11:30', '14:00', '16:30'],
  },
  {
    id: 'SP-002',
    name: 'Dra. Ana Torres',
    specialty: 'Odontología General',
    initials: 'AT',
    avatarGradient: 'from-violet-500 to-violet-600',
    rating: 4.9,
    reviewCount: 87,
    slots: ['09:00', '10:30', '13:00', '15:30'],
  },
  {
    id: 'SP-003',
    name: 'Dr. Luis Paredes',
    specialty: 'Fisioterapia y Rehabilitación',
    initials: 'LP',
    avatarGradient: 'from-emerald-500 to-emerald-600',
    rating: 4.7,
    reviewCount: 56,
    slots: ['09:30', '11:00', '14:30', '16:00'],
  },
  {
    id: 'SP-004',
    name: 'Dra. María Gómez',
    specialty: 'Nutrición Clínica',
    initials: 'MG',
    avatarGradient: 'from-rose-500 to-rose-600',
    rating: 4.6,
    reviewCount: 43,
    slots: ['08:00', '10:00', '12:30', '15:00', '17:00'],
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

/** Payload enviado al backend al confirmar la reprogramación */
export interface SelectedSpecialist {
  id: string;
  name: string;
  specialty: string;
  slot: string; // Horario seleccionado, ej. "09:00"
}

export interface ClientRescheduleOrderData {
  id: string;
  tipo_envio?: string;
  estado: string;
  fechaCita?: string;        // "YYYY-MM-DD"
  reprogramaciones?: number; // 0 = ninguna, 1 = ya hizo 1
  solicitudEnviada?: boolean;
  tienda?: string;
  detalle?: string;
}

interface ClientRescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: ClientRescheduleOrderData | null;
  /**
   * Llamado al confirmar:
   * - orderId    → ID del pedido
   * - newDateISO → "YYYY-MM-DD" fecha nueva
   * - specialist → especialista y horario elegidos
   */
  onConfirm: (orderId: string, newDateISO: string, specialist: SelectedSpecialist) => void;
  onSendRequest: (orderId: string) => void;
}

type ModalView = 'calendar' | 'blocked_same_day' | 'limit_reached' | 'request_sent';
type CalStep   = 'date' | 'specialist';

// ─── View resolver ────────────────────────────────────────────────────────────

function resolveView(order: ClientRescheduleOrderData, today: Date): ModalView {
  if (order.solicitudEnviada) return 'request_sent';
  if ((order.reprogramaciones ?? 0) >= 1) return 'limit_reached';
  if (order.fechaCita) {
    const todayNorm = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const appt      = new Date(order.fechaCita + 'T00:00:00');
    const apptNorm  = new Date(appt.getFullYear(), appt.getMonth(), appt.getDate());
    if (apptNorm.getTime() === todayNorm.getTime()) return 'blocked_same_day';
  }
  return 'calendar';
}

// ─── StarRating ───────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-2.5 h-2.5 ${s <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200 dark:text-gray-600'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-[9px] font-black text-gray-500 dark:text-[var(--text-muted)]">{rating}</span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ClientRescheduleModal({
  isOpen,
  onClose,
  order,
  onConfirm,
  onSendRequest,
}: ClientRescheduleModalProps) {
  const today     = new Date();
  const todayNorm = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const [currentMonth,       setCurrentMonth]       = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate,       setSelectedDate]       = useState<Date | null>(null);
  const [calStep,            setCalStep]            = useState<CalStep>('date');
  const [selectedSpecialist, setSelectedSpecialist] = useState<SpecialistOption | null>(null);
  const [selectedSlot,       setSelectedSlot]       = useState<string | null>(null);
  const [sending,            setSending]            = useState(false);
  const [localRequestSent,   setLocalRequestSent]   = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
      setSelectedDate(null);
      setCalStep('date');
      setSelectedSpecialist(null);
      setSelectedSlot(null);
      setSending(false);
      setLocalRequestSent(false);
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const view: ModalView = localRequestSent ? 'request_sent' : resolveView(order, today);
  const year   = currentMonth.getFullYear();
  const month  = currentMonth.getMonth();
  const calDays = getCalendarDays(year, month);

  const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const maxMonth   = new Date(today.getFullYear() + 1, today.getMonth(), 1);
  const canGoPrev  = currentMonth > todayMonth;
  const canGoNext  = currentMonth < maxMonth;

  function handleSlotPick(specialist: SpecialistOption, slot: string) {
    setSelectedSpecialist(specialist);
    setSelectedSlot(slot);
  }

  function handleBackToDate() {
    setCalStep('date');
    setSelectedSpecialist(null);
    setSelectedSlot(null);
  }

  function handleSendRequest() {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setLocalRequestSent(true);
      onSendRequest(order!.id);
    }, 800);
  }

  function handleConfirm() {
    if (!selectedDate || !selectedSpecialist || !selectedSlot) return;
    onConfirm(order!.id, toISODateString(selectedDate), {
      id:        selectedSpecialist.id,
      name:      selectedSpecialist.name,
      specialty: selectedSpecialist.specialty,
      slot:      selectedSlot,
    });
  }

  // ─── Step indicator (solo en view calendar) ───────────────────────────────
  const StepIndicator = () => (
    <div className="flex items-center gap-2 px-1">
      {/* Paso 1 */}
      <div className="flex items-center gap-1.5">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black transition-all ${
          calStep === 'date'
            ? 'bg-sky-500 dark:bg-[var(--brand-green)] text-white'
            : 'bg-emerald-500 text-white'
        }`}>
          {calStep === 'specialist' ? (
            <svg className="w-2.5 h-2.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : '1'}
        </div>
        <span className={`text-[9px] font-black uppercase tracking-wider transition-colors ${
          calStep === 'date' ? 'text-sky-500 dark:text-[var(--icons-green)]' : 'text-emerald-500'
        }`}>
          Fecha
        </span>
      </div>

      <div className={`flex-1 h-px transition-colors ${
        calStep === 'specialist'
          ? 'bg-emerald-400 dark:bg-emerald-500'
          : 'bg-gray-200 dark:bg-[var(--border-subtle)]'
      }`} />

      {/* Paso 2 */}
      <div className="flex items-center gap-1.5">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black transition-all ${
          calStep === 'specialist'
            ? 'bg-sky-500 dark:bg-[var(--brand-green)] text-white'
            : 'bg-gray-200 dark:bg-[var(--bg-muted)] text-gray-400'
        }`}>
          2
        </div>
        <span className={`text-[9px] font-black uppercase tracking-wider transition-colors ${
          calStep === 'specialist'
            ? 'text-sky-500 dark:text-[var(--icons-green)]'
            : 'text-gray-400 dark:text-[var(--text-secondary)]'
        }`}>
          Especialista
        </span>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-md z-[100] flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[var(--bg-secondary)] w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl border border-white/20 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header ───────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-sky-500 to-sky-400 dark:from-[var(--brand-green-hover)] dark:to-[var(--brand-green)] p-4 sm:p-5 text-white relative flex-shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                <Icon name="CalendarClock" className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-tighter leading-none">Reprogramar Cita</h3>
                {order.tienda && (
                  <p className="text-[9px] font-bold text-sky-100 uppercase tracking-[0.2em] mt-0.5 truncate max-w-[160px]">
                    {order.tienda}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-all"
            >
              <Icon name="X" className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* ─── Body (scrollable) ────────────────────────────────────────── */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">

          {/* ── VIEW: blocked_same_day ───────────────────────────────── */}
          {view === 'blocked_same_day' && (
            <>
              <div className="flex flex-col items-center text-center gap-4 py-5">
                <div className="w-16 h-16 rounded-2xl bg-sky-100 dark:bg-[var(--brand-green)]/30 border border-sky-200 dark:border-[var(--icons-green)]/30 flex items-center justify-center">
                  <Icon name="CalendarX2" className="w-7 h-7 text-sky-500 dark:text-[var(--icons-green)]" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-black text-gray-800 dark:text-[var(--text-primary)]">
                    Hoy es el día de su cita
                  </p>
                  <p className="text-xs text-gray-500 dark:text-[var(--text-muted)] leading-relaxed max-w-[260px]">
                    No puede realizar una reprogramación el mismo día de su cita. Podrá solicitar un cambio a partir de mañana.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-600 dark:text-[var(--text-primary)] font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-[#2A3F33] transition-all"
              >
                Entendido
              </button>
            </>
          )}

          {/* ── VIEW: limit_reached ──────────────────────────────────── */}
          {view === 'limit_reached' && (
            <>
              <div className="flex flex-col items-center text-center gap-4 py-3">
                <div className="w-16 h-16 rounded-2xl bg-sky-100 dark:bg-[var(--icons-green)]/15 border border-sky-200 dark:border-[var(--icons-green)]/20 flex items-center justify-center">
                  <Icon name="AlertCircle" className="w-7 h-7 text-sky-500 dark:text-[var(--icons-green)]" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-black text-gray-800 dark:text-[var(--text-primary)]">
                    Límite de reprogramaciones alcanzado
                  </p>
                  <p className="text-xs text-gray-500 dark:text-[var(--text-muted)] leading-relaxed max-w-[260px]">
                    Ya realizó 1 reprogramación. Para un nuevo cambio de fecha deberá enviar una solicitud al centro de salud. Ellos se pondrán en contacto con usted.
                  </p>
                  <p className="text-xs font-black text-gray-500 dark:text-[var(--text-muted)] leading-relaxed max-w-[260px]">
                   (Mensaje para backend: Esta solicitud se debe enviar como mensaje a la tienda donde se compro este servicio, a través del modulo chat con vendedores/clientes.)
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleSendRequest}
                  disabled={sending}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-400 dark:from-[var(--brand-green)] dark:to-[var(--brand-green-hover)] text-white font-black text-[10px] uppercase tracking-widest hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Icon name="Send" className="w-3.5 h-3.5" />
                  )}
                  {sending ? 'Enviando solicitud...' : 'Enviar solicitud al centro de salud'}
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-2xl text-gray-500 dark:text-[var(--text-muted)] font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)] transition-all"
                >
                  Cancelar
                </button>
              </div>
            </>
          )}

          {/* ── VIEW: request_sent ───────────────────────────────────── */}
          {view === 'request_sent' && (
            <>
              <div className="flex flex-col items-center text-center gap-4 py-5">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center">
                  <Icon name="CheckCircle2" className="w-7 h-7 text-emerald-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-black text-gray-800 dark:text-[var(--text-primary)]">
                    Solicitud enviada
                  </p>
                  <p className="text-xs text-gray-500 dark:text-[var(--text-muted)] leading-relaxed max-w-[260px]">
                    Su solicitud de reprogramación fue enviada al centro de salud. Pronto se pondrán en contacto con usted para coordinar.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 dark:from-[var(--brand-green)] dark:to-[var(--brand-green-hover)] text-white font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all"
              >
                Cerrar
              </button>
            </>
          )}

          {/* ── VIEW: calendar ───────────────────────────────────────── */}
          {view === 'calendar' && (
            <>
              {/* Indicador de pasos */}
              <StepIndicator />

              {/* ── PASO 1: Seleccionar fecha ──────────────────────── */}
              {calStep === 'date' && (
                <>
                  {/* Banner info */}
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20">
                    <Icon name="Info" className="w-4 h-4 text-sky-500 dark:text-[var(--icons-green)] flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-sky-700 dark:text-sky-300 leading-relaxed">
                      El centro de salud necesita mínimo 24 horas de anticipación. El día de hoy está inhabilitado.
                    </p>
                  </div>

                  {/* Calendario */}
                  <div className="space-y-2 bg-sky-50 dark:bg-[var(--bg-card)] p-3 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => { if (canGoPrev) { setCurrentMonth(new Date(year, month - 1, 1)); setSelectedDate(null); } }}
                        disabled={!canGoPrev}
                        className="w-7 h-7 rounded-lg text-sky-500 dark:text-[var(--icons-green)] hover:bg-sky-200 dark:hover:bg-white/10 flex items-center justify-center disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                      >
                        <Icon name="ChevronLeft" className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] font-black text-sky-600 dark:text-[var(--icons-green)] uppercase tracking-widest">
                        {MONTH_NAMES[month]} {year}
                      </span>
                      <button
                        onClick={() => { if (canGoNext) { setCurrentMonth(new Date(year, month + 1, 1)); setSelectedDate(null); } }}
                        disabled={!canGoNext}
                        className="w-7 h-7 rounded-lg text-sky-500 dark:text-[var(--icons-green)] hover:bg-sky-200 dark:hover:bg-white/10 flex items-center justify-center disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                      >
                        <Icon name="ChevronRight" className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-0.5">
                      {DAY_HEADERS.map((h) => (
                        <div key={h} className="text-center text-[8px] font-black text-sky-500 dark:text-[var(--icons-green)] uppercase py-1">
                          {h}
                        </div>
                      ))}
                      {calDays.map((date, idx) => {
                        if (!date) return <div key={`e-${idx}`} className="h-8" />;
                        const dNorm     = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                        const isToday   = dNorm.getTime() === todayNorm.getTime();
                        const selectable = dNorm > todayNorm;
                        const isPast    = dNorm < todayNorm;
                        const isSelected = selectedDate?.toDateString() === date.toDateString();
                        return (
                          <button
                            key={date.toISOString()}
                            disabled={!selectable}
                            onClick={() => setSelectedDate(date)}
                            className={`relative h-8 w-full rounded-lg text-[11px] font-black transition-all
                              ${isPast ? 'text-gray-300 dark:text-gray-500 opacity-20 cursor-not-allowed' : ''}
                              ${isToday && !isSelected ? 'bg-sky-100 dark:bg-[var(--brand-green)]/20 text-sky-500 dark:text-[var(--icons-green)] opacity-50 cursor-not-allowed line-through ring-2 ring-sky-300/50 dark:ring-[var(--icons-green)]/30 ring-offset-1 ring-offset-sky-50 dark:ring-offset-[var(--bg-card)]' : ''}
                              ${selectable && !isSelected ? 'text-gray-700 dark:text-[var(--text-primary)] hover:bg-sky-200 dark:hover:bg-white/10 hover:text-sky-500 dark:hover:text-[var(--icons-green)] cursor-pointer' : ''}
                              ${isSelected ? 'bg-sky-500 dark:bg-[var(--brand-green)] text-white shadow-md shadow-sky-500/20 dark:shadow-[var(--icons-green)]/20' : ''}
                            `}
                          >
                            {date.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fecha seleccionada */}
                  {selectedDate ? (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-sky-500/8 dark:bg-[var(--icons-green)]/8 border border-sky-500/20 dark:border-[var(--icons-green)]/20">
                      <Icon name="CheckCircle2" className="w-4 h-4 text-sky-500 dark:text-[var(--icons-green)] flex-shrink-0" />
                      <div>
                        <p className="text-[9px] font-black text-sky-500 dark:text-[var(--icons-green)] uppercase tracking-widest">
                          Fecha seleccionada
                        </p>
                        <p className="text-sm font-black text-gray-800 dark:text-[var(--text-primary)]">
                          {formatFechaLong(selectedDate)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-dashed border-gray-200 dark:border-[var(--border-subtle)]">
                      <Icon name="CalendarSearch" className="w-4 h-4 text-gray-300 dark:text-[var(--text-secondary)]" />
                      <p className="text-[10px] font-bold text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-wider">
                        Seleccione una fecha en el calendario
                      </p>
                    </div>
                  )}

                  {/* Acciones paso 1 */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setCalStep('specialist')}
                      disabled={!selectedDate}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-400 dark:from-[var(--brand-green)] dark:to-[var(--brand-green-hover)] text-white font-black text-[10px] uppercase tracking-widest disabled:opacity-35 disabled:cursor-not-allowed hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                      Continuar — elegir especialista
                      <Icon name="ChevronRight" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={onClose}
                      className="w-full py-3 rounded-2xl text-gray-500 dark:text-[var(--text-muted)] font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)] transition-all"
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              )}

              {/* ── PASO 2: Elegir especialista ────────────────────── */}
              {calStep === 'specialist' && (
                <>
                  {/* Barra superior: fecha elegida + botón volver */}
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 dark:bg-[var(--bg-muted)]/60 border border-gray-100 dark:border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2">
                      <Icon name="Calendar" className="w-3.5 h-3.5 text-sky-500 dark:text-[var(--icons-green)]" />
                      <span className="text-[10px] font-black text-gray-700 dark:text-[var(--text-primary)]">
                        {selectedDate ? formatFechaShort(selectedDate) : '—'}
                      </span>
                    </div>
                    <button
                      onClick={handleBackToDate}
                      className="flex items-center gap-1 text-[9px] font-black text-sky-500 dark:text-[var(--icons-green)] uppercase tracking-wider hover:underline"
                    >
                      <Icon name="ChevronLeft" className="w-3 h-3" />
                      Cambiar
                    </button>
                  </div>

                  {/* Lista de especialistas */}
                  <div className="space-y-2.5">
                    {MOCK_SPECIALISTS.map((sp) => {
                      const isCardSelected = selectedSpecialist?.id === sp.id;
                      return (
                        <div
                          key={sp.id}
                          className={`rounded-2xl border transition-all ${
                            isCardSelected
                              ? 'border-sky-400/60 dark:border-[var(--icons-green)]/40 bg-sky-50/60 dark:bg-[var(--icons-green)]/5 shadow-sm'
                              : 'border-gray-100 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-secondary)]'
                          }`}
                        >
                          {/* Info del especialista */}
                          <div className="flex items-center gap-3 px-3.5 pt-3.5 pb-2">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${sp.avatarGradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                              <span className="text-[10px] font-black text-white">{sp.initials}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-gray-800 dark:text-[var(--text-primary)] truncate leading-tight">
                                {sp.name}
                              </p>
                              <p className="text-[9px] font-bold text-gray-400 dark:text-[var(--text-muted)] truncate">
                                {sp.specialty}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <StarRating rating={sp.rating} />
                                <span className="text-[8px] text-gray-400 dark:text-[var(--text-muted)]">
                                  ({sp.reviewCount} reseñas)
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Horarios disponibles */}
                          <div className="px-3.5 pb-3 flex flex-wrap gap-1.5">
                            {sp.slots.map((slot) => {
                              const isSlotActive = isCardSelected && selectedSlot === slot;
                              return (
                                <button
                                  key={slot}
                                  onClick={() => handleSlotPick(sp, slot)}
                                  className={`px-2.5 py-1 rounded-lg text-[9px] font-black transition-all ${
                                    isSlotActive
                                      ? 'bg-sky-500 dark:bg-[var(--brand-green)] text-white shadow-sm shadow-sky-500/20 dark:shadow-[var(--icons-green)]/20'
                                      : 'bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-600 dark:text-[var(--text-primary)] hover:bg-sky-100 dark:hover:bg-[var(--icons-green)]/10 hover:text-sky-600 dark:hover:text-[var(--icons-green)]'
                                  }`}
                                >
                                  {slot}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Resumen selección */}
                  {selectedSpecialist && selectedSlot ? (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-sky-500/8 dark:bg-[var(--icons-green)]/8 border border-sky-500/20 dark:border-[var(--icons-green)]/20">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${selectedSpecialist.avatarGradient} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-[9px] font-black text-white">{selectedSpecialist.initials}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black text-sky-500 dark:text-[var(--icons-green)] uppercase tracking-widest">
                          Confirmando con
                        </p>
                        <p className="text-xs font-black text-gray-800 dark:text-[var(--text-primary)] truncate">
                          {selectedSpecialist.name}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-[var(--text-muted)]">
                          {selectedDate ? formatFechaShort(selectedDate) : ''} · <strong>{selectedSlot}</strong>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-dashed border-gray-200 dark:border-[var(--border-subtle)]">
                      <Icon name="UserSearch" className="w-4 h-4 text-gray-300 dark:text-[var(--text-secondary)]" />
                      <p className="text-[10px] font-bold text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-wider">
                        Seleccione un especialista y horario
                      </p>
                    </div>
                  )}

                  {/* Acciones paso 2 */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleConfirm}
                      disabled={!selectedSpecialist || !selectedSlot}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-400 dark:from-[var(--brand-green)] dark:to-[var(--brand-green-hover)] text-white font-black text-[10px] uppercase tracking-widest disabled:opacity-35 disabled:cursor-not-allowed hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                      <Icon name="CheckCircle2" className="w-4 h-4" />
                      Confirmar reprogramación
                    </button>
                    <button
                      onClick={onClose}
                      className="w-full py-3 rounded-2xl text-gray-500 dark:text-[var(--text-muted)] font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)] transition-all"
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}