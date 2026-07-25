'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEcho } from '@laravel/echo-react';
import { bookingRepository } from '@/shared/lib/api/bookingRepository';
import type { BookingResponse } from '@/shared/lib/api/bookingRepository';
import { BookingTimeline } from '@/shared/components/booking/BookingTimeline';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import Icon from '@/components/ui/Icon';
import Pagination from '@/components/ui/Pagination';
import {
  Calendar, Clock, User, Loader2, X, Star, Eye,
  MessageSquare, Store, CreditCard, BadgeCheck, XCircle,
} from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:    { label: 'Pendiente',  color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  confirmed:  { label: 'Confirmada', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  on_the_way: { label: 'En camino',  color: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300' },
  completed:  { label: 'Completada', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
  cancelled:  { label: 'Cancelada',  color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  no_show:    { label: 'No asistió', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
};

const PAYMENT_LABELS: Record<string, string> = {
  card: 'Tarjeta', yape: 'Yape', plin: 'Plin', cash: 'Efectivo',
  transfer: 'Transferencia', izipay: 'Izipay',
};

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];
  const days = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function CustomerBookingsPage() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const router = useRouter();

  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [page, setPage] = useState(1);

  const [detailTarget, setDetailTarget] = useState<BookingResponse | null>(null);

  const [rateTarget, setRateTarget] = useState<BookingResponse | null>(null);
  const [rateValue, setRateValue] = useState(0);
  const [rateComment, setRateComment] = useState('');
  const [rateSubmitting, setRateSubmitting] = useState(false);
  const [rateError, setRateError] = useState('');

  const loadBookings = useCallback(() => {
    return bookingRepository.myBookings(50)
      .then(setBookings)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    loadBookings().finally(() => setLoading(false));
  }, [isAuthenticated, loadBookings]);

  // Realtime: refresca cuando llega notificación de booking
  useEcho<{ type: string }>(
    `user.${user?.id ?? 0}`,
    'NotificationCreated',
    async (event) => {
      const t = String(event?.type ?? '');
      if (!t.includes('Booking')) return;
      await loadBookings();
      if (detailTarget) {
        const fresh = (await bookingRepository.myBookings(50)).find(b => b.id === detailTarget.id);
        if (fresh) setDetailTarget(fresh);
      }
    },
    [user, loadBookings, detailTarget?.id],
  );

  const openDetail = (b: BookingResponse) => {
    setDetailTarget(b);
  };
  const closeDetail = () => {
    setDetailTarget(null);
  };

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const upcoming = bookings.filter(b =>
    (b.status === 'pending' || b.status === 'confirmed' || b.status === 'on_the_way') && b.date >= todayStr
  );
  const past = bookings.filter(b =>
    b.status === 'completed' || b.status === 'cancelled' || b.status === 'no_show'
    || ((b.status === 'pending' || b.status === 'confirmed' || b.status === 'on_the_way') && b.date < todayStr)
  );

  // ─── Validación de finalización por el cliente ────────────────────────────

  const [validatingId, setValidatingId] = useState<number | null>(null);

  const canValidate = (b: BookingResponse) => b.status === 'completed' && !b.customer_validated_at;

  const handleValidateReceipt = async (booking: BookingResponse) => {
    if (validatingId !== null) return;
    setValidatingId(booking.id);
    try {
      const { liriosBonus } = await bookingRepository.validateReceipt(booking.id);
      const applyValidated = (b: BookingResponse): BookingResponse =>
        b.id === booking.id
          ? { ...b, customer_validated_at: new Date().toISOString(), validation_source: 'manual' }
          : b;
      setBookings(prev => prev.map(applyValidated));
      setDetailTarget(prev => (prev && prev.id === booking.id ? applyValidated(prev) : prev));
      alert(`¡Gracias por confirmar tu servicio! Has ganado ${liriosBonus} Lirios para tu próxima compra. 🎉`);
    } catch (e) {
      alert(e instanceof Error && e.message ? e.message : 'No se pudo validar la reserva. Intenta nuevamente.');
    } finally {
      setValidatingId(null);
    }
  };

  // ─── Cancelación por el cliente ────────────────────────────────────────────

  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const handleCancelBooking = async (booking: BookingResponse) => {
    if (cancellingId !== null) return;
    if (!window.confirm(`¿Seguro que quieres cancelar la reserva de "${booking.service_name}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    setCancellingId(booking.id);
    try {
      const updated = await bookingRepository.cancel(booking.id);
      setBookings(prev => prev.map(b => (b.id === booking.id ? { ...b, ...updated } : b)));
      setDetailTarget(prev => (prev && prev.id === booking.id ? { ...prev, ...updated } : prev));
    } catch (e) {
      alert(e instanceof Error && e.message ? e.message : 'No se pudo cancelar la reserva. Intenta nuevamente.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleRate = async () => {
    if (!rateTarget || rateValue === 0) return;
    setRateSubmitting(true);
    setRateError('');
    try {
      await bookingRepository.rate(rateTarget.id, { rating: rateValue, comment: rateComment || undefined });
      setBookings(prev => prev.map(b =>
        b.id === rateTarget.id ? { ...b, review: { rating: rateValue, comment: rateComment || null } } : b
      ));
      setRateTarget(null);
      setRateValue(0);
      setRateComment('');
    } catch (e: any) {
      setRateError(e.message ?? 'Error al calificar');
    } finally {
      setRateSubmitting(false);
    }
  };

  const list = tab === 'upcoming' ? upcoming : past;
  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedList = useMemo(
    () => list.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [list, safePage],
  );

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-sky-500 dark:text-[var(--icons-green)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Mis Reservas"
        subtitle="Gestiona y revisa el historial de tus servicios reservados en Lyrium"
        icon="Calendar"
      />

      <div className="bg-white dark:bg-[var(--bg-secondary)] p-5 rounded-[2rem] border border-gray-100 dark:border-[var(--border-subtle)] shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-600 dark:from-[var(--brand-green)] dark:to-[var(--brand-green-hover)] rounded-2xl flex items-center justify-center shadow-lg">
            <Icon name="Filter" className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-black text-gray-800 dark:text-[var(--text-primary)]">
            Filtrar por Estado
          </h3>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-[var(--bg-secondary)] rounded-xl p-1 w-fit">
        <button onClick={() => { setTab('upcoming'); setPage(1); }}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            tab === 'upcoming'
              ? 'bg-white dark:bg-[var(--bg-card)] text-gray-900 dark:text-[var(--text-primary)] shadow-sm'
              : 'text-gray-500 dark:text-[var(--text-muted)] hover:text-gray-700 dark:hover:text-[var(--text-secondary)]'
          }`}>
          Próximas ({upcoming.length})
        </button>
        <button onClick={() => { setTab('past'); setPage(1); }}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            tab === 'past'
              ? 'bg-white dark:bg-[var(--bg-card)] text-gray-900 dark:text-[var(--text-primary)] shadow-sm'
              : 'text-gray-500 dark:text-[var(--text-muted)] hover:text-gray-700 dark:hover:text-[var(--text-secondary)]'
          }`}>
          Pasadas ({past.length})
        </button>
      </div>
      </div>

      {/* List */}
      {list.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-[var(--text-muted)] font-semibold">
            {tab === 'upcoming' ? 'No tienes reservas próximas' : 'No tienes reservas pasadas'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-[var(--border-subtle)] overflow-hidden">
          <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-8 pt-6 pb-3">
            {list.length} reserva{list.length !== 1 ? 's' : ''}
          </p>
          <div className="overflow-x-auto no-scrollbar">
          <table className="hidden md:table w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-subtle)]">
                {['Servicio', 'Tienda', 'Fecha', 'Horario', 'Especialista', 'Monto', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} className="px-6 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {paginatedList.map((booking) => (
                <tr key={booking.id} className="hover:bg-[var(--bg-secondary)]/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">{booking.service_name}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-600 dark:text-[var(--text-secondary)] whitespace-nowrap">{booking.store_name}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-700 dark:text-[var(--text-primary)] whitespace-nowrap">{booking.date ? formatDate(booking.date) : '—'}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-700 dark:text-[var(--text-primary)] whitespace-nowrap">{booking.start_time} - {booking.end_time}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-600 dark:text-[var(--text-secondary)] whitespace-nowrap">
                    {booking.specialist?.name ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-[var(--text-primary)] whitespace-nowrap">
                    {booking.payment_amount > 0 ? `S/ ${booking.payment_amount.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${STATUS_LABELS[booking.status]?.color ?? ''}`}>
                      {STATUS_LABELS[booking.status]?.label ?? booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openDetail(booking)}
                        className="p-2 rounded-xl bg-sky-50 dark:bg-[var(--brand-green)] text-sky-600 dark:text-white hover:bg-sky-100 dark:hover:bg-[var(--brand-green-hover)] border border-sky-200 dark:border-[var(--border-subtle)] transition-colors"
                        title="Ver detalle">
                        <Eye className="w-4 h-4" />
                      </button>
                      {booking.can_cancel && (
                        <button onClick={() => handleCancelBooking(booking)}
                          disabled={cancellingId === booking.id}
                          className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800/40 transition-colors disabled:opacity-50"
                          title="Cancelar reserva">
                          {cancellingId === booking.id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <XCircle className="w-4 h-4" />}
                        </button>
                      )}
                      {canValidate(booking) && (
                        <button onClick={() => handleValidateReceipt(booking)}
                          disabled={validatingId === booking.id}
                          className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-700/40 transition-colors disabled:opacity-50"
                          title="Validar servicio y ganar Lirios">
                          {validatingId === booking.id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <BadgeCheck className="w-4 h-4" />}
                        </button>
                      )}
                      {booking.status === 'completed' && booking.customer_validated_at && (
                        <span
                          className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-400 flex items-center"
                          title={booking.validation_source === 'auto_expired' ? 'Cerrada automáticamente' : 'Validada por ti'}
                        >
                          <BadgeCheck className="w-4 h-4" />
                        </span>
                      )}
                      {booking.status === 'completed' && (
                        booking.review ? (
                          <span
                            className="p-2 rounded-xl bg-sky-50 dark:bg-[var(--brand-green)]/20 text-sky-600 dark:text-[var(--icons-green)] flex items-center gap-1"
                            title={`Ya calificaste: ${booking.review.rating}/5`}
                          >
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-[10px] font-bold">{booking.review.rating}</span>
                          </span>
                        ) : (
                          <button onClick={() => { setRateTarget(booking); setRateValue(0); setRateComment(''); setRateError(''); }}
                            className="p-2 rounded-xl bg-sky-50 dark:bg-[var(--bg-muted)] text-sky-600 dark:text-[var(--icons-green)] hover:bg-sky-100 dark:hover:bg-[var(--bg-secondary)] transition-colors"
                            title="Calificar">
                            <Star className="w-4 h-4" />
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          <div className="block md:hidden space-y-3 p-4">
            {paginatedList.map((booking) => (
              <div key={booking.id}
                className="group bg-white dark:bg-[var(--bg-card)] rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] p-4 transition-all hover:shadow-lg hover:border-sky-200 dark:hover:border-[var(--icons-green)]/40">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 max-w-full break-words">
                    <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)] text-sm truncate">{booking.service_name}</h3>
                    <p className="text-xs text-gray-400 dark:text-[var(--text-muted)] mt-0.5 flex items-center gap-1.5">
                      <Store className="w-3 h-3" /> {booking.store_name}
                    </p>
                  </div>
                  <span className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full ${STATUS_LABELS[booking.status]?.color ?? ''}`}>
                    {STATUS_LABELS[booking.status]?.label ?? booking.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-[var(--text-secondary)] mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-sky-500 dark:text-[var(--icons-green)]" />
                    {booking.date && formatDate(booking.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-sky-500 dark:text-[var(--icons-green)]" />
                    {booking.start_time} - {booking.end_time}
                  </span>
                  {booking.specialist && (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-sky-500 dark:text-[var(--icons-green)]" />
                      {booking.specialist.name}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-[var(--border-subtle)]">
                  <span className="text-sm font-bold text-gray-900 dark:text-[var(--text-primary)]">
                    {booking.payment_amount > 0 ? `S/ ${booking.payment_amount.toFixed(2)}` : ''}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => openDetail(booking)}
                      className="px-3 py-2 rounded-2xl bg-sky-50 dark:bg-[var(--brand-green)] text-sky-600 dark:text-white hover:bg-sky-100 dark:hover:bg-[var(--brand-green-hover)] border border-sky-200 dark:border-[var(--border-subtle)] transition-colors flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-wide">Ver</span>
                    </button>
                    {booking.can_cancel && (
                      <button onClick={() => handleCancelBooking(booking)}
                        disabled={cancellingId === booking.id}
                        className="px-3 py-2 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800/40 transition-colors flex items-center gap-1.5 disabled:opacity-50">
                        {cancellingId === booking.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <XCircle className="w-4 h-4" />}
                        <span className="text-[10px] font-black uppercase tracking-wide">Cancelar</span>
                      </button>
                    )}
                    {canValidate(booking) && (
                      <button onClick={() => handleValidateReceipt(booking)}
                        disabled={validatingId === booking.id}
                        className="px-3 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/40 transition-colors flex items-center gap-1.5 disabled:opacity-50">
                        {validatingId === booking.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <BadgeCheck className="w-4 h-4" />}
                        <span className="text-[10px] font-black uppercase tracking-wide">Validar</span>
                      </button>
                    )}
                    {booking.status === 'completed' && !booking.review && (
                      <button onClick={() => { setRateTarget(booking); setRateValue(0); setRateComment(''); setRateError(''); }}
                        className="px-3 py-2 rounded-2xl bg-sky-50 dark:bg-[var(--bg-muted)] text-sky-600 dark:text-[var(--icons-green)] border border-sky-200 dark:border-[var(--border-subtle)] transition-colors flex items-center gap-1.5">
                        <Star className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-wide">Calificar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="border-t border-[var(--border-subtle)]">
              <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} totalItems={list.length} itemLabel="reservas" />
            </div>
          )}
        </div>
      )}

      {/* Modal de detalle — mismo diseño centrado que "Detalles del Pedido" en Mis Pedidos,
          vía portal a document.body por el mismo motivo (transform en BaseLayout.tsx rompe
          position:fixed relativo al viewport real). */}
      {detailTarget && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xl z-[99999] flex justify-center items-center p-4 lg:p-6 animate-fadeIn"
          onClick={closeDetail}
          onKeyDown={(e) => { if (e.key === 'Escape') closeDetail(); }}
          role="dialog"
          aria-modal="true"
          aria-label={`Detalle de reserva: ${detailTarget.service_name}`}
          tabIndex={-1}
        >
          <div
            className="bg-white dark:bg-[var(--bg-secondary)] w-full md:max-w-xl lg:max-w-[700px] max-h-[80vh] rounded-[2.5rem] overflow-hidden shadow-[-40px_0_100px_rgba(0,0,0,0.1)] border border-white/20 relative flex flex-col transition-all duration-700"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => { if (e.key === 'Escape') e.stopPropagation(); }}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
          >
            <div className="bg-gradient-to-r from-[var(--turquesa-500)] to-[var(--verde-500)] p-6 text-white relative flex-shrink-0">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                    <Icon name="CalendarCheck" className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tighter leading-none">Detalles de la Reserva</h3>
                    <p className="text-[9px] font-bold text-white/80 uppercase tracking-[0.2em] mt-1">Información de tu servicio</p>
                  </div>
                </div>
                <button
                  onClick={closeDetail}
                  className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all"
                >
                  <Icon name="X" className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 lg:p-8 space-y-6 overflow-y-auto flex-1">
              {/* Establecimiento + estado */}
              <div className="p-8 bg-sky-50 dark:bg-[var(--bg-muted)]/50 rounded-[2.5rem] border border-sky-100/50 flex flex-col md:flex-row items-center gap-6">
                <div className="w-20 h-20 bg-white dark:bg-[var(--bg-secondary)] rounded-[1.5rem] flex items-center justify-center shadow-lg border border-sky-50">
                  <Icon name="Store" className="w-10 h-10 text-sky-600 dark:text-[var(--icons-green)]" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <p className="text-[10px] font-black text-sky-400 dark:text-[var(--icons-green)] uppercase tracking-widest mb-1">Establecimiento</p>
                  <h4 className="text-2xl font-black text-gray-800 dark:text-[var(--text-primary)] tracking-tighter">
                    {detailTarget.store_name}
                  </h4>
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verificado por Lyrium</span>
                  </div>
                </div>
                <div
                  className={`px-5 py-2.5 rounded-2xl text-white ${
                    detailTarget.status === 'completed'
                      ? 'bg-gradient-to-r from-green-400 to-sky-500'
                      : detailTarget.status === 'cancelled' || detailTarget.status === 'no_show'
                        ? 'bg-gradient-to-r from-red-500 to-red-600'
                        : detailTarget.status === 'on_the_way'
                          ? 'bg-gradient-to-r from-sky-500 to-sky-600 dark:from-[var(--brand-green)] dark:to-[var(--brand-green-hover)]'
                          : 'bg-gradient-to-r from-gray-400 to-gray-500'
                  }`}
                >
                  <p className="text-[9px] font-black uppercase tracking-widest leading-none mb-1 opacity-70">Estado</p>
                  <p className="text-xs font-black uppercase tracking-tighter">
                    {STATUS_LABELS[detailTarget.status]?.label ?? detailTarget.status}
                  </p>
                </div>
              </div>

              {/* Seguimiento */}
              <div className="p-6 bg-gray-50 dark:bg-[var(--bg-muted)]/50 rounded-[2rem] border border-gray-100 dark:border-[var(--border-subtle)]">
                <h5 className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest mb-5">
                  Seguimiento de la Reserva
                </h5>
                <BookingTimeline status={detailTarget.status} isHome={!!detailTarget.is_home_service} validated={!!detailTarget.customer_validated_at} />
              </div>

              {/* Info cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 dark:bg-[var(--bg-muted)]/50 rounded-[2rem] border border-gray-100 dark:border-[var(--border-subtle)] flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center shadow-sm text-sky-500 dark:text-[var(--icons-green)] border border-gray-100 dark:border-[var(--border-subtle)]">
                    <Icon name="Briefcase" className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Servicio</p>
                    <p className="text-sm font-bold text-gray-700 dark:text-[var(--text-primary)]">{detailTarget.service_name}</p>
                  </div>
                </div>
                <InfoCard icon={Calendar} label="Fecha" value={detailTarget.date ? formatDate(detailTarget.date) : '—'} />
                <InfoCard icon={Clock} label="Horario" value={`${detailTarget.start_time} - ${detailTarget.end_time}`} />
                {detailTarget.specialist && (
                  <InfoCard icon={User} label="Especialista" value={detailTarget.specialist.name} />
                )}
                {detailTarget.payment_method && (
                  <InfoCard
                    icon={CreditCard}
                    label="Método de pago"
                    value={PAYMENT_LABELS[detailTarget.payment_method] ?? detailTarget.payment_method}
                    extra={detailTarget.payment_status === 'paid' ? 'Pagado' : detailTarget.payment_status}
                    extraColor={detailTarget.payment_status === 'paid' ? 'text-emerald-600 dark:text-[var(--icons-green)]' : 'text-amber-500'}
                  />
                )}
              </div>

              {detailTarget.notes && (
                <div className="p-4 bg-gray-50 dark:bg-[var(--bg-muted)]/50 rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-[var(--text-muted)] mb-2 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Notas del cliente
                  </p>
                  <p className="text-sm text-gray-700 dark:text-[var(--text-secondary)]">{detailTarget.notes}</p>
                </div>
              )}

              {detailTarget.seller_notes && (
                <div className="p-4 bg-sky-50 dark:bg-[var(--bg-muted)]/40 rounded-2xl border border-sky-100 dark:border-[var(--icons-green)]/30">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-[var(--icons-green)] mb-2">
                    Notas del vendedor
                  </p>
                  <p className="text-sm text-gray-700 dark:text-[var(--text-secondary)]">{detailTarget.seller_notes}</p>
                </div>
              )}

              {/* Total */}
              <div className="pt-2">
                <div className="bg-gradient-to-br from-slate-900 to-gray-900 dark:from-[var(--brand-green-hover)] dark:via-[var(--brand-green)] dark:to-[var(--brand-green-hover)] p-5 rounded-[2.5rem] flex items-center justify-between text-white shadow-2xl">
                  <div>
                    <p className="text-[10px] font-bold text-sky-300 dark:text-[var(--icons-green)] uppercase tracking-[0.3em] mb-1">Monto Total</p>
                    <h6 className="text-3xl font-black tracking-tighter">S/ {detailTarget.payment_amount.toFixed(2)}</h6>
                  </div>
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-[1.5rem] flex items-center justify-center border border-white/20">
                    <Icon name="CheckCircle" className="w-8 h-8 text-green-400 dark:text-[var(--icons-green)]" />
                  </div>
                </div>
              </div>

              {/* Validación de finalización */}
              {canValidate(detailTarget) && (
                <button
                  onClick={() => handleValidateReceipt(detailTarget)}
                  disabled={validatingId === detailTarget.id}
                  className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-xs uppercase tracking-[0.2em] hover:shadow-lg hover:shadow-emerald-200 dark:hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {validatingId === detailTarget.id
                    ? <Loader2 className="w-5 h-5 animate-spin" />
                    : <BadgeCheck className="w-5 h-5" />}
                  {validatingId === detailTarget.id ? 'Validando…' : 'Validar Servicio y Ganar Lirios'}
                </button>
              )}
              {detailTarget.status === 'completed' && detailTarget.customer_validated_at && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-700/40 flex items-center gap-2">
                  <BadgeCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                    {detailTarget.validation_source === 'auto_expired'
                      ? 'Reserva cerrada automáticamente por inacción.'
                      : 'Validaste esta reserva. ¡Gracias por confirmar!'}
                  </p>
                </div>
              )}

              {/* Cancelar reserva */}
              {detailTarget.can_cancel && (
                <button
                  onClick={() => handleCancelBooking(detailTarget)}
                  disabled={cancellingId === detailTarget.id}
                  className="w-full py-4 rounded-2xl border-2 border-red-200 dark:border-red-800/40 text-red-500 dark:text-red-400 font-black text-xs uppercase tracking-[0.2em] hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {cancellingId === detailTarget.id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <XCircle className="w-4 h-4" />}
                  {cancellingId === detailTarget.id ? 'Cancelando…' : 'Cancelar Reserva'}
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Rate modal — mismo motivo, vía portal */}
      {rateTarget && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-label="Califica tu experiencia" tabIndex={-1} onClick={() => setRateTarget(null)} onKeyDown={(e) => { if (e.key === 'Escape') setRateTarget(null); }}>
          <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl shadow-2xl max-w-sm w-full p-6 relative" tabIndex={-1} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <button onClick={() => setRateTarget(null)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-[var(--text-secondary)]">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-full bg-sky-100 dark:bg-[var(--brand-green)]/40 flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-sky-500 dark:text-[var(--icons-green)]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-[var(--text-primary)]">Califica tu experiencia</h3>
              <p className="text-sm text-gray-500 dark:text-[var(--text-muted)] mt-1">{rateTarget.service_name}</p>
            </div>

            <div className="flex justify-center gap-2 mb-5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRateValue(n)} className="transition-all hover:scale-110">
                  <Star className={`w-8 h-8 ${n <= rateValue ? 'text-sky-500 fill-sky-500 dark:text-[var(--icons-green)] dark:fill-[var(--icons-green)]' : 'text-gray-300 dark:text-gray-600'}`} />
                </button>
              ))}
            </div>

            <textarea value={rateComment} onChange={(e) => setRateComment(e.target.value)}
              placeholder="Cuéntanos tu experiencia (opcional)" rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-muted)] text-sm text-gray-700 dark:text-[var(--text-secondary)] focus:border-sky-400 dark:focus:border-[var(--icons-green)] focus:ring-2 focus:ring-sky-100 dark:focus:ring-[var(--icons-green)]/20 outline-none transition-all resize-none mb-4" />

            {rateError && <p className="text-xs text-red-500 mb-3 text-center">{rateError}</p>}

            <button onClick={handleRate} disabled={rateValue === 0 || rateSubmitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-600 hover:to-sky-500 dark:from-[var(--brand-green)] dark:to-[var(--brand-green-hover)] dark:hover:from-[var(--brand-green-hover)] dark:hover:to-[var(--brand-green)] disabled:opacity-50 text-white text-sm font-bold transition-all flex items-center justify-center gap-2">
              {rateSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
              {rateSubmitting ? 'Enviando…' : 'Enviar calificación'}
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function InfoCard({
  icon: Icon, label, value, extra, extraColor,
}: { icon: any; label: string; value: string; extra?: string; extraColor?: string }) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-[var(--bg-muted)]/50 rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)]">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-[var(--text-muted)] mb-1.5 flex items-center gap-1.5">
        <Icon className="w-3 h-3" /> {label}
      </p>
      <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">{value}</p>
      {extra && <p className={`text-[11px] font-semibold mt-0.5 ${extraColor ?? 'text-gray-500 dark:text-[var(--text-muted)]'}`}>{extra}</p>}
    </div>
  );
}
