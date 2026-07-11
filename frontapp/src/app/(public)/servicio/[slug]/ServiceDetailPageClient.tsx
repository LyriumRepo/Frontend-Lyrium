'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  Clock,
  Calendar,
  CheckCircle,
  X,
  User,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Wifi,
  Home,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building2,
  Loader2,
  AlertCircle,
  Check,
  CalendarDays,
  LogIn,
  ShoppingCart,
  Star,
  Stethoscope,
  ChevronDown,
  Bell,
} from 'lucide-react';
import type {
  Service,
  ServiceSpecialist,
  ServiceSchedule,
} from '@/shared/lib/api/serviRepository';
import {
  formatDuration,
  serviceRepository,
} from '@/shared/lib/api/serviRepository';
import { useIzipay } from '@/features/public/checkout/hooks/useIzipay';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { useCarritoStore } from '@/store/carritoStore';
import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import TopMedalBadge from '@/components/ui/TopMedalBadge';
import { ServiceReviews, ServiceReview, ReviewStats } from './ServiceReviews';
import {
  getDepartamentos,
  getProvincias,
  getDistritos,
} from '@/features/public/checkout/lib/ubigeo';
import CustomSelect from '@/features/public/checkout/components/ui/CustomSelect';

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
    return {
      label: 'Cancelación flexible',
      color:
        'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400',
    };
  if (policy === 'strict')
    return {
      label: 'Cancelación estricta',
      color:
        'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400',
    };
  return {
    label: 'Sin reembolso',
    color: 'text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400',
  };
}

const _DAY_NAMES = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
];
const _MONTH_NAMES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'setiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return `${_DAY_NAMES[d.getDay()]}, ${d.getDate()} de ${_MONTH_NAMES[d.getMonth()]} del ${d.getFullYear()}`;
}

function todayString(): string {
  const d = new Date();
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0')
  );
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0')
  );
}

const DAY_MAP: Record<number, string> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

function getDayName(dateStr: string): string {
  return DAY_MAP[new Date(dateStr + 'T00:00:00').getDay()] ?? 'monday';
}

const DAY_NAMES_ES: Record<string, string> = {
  sunday: 'domingo',
  monday: 'lunes',
  tuesday: 'martes',
  wednesday: 'miércoles',
  thursday: 'jueves',
  friday: 'viernes',
  saturday: 'sábado',
};

const MONTH_NAMES_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const WEEKDAY_SHORT = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

function getSpecialistAvailability(sp: ServiceSpecialist): {
  today: boolean;
  tomorrow: boolean;
  days: string[];
} {
  const todayD = new Date();
  const todayDay: string = DAY_MAP[todayD.getDay()];
  const tomorrowDay: string =
    DAY_MAP[new Date(todayD.getTime() + 86400000).getDay()];
  const scheds = sp.schedules ?? [];
  const availableDaySet = new Set<string>(
    scheds.filter((s) => s.is_active !== false).map((s) => s.day_of_week),
  );
  return {
    today: availableDaySet.has(todayDay),
    tomorrow: availableDaySet.has(tomorrowDay),
    days: Array.from(availableDaySet).map((d) => DAY_NAMES_ES[d] ?? d),
  };
}

function getAvailableDayNames(schedules: ServiceSchedule[]): Set<string> {
  return new Set(
    schedules.filter((s) => s.is_active !== false).map((s) => s.day_of_week),
  );
}

function isDayAvailableInSchedules(
  dateStr: string,
  schedules: ServiceSchedule[],
): boolean {
  const dayName = DAY_MAP[new Date(dateStr + 'T00:00:00').getDay()];
  return getAvailableDayNames(schedules).has(dayName);
}

function imgSrc(url?: string | null) {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return null;
}

function getLeafCategory(category: string): string {
  if (!category) return '';
  const parts = category.split(' > ');
  return parts[parts.length - 1]?.trim() ?? category;
}

function getExtraBadges(
  service: Service,
): Array<{ label: string; className: string }> {
  const etiquetas = (service as any).settings?.etiquetas;
  if (!etiquetas) return [];
  const badges: Array<{ label: string; className: string }> = [];
  if (etiquetas.nuevo && service.sticker !== 'nuevo') {
    badges.push({ label: 'NUEVO', className: 'bg-emerald-500 text-white' });
  }
  return badges;
}

function getStickerBadge(
  sticker?: string | null,
  discountPercentage?: number | null,
): { label: string; className: string } | null {
  if (!sticker) return null;
  const map: Record<string, { label: string; className: string }> = {
    nuevo: {
      label: 'NUEVO',
      className:
        'bg-gradient-to-r from-emerald-500 to-emerald-400 text-white px-5 py-3 rounded-full text-sm font-black uppercase tracking-widest shadow-xl shadow-emerald-500/40 animate-pulse',
    },
    oferta: {
      label: 'OFERTA',
      className:
        'bg-gradient-to-br from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest shadow-xl shadow-orange-500/40 animate-bounce',
    },
    liquidacion: {
      label: 'LIQUIDACIÓN',
      className:
        'bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-red-600/40 transform -rotate-3 hover:rotate-3 transition-transform',
    },
    bestseller: {
      label: 'MÁS VENDIDO',
      className:
        'bg-gradient-to-r from-amber-500 to-amber-400 text-white px-5 py-3 rounded-lg text-sm font-black uppercase tracking-widest shadow-2xl shadow-amber-500/50 animate-pulse',
    },
    envio_gratis: {
      label: 'ENVÍO GRATIS',
      className:
        'bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-full text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-500/40 hover:scale-110 transition-transform',
    },
  };
  if (sticker === 'descuento') {
    const pct = discountPercentage ?? 0;
    return {
      label: `-${pct}%`,
      className:
        'bg-gradient-to-br from-rose-600 to-rose-500 text-white px-5 py-3 rounded-2xl text-lg font-black uppercase tracking-widest shadow-2xl shadow-rose-600/50 transform scale-110 animate-pulse',
    };
  }
  return map[sticker] ?? null;
}

// ─── MiniCalendar ──────────────────────────────────────────────────────────────

function MiniCalendar({
  schedules,
  selectedDate,
  onSelect,
  minDate,
  maxDate,
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

  const rows: Array<{ day: number; dateStr: string; isCurrent: boolean }[]> =
    [];
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

  const canNavigateBack =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());
  const canNavigateForward =
    viewYear < new Date(maxDate).getFullYear() ||
    (viewYear === new Date(maxDate).getFullYear() &&
      viewMonth < new Date(maxDate).getMonth());

  return (
    <div className="bg-white dark:bg-[var(--bg-card)] rounded-xl border border-gray-200 dark:border-[var(--border-default)] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-[var(--bg-muted)] border-b border-gray-200 dark:border-[var(--border-default)]">
        <button
          onClick={() => {
            if (viewMonth === 0) {
              setViewYear((y) => y - 1);
              setViewMonth(11);
            } else setViewMonth((m) => m - 1);
          }}
          disabled={!canNavigateBack}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">
          {MONTH_NAMES_ES[viewMonth]} {viewYear}
        </span>
        <button
          onClick={() => {
            if (viewMonth === 11) {
              setViewYear((y) => y + 1);
              setViewMonth(0);
            } else setViewMonth((m) => m + 1);
          }}
          disabled={!canNavigateForward}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-px bg-gray-100 dark:bg-[var(--bg-muted)]">
        {WEEKDAY_SHORT.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-bold text-gray-400 py-2 bg-gray-50 dark:bg-[var(--bg-muted)]"
          >
            {d}
          </div>
        ))}
        {rows.flat().map((cell, i) => {
          if (!cell.isCurrent || !cell.dateStr) {
            return (
              <div key={i} className="bg-white dark:bg-[var(--bg-card)]" />
            );
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
                disabled
                  ? 'text-gray-300 dark:text-[var(--text-secondary)] cursor-not-allowed bg-white dark:bg-[var(--bg-card)]'
                  : selected
                    ? 'bg-sky-500 text-white shadow-sm rounded-lg'
                    : isToday
                      ? 'text-sky-600 bg-sky-50 dark:bg-sky-950/30 hover:bg-sky-100 dark:hover:bg-sky-900/40 cursor-pointer'
                      : available
                        ? 'text-gray-800 dark:text-[var(--text-primary)] bg-white dark:bg-[var(--bg-card)] hover:bg-sky-50 dark:hover:bg-sky-950/30 cursor-pointer'
                        : 'text-gray-400 dark:text-[var(--text-muted)] bg-white dark:bg-[var(--bg-card)] cursor-pointer hover:bg-gray-50'
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

type ModalStep =
  | 'specialist'
  | 'datetime'
  | 'payment'
  | 'confirming'
  | 'confirmed';

function BookingModal({
  service,
  open,
  onClose,
  preselectedSpecialist,
}: {
  service: Service;
  open: boolean;
  onClose: () => void;
  preselectedSpecialist?: ServiceSpecialist | null;
}) {
  const [step, setStep] = useState<ModalStep>('specialist');
  const [selectedSpecialist, setSelectedSpecialist] =
    useState<ServiceSpecialist | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [serviceAddress, setServiceAddress] = useState('');
  const [addressDepto, setAddressDepto] = useState('');
  const [addressProv, setAddressProv] = useState('');
  const [addressDist, setAddressDist] = useState('');
  const [addressRef, setAddressRef] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [transactionId, setTransactionId] = useState<number | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transactionIdRef = useRef<number | null>(null);
  const holdIdRef = useRef<number | null>(null);

  const fullAddress = [addressDist, addressProv, addressDepto].filter(Boolean).join(', ') +
    (serviceAddress ? ` - ${serviceAddress}` : '') +
    (addressRef ? ` (${addressRef})` : '');

  const addressValid = addressDepto && addressProv && addressDist && serviceAddress.trim();
  const PERU_DEPTOS = getDepartamentos();
  const provincias = addressDepto ? getProvincias(addressDepto) : [];
  const distritos = addressProv ? getDistritos(addressDepto, addressProv) : [];

  const { isAuthenticated } = useAuth();
  const incrementServiceHoldCount = useCarritoStore((s) => s.incrementServiceHoldCount);
  const setLastAddedService = useCarritoStore((s) => s.setLastAddedService);
  const openCartPopup = useCarritoStore((s) => s.openPopup);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  useEffect(() => {
    if (open) {
      if (preselectedSpecialist) {
        setStep('datetime');
        setSelectedSpecialist(preselectedSpecialist);
      } else {
        setStep('specialist');
        setSelectedSpecialist(null);
      }
      setSelectedDate('');
      setSelectedSlot('');
      setEmail('');
      setNotes('');
      setServiceAddress('');
      setAddressDepto('');
      setAddressProv('');
      setAddressDist('');
      setAddressRef('');
      setSlots([]);
      holdIdRef.current = null;
      setPaymentError(null);
    }
  }, [open, preselectedSpecialist]);

  const {
    loadSmartForm,
    isLoading: izipayLoading,
    isSdkReady,
    clearError,
  } = useIzipay({
    onSuccess: useCallback(async () => {
      const txId = transactionIdRef.current;
      try {
        setStep('confirming');
        stopPolling();
        const token = await getClientToken();
        if (!token) {
          setPaymentError('Debes iniciar sesión para completar la reserva');
          setStep('payment');
          return;
        }
        try {
          const confirmRes = await fetch(
            `${LARAVEL_API_URL}/payments/izipay/confirm-booking`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ transaction_id: txId }),
            },
          );
          const confirmData = await confirmRes.json();
          if (confirmData.success) {
            setStep('confirmed');
            return;
          }
          setPaymentError(
            confirmData.message ?? 'Error al confirmar la reserva',
          );
          setStep('payment');
          return;
        } catch {
          /* fallback to polling */
        }

        pollRef.current = setInterval(async () => {
          try {
            const statusRes = await fetch(
              `${LARAVEL_API_URL}/payments/izipay/booking-status/${txId}`,
              {
                headers: {
                  Accept: 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              },
            );
            if (!statusRes.ok) return;
            const data = await statusRes.json();
            if (data.status === 'paid' && data.booking_id) {
              setStep('confirmed');
              stopPolling();
            } else if (data.status === 'failed') {
              setPaymentError(
                data.error_message ?? 'El pago no pudo completarse',
              );
              setStep('payment');
              stopPolling();
            }
          } catch {
            /* retry */
          }
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

  useEffect(() => {
    if (!selectedDate || !selectedSpecialist) {
      setSlots([]);
      return;
    }
    setSlotsLoading(true);
    fetch(
      `${LARAVEL_API_URL}/services/${service.id}/slots?specialist_id=${selectedSpecialist.id}&appointment_date=${selectedDate}`,
      {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      },
    )
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

  const handleAddToCart = async (): Promise<boolean> => {
    setIsAddingToCart(true);
    setPaymentError(null);
    const dayName = getDayName(selectedDate);
    const matchingSchedule =
      selectedSpecialist?.schedules?.find((s) => s.day_of_week === dayName) ??
      service.schedule?.find((s) => {
        const sDay =
          typeof s.day_of_week === 'number'
            ? DAY_MAP[s.day_of_week]
            : s.day_of_week;
        return sDay === dayName;
      });
    try {
      if (!selectedSlot) throw new Error('Selecciona un horario primero');
      const result = await serviceRepository.addServiceToCart({
        service_id: service.id,
        specialist_id: selectedSpecialist?.id ?? 0,
        schedule_id: matchingSchedule?.id ?? null,
        appointment_date: selectedDate,
        start_time: selectedSlot,
        customer_notes: notes || null,
        cart_token: getCartToken(),
        service_address: service.is_home_service ? fullAddress : null,
      });
      if (result.hold) holdIdRef.current = result.hold.id;
      incrementServiceHoldCount();
      setLastAddedService({
        name: service.name,
        price:
          service.discount_percentage && service.discount_percentage > 0
            ? service.price * (1 - service.discount_percentage / 100)
            : service.price,
        image: service.image ?? null,
        specialistName: selectedSpecialist?.nombre_completo,
      });
      openCartPopup();
      return true;
    } catch (e: any) {
      setPaymentError(e.message ?? 'Error al agregar al carrito');
      return false;
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleStartPayment = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Ingresa un correo válido');
      return;
    }
    setEmailError('');
    setPaymentError(null);
    clearError();
    const token = await getClientToken();
    if (!token) {
      setPaymentError('Debes iniciar sesión para pagar');
      return;
    }
    const dayName = getDayName(selectedDate);
    const matchingSchedule =
      selectedSpecialist?.schedules?.find((s) => s.day_of_week === dayName) ??
      service.schedule?.find((s) => {
        const sDay =
          typeof s.day_of_week === 'number'
            ? DAY_MAP[s.day_of_week]
            : s.day_of_week;
        return sDay === dayName;
      });
    if (!matchingSchedule) {
      setPaymentError('No se encontró un horario válido');
      return;
    }
    try {
      const res = await fetch(
        `${LARAVEL_API_URL}/payments/izipay/create-booking-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            service_id: service.id,
            email,
            schedule_id: matchingSchedule.id,
            specialist_id: selectedSpecialist?.id ?? null,
            appointment_date: selectedDate,
            start_time: selectedSlot,
            customer_notes: notes || null,
            service_address: service.is_home_service
              ? serviceAddress || null
              : null,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message ?? 'Error al crear sesión de pago');
      setTransactionId(data.transaction_id);
      transactionIdRef.current = data.transaction_id;
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

  const specialistStep = () => {
    if (!isAuthenticated) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center">
            <User className="w-8 h-8 text-sky-500" />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900 dark:text-[var(--text-primary)]">
              Inicia sesión para reservar
            </p>
            <p className="text-sm text-gray-500 dark:text-[var(--text-muted)] mt-1">
              Necesitas una cuenta para agendar una cita.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-sm transition-all"
          >
            Iniciar sesión
          </Link>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700 dark:text-[var(--text-secondary)]">
          Selecciona un especialista
        </p>
        {service.specialists.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-[var(--text-muted)] text-center py-6">
            No hay especialistas disponibles
          </p>
        ) : (
          service.specialists.map((sp) => {
            const { today, tomorrow } = getSpecialistAvailability(sp);
            return (
              <button
                key={sp.id}
                onClick={() => {
                  setSelectedSpecialist(sp);
                  setStep('datetime');
                }}
                className={`w-full text-left p-4 rounded-xl border transition-all group ${selectedSpecialist?.id === sp.id ? 'border-sky-300 bg-sky-50 dark:bg-sky-950/30 dark:border-sky-700' : 'border-gray-100 dark:border-[var(--border-default)] hover:border-sky-200 dark:hover:border-sky-700 hover:bg-sky-50/50 dark:hover:bg-sky-950/20'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/50 dark:to-blue-900/50 flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-white dark:ring-[var(--bg-card)]">
                    {sp.foto ? (
                      <img
                        src={sp.foto}
                        alt={sp.nombre_completo}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <User className="w-5 h-5 text-sky-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${today ? 'bg-emerald-400' : 'bg-amber-400'} shrink-0`}
                      />
                      <p className="font-bold text-sm text-gray-900 dark:text-[var(--text-primary)] truncate">
                        {sp.nombre_completo}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-[var(--text-muted)]">
                      {sp.especialidad}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${today ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-gray-50 text-gray-400 dark:bg-[var(--bg-muted)] dark:text-[var(--text-muted)]'}`}
                      >
                        {today ? '✓ Hoy' : 'Hoy —'}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${tomorrow ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-gray-50 text-gray-400 dark:bg-[var(--bg-muted)] dark:text-[var(--text-muted)]'}`}
                      >
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
  };

  const dateTimeStep = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700 dark:text-[var(--text-secondary)]">
          <User className="w-4 h-4 inline mr-1.5 text-sky-500" />
          {selectedSpecialist?.nombre_completo}
        </p>
        <button
          onClick={() => setStep('specialist')}
          className="text-xs text-sky-600 hover:underline"
        >
          Cambiar
        </button>
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 dark:text-[var(--text-muted)] uppercase tracking-wide mb-2 block">
          Fecha
        </label>
        <MiniCalendar
          schedules={selectedSpecialist?.schedules ?? []}
          selectedDate={selectedDate}
          onSelect={(date) => {
            setSelectedDate(date);
            setSelectedSlot('');
          }}
          minDate={todayString()}
          maxDate={addDays(todayString(), 60)}
        />
        {selectedDate && (
          <p className="text-xs text-center mt-2 text-gray-500 dark:text-[var(--text-muted)]">
            {formatDate(selectedDate)}
          </p>
        )}
      </div>
      {selectedDate && (
        <div>
          <label className="text-xs font-bold text-gray-500 dark:text-[var(--text-muted)] uppercase tracking-wide mb-1.5 block">
            Horario disponible
          </label>
          {slotsLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-sky-500" />
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">
                No hay horarios disponibles para esta fecha
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2.5 rounded-xl text-sm font-bold transition-all border ${selectedSlot === slot ? 'bg-sky-500 text-white border-sky-500 shadow-sm' : 'bg-gray-50 dark:bg-[var(--bg-muted)] text-gray-700 dark:text-[var(--text-secondary)] border-gray-200 dark:border-[var(--border-default)] hover:border-sky-300 hover:text-sky-600'}`}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {service.is_home_service && (
        <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-3">
          <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wide flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Dirección de atención
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-[var(--text-muted)] uppercase tracking-wide mb-1 block">Departamento *</label>
              <CustomSelect
                value={addressDepto}
                onChange={(v) => { setAddressDepto(v); setAddressProv(''); setAddressDist(''); }}
                options={PERU_DEPTOS}
                placeholder="Seleccionar..."
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-[var(--text-muted)] uppercase tracking-wide mb-1 block">Provincia *</label>
              <CustomSelect
                value={addressProv}
                onChange={(v) => { setAddressProv(v); setAddressDist(''); }}
                options={provincias}
                placeholder="Seleccionar..."
                disabled={!addressDepto}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-[var(--text-muted)] uppercase tracking-wide mb-1 block">Distrito *</label>
              <CustomSelect
                value={addressDist}
                onChange={(v) => setAddressDist(v)}
                options={distritos}
                placeholder="Seleccionar..."
                disabled={!addressProv}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-[var(--text-muted)] uppercase tracking-wide mb-1 block">Dirección *</label>
            <input
              type="text"
              value={serviceAddress}
              onChange={(e) => setServiceAddress(e.target.value)}
              placeholder="Ej: Av. La Marina 1234"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[var(--bg-card)] text-sm text-gray-700 dark:text-[var(--text-primary)] focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-[var(--text-muted)] uppercase tracking-wide mb-1 block">Referencia (opcional)</label>
            <input
              type="text"
              value={addressRef}
              onChange={(e) => setAddressRef(e.target.value)}
              placeholder="Ej: Cerca al parque central"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[var(--bg-card)] text-sm text-gray-700 dark:text-[var(--text-primary)] focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 outline-none transition-all"
            />
          </div>
        </div>
      )}
      {paymentError && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 dark:text-red-300">
            {paymentError}
          </p>
        </div>
      )}
      <button
        onClick={async () => {
          const ok = await handleAddToCart();
          if (ok) close();
        }}
        disabled={!selectedSlot || isAddingToCart || (service.is_home_service && !addressValid)}
        className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
          !selectedSlot || (service.is_home_service && !addressValid)
            ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400 cursor-not-allowed'
            : isAddingToCart
              ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400'
              : 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20'
        }`}
      >
        {isAddingToCart ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ShoppingCart className="w-4 h-4" />
        )}
        {isAddingToCart ? 'Agregando…' : 'Añadir al carrito'}
      </button>
    </div>
  );
  const paymentStep = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700 dark:text-[var(--text-secondary)]">
          <Calendar className="w-4 h-4 inline mr-1.5 text-sky-500" />
          {formatDate(selectedDate)} — {selectedSlot}
        </p>
        <button
          onClick={() => setStep('datetime')}
          className="text-xs text-sky-600 hover:underline"
        >
          Cambiar
        </button>
      </div>
      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-800/40 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 dark:text-amber-300">
          El pago es requerido para confirmar tu reserva.
        </p>
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 dark:text-[var(--text-muted)] uppercase tracking-wide mb-1.5 block">
          Correo electrónico
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError('');
          }}
          placeholder="tu@correo.com"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[var(--border-default)] bg-gray-50 dark:bg-[var(--bg-muted)] text-sm text-gray-700 dark:text-[var(--text-primary)] focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
        />
        {emailError && (
          <p className="text-xs text-red-500 mt-1">{emailError}</p>
        )}
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 dark:text-[var(--text-muted)] uppercase tracking-wide mb-1.5 block">
          Notas (opcional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Algún detalle que debamos saber..."
          rows={2}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[var(--border-default)] bg-gray-50 dark:bg-[var(--bg-muted)] text-sm text-gray-700 dark:text-[var(--text-primary)] focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all resize-none"
        />
      </div>
      {paymentError && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 dark:text-red-300">
            {paymentError}
          </p>
        </div>
      )}
      <button
        onClick={handleStartPayment}
        disabled={izipayLoading || !isSdkReady}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-600 hover:to-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-200 dark:shadow-sky-900/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {izipayLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ShieldCheck className="w-4 h-4" />
        )}
        {izipayLoading
          ? 'Preparando pago…'
          : `Pagar S/ ${(service.discount_percentage && service.discount_percentage > 0 ? service.price * (1 - service.discount_percentage / 100) : service.price).toFixed(2)}`}
      </button>
      <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/40">
        <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
        <div>
          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
            Pago 100% seguro
          </p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400">
            Procesado por <span className="font-bold">Izipay</span>, respaldado
            por BCP.
          </p>
        </div>
      </div>
      <div
        className="kr-smart-form flex justify-center w-full"
        kr-card-form-expanded="true"
      >
        <button className="kr-payment-button" />
        <div className="kr-form-error" />
      </div>
    </div>
  );

  const confirmingStep = () => (
    <div className="text-center py-8 space-y-3">
      <Loader2 className="w-12 h-12 animate-spin text-sky-500 mx-auto" />
      <p className="font-bold text-gray-900 dark:text-[var(--text-primary)]">
        Procesando tu pago…
      </p>
      <p className="text-sm text-gray-400">
        No cierres esta página. Estamos confirmando tu reserva.
      </p>
    </div>
  );

  const confirmedStep = () => (
    <div className="text-center py-6 space-y-4">
      <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center mx-auto">
        <Check className="w-8 h-8 text-emerald-500" />
      </div>
      <div>
        <p className="text-lg font-bold text-gray-900 dark:text-[var(--text-primary)]">
          ¡Reserva confirmada!
        </p>
        <p className="text-sm text-gray-500 dark:text-[var(--text-muted)] mt-1">
          Recibirás los detalles en tu correo.
        </p>
      </div>
      <div className="bg-gray-50 dark:bg-[var(--bg-muted)] rounded-xl p-4 space-y-2 text-left">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Servicio</span>
          <span className="font-semibold text-gray-800 dark:text-[var(--text-primary)]">
            {service.name}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Especialista</span>
          <span className="font-semibold text-gray-800 dark:text-[var(--text-primary)]">
            {selectedSpecialist?.nombre_completo}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Fecha</span>
          <span className="font-semibold text-gray-800 dark:text-[var(--text-primary)]">
            {formatDate(selectedDate)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Hora</span>
          <span className="font-semibold text-gray-800 dark:text-[var(--text-primary)]">
            {selectedSlot}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Total</span>
          <span className="font-bold text-emerald-600">
            S/{' '}
            {(service.discount_percentage && service.discount_percentage > 0
              ? service.price * (1 - service.discount_percentage / 100)
              : service.price
            ).toFixed(2)}
          </span>
        </div>
      </div>
      <button
        onClick={close}
        className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm transition-colors"
      >
        Cerrar
      </button>
    </div>
  );

  const stepOrder = ['specialist', 'datetime', 'payment'];
  const currentIdx = stepOrder.indexOf(
    step === 'confirming' || step === 'confirmed' ? 'payment' : step,
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={close}
    >
      <div
        className="bg-white dark:bg-[var(--bg-card)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 bg-gradient-to-r from-sky-500 to-sky-400 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Adquirir cita
            </h2>
            <button
              onClick={close}
              className="text-white/80 hover:text-white transition-colors"
            >
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
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${done ? 'bg-white text-sky-500' : active ? 'bg-white/90 text-sky-500' : 'bg-sky-300/30 text-white/60'}`}
                    >
                      {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    {i < 2 && (
                      <div
                        className={`h-0.5 flex-1 transition-all ${done ? 'bg-white' : 'bg-sky-300/30'}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
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

// ─── Specialist Profile Modal ──────────────────────────────────────────────────

function SpecialistProfileModal({
  specialist,
  service,
  open,
  onClose,
  onBook,
}: {
  specialist: ServiceSpecialist | null;
  service: Service;
  open: boolean;
  onClose: () => void;
  onBook: (specialist: ServiceSpecialist) => void;
}) {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<ServiceReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    if (!open || !specialist) return;
    setLoadingReviews(true);
    fetch(`${LARAVEL_API_URL}/reviews?product_id=${service.id}&per_page=100`, {
      headers: { Accept: 'application/json' },
    })
      .then((r) => r.json())
      .then((json) => {
        setReviews(json.data?.data ?? []);
        setStats(json.data?.stats ?? null);
      })
      .catch(() => {})
      .finally(() => setLoadingReviews(false));
  }, [open, specialist, service.id]);

  const avail = specialist ? getSpecialistAvailability(specialist) : null;
  const today = avail?.today ?? false;
  const tomorrow = avail?.tomorrow ?? false;

  if (!open || !specialist) return null;
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[var(--bg-card)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 bg-gradient-to-r from-sky-500 to-sky-400 p-4 flex items-center justify-between">
          <h2 className="text-white font-bold flex items-center gap-2">
            <User className="w-4 h-4" /> Perfil del especialista
          </h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/50 dark:to-blue-900/50 flex items-center justify-center overflow-hidden shrink-0 ring-4 ring-white dark:ring-[var(--bg-card)] shadow-lg">
              {specialist.foto ? (
                <img
                  src={specialist.foto}
                  alt={specialist.nombre_completo}
                  className="object-cover w-full h-full"
                />
              ) : (
                <User className="w-8 h-8 text-sky-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-[var(--text-primary)] truncate">
                {specialist.nombre_completo}
              </h3>
              <p className="text-sm text-cyan-600 dark:text-white font-medium">
                {specialist.especialidad}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${today ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${today ? 'bg-emerald-400' : 'bg-amber-400'}`}
                  />
                  {today ? 'Disponible hoy' : 'No disponible hoy'}
                </span>
                {stats && (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {stats.average.toFixed(1)} ({stats.count})
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {specialist.anios_experiencia != null && (
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-[var(--bg-muted)] border border-gray-100 dark:border-[var(--border-subtle)]">
                <p className="text-xs text-gray-400">Experiencia</p>
                <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">
                  {specialist.anios_experiencia} años
                </p>
              </div>
            )}
            {specialist.sub_especialidad && (
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-[var(--bg-muted)] border border-gray-100 dark:border-[var(--border-subtle)]">
                <p className="text-xs text-gray-400">Sub-especialidad</p>
                <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] truncate">
                  {specialist.sub_especialidad}
                </p>
              </div>
            )}
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[var(--bg-muted)] border border-gray-100 dark:border-[var(--border-subtle)]">
              <p className="text-xs text-gray-400">Disponibilidad</p>
              <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">
                {today && tomorrow
                  ? 'Hoy y mañana'
                  : today
                    ? 'Hoy'
                    : tomorrow
                      ? 'Mañana'
                      : 'Consultar'}
              </p>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-[var(--text-primary)]">
                Reseñas del servicio
              </h3>
              {stats && (
                <span className="text-xs text-gray-400">
                  {stats.count} reseña{stats.count !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            {loadingReviews ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-sky-500" />
              </div>
            ) : displayedReviews.length === 0 ? (
              <div className="text-center py-8 text-gray-400 dark:text-[var(--text-muted)]">
                <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No hay reseñas aún</p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayedReviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-3 rounded-xl border border-gray-100 dark:border-[var(--border-subtle)] bg-gray-50/50 dark:bg-[var(--bg-muted)]/50"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/50 dark:to-blue-900/50 flex items-center justify-center overflow-hidden shrink-0">
                        {review.user?.avatar ? (
                          <img
                            src={review.user.avatar}
                            alt=""
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <User className="w-3 h-3 text-sky-400" />
                        )}
                      </div>
                      <span className="text-xs font-semibold text-gray-800 dark:text-[var(--text-primary)]">
                        {review.user?.name ?? 'Usuario'}
                      </span>
                      <span className="text-[10px] text-gray-400 ml-auto">
                        {new Date(review.createdAt).toLocaleDateString(
                          'es-PE',
                          { day: 'numeric', month: 'short', year: 'numeric' },
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`w-3 h-3 ${n <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-[var(--text-muted)]'}`}
                        />
                      ))}
                      {review.isVerifiedPurchase && (
                        <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 ml-1">
                          <CheckCircle className="w-2.5 h-2.5" /> Verificada
                        </span>
                      )}
                    </div>
                    {review.comment && (
                      <p className="text-xs text-gray-500 dark:text-[var(--text-muted)] leading-relaxed line-clamp-3">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
                {reviews.length > 3 && !showAllReviews && (
                  <button
                    onClick={() => setShowAllReviews(true)}
                    className="w-full py-2 text-xs font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-950/50 transition-colors"
                  >
                    Ver todas las {reviews.length} reseñas
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="shrink-0 p-4 border-t border-gray-100 dark:border-[var(--border-subtle)]">
          {isAuthenticated ? (
            <button
              onClick={() => {
                onBook(specialist);
                onClose();
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-600 hover:to-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-200 dark:shadow-sky-900/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" /> Adquirir cita con{' '}
              {specialist.nombre_completo.split(' ')[0]}
            </button>
          ) : (
            <Link
              href="/login"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-600 hover:to-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-200 dark:shadow-sky-900/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Inicia sesión para reservar
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── RelatedServiceCard ────────────────────────────────────────────────────────

function RelatedServiceCard({ s }: { s: any }) {
  return (
    <Link href={`/servicio/${s.slug}`} className="flex-shrink-0 w-64 group">
      <div className="bg-white dark:bg-[var(--bg-card)] rounded-xl border border-gray-100 dark:border-[var(--border-subtle)] overflow-hidden hover:border-cyan-400/40 hover:shadow-lg hover:-translate-y-2 transition-all duration-300 h-full">
        <div className="relative aspect-[3/2] bg-sky-50 dark:bg-sky-950/30 flex items-center justify-center overflow-hidden">
          {s.image ? (
            <img
              src={s.image}
              alt={s.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <Stethoscope className="w-8 h-8 text-cyan-600 dark:text-white/40" />
          )}
          {(() => {
            const badges: Array<{ label: string; className: string }> = [];
            const primary = getStickerBadge(s.sticker, s.discount_percentage);
            if (primary) badges.push(primary);
            if (badges.length === 0) return null;
            return (
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {badges.map((b, i) => {
                  const compactClass = b.className
                    .replace('px-5 py-3', 'px-3 py-1.5')
                    .replace('px-6 py-3', 'px-3 py-1.5')
                    .replace('text-sm', 'text-[10px]')
                    .replace('text-lg', 'text-xs');
                  return (
                    <span key={i} className={compactClass}>
                      {b.label}
                    </span>
                  );
                })}
              </div>
            );
          })()}
          <TopMedalBadge entityType="service" entityId={s.id} size="sm" className="absolute bottom-3 right-3" />
        </div>
        <div className="p-4">
          <p className="text-sm font-semibold text-gray-800 dark:text-[var(--text-primary)] line-clamp-2 leading-tight group-hover:text-cyan-600 dark:text-white transition-colors">
            {s.name}
          </p>
          <div className="flex items-center gap-1 mt-1.5">
            <Star className="w-3.5 h-3.5 fill-[#FACC15] text-[#FACC15]" />
            <span className="text-xs text-gray-400">4.8</span>
          </div>
          <p className="text-sm font-black text-cyan-600 dark:text-white mt-1.5">
            {s.discount_percentage && s.discount_percentage > 0 ? (
              <>
                <span>
                  S/ {(s.price * (1 - s.discount_percentage / 100)).toFixed(2)}
                </span>
                <span className="ml-1.5 text-[10px] text-gray-400 line-through font-normal">
                  S/ {Number(s.price).toFixed(2)}
                </span>
              </>
            ) : (
              `S/ ${Number(s.price).toFixed(2)}`
            )}
          </p>
        </div>
      </div>
    </Link>
  );
}

// ─── RelatedServicesCarousel (auto-scroll infinito) ────────────────────────────

function RelatedServicesCarousel({ services }: { services: any[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const pausedRef = useRef(false);
  const posRef = useRef(0);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const SPEED = 0.5;
  const CARD_STEP = 272; // ancho de card (256px) + gap (16px)
  const RESUME_DELAY = 2500;

  const items = [...services, ...services, ...services];

  const pauseTemporarily = () => {
    pausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, RESUME_DELAY);
  };

  const shift = (direction: 'left' | 'right') => {
    const track = trackRef.current;
    if (!track) return;
    pauseTemporarily();
    const third = track.scrollWidth / 3;
    let next =
      posRef.current + (direction === 'right' ? CARD_STEP : -CARD_STEP);
    if (next < 0) next += third;
    if (next >= third) next -= third;
    const start = posRef.current;
    const diff = next - start;
    const adjustedDiff =
      Math.abs(diff) > third / 2
        ? diff > 0
          ? diff - third
          : diff + third
        : diff;
    const duration = 300;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      let current = start + adjustedDiff * ease;
      if (current < 0) current += third;
      if (current >= third) current -= third;
      posRef.current = current;
      track.style.transform = `translateX(-${current}px)`;
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const step = () => {
      if (!pausedRef.current) {
        posRef.current += SPEED;
        const third = track.scrollWidth / 3;
        if (posRef.current >= third) posRef.current = 0;
        track.style.transform = `translateX(-${posRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(animRef.current);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      e.preventDefault();
      shift(e.deltaY > 0 ? 'right' : 'left');
    };
    wrap.addEventListener('wheel', onWheel, { passive: false });
    return () => wrap.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-[var(--text-primary)]">
            Servicios relacionados
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Usa las flechas o la rueda del mouse para explorar
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500" />
          </span>
          <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            Auto-scroll
          </span>
        </div>
      </div>

      {/* Contenedor con flechas superpuestas */}
      <div className="relative group/carousel">
        {/* Flecha izquierda */}
        <button
          onClick={() => shift('left')}
          aria-label="Anterior"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20
            w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-lg
            border border-sky-100 dark:border-sky-900/40
            flex items-center justify-center
            text-sky-600 dark:text-sky-400
            hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:border-sky-400
            transition-all duration-200
            opacity-0 group-hover/carousel:opacity-100
            -translate-x-1 group-hover/carousel:translate-x-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Flecha derecha */}
        <button
          onClick={() => shift('right')}
          aria-label="Siguiente"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20
            w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-lg
            border border-sky-100 dark:border-sky-900/40
            flex items-center justify-center
            text-sky-600 dark:text-sky-400
            hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:border-sky-400
            transition-all duration-200
            opacity-0 group-hover/carousel:opacity-100
            translate-x-1 group-hover/carousel:translate-x-0"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Fade + overflow */}
        <div
          ref={wrapRef}
          className="overflow-hidden relative"
          style={{
            maskImage:
              'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
          }}
          onMouseEnter={() => {
            pausedRef.current = true;
            if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
          }}
          onMouseLeave={() => {
            pausedRef.current = false;
          }}
          onTouchStart={() => pauseTemporarily()}
          onTouchEnd={() => {}}
        >
          <div
            ref={trackRef}
            className="flex gap-4 will-change-transform py-4 px-2"
            style={{ width: 'max-content' }}
          >
            {items.map((s, i) => (
              <RelatedServiceCard key={`${s.id}-${i}`} s={s} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── RelatedServices (wrapper con fetch) ──────────────────────────────────────

function RelatedServices({
  categoryId,
  excludeId,
}: {
  categoryId: number;
  excludeId: number;
}) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${LARAVEL_API_URL}/services?category_id=${categoryId}&per_page=7`, {
      headers: { Accept: 'application/json' },
    })
      .then((r) => r.json())
      .then((json) => {
        const list = (json.data ?? [])
          .filter((s: any) => s.id !== excludeId)
          .slice(0, 6);
        setServices(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [categoryId, excludeId]);

  if (loading || services.length === 0) return null;

  return <RelatedServicesCarousel services={services} />;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ServiceDetailPageClient({ service }: Props) {
  const router = useRouter();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [profileSpecialist, setProfileSpecialist] =
    useState<ServiceSpecialist | null>(null);
  const [showAllSpecialists, setShowAllSpecialists] = useState(false);
  const [bookingSpecialist, setBookingSpecialist] =
    useState<ServiceSpecialist | null>(null);

  const cancelInfo = getCancellationLabel(service.cancellation_policy);
  const heroImg = imgSrc(service.image);

  const benefits: string[] = (() => {
    if (!service.benefits) return [];
    if (typeof service.benefits === 'string') {
      try {
        return JSON.parse(service.benefits);
      } catch {
        /* not JSON */
      }
      const trimmed = service.benefits.trim();
      if (trimmed.includes('\n'))
        return trimmed
          .split('\n')
          .map((b) => b.trim())
          .filter(Boolean);
      return [trimmed];
    }
    if (Array.isArray(service.benefits)) return service.benefits;
    return [];
  })();

  const handleBookFromProfile = useCallback((specialist: ServiceSpecialist) => {
    setProfileSpecialist(null);
    setBookingSpecialist(specialist);
    setBookingOpen(true);
  }, []);

  useEffect(() => {
    if (!bookingOpen) setBookingSpecialist(null);
  }, [bookingOpen]);

  return (
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-[var(--bg-primary)]">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-[var(--bg-card)] border-b border-gray-200 dark:border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="text-gray-400 hover:text-cyan-600 dark:text-white transition-colors"
          >
            Inicio
          </Link>
          <span className="text-gray-300 dark:text-[var(--text-secondary)]">
            /
          </span>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-cyan-600 dark:text-white hover:underline"
          >
            Servicios
          </button>
          <span className="text-gray-300 dark:text-[var(--text-secondary)]">
            /
          </span>
          <span className="font-semibold text-gray-700 dark:text-[var(--text-primary)] truncate max-w-[200px]">
            {service.name}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
        <div className="grid lg:grid-cols-[65fr_35fr] gap-8">
          {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
          <div className="space-y-6 min-w-0">
            {/* Hero */}
            <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start gap-5">
                <div className="relative w-full h-56 sm:w-64 sm:h-64 lg:w-[400px] lg:h-[400px] rounded-2xl bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center shrink-0 overflow-hidden">
                  {heroImg ? (
                    <img
                      src={heroImg}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Stethoscope className="w-12 h-12 text-cyan-600 dark:text-white" />
                  )}
                  {(() => {
                    const badges: Array<{ label: string; className: string }> =
                      [];
                    const primary = getStickerBadge(
                      service.sticker,
                      service.discount_percentage,
                    );
                    if (primary) badges.push(primary);
                    badges.push(...getExtraBadges(service));
                    if (badges.length === 0) return null;
                    return (
                      <div className="absolute top-4 left-4 flex flex-col gap-1">
                        {badges.map((b, i) => (
                          <span key={i} className={b.className}>
                            {b.label}
                          </span>
                        ))}
                      </div>
                    );
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {service.category && (
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 dark:bg-cyan-600/20 text-cyan-600 dark:text-white text-xs font-semibold">
                        {getLeafCategory(service.category)}
                      </span>
                    )}
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400">
                      <CheckCircle className="w-3 h-3" /> Disponible
                    </span>
                    {service.is_home_service && (
                      <span className="flex items-center gap-1 px-1.5 py-1 rounded-md text-xs font-semibold text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 dark:text-cyan-400">
                        <Home className="w-3 h-3" /> A domicilio
                      </span>
                    )}
                    {service.is_virtual && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400">
                        <Wifi className="w-3 h-3" /> Online
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
                    {service.name}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-[var(--text-muted)] mt-0.5">
                    {service.store_name}
                  </p>
                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-[#FACC15] text-[#FACC15]" />
                      <span className="font-bold text-gray-800 dark:text-[var(--text-primary)]">
                        4.8
                      </span>
                      <span className="text-xs text-gray-400 dark:text-[var(--text-muted)]">
                        (256 reseñas)
                      </span>
                    </div>
                    <span className="text-gray-300 dark:text-[var(--text-secondary)]">
                      |
                    </span>
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
                <h2 className="text-lg font-bold text-gray-900 dark:text-[var(--text-primary)] mb-3">
                  Descripción del servicio
                </h2>
                <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                  {service.description}
                </p>
              </div>
            )}

            {/* Includes */}
            {(benefits.length > 0 || service.duration_minutes) && (
              <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 dark:text-[var(--text-primary)] mb-4">
                  Este servicio incluye
                </h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    {benefits.length > 0 ? (
                      benefits.map((b, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-cyan-600 dark:text-white shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                            {b}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-cyan-600 dark:text-white shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                          Servicio profesional
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs font-semibold text-gray-800 dark:text-[var(--text-primary)]">
                          Tipo de servicio
                        </p>
                        <p className="text-xs text-gray-400">
                          {service.is_virtual ? 'Online' : 'Presencial'}
                          {service.is_home_service ? ' / A domicilio' : ''}
                        </p>
                      </div>
                    </div>
                    {service.duration_minutes && (
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs font-semibold text-gray-800 dark:text-[var(--text-primary)]">
                            Duración
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDuration(service.duration_minutes)}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs font-semibold text-gray-800 dark:text-[var(--text-primary)]">
                          Reservar con anticipación
                        </p>
                        <p className="text-xs text-gray-400">
                          {service.booking_advance_hours}h antes
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cancelInfo.color}`}
                      >
                        <CheckCircle className="w-3 h-3" /> {cancelInfo.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews */}
            <ServiceReviews serviceId={service.id} />

            {/* Store */}
            <Link href={`/tienda/${service.store_id}`} className="block">
              <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] p-4 hover:border-cyan-400/30 transition-colors flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0 overflow-hidden relative">
                  {service.store_logo ? (
                    <Image
                      src={service.store_logo}
                      alt={service.store_name}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <MapPin className="w-5 h-5 text-cyan-600 dark:text-white" />
                  )}
                  <TopMedalBadge entityType="store" entityId={service.store_id} size="lg" className="absolute bottom-3 right-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">Tienda</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] truncate">
                    {service.store_name}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 dark:text-[var(--text-muted)] shrink-0" />
              </div>
            </Link>
          </div>

          {/* ── RIGHT COLUMN ─────────────────────────────────────────────── */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] shadow-lg overflow-hidden">
              <div className="p-6 pb-4">
                <p className="text-xs text-gray-400 mb-1">Precio desde</p>
                {service.discount_percentage &&
                service.discount_percentage > 0 ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-cyan-600 dark:text-white">
                      S/{' '}
                      {(
                        service.price *
                        (1 - service.discount_percentage / 100)
                      ).toFixed(2)}
                    </span>
                    <span className="text-lg text-gray-400 line-through">
                      S/ {Number(service.price).toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl font-black text-cyan-600 dark:text-white">
                    S/ {Number(service.price).toFixed(2)}
                  </span>
                )}
              </div>
              <div className="px-6 pb-4">
                <button
                  onClick={() => setBookingOpen(true)}
                  className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" /> Adquirir cita
                </button>
              </div>
              <div className="mx-6 h-px bg-gray-100 dark:bg-[var(--bg-muted)]" />
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)] text-sm">
                    Especialistas disponibles
                  </h3>
                  <span className="text-xs text-cyan-600 dark:text-white">
                    {service.specialists.length} especialistas
                  </span>
                </div>
                <div className="space-y-2.5">
                  {(showAllSpecialists
                    ? service.specialists
                    : service.specialists.slice(0, 4)
                  ).map((sp) => {
                    const { today } = getSpecialistAvailability(sp);
                    return (
                      <button
                        key={sp.id}
                        onClick={() => setProfileSpecialist(sp)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-[var(--border-default)] hover:border-cyan-400/30 hover:bg-cyan-500/5 transition-all group"
                      >
                        <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/50 dark:to-blue-900/50 flex items-center justify-center overflow-hidden shrink-0">
                          {sp.foto ? (
                            <img
                              src={sp.foto}
                              alt={sp.nombre_completo}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <User className="w-4 h-4 text-sky-400" />
                          )}
                          <span
                            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-[var(--bg-card)] ${today ? 'bg-emerald-400' : 'bg-amber-400'}`}
                          />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-sm font-semibold text-gray-800 dark:text-[var(--text-primary)] truncate">
                            {sp.nombre_completo}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {sp.especialidad}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 dark:text-[var(--text-muted)] group-hover:text-cyan-600 dark:text-white transition-colors shrink-0" />
                      </button>
                    );
                  })}
                  {!showAllSpecialists && service.specialists.length > 4 && (
                    <button
                      onClick={() => setShowAllSpecialists(true)}
                      className="w-full text-center text-xs text-cyan-600 dark:text-white hover:underline pt-1"
                    >
                      Ver todos los {service.specialists.length} especialistas
                    </button>
                  )}
                  {showAllSpecialists && service.specialists.length > 4 && (
                    <button
                      onClick={() => setShowAllSpecialists(false)}
                      className="w-full text-center text-xs text-gray-400 hover:text-gray-600 dark:hover:text-[var(--text-secondary)] pt-1"
                    >
                      Mostrar menos
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Servicios relacionados con carrusel animado ── */}
      <RelatedServices
        categoryId={service.parent_category_id ?? service.category_id}
        excludeId={service.id}
      />

      {/* Modales */}
      <BookingModal
        service={service}
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        preselectedSpecialist={bookingSpecialist}
      />
      <SpecialistProfileModal
        specialist={profileSpecialist}
        service={service}
        open={profileSpecialist !== null}
        onClose={() => setProfileSpecialist(null)}
        onBook={handleBookFromProfile}
      />
    </main>
  );
}
