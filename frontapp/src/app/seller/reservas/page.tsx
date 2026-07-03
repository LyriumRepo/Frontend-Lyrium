'use client';

import { useState, useEffect } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import {
  Calendar, Clock, User, Star, Loader2, CheckCircle,
  Search, CreditCard, MessageSquare, X, AlertCircle, Eye, Store,
} from 'lucide-react';
import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import type { BookingResponse } from '@/shared/lib/api/bookingRepository';
import { BookingTimeline } from '@/shared/components/booking/BookingTimeline';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  confirmed: { label: 'Confirmada', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  on_the_way: { label: 'En camino', color: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300' },
  completed: { label: 'Completada', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  no_show: { label: 'No asistió', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
};

const PAYMENT_LABELS: Record<string, string> = {
  card: 'Tarjeta', yape: 'Yape', plin: 'Plin', cash: 'Efectivo',
  transfer: 'Transferencia', izipay: 'Izipay',
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
        <Star key={n} className={`w-3 h-3 ${n <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-[var(--border-subtle)]'}`} />
      ))}
    </div>
  );
}

export default function SellerReservasPage() {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [specialists, setSpecialists] = useState<SpecialistRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cancelTarget, setCancelTarget] = useState<BookingResponse | null>(null);
  const [detailTarget, setDetailTarget] = useState<BookingResponse | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDetail = (b: BookingResponse) => {
    setDetailTarget(b);
    requestAnimationFrame(() => setDrawerOpen(true));
  };
  const closeDetail = () => {
    setDrawerOpen(false);
    setTimeout(() => setDetailTarget(null), 300);
  };

  // keep drawer fresh when bookings update
  useEffect(() => {
    if (detailTarget) {
      const fresh = bookings.find(b => b.id === detailTarget.id);
      if (fresh && fresh.status !== detailTarget.status) setDetailTarget(fresh);
    }
  }, [bookings, detailTarget?.id]);

  useEffect(() => {
    Promise.all([
      fetchApi<{ data: BookingResponse[] }>('/bookings/seller?per_page=100'),
      fetchApi<{ data: SpecialistRating[] }>('/stores/me/specialists?per_page=100'),
    ])
      .then(([bookingsRes, specialistsRes]) => {
        setBookings(bookingsRes.data ?? []);
        setSpecialists(specialistsRes.data ?? []);
      })
      .catch((e: Error) => setLoadError(e.message || 'Error al cargar las reservas'))
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

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCompletingId(cancelTarget.id);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${LARAVEL_API_URL}/bookings/${cancelTarget.id}/cancel`, {
        method: 'PUT',
        headers: headers as HeadersInit,
      });
      if (!res.ok) throw new Error();
      setBookings(prev => prev.map(b =>
        b.id === cancelTarget.id ? { ...b, status: 'cancelled' as const } : b
      ));
      setCancelTarget(null);
    } catch {
      alert('Error al cancelar la reserva');
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
        <Loader2 className="w-10 h-10 animate-spin text-sky-500 dark:text-[var(--icons-green)]" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-6 text-center text-red-500 bg-red-50 dark:bg-red-900/20 rounded-2xl">
        {loadError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Reservas"
        subtitle="Reservas recibidas en tu tienda"
        icon="Calendar"
      />

      {/* Specialist ratings summary */}
      {specialists.length > 0 && (
        <div className="bg-white dark:bg-[var(--bg-card)] rounded-xl border border-gray-100 dark:border-[var(--border-subtle)] p-5">
          <h2 className="text-xs font-bold text-gray-400 dark:text-[var(--text-secondary)] uppercase tracking-wide mb-3">
            Calificaciones de especialistas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {specialists.map(sp => (
              <div key={sp.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[var(--bg-secondary)] border border-gray-100 dark:border-[var(--border-subtle)]">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 dark:from-[var(--celeste-500)]/20 dark:to-[var(--celeste-500)]/10 flex items-center justify-center overflow-hidden shrink-0">
                  {sp.foto ? (
                    <img src={sp.foto} alt={sp.nombre_completo} className="object-cover w-full h-full" />
                  ) : (
                    <User className="w-4 h-4 text-sky-400 dark:text-[var(--icons-green)]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-[var(--text-primary)] truncate">{sp.nombre_completo}</p>
                  <p className="text-[11px] text-gray-400 dark:text-[var(--text-secondary)]">{sp.especialidad}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1">
                    <RatingStars value={sp.avg_rating} />
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-[var(--text-secondary)] mt-0.5">
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
      <div className="bg-[var(--bg-card)] p-6 sm:p-8 rounded-[2.5rem] shadow-xl border border-[var(--border-subtle)] animate-fadeIn">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--brand-green)] rounded-2xl flex items-center justify-center shadow-lg shrink-0">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-black text-[var(--text-primary)]">
              Filtros de Reservas
            </h3>
          </div>
          <button
            onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 dark:from-emerald-700 dark:to-teal-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-sky-500/25 dark:shadow-emerald-900/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            title="Limpiar Filtros"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Limpiar</span>
          </button>
        </div>

        {/* Buscador — fila completa */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por servicio, cliente, especialista…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-sky-500/50 dark:focus:border-[#8FC3A1]/50 transition-colors"
            />
          </div>
        </div>

        {/* Estado — grid 1 columna */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--icons-green)]/20 cursor-pointer outline-none"
            >
              <option value="all">Todos los estados</option>
              {Object.entries(STATUS_LABELS).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bookings list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-12 h-12 mx-auto text-gray-300 dark:text-[var(--border-subtle)] mb-3" />
          <p className="text-gray-500 dark:text-[var(--text-secondary)] font-semibold">No hay reservas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking) => (
            <div key={booking.id} className="bg-white dark:bg-[var(--bg-card)] rounded-xl border border-gray-100 dark:border-[var(--border-subtle)] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)] text-sm truncate">{booking.service_name}</h3>
                    <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_LABELS[booking.status]?.color ?? ''}`}>
                      {STATUS_LABELS[booking.status]?.label ?? booking.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-600 dark:text-[var(--text-secondary)] mt-2">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-sky-400 dark:text-[var(--icons-green)]" />
                      {booking.customer_name}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-sky-400 dark:text-[var(--icons-green)]" />
                      {booking.date && formatDate(booking.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-sky-400 dark:text-[var(--icons-green)]" />
                      {booking.start_time} - {booking.end_time}
                    </span>
                    {booking.specialist && (
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-sky-400 dark:text-[var(--icons-green)]" />
                        {booking.specialist.name}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
                    {booking.payment_amount > 0 && (
                      <span className="font-semibold text-gray-800 dark:text-[var(--text-primary)]">
                        S/ {booking.payment_amount.toFixed(2)}
                      </span>
                    )}
                    {booking.payment_method && (
                      <span className="text-gray-400 dark:text-[var(--text-secondary)] flex items-center gap-1">
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
                    <p className="text-xs text-gray-400 dark:text-[var(--text-secondary)] mt-2 flex items-start gap-1.5">
                      <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" />
                      {booking.notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => openDetail(booking)}
                    className="p-2 rounded-xl bg-emerald-50 dark:bg-[var(--bg-muted)] text-emerald-600 dark:text-[var(--icons-green)] hover:bg-emerald-100 dark:hover:bg-[var(--bg-secondary)] transition-colors"
                    title="Ver detalle"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => handleConfirm(booking.id)}
                      disabled={completingId === booking.id}
                      className="px-4 py-2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Validar
                    </button>
                  )}
                  {booking.status === 'confirmed' && booking.is_home_service && (
                    <button
                      onClick={() => handleOnTheWay(booking.id)}
                      disabled={completingId === booking.id}
                      className="px-4 py-2 text-xs font-bold text-white bg-lime-500 hover:bg-lime-600 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
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
                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                    <button
                      onClick={() => setCancelTarget(booking)}
                      disabled={completingId === booking.id}
                      className="px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Cancelar
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
                ¿Confirmas que deseas cancelar la reserva de <strong>{cancelTarget.service_name}</strong> de {cancelTarget.customer_name}? Se le notificará al cliente.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCancelTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Volver
              </button>
              <button onClick={handleCancel} disabled={completingId === cancelTarget.id}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {completingId === cancelTarget.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cancelar reserva'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail drawer */}
      {detailTarget && (
        <div className="fixed inset-0 z-50" onClick={closeDetail}>
          <div className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${drawerOpen ? 'opacity-100' : 'opacity-0'}`} />
          <div
            onClick={(e) => e.stopPropagation()}
            className={`absolute right-0 top-0 bottom-0 w-full sm:w-[520px] bg-white dark:bg-[var(--bg-secondary)] shadow-[-40px_0_100px_rgba(0,0,0,0.25)] flex flex-col transition-transform duration-300 ease-out ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="relative px-6 pt-7 pb-5 bg-gradient-to-r from-[#2A5A4D] via-emerald-600 to-[#6BAF7B] dark:from-[var(--brand-green-hover)] dark:via-[var(--brand-green)] dark:to-[var(--brand-green-hover)] text-white flex-shrink-0">
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
                      <User className="w-3 h-3" /> {detailTarget.customer_name}
                    </span>
                  </div>
                </div>
                <button onClick={closeDetail}
                  className="w-9 h-9 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-all shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-5 space-y-5">
              <div className="p-5 bg-gray-50 dark:bg-[var(--bg-muted)]/50 rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)]">
                <p className="text-[10px] font-black text-gray-400 dark:text-[var(--text-muted)] uppercase tracking-widest mb-3">
                  Seguimiento
                </p>
                <BookingTimeline status={detailTarget.status} isHome={!!detailTarget.is_home_service} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SInfoCard icon={Calendar} label="Fecha" value={detailTarget.date ? formatDate(detailTarget.date) : '—'} />
                <SInfoCard icon={Clock} label="Horario" value={`${detailTarget.start_time} - ${detailTarget.end_time}`} />
                <SInfoCard icon={User} label="Cliente" value={detailTarget.customer_name} extra={detailTarget.customer_email} />
                {detailTarget.specialist && (
                  <SInfoCard icon={User} label="Especialista" value={detailTarget.specialist.name} />
                )}
                {detailTarget.payment_method && (
                  <SInfoCard
                    icon={CreditCard}
                    label="Pago"
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

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-[var(--border-subtle)]">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[var(--text-muted)]">Total</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-[var(--icons-green)]">
                  S/ {detailTarget.payment_amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SInfoCard({
  icon: Icon, label, value, extra, extraColor,
}: { icon: any; label: string; value: string; extra?: string; extraColor?: string }) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-[var(--bg-muted)]/50 rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)]">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-[var(--text-muted)] mb-1.5 flex items-center gap-1.5">
        <Icon className="w-3 h-3" /> {label}
      </p>
      <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] truncate">{value}</p>
      {extra && <p className={`text-[11px] font-semibold mt-0.5 truncate ${extraColor ?? 'text-gray-500 dark:text-[var(--text-muted)]'}`}>{extra}</p>}
    </div>
  );
}