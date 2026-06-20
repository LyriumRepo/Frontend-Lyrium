'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { bookingRepository } from '@/shared/lib/api/bookingRepository';
import type { BookingResponse } from '@/shared/lib/api/bookingRepository';
import {
  Calendar, Clock, User, MapPin, CreditCard,
  Loader2, X, ChevronRight, Star, CheckCircle,
  AlertCircle, MessageSquare,
} from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' },
  confirmed: { label: 'Confirmada', color: 'bg-sky-100 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400' },
  on_the_way: { label: 'En camino', color: 'bg-violet-100 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400' },
  completed: { label: 'Completada', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400' },
  no_show: { label: 'No asistió', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
};

const PAYMENT_LABELS: Record<string, string> = {
  card: 'Tarjeta',
  yape: 'Yape',
  plin: 'Plin',
  cash: 'Efectivo',
  transfer: 'Transferencia',
};

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];
  const days = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function CustomerBookingsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  // Modals
  const [cancelTarget, setCancelTarget] = useState<BookingResponse | null>(null);
  const [rateTarget, setRateTarget] = useState<BookingResponse | null>(null);
  const [rateValue, setRateValue] = useState(0);
  const [rateComment, setRateComment] = useState('');
  const [rateSubmitting, setRateSubmitting] = useState(false);
  const [rateError, setRateError] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    bookingRepository.myBookings(50)
      .then(setBookings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const upcoming = bookings.filter(b =>
    (b.status === 'pending' || b.status === 'confirmed' || b.status === 'on_the_way') && b.date >= todayStr
  );
  const past = bookings.filter(b =>
    b.status === 'completed' || b.status === 'cancelled' || b.status === 'no_show'
    || (b.status === 'pending' || b.status === 'confirmed' || b.status === 'on_the_way') && b.date < todayStr
  );

  const handleConfirmCompletion = async (bookingId: number) => {
    setActionLoading(bookingId);
    try {
      await bookingRepository.confirmCompletion(bookingId);
      setBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status: 'completed' as const } : b
      ));
    } catch (e: any) {
      alert(e.message ?? 'Error al confirmar atención');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setActionLoading(cancelTarget.id);
    try {
      await bookingRepository.cancel(cancelTarget.id);
      setBookings(prev => prev.map(b =>
        b.id === cancelTarget.id ? { ...b, status: 'cancelled', can_cancel: false } : b
      ));
      setCancelTarget(null);
    } catch (e: any) {
      alert(e.message ?? 'Error al cancelar');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRate = async () => {
    if (!rateTarget || rateValue === 0) return;
    setRateSubmitting(true);
    setRateError('');
    try {
      await bookingRepository.rate(rateTarget.id, { rating: rateValue, comment: rateComment || undefined });
      setBookings(prev => prev.map(b =>
        b.id === rateTarget.id ? { ...b, status: 'completed' as any } : b
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
        <Loader2 className="w-10 h-10 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Mis Reservas</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Servicios agendados y tu historial de reservas
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab('upcoming')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            tab === 'upcoming'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Próximas ({upcoming.length})
        </button>
        <button
          onClick={() => setTab('past')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            tab === 'past'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Pasadas ({past.length})
        </button>
      </div>

      {/* List */}
      {((tab === 'upcoming' ? upcoming : past) as BookingResponse[]).length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-semibold">
            {tab === 'upcoming' ? 'No tienes reservas próximas' : 'No tienes reservas pasadas'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {(tab === 'upcoming' ? upcoming : past).map((booking) => (
            <div key={booking.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{booking.service_name}</h3>
                    <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_LABELS[booking.status]?.color ?? ''}`}>
                      {STATUS_LABELS[booking.status]?.label ?? booking.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{booking.store_name}</p>

                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-sky-400" />
                      {booking.date && formatDate(booking.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                      {booking.start_time} - {booking.end_time}
                    </span>
                    {booking.specialist && (
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-sky-400" />
                        {booking.specialist.name}
                      </span>
                    )}
                    {booking.payment_amount > 0 && (
                      <span className="flex items-center gap-1.5 font-semibold text-gray-800 dark:text-gray-200">
                        S/ {booking.payment_amount.toFixed(2)}
                      </span>
                    )}
                    {booking.payment_method && (
                      <span className="flex items-center gap-1.5 text-gray-400">
                        <CreditCard className="w-3.5 h-3.5" />
                        {PAYMENT_LABELS[booking.payment_method] ?? booking.payment_method}
                      </span>
                    )}
                  </div>

                  {booking.notes && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 flex items-start gap-1.5">
                      <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" />
                      {booking.notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  {booking.can_cancel && (
                    <button
                      onClick={() => setCancelTarget(booking)}
                      disabled={actionLoading === booking.id}
                      className="px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {actionLoading === booking.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Cancelar'}
                    </button>
                  )}
                  {(booking.status === 'confirmed' || booking.status === 'on_the_way') && (
                    <button
                      onClick={() => handleConfirmCompletion(booking.id)}
                      disabled={actionLoading === booking.id}
                      className="px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      {actionLoading === booking.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                      Confirmar atención
                    </button>
                  )}
                  {booking.status === 'completed' && (
                    <button
                      onClick={() => { setRateTarget(booking); setRateValue(0); setRateComment(''); setRateError(''); }}
                      className="px-3 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50 rounded-lg transition-colors"
                    >
                      Calificar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel modal */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setCancelTarget(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setCancelTarget(null)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Cancelar reserva</h3>
              <p className="text-sm text-gray-500 mt-2">
                ¿Estás seguro de cancelar la reserva de <strong>{cancelTarget.service_name}</strong> el {cancelTarget.date && formatDate(cancelTarget.date)} a las {cancelTarget.start_time}?
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCancelTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Volver
              </button>
              <button onClick={handleCancel} disabled={actionLoading === cancelTarget.id}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {actionLoading === cancelTarget.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cancelar reserva'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rate modal */}
      {rateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setRateTarget(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setRateTarget(null)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Califica tu experiencia</h3>
              <p className="text-sm text-gray-500 mt-1">{rateTarget.service_name}</p>
            </div>

            <div className="flex justify-center gap-2 mb-5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRateValue(n)} className="transition-all hover:scale-110">
                  <Star className={`w-8 h-8 ${n <= rateValue ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
                </button>
              ))}
            </div>

            <textarea
              value={rateComment}
              onChange={(e) => setRateComment(e.target.value)}
              placeholder="Cuéntanos tu experiencia (opcional)"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all resize-none mb-4"
            />

            {rateError && (
              <p className="text-xs text-red-500 mb-3 text-center">{rateError}</p>
            )}

            <button
              onClick={handleRate}
              disabled={rateValue === 0 || rateSubmitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 disabled:opacity-50 text-white text-sm font-bold transition-all flex items-center justify-center gap-2"
            >
              {rateSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
              {rateSubmitting ? 'Enviando…' : 'Enviar calificación'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
