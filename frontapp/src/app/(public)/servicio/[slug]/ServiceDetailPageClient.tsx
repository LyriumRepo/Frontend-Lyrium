'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, Clock, Calendar, CheckCircle, X, User,
  ChevronLeft, ChevronRight, MapPin, Wifi, Home, ShieldCheck,
  CreditCard, Smartphone, Building2, Loader2, AlertCircle,
  Check, CalendarDays, LogIn, ShoppingCart, Star,
  Stethoscope, ChevronDown, Bell,
} from 'lucide-react';
import type { Service, ServiceSpecialist, ServiceSchedule } from '@/shared/lib/api/serviRepository';
import { formatDuration, serviceRepository } from '@/shared/lib/api/serviRepository';
import { useIzipay } from '@/features/public/checkout/hooks/useIzipay';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import { ServiceReviews } from './ServiceReviews';

// ─── Token cache ──────────────────────────────────────────────────────────────

let _tokenCache: { value: string | null; ts: number } | null = null;

async function getClientToken(): Promise<string | null> {
  const now = Date.now();
  if (_tokenCache && now - _tokenCache.ts < 30_000) return _tokenCache.value;
  try {
    const res = await fetch('/api/auth-token', {
      credentials: 'include',
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const { token } = await res.json();
    const clean = token?.replace(/^["']|["']$/g, '').trim() || null;
    _tokenCache = { value: clean, ts: now };
    return clean;
  } catch {
    return null;
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getCancellationLabel(policy: string) {
  if (policy === 'flexible')
    return { label: 'Cancelación flexible', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400' };
  if (policy === 'strict')
    return { label: 'Cancelación estricta', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400' };
  return { label: 'Sin reembolso', color: 'text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400' };
}

const _DAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const _MONTH_NAMES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return `${_DAY_NAMES[d.getDay()]}, ${d.getDate()} de ${_MONTH_NAMES[d.getMonth()]} del ${d.getFullYear()}`;
}

function todayString(): string {
  const d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

const DAY_MAP: Record<number, string> = {
  0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
  4: 'thursday', 5: 'friday', 6: 'saturday',
};

function getDayName(dateStr: string): string {
  return DAY_MAP[new Date(dateStr + 'T00:00:00').getDay()] ?? 'monday';
}

const DAY_NAMES_ES: Record<string, string> = {
  sunday: 'domingo', monday: 'lunes', tuesday: 'martes', wednesday: 'miércoles',
  thursday: 'jueves', friday: 'viernes', saturday: 'sábado',
};

const MONTH_NAMES_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const WEEKDAY_SHORT = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

function getSpecialistAvailability(sp: ServiceSpecialist): {
  today: boolean; tomorrow: boolean; days: string[];
} {
  const todayD = new Date();
  const todayDay: string = DAY_MAP[todayD.getDay()];
  const tomorrowDay: string = DAY_MAP[new Date(todayD.getTime() + 86400000).getDay()];
  const scheds = sp.schedules ?? [];
  const availableDaySet = new Set<string>(scheds.filter(s => s.is_active !== false).map(s => s.day_of_week));
  return {
    today: availableDaySet.has(todayDay),
    tomorrow: availableDaySet.has(tomorrowDay),
    days: Array.from(availableDaySet).map(d => DAY_NAMES_ES[d] ?? d),
  };
}

function getAvailableDayNames(schedules: ServiceSchedule[]): Set<string> {
  return new Set(schedules.filter(s => s.is_active !== false).map(s => s.day_of_week));
}

function isDayAvailableInSchedules(dateStr: string, schedules: ServiceSchedule[]): boolean {
  const dayName = DAY_MAP[new Date(dateStr + 'T00:00:00').getDay()];
  return getAvailableDayNames(schedules).has(dayName);
}

function imgSrc(url?: string | null) {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return null;
}

// ─── MiniCalendar ──────────────────────────────────────────────────────────────

function MiniCalendar({
  schedules, selectedDate, onSelect, minDate, maxDate,
}: {
  schedules: ServiceSchedule[];
  selectedDate: string;
  onSelect: (date: string) => void;
  minDate: string;
  maxDate: string;
}) {
  const today = new Date();
  const todayStr = todayString();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const availableDayNames = getAvailableDayNames(schedules);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const rows: Array<{ day: number; dateStr: string; isCurrent: boolean }[]> = [];
  let cells: { day: number; dateStr: string; isCurrent: boolean }[] = [];

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, dateStr: '', isCurrent: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, dateStr, isCurrent: true });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: (cells.length % 7) + 1, dateStr: '', isCurrent: false });
  }
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  const canNavigateBack = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth > today.getMonth());
  const canNavigateForward = viewYear < new Date(maxDate).getFullYear() || (viewYear === new Date(maxDate).getFullYear() && viewMonth < new Date(maxDate).getMonth());

  return (
    <div className="bg-white dark:bg-[var(--bg-card)] rounded-xl border border-gray-200 dark:border-[var(--border-default)] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-[var(--bg-muted)] border-b border-gray-200 dark:border-[var(--border-default)]">
        <button onClick={() => { if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); } else setViewMonth(m => m - 1); }}
          disabled={!canNavigateBack}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">
          {MONTH_NAMES_ES[viewMonth]} {viewYear}
        </span>
        <button onClick={() => { if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); } else setViewMonth(m => m + 1); }}
          disabled={!canNavigateForward}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-px bg-gray-100 dark:bg-[var(--bg-muted)]">
        {WEEKDAY_SHORT.map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-2 bg-gray-50 dark:bg-[var(--bg-muted)]">{d}</div>
        ))}
        {rows.flat().map((cell, i) => {
          if (!cell.isCurrent || !cell.dateStr) {
            return <div key={i} className="bg-white dark:bg-[var(--bg-card)]" />;
          }
          const available = isDayAvailableInSchedules(cell.dateStr, schedules);
          const past = cell.dateStr < todayStr;
          const beyondMax = cell.dateStr > maxDate;
          const disabled = past || beyondMax;
          const selected = cell.dateStr === selectedDate;
          const isToday = cell.dateStr === todayStr;
          return (
            <button
              key={i}
              disabled={disabled}
              onClick={() => onSelect(cell.dateStr)}
              className={`relative flex flex-col items-center justify-center py-1.5 text-xs font-semibold transition-all ${
                disabled ? 'text-gray-300 dark:text-[var(--text-secondary)] cursor-not-allowed bg-white dark:bg-[var(--bg-card)]' :
                selected ? 'bg-sky-500 text-white shadow-sm' :
                isToday ? 'text-sky-600 bg-sky-50 dark:bg-sky-950/30 hover:bg-sky-100 dark:hover:bg-sky-900/40 cursor-pointer' :
                available ? 'text-gray-800 dark:text-[var(--text-primary)] bg-white dark:bg-[var(--bg-card)] hover:bg-sky-50 dark:hover:bg-sky-950/30 cursor-pointer' :
                'text-gray-400 dark:text-[var(--text-muted)] bg-white dark:bg-[var(--bg-card)] cursor-pointer hover:bg-gray-50'
              }`}
            >
              <span>{cell.day}</span>
              {available && !selected && !disabled && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-emerald-400" />
              )}
              {isToday && !selected && (
                <span className="absolute -top-px -right-px w-1.5 h-1.5 rounded-full bg-sky-400 ring-1 ring-white dark:ring-[var(--bg-card)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  service: Service;
}

// ─── Booking Modal ─────────────────────────────────────────────────────────────

type ModalStep = 'specialist' | 'datetime' | 'payment' | 'confirming' | 'confirmed';

function BookingModal({
  service, open, onClose,
}: {
  service: Service;
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<ModalStep>('specialist');
  const [selectedSpecialist, setSelectedSpecialist] = useState<ServiceSpecialist | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [transactionId, setTransactionId] = useState<number | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isAuthenticated } = useAuth();

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  // Reset all state when modal opens
  useEffect(() => {
    if (open) {
      setStep('specialist');
      setSelectedSpecialist(null);
      setSelectedDate('');
      setSelectedSlot('');
      setEmail('');
      setNotes('');
      setSlots([]);
      setPaymentError(null);
      setAddedToCart(false);
    }
  }, [open]);

  // Izipay hook
  const {
    loadSmartForm, isLoading: izipayLoading, isSdkReady, clearError,
  } = useIzipay({
    onSuccess: useCallback(async () => {
      try {
        setStep('confirming');
        stopPolling();
        const token = await getClientToken();
        if (!token) { setPaymentError('Debes iniciar sesión para completar la reserva'); setStep('payment'); return; }

        pollRef.current = setInterval(async () => {
          try {
            const statusRes = await fetch(
              `${LARAVEL_API_URL}/payments/izipay/booking-status/${transactionId}`,
              {
                headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
              },
            );
            if (!statusRes.ok) return;
            const data = await statusRes.json();
            if (data.status === 'paid' && data.booking_id) {
              setStep('confirmed');
              stopPolling();
            } else if (data.status === 'failed') {
              setPaymentError(data.error_message ?? 'El pago no pudo completarse');
              setStep('payment');
              stopPolling();
            }
          } catch { /* retry */ }
        }, 2000);

        timeoutRef.current = setTimeout(() => {
          stopPolling();
          setPaymentError('El pago está siendo procesado. Revisa tu correo.');
        }, 60000);
      } catch (e: any) {
        setPaymentError(e.message ?? 'Error inesperado');
        setStep('payment');
      }
    }, [transactionId, stopPolling]),
  });

  // Fetch slots
  useEffect(() => {
    if (!selectedDate || !selectedSpecialist) { setSlots([]); return; }
    setSlotsLoading(true);
    fetch(`${LARAVEL_API_URL}/services/${service.id}/slots?specialist_id=${selectedSpecialist.id}&appointment_date=${selectedDate}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
      .then((r) => r.json())
      .then((data) => setSlots(data.slots ?? []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selectedDate, selectedSpecialist, service.id]);

  const getCartToken = (): string => {
    if (typeof window === 'undefined') return '';
    let sid = sessionStorage.getItem('cart_session_id');
    if (!sid) {
      sid = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      sessionStorage.setItem('cart_session_id', sid);
    }
    return sid;
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    setPaymentError(null);

    const dayName = getDayName(selectedDate);
    const matchingSchedule = selectedSpecialist?.schedules?.find((s) => s.day_of_week === dayName)
      ?? service.schedule?.find((s) => {
        const sDay = typeof s.day_of_week === 'number' ? DAY_MAP[s.day_of_week] : s.day_of_week;
        return sDay === dayName;
      });

    try {
      if (!selectedSlot) throw new Error('Selecciona un horario primero');
      await serviceRepository.addServiceToCart({
        service_id: service.id,
        specialist_id: selectedSpecialist?.id ?? 0,
        schedule_id: matchingSchedule?.id ?? null,
        appointment_date: selectedDate,
        start_time: selectedSlot,
        customer_notes: notes || null,
        cart_token: getCartToken(),
      });
      setAddedToCart(true);
    } catch (e: any) {
      console.error('[AddToCart]', e);
      setPaymentError(e.message ?? 'Error al agregar al carrito');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleStartPayment = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) { setEmailError('Ingresa un correo válido'); return; }
    setEmailError('');
    setPaymentError(null);
    clearError();

    const token = await getClientToken();
    if (!token) { setPaymentError('Debes iniciar sesión para pagar'); return; }

    const dayName = getDayName(selectedDate);
    const matchingSchedule = selectedSpecialist?.schedules?.find((s) => s.day_of_week === dayName)
      ?? service.schedule?.find((s) => {
        const sDay = typeof s.day_of_week === 'number' ? DAY_MAP[s.day_of_week] : s.day_of_week;
        return sDay === dayName;
      });

    if (!matchingSchedule) { setPaymentError('No se encontró un horario válido'); return; }

    try {
      const res = await fetch(`${LARAVEL_API_URL}/payments/izipay/create-booking-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          service_id: service.id,
          email,
          schedule_id: matchingSchedule.id,
          specialist_id: selectedSpecialist?.id ?? null,
          appointment_date: selectedDate,
          start_time: selectedSlot,
          customer_notes: notes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Error al crear sesión de pago');
      setTransactionId(data.transaction_id);
      await loadSmartForm(data.form_token);
    } catch (e: any) {
      setPaymentError(e.message);
    }
  };

  const close = () => {
    stopPolling();
    onClose();
  };

  if (!open) return null;

  const specialistStep = () => (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-700 dark:text-[var(--text-secondary)]">Selecciona un especialista</p>
      {service.specialists.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-[var(--text-muted)] text-center py-6">No hay especialistas disponibles</p>
      ) : (
        service.specialists.map((sp) => {
          const { today, tomorrow } = getSpecialistAvailability(sp);
          return (
            <button
              key={sp.id}
              onClick={() => {
                if (!isAuthenticated) { close(); return; }
                setSelectedSpecialist(sp);
                setStep('datetime');
              }}
              className={`w-full text-left p-4 rounded-xl border transition-all group ${
                selectedSpecialist?.id === sp.id
                  ? 'border-sky-300 bg-sky-50 dark:bg-sky-950/30 dark:border-sky-700'
                  : 'border-gray-100 dark:border-[var(--border-default)] hover:border-sky-200 dark:hover:border-sky-700 hover:bg-sky-50/50 dark:hover:bg-sky-950/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/50 dark:to-blue-900/50 flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-white dark:ring-[var(--bg-card)]">
                  {sp.foto ? (
                    <img src={sp.foto} alt={sp.nombre_completo} className="object-cover w-full h-full" />
                  ) : (
                    <User className="w-5 h-5 text-sky-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${today ? 'bg-emerald-400' : 'bg-amber-400'} shrink-0`} />
                    <p className="font-bold text-sm text-gray-900 dark:text-[var(--text-primary)] truncate">{sp.nombre_completo}</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-[var(--text-muted)]">{sp.especialidad}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${today ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-gray-50 text-gray-400 dark:bg-[var(--bg-muted)] dark:text-[var(--text-muted)]'}`}>
                      {today ? '✓ Hoy' : 'Hoy —'}
                    </span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${tomorrow ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-gray-50 text-gray-400 dark:bg-[var(--bg-muted)] dark:text-[var(--text-muted)]'}`}>
                      {tomorrow ? '✓ Mañana' : 'Mañana —'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 dark:text-[var(--text-muted)] group-hover:text-sky-400 transition-colors shrink-0" />
              </div>
            </button>
          );
        })
      )}
    </div>
  );

  const dateTimeStep = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700 dark:text-[var(--text-secondary)]">
          <User className="w-4 h-4 inline mr-1.5 text-sky-500" />
          {selectedSpecialist?.nombre_completo}
        </p>
        <button onClick={() => setStep('specialist')} className="text-xs text-sky-600 hover:underline">Cambiar</button>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 dark:text-[var(--text-muted)] uppercase tracking-wide mb-2 block">Fecha</label>
        <MiniCalendar
          schedules={selectedSpecialist?.schedules ?? []}
          selectedDate={selectedDate}
          onSelect={(date) => { setSelectedDate(date); setSelectedSlot(''); }}
          minDate={todayString()}
          maxDate={addDays(todayString(), 60)}
        />
        {selectedDate && (
          <p className="text-xs text-center mt-2 text-gray-500 dark:text-[var(--text-muted)]">{formatDate(selectedDate)}</p>
        )}
      </div>

      {selectedDate && (
        <div>
          <label className="text-xs font-bold text-gray-500 dark:text-[var(--text-muted)] uppercase tracking-wide mb-1.5 block">
            Horario disponible
          </label>
          {slotsLoading ? (
            <div className="flex items-center justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-sky-500" /></div>
          ) : slots.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No hay horarios disponibles para esta fecha</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2.5 rounded-xl text-sm font-bold transition-all border ${
                    selectedSlot === slot
                      ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                      : 'bg-gray-50 dark:bg-[var(--bg-muted)] text-gray-700 dark:text-[var(--text-secondary)] border-gray-200 dark:border-[var(--border-default)] hover:border-sky-300 hover:text-sky-600'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {paymentError && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 dark:text-red-300">{paymentError}</p>
        </div>
      )}

      {addedToCart ? (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">Agregado al carrito</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              {service.name} — {selectedSlot} con {selectedSpecialist?.nombre_completo}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={close} className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-[var(--bg-muted)] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-[var(--text-secondary)] font-bold text-sm transition-colors">
              Cerrar
            </button>
            <button onClick={() => setStep('payment')} className="flex-1 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2">
              <ShoppingCart className="w-4 h-4" /> Ir a pagar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={!selectedSlot || isAddingToCart}
            className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {isAddingToCart ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
            {isAddingToCart ? 'Agregando…' : 'Añadir al carrito'}
          </button>
          <button
            onClick={() => setStep('payment')}
            disabled={!selectedSlot}
            className="flex-1 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <ChevronRight className="w-4 h-4" /> Pagar ahora
          </button>
        </div>
      )}
    </div>
  );

  const paymentStep = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700 dark:text-[var(--text-secondary)]">
          <Calendar className="w-4 h-4 inline mr-1.5 text-sky-500" />
          {formatDate(selectedDate)} — {selectedSlot}
        </p>
        <button onClick={() => setStep('datetime')} className="text-xs text-sky-600 hover:underline">Cambiar</button>
      </div>

      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-800/40 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 dark:text-amber-300">El pago es requerido para confirmar tu reserva.</p>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 dark:text-[var(--text-muted)] uppercase tracking-wide mb-1.5 block">Correo electrónico</label>
        <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
          placeholder="tu@correo.com"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[var(--border-default)] bg-gray-50 dark:bg-[var(--bg-muted)] text-sm text-gray-700 dark:text-[var(--text-primary)] focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all" />
        {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
      </div>

      <div>
        <label className="text-xs font-bold text-gray-500 dark:text-[var(--text-muted)] uppercase tracking-wide mb-1.5 block">Notas (opcional)</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="Algún detalle que debamos saber..." rows={2}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[var(--border-default)] bg-gray-50 dark:bg-[var(--bg-muted)] text-sm text-gray-700 dark:text-[var(--text-primary)] focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all resize-none" />
      </div>

      {paymentError && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 dark:text-red-300">{paymentError}</p>
        </div>
      )}

      <button
        onClick={handleStartPayment}
        disabled={izipayLoading || !isSdkReady}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-600 hover:to-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-200 dark:shadow-sky-900/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {izipayLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
        {izipayLoading ? 'Preparando pago…' : `Pagar S/ ${Number(service.price).toFixed(2)}`}
      </button>

      {!isSdkReady && !izipayLoading && (
        <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-800/40 flex items-start gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-sky-500 shrink-0 mt-0.5" />
          <p className="text-xs text-sky-700 dark:text-sky-300">Cargando pasarela de pago segura…</p>
        </div>
      )}

      <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/40">
        <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
        <div>
          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Pago 100% seguro</p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400">Procesado por <span className="font-bold">Izipay</span>, respaldado por BCP.</p>
        </div>
      </div>

      {/* KR smart form — inline dentro del scroll para que el iframe sea visible y centrado */}
      <div className="kr-smart-form flex justify-center w-full" kr-card-form-expanded="true">
        <button className="kr-payment-button" />
        <div className="kr-form-error" />
      </div>
    </div>
  );

  const confirmingStep = () => (
    <div className="text-center py-8 space-y-3">
      <Loader2 className="w-12 h-12 animate-spin text-sky-500 mx-auto" />
      <p className="font-bold text-gray-900 dark:text-[var(--text-primary)]">Procesando tu pago…</p>
      <p className="text-sm text-gray-400">No cierres esta página. Estamos confirmando tu reserva.</p>
    </div>
  );

  const confirmedStep = () => (
    <div className="text-center py-6 space-y-4">
      <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center mx-auto">
        <Check className="w-8 h-8 text-emerald-500" />
      </div>
      <div>
        <p className="text-lg font-bold text-gray-900 dark:text-[var(--text-primary)]">¡Reserva confirmada!</p>
        <p className="text-sm text-gray-500 dark:text-[var(--text-muted)] mt-1">Recibirás los detalles en tu correo.</p>
      </div>
      <div className="bg-gray-50 dark:bg-[var(--bg-muted)] rounded-xl p-4 space-y-2 text-left">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Servicio</span>
          <span className="font-semibold text-gray-800 dark:text-[var(--text-primary)]">{service.name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Especialista</span>
          <span className="font-semibold text-gray-800 dark:text-[var(--text-primary)]">{selectedSpecialist?.nombre_completo}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Fecha</span>
          <span className="font-semibold text-gray-800 dark:text-[var(--text-primary)]">{formatDate(selectedDate)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Hora</span>
          <span className="font-semibold text-gray-800 dark:text-[var(--text-primary)]">{selectedSlot}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Total</span>
          <span className="font-bold text-emerald-600">S/ {Number(service.price).toFixed(2)}</span>
        </div>
      </div>
      <button onClick={close} className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm transition-colors">
        Cerrar
      </button>
    </div>
  );

  const stepOrder = ['specialist', 'datetime', 'payment'];
  const currentIdx = stepOrder.indexOf(step === 'confirming' || step === 'confirmed' ? 'payment' : step);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={close}>
      <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="shrink-0 bg-gradient-to-r from-sky-500 to-sky-400 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Reservar cita
            </h2>
            <button onClick={close} className="text-white/80 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          {step !== 'confirmed' && step !== 'confirming' && (
            <div className="flex items-center gap-1.5 mt-3">
              {stepOrder.map((s, i) => {
                const done = i < currentIdx;
                const active = i === currentIdx;
                return (
                  <div key={s} className="flex items-center gap-1.5 flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${done ? 'bg-white text-sky-500' : active ? 'bg-white/90 text-sky-500' : 'bg-sky-300/30 text-white/60'}`}>
                      {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    {i < 2 && <div className={`h-0.5 flex-1 transition-all ${done ? 'bg-white' : 'bg-sky-300/30'}`} />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {step === 'specialist' && specialistStep()}
          {step === 'datetime' && dateTimeStep()}
          {step === 'payment' && paymentStep()}
          {step === 'confirming' && confirmingStep()}
          {step === 'confirmed' && confirmedStep()}
        </div>
      </div>
    </div>
  );
}

// ─── Servicios Relacionados ────────────────────────────────────────────────────

function RelatedServices({ categoryId, excludeId }: { categoryId: number; excludeId: number }) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${LARAVEL_API_URL}/services?category_id=${categoryId}&per_page=7`, {
      headers: { Accept: 'application/json' },
    })
      .then((r) => r.json())
      .then((json) => {
        const list = (json.data ?? []).filter((s: any) => s.id !== excludeId).slice(0, 6);
        setServices(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [categoryId, excludeId]);

  if (loading || services.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 pb-10">
      <h2 className="text-lg font-bold text-gray-900 dark:text-[var(--text-primary)] mb-5">
        Servicios relacionados
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {services.map((s: any) => (
          <Link
            key={s.id}
            href={`/servicio/${s.slug}`}
            className="group bg-white dark:bg-[var(--bg-card)] rounded-xl border border-gray-100 dark:border-[var(--border-subtle)] overflow-hidden hover:border-[#1B6EF3]/30 hover:shadow-md transition-all"
          >
            <div className="aspect-[3/2] bg-sky-50 dark:bg-sky-950/30 flex items-center justify-center overflow-hidden">
              {s.image ? (
                <img src={s.image} alt={s.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <Stethoscope className="w-8 h-8 text-[#1B6EF3]/40" />
              )}
            </div>
            <div className="p-4">
              <p className="text-sm font-semibold text-gray-800 dark:text-[var(--text-primary)] truncate leading-tight">{s.name}</p>
              <div className="flex items-center gap-1 mt-1.5">
                <Star className="w-3.5 h-3.5 fill-[#FACC15] text-[#FACC15]" />
                <span className="text-xs text-gray-400">4.8</span>
              </div>
              <p className="text-sm font-black text-[#1B6EF3] mt-1">S/ {Number(s.price).toFixed(2)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ServiceDetailPageClient({ service }: Props) {
  const [bookingOpen, setBookingOpen] = useState(false);

  const cancelInfo = getCancellationLabel(service.cancellation_policy);
  const heroImg = imgSrc(service.image);

  const benefits: string[] = (() => {
    if (!service.benefits) return [];
    if (typeof service.benefits === 'string') {
      try { return JSON.parse(service.benefits); } catch { return [service.benefits]; }
    }
    if (Array.isArray(service.benefits)) return service.benefits;
    return [];
  })();

  return (
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-[var(--bg-primary)]">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-[var(--bg-card)] border-b border-gray-200 dark:border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm">
          <Link href="/" className="text-gray-400 hover:text-[#1B6EF3] transition-colors">Inicio</Link>
          <span className="text-gray-300 dark:text-[var(--text-secondary)]">/</span>
          <Link href="/servicios" className="text-[#1B6EF3] hover:underline">Servicios</Link>
          <span className="text-gray-300 dark:text-[var(--text-secondary)]">/</span>
          <span className="font-semibold text-gray-700 dark:text-[var(--text-primary)] truncate max-w-[200px]">{service.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
        <div className="grid lg:grid-cols-[65fr_35fr] gap-8">
          {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
          <div className="space-y-6 min-w-0">

            {/* Hero Section */}
            <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] p-6 shadow-sm">
              <div className="flex items-start gap-5">
                <div className="w-[400px] h-[400px] rounded-2xl bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center shrink-0 overflow-hidden">
                  {heroImg ? (
                    <img src={heroImg} alt={service.name} className="w-full h-full object-cover" />
                  ) : (
                    <Stethoscope className="w-12 h-12 text-[#1B6EF3]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {service.category && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#1B6EF3]/10 dark:bg-[#1B6EF3]/20 text-[#1B6EF3] text-xs font-semibold">
                        {service.category}
                      </span>
                    )}
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400">
                      <CheckCircle className="w-3 h-3" /> Disponible
                    </span>
                    {service.is_home_service && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-violet-600 bg-violet-50 dark:bg-violet-950/40 dark:text-violet-400">
                        <Home className="w-3 h-3" /> A domicilio
                      </span>
                    )}
                    {service.is_virtual && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400">
                        <Wifi className="w-3 h-3" /> Online
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-[var(--text-primary)]">{service.name}</h1>
                  <p className="text-sm text-gray-500 dark:text-[var(--text-muted)] mt-0.5">{service.store_name}</p>
                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-[#FACC15] text-[#FACC15]" />
                      <span className="font-bold text-gray-800 dark:text-[var(--text-primary)]">4.8</span>
                      <span className="text-xs text-gray-400 dark:text-[var(--text-muted)]">(256 reseñas)</span>
                    </div>
                    <span className="text-gray-300 dark:text-[var(--text-secondary)]">|</span>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <User className="w-3.5 h-3.5" />
                      <span>Más de 3,200 citas realizadas</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {service.description && (
              <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 dark:text-[var(--text-primary)] mb-3">Descripción del servicio</h2>
                <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{service.description}</p>
              </div>
            )}

            {/* Includes / Benefits */}
            {(benefits.length > 0 || service.duration_minutes) && (
              <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 dark:text-[var(--text-primary)] mb-4">Este servicio incluye</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    {benefits.length > 0 ? (
                      benefits.map((b, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-[#1B6EF3] shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">{b}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-[#1B6EF3] shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">Servicio profesional</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {service.duration_minutes && (
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs font-semibold text-gray-800 dark:text-[var(--text-primary)]">Duración</p>
                          <p className="text-xs text-gray-400">{formatDuration(service.duration_minutes)}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs font-semibold text-gray-800 dark:text-[var(--text-primary)]">Tipo de servicio</p>
                        <p className="text-xs text-gray-400">{service.is_virtual ? 'Online' : 'Presencial'}{service.is_home_service ? ' / A domicilio' : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs font-semibold text-gray-800 dark:text-[var(--text-primary)]">Reservar con anticipación</p>
                        <p className="text-xs text-gray-400">{service.booking_advance_hours}h antes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cancelInfo.color}`}>
                        <CheckCircle className="w-3 h-3" /> {cancelInfo.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews */}
            <ServiceReviews serviceId={service.id} />

            {/* Store info */}
            <Link href={`/tienda/${service.store_id}`} className="block">
              <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] p-4 hover:border-[#1B6EF3]/30 transition-colors flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-[#1B6EF3]/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-[#1B6EF3]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">Tienda</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] truncate">{service.store_name}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 dark:text-[var(--text-muted)] shrink-0" />
              </div>
            </Link>

          </div>

          {/* ── RIGHT COLUMN: Sticky Booking Panel ──────────────────────── */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] shadow-lg overflow-hidden">
              {/* Price */}
              <div className="p-6 pb-4">
                <p className="text-xs text-gray-400 mb-1">Precio desde</p>
                <span className="text-3xl font-black text-[#1B6EF3]">S/ {Number(service.price).toFixed(2)}</span>
              </div>

              {/* CTA */}
              <div className="px-6 pb-4">
                <button
                  onClick={() => setBookingOpen(true)}
                  className="w-full py-3.5 rounded-xl bg-[#1B6EF3] hover:bg-[#1B6EF3]/90 text-white font-bold text-sm shadow-lg shadow-[#1B6EF3]/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" /> Reservar cita
                </button>
              </div>

              <div className="mx-6 h-px bg-gray-100 dark:bg-[var(--bg-muted)]" />

              {/* Specialists */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)] text-sm">Especialistas disponibles</h3>
                  <span className="text-xs text-[#1B6EF3]">{service.specialists.length} especialistas</span>
                </div>
                <div className="space-y-2.5">
                  {service.specialists.slice(0, 4).map((sp) => {
                    const { today, tomorrow } = getSpecialistAvailability(sp);
                    return (
                      <button
                        key={sp.id}
                        onClick={() => setBookingOpen(true)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-[var(--border-default)] hover:border-[#1B6EF3]/30 hover:bg-[#1B6EF3]/5 transition-all group"
                      >
                        <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/50 dark:to-blue-900/50 flex items-center justify-center overflow-hidden shrink-0">
                          {sp.foto ? (
                            <img src={sp.foto} alt={sp.nombre_completo} className="object-cover w-full h-full" />
                          ) : (
                            <User className="w-4 h-4 text-sky-400" />
                          )}
                          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-[var(--bg-card)] ${today ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-sm font-semibold text-gray-800 dark:text-[var(--text-primary)] truncate">{sp.nombre_completo}</p>
                          <p className="text-xs text-gray-400 truncate">{sp.especialidad}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 dark:text-[var(--text-muted)] group-hover:text-[#1B6EF3] transition-colors shrink-0" />
                      </button>
                    );
                  })}
                  {service.specialists.length > 4 && (
                    <button className="w-full text-center text-xs text-[#1B6EF3] hover:underline pt-1">
                      Ver todos los especialistas
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related services */}
      <RelatedServices
        categoryId={service.parent_category_id ?? service.category_id}
        excludeId={service.id}
      />

      {/* Booking Modal */}
      <BookingModal service={service} open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </main>
  );
}
