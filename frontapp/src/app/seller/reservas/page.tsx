'use client';

import { useState, useEffect } from 'react';
import {
  Calendar, Clock, User, Star, Loader2, CheckCircle,
  Search, CreditCard, MessageSquare,
} from 'lucide-react';
import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import type { BookingResponse } from '@/shared/lib/api/bookingRepository';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' },
  confirmed: { label: 'Confirmada', color: 'bg-sky-100 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400' },
  on_the_way: { label: 'En camino', color: 'bg-violet-100 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400' },
  completed: { label: 'Completada', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400' },
  no_show: { label: 'No asistió', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
};

const STATUS_ORDER = ['confirmed', 'on_the_way', 'pending', 'completed', 'no_show', 'cancelled'] as const;

interface SpecialistRating {
  id: number;
  nombre_completo: string;
  especialidad: string;
  foto: string | null;
  avg_rating: number;
  total_ratings: number;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const base: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' };
  try {
    const res = await fetch('/api/auth-token');
    if (res.ok) {
      const { token } = await res.json();
      if (token) base.Authorization = `Bearer ${String(token).replace(/^["']|["']$/g, '').trim()}`;
    }
  } catch { /* no token */ }
  return base;
}

async function fetchApi<T>(endpoint: string): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${LARAVEL_API_URL}${endpoint}`, { headers: headers as HeadersInit });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? `Error ${res.status}`);
  return json;
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];
  const days = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function RatingStars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`w-3 h-3 ${n <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
      ))}
    </div>
  );
}

export default function SellerReservasPage() {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [specialists, setSpecialists] = useState<SpecialistRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    Promise.all([
      fetchApi<{ data: BookingResponse[] }>('/bookings/seller?per_page=100'),
      fetchApi<{ data: SpecialistRating[] }>('/stores/me/specialists?per_page=100'),
    ])
      .then(([bookingsRes, specialistsRes]) => {
        setBookings(bookingsRes.data ?? []);
        setSpecialists(specialistsRes.data ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleConfirm = async (bookingId: number) => {
    setCompletingId(bookingId);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${LARAVEL_API_URL}/bookings/${bookingId}/confirm`, {
        method: 'PUT',
        headers: headers as HeadersInit,
      });
      if (!res.ok) throw new Error();
      setBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status: 'confirmed' as const } : b
      ));
    } catch {
      alert('Error al validar la reserva');
    } finally {
      setCompletingId(null);
    }
  };

  const handleOnTheWay = async (bookingId: number) => {
    setCompletingId(bookingId);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${LARAVEL_API_URL}/bookings/${bookingId}/on-the-way`, {
        method: 'PUT',
        headers: headers as HeadersInit,
      });
      if (!res.ok) throw new Error();
      setBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status: 'on_the_way' as const } : b
      ));
    } catch {
      alert('Error al marcar como en camino');
    } finally {
      setCompletingId(null);
    }
  };

  const handleComplete = async (bookingId: number) => {
    setCompletingId(bookingId);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${LARAVEL_API_URL}/bookings/${bookingId}/complete`, {
        method: 'PUT',
        headers: headers as HeadersInit,
      });
      if (!res.ok) throw new Error();
      setBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status: 'completed' as const } : b
      ));
    } catch {
      alert('Error al completar la reserva');
    } finally {
      setCompletingId(null);
    }
  };

  const filtered = bookings
    .filter(b => statusFilter === 'all' || b.status === statusFilter)
    .filter(b => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        b.service_name?.toLowerCase().includes(q) ||
        b.customer_name?.toLowerCase().includes(q) ||
        b.specialist?.name?.toLowerCase().includes(q) ||
        b.store_name?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const ia = STATUS_ORDER.indexOf(a.status as any);
      const ib = STATUS_ORDER.indexOf(b.status as any);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Reservas</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Reservas recibidas en tu tienda
        </p>
      </div>

      {/* Specialist ratings summary */}
      {specialists.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
          <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
            Calificaciones de especialistas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {specialists.map(sp => (
              <div key={sp.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/50 dark:to-blue-900/50 flex items-center justify-center overflow-hidden shrink-0">
                  {sp.foto ? (
                    <img src={sp.foto} alt={sp.nombre_completo} className="object-cover w-full h-full" />
                  ) : (
                    <User className="w-4 h-4 text-sky-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{sp.nombre_completo}</p>
                  <p className="text-[11px] text-gray-400">{sp.especialidad}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1">
                    <RatingStars value={sp.avg_rating} />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {sp.total_ratings > 0
                      ? `${sp.avg_rating.toFixed(1)} (${sp.total_ratings})`
                      : 'Sin reseñas'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por servicio, cliente, especialista…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-semibold text-gray-700 dark:text-gray-200 outline-none focus:border-sky-400"
        >
          <option value="all">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Bookings list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-semibold">No hay reservas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking) => (
            <div key={booking.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{booking.service_name}</h3>
                    <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_LABELS[booking.status]?.color ?? ''}`}>
                      {STATUS_LABELS[booking.status]?.label ?? booking.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-600 dark:text-gray-300 mt-2">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-sky-400" />
                      {booking.customer_name}
                    </span>
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
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
                    {booking.payment_amount > 0 && (
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        S/ {booking.payment_amount.toFixed(2)}
                      </span>
                    )}
                    {booking.payment_method && (
                      <span className="text-gray-400 flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        {booking.payment_method}
                      </span>
                    )}
                    {booking.payment_status && (
                      <span className={`font-semibold ${
                        booking.payment_status === 'paid' ? 'text-emerald-600 dark:text-emerald-400' :
                        booking.payment_status === 'refunded' ? 'text-red-500' : 'text-amber-500'
                      }`}>
                        {booking.payment_status === 'paid' ? 'Pagado' :
                         booking.payment_status === 'refunded' ? 'Reembolsado' :
                         booking.payment_status === 'pending' ? 'Pendiente' : booking.payment_status}
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
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => handleConfirm(booking.id)}
                      disabled={completingId === booking.id}
                      className="px-4 py-2 text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Validar
                    </button>
                  )}
                  {booking.status === 'confirmed' && booking.is_home_service && (
                    <button
                      onClick={() => handleOnTheWay(booking.id)}
                      disabled={completingId === booking.id}
                      className="px-4 py-2 text-xs font-bold text-white bg-violet-500 hover:bg-violet-600 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Loader2 className="w-3 h-3" />
                      En camino
                    </button>
                  )}
                  {(booking.status === 'confirmed' || booking.status === 'on_the_way') && (
                    <button
                      onClick={() => handleComplete(booking.id)}
                      disabled={completingId === booking.id}
                      className="px-4 py-2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {completingId === booking.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3 h-3" />
                      )}
                      Completar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
