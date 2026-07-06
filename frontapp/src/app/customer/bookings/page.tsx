'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEcho } from '@laravel/echo-react';
import { bookingRepository } from '@/shared/lib/api/bookingRepository';
import type { BookingResponse } from '@/shared/lib/api/bookingRepository';
import { BookingTimeline } from '@/shared/components/booking/BookingTimeline';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import {
  Calendar, Clock, User, Loader2, X, Star, Eye,
  MessageSquare, Store, CreditCard,
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

  const [detailTarget, setDetailTarget] = useState<BookingResponse | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    requestAnimationFrame(() => setDrawerOpen(true));
  };
  const closeDetail = () => {
    setDrawerOpen(false);
    setTimeout(() => setDetailTarget(null), 300);
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

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-sky-500 dark:text-[var(--icons-green)]" />
      </div>
    );
  }

  const list = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Mis Reservas"
        subtitle="Servicios agendados y tu historial de reservas"
        icon="Calendar"
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-[var(--bg-secondary)] rounded-xl p-1 w-fit">
        <button onClick={() => setTab('upcoming')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            tab === 'upcoming'
              ? 'bg-white dark:bg-[var(--bg-card)] text-gray-900 dark:text-[var(--text-primary)] shadow-sm'
              : 'text-gray-500 dark:text-[var(--text-muted)] hover:text-gray-700 dark:hover:text-[var(--text-secondary)]'
          }`}>
          Próximas ({upcoming.length})
        </button>
        <button onClick={() => setTab('past')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            tab === 'past'
              ? 'bg-white dark:bg-[var(--bg-card)] text-gray-900 dark:text-[var(--text-primary)] shadow-sm'
              : 'text-gray-500 dark:text-[var(--text-muted)] hover:text-gray-700 dark:hover:text-[var(--text-secondary)]'
          }`}>
          Pasadas ({past.length})
        </button>
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
        <div className="space-y-3">
          {list.map((booking) => (
            <div key={booking.id}
              className="group bg-white dark:bg-[var(--bg-card)] rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] p-5 transition-all hover:shadow-lg hover:border-sky-200 dark:hover:border-[var(--icons-green)]/40">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)] text-sm truncate">{booking.service_name}</h3>
                    <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_LABELS[booking.status]?.color ?? ''}`}>
                      {STATUS_LABELS[booking.status]?.label ?? booking.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-[var(--text-muted)] mb-3 flex items-center gap-1.5">
                    <Store className="w-3 h-3" /> {booking.store_name}
                  </p>

                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-600 dark:text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-sky-500 dark:text-[var(--icons-green)]" />
                      {booking.date && formatDate(booking.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-sky-500 dark:text-[var(--icons-green)]" />
                      {booking.start_time} - {booking.end_time}
                    </span>
                    {booking.specialist && (
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-sky-500 dark:text-[var(--icons-green)]" />
                        {booking.specialist.name}
                      </span>
                    )}
                    {booking.payment_amount > 0 && (
                      <span className="font-bold text-gray-800 dark:text-[var(--text-primary)]">
                        S/ {booking.payment_amount.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => openDetail(booking)}
                    className="p-2 rounded-xl bg-sky-50 dark:bg-[var(--bg-muted)] text-sky-600 dark:text-[var(--icons-green)] hover:bg-sky-100 dark:hover:bg-[var(--bg-secondary)] transition-colors"
                    title="Ver detalle">
                    <Eye className="w-4 h-4" />
                  </button>
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
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Right-side drawer — vía portal a document.body: el <div className="animate-fadeIn">
          de BaseLayout.tsx tiene un transform (translateY vía animación con forwards) que
          crea un containing block y rompe el position:fixed relativo al viewport real. */}
      {detailTarget && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label={`Detalle de reserva: ${detailTarget.service_name}`} onClick={closeDetail}>
          {/* Overlay */}
          <div className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${drawerOpen ? 'opacity-100' : 'opacity-0'}`} />
          {/* Drawer */}
          <div
            onClick={(e) => e.stopPropagation()}
            className={`absolute right-0 top-0 bottom-0 w-full sm:w-[520px] bg-white dark:bg-[var(--bg-secondary)] shadow-[-40px_0_100px_rgba(0,0,0,0.25)] flex flex-col transition-transform duration-300 ease-out will-change-transform ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            {/* Header gradiente */}
            <div className="sticky top-0 z-10 px-6 pt-7 pb-5 bg-gradient-to-r from-sky-500 via-sky-400 to-sky-300 dark:from-[var(--brand-green-hover)] dark:via-[var(--brand-green)] dark:to-[var(--brand-green-hover)] text-white flex-shrink-0">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl" />
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/70">Detalle de reserva</p>
                  <h2 className="text-lg font-black mt-1 leading-tight">{detailTarget.service_name}</h2>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                      {STATUS_LABELS[detailTarget.status]?.label ?? detailTarget.status}
                    </span>
                    <span className="text-[11px] font-semibold text-white/90 flex items-center gap-1">
                      <Store className="w-3 h-3" /> {detailTarget.store_name}
                    </span>
                  </div>
                </div>
                <button onClick={closeDetail}
                  className="w-9 h-9 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-all shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-5 space-y-5">
              {/* Timeline */}
              <div className="p-5 bg-gray-50 dark:bg-[var(--bg-muted)]/50 rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)]">
                <p className="text-[10px] font-black text-gray-400 dark:text-[var(--text-muted)] uppercase tracking-widest mb-3">
                  Seguimiento
                </p>
                <BookingTimeline status={detailTarget.status} isHome={!!detailTarget.is_home_service} />
              </div>

              {/* Info cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-[var(--border-subtle)]">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[var(--text-muted)]">Total</span>
                <span className="text-2xl font-black text-sky-600 dark:text-[var(--icons-green)]">
                  S/ {detailTarget.payment_amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Rate modal — mismo motivo, vía portal */}
      {rateTarget && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-label="Califica tu experiencia" onClick={() => setRateTarget(null)}>
          <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl shadow-2xl max-w-sm w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
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
