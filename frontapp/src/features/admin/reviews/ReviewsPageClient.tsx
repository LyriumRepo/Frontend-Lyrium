'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseButton from '@/components/ui/BaseButton';
import { BaseSkeleton } from '@/components/ui/BaseSkeleton';
import {
  Star,
  ShieldAlert,
  Trophy,
  Package,
  MessageSquare,
  Trash2,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  AlertCircle,
  Loader2,
  RefreshCw,
  Store,
  BadgeCheck,
  TrendingUp,
  Calendar,
  Clock,
} from 'lucide-react';
import {
  rankingApi,
  type ProductRanking,
  type StoreRanking,
  type ServiceRanking,
  type ReviewReport,
  type AdminReview,
} from '@/shared/lib/api/rankingRepository';
import {
  medalApi,
  type TopMedal,
} from '@/shared/lib/api/medalRepository';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Stars({ value, size = 'sm' }: { value: number; size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${cls} ${n <= Math.round(value) ? 'text-[var(--color-warning)] fill-[var(--color-warning)]' : 'text-[var(--border-subtle)] fill-[var(--border-subtle)]'}`}
        />
      ))}
    </div>
  );
}

function RatingBadge({ value }: { value: number }) {
  const color =
    value >= 4.5
      ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
      : value >= 3.5
        ? 'bg-[var(--color-warning)]/15 text-[var(--color-warning)]'
        : 'bg-[var(--color-error)]/15 text-[var(--color-error)]';
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black ${color}`}
    >
      <Star className="w-3 h-3 fill-current" />
      {value.toFixed(1)}
    </span>
  );
}

function EmptyState({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[var(--bg-muted)] flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[var(--text-muted)]" />
      </div>
      <p className="font-bold text-[var(--text-secondary)]">{title}</p>
      <p className="text-sm text-[var(--text-muted)] mt-1">{subtitle}</p>
    </div>
  );
}

// ─── Limit Selector compartido ─────────────────────────────────────────────────

function LimitSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const options = [5, 10, 100];
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
        Top
      </span>
      <div className="flex gap-1">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
              value === opt
                ? 'bg-gradient-to-r from-sky-500 to-sky-400 dark:from-emerald-700 dark:to-teal-600 text-white shadow-lg shadow-sky-500/25 dark:shadow-emerald-900/25'
                : 'bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Top Productos ───────────────────────────────────────────────────────

function TopProductsTab() {
  const [products, setProducts] = useState<ProductRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const perPage = 10;

  useEffect(() => {
    setLoading(true);
    setError(null);
    rankingApi
      .getTopProducts(100, 1)
      .then((res) => {
        const list = Array.isArray(res) ? res : ((res as any).data ?? []);
        setProducts(Array.isArray(list) ? list : []);
      })
      .catch(() => setError('No se pudo cargar el ranking.'))
      .finally(() => setLoading(false));
  }, []);

  // FIX 1: guard null en store.name antes de llamar toLowerCase
  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchName = p.name?.toLowerCase().includes(q) ?? false;
    const matchStore = p.store?.name?.toLowerCase().includes(q) ?? false;
    return matchName || matchStore;
  });

  const limited = filtered.slice(0, limit);
  const totalPages = Math.ceil(limited.length / perPage);
  const paginated = limited.slice((page - 1) * perPage, page * perPage);

  if (loading)
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <BaseSkeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    );

  if (error)
    return (
      <div className="flex items-center gap-2 text-[var(--color-error)] text-sm p-4 bg-[var(--color-error)]/5 rounded-2xl">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        {error}
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Buscador y Limit */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar producto o tienda..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--icons-green)]/30 bg-[var(--bg-card)]"
          />
        </div>
        <LimitSelector value={limit} onChange={(v) => { setLimit(v); setPage(1); }} />
      </div>

      {/* Tabla */}
      {paginated.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Sin resultados"
          subtitle="Intenta con otro término de búsqueda"
        />
      ) : (
        <div className="space-y-2">
          {paginated.map((product, i) => {
            const rank = (page - 1) * perPage + i + 1;
            return (
              <div
                key={product.id}
                className="flex items-center gap-4 p-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl hover:border-[var(--icons-green)]/20 transition-all group"
              >
                {/* Rank */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm ${rank === 1 ? 'bg-[var(--color-warning)]/15 text-[var(--color-warning)]' : rank === 2 ? 'bg-[var(--bg-muted)] text-[var(--text-secondary)]' : rank === 3 ? 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]' : 'bg-[var(--bg-muted)] text-[var(--text-muted)]'}`}
                >
                  {rank <= 3 ? <Trophy className="w-4 h-4" /> : rank}
                </div>

                {/* Imagen */}
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-muted)] overflow-hidden flex-shrink-0">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Package className="w-5 h-5 text-[var(--text-muted)] m-auto mt-2.5" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] truncate flex items-center gap-1">
                    <Store className="w-3 h-3" />
                    {product.store?.name ?? '—'}
                  </p>
                </div>

                {/* Rating */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <RatingBadge value={product.rating_average} />
                  <p className="text-xs text-[var(--text-muted)]">
                    {product.rating_count} reseñas
                  </p>
                </div>

                {/* Ver */}
                <Link
                  href={`/producto/${product.slug}`}
                  target="_blank"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-[var(--icons-green)] font-bold flex-shrink-0"
                >
                  Ver →
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-[var(--text-muted)]">{limited.length} productos</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-[var(--border-subtle)] disabled:opacity-40 hover:bg-[var(--bg-muted)] transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-[var(--text-secondary)]" />
            </button>
            <span className="text-xs font-bold text-[var(--text-secondary)]">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-[var(--border-subtle)] disabled:opacity-40 hover:bg-[var(--bg-muted)] transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Top Tiendas ─────────────────────────────────────────────────────────

function TopStoresTab() {
  const [stores, setStores] = useState<StoreRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    setLoading(true);
    rankingApi
      .getTopStores(50)
      .then((res) => {
        const list = Array.isArray(res) ? res : ((res as any).data ?? []);
        setStores(Array.isArray(list) ? list : []);
      })
      .catch(() => setError('No se pudo cargar el ranking de tiendas.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <BaseSkeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    );

  if (error)
    return (
      <div className="flex items-center gap-2 text-[var(--color-error)] text-sm p-4 bg-[var(--color-error)]/5 rounded-2xl">
        <AlertCircle className="w-4 h-4" />
        {error}
      </div>
    );

  const displayed = stores.slice(0, limit);

  return (
    <div className="space-y-4">
      {/* Limit */}
      <div className="flex justify-end">
        <LimitSelector value={limit} onChange={setLimit} />
      </div>

      {displayed.length === 0 ? (
        <EmptyState
          icon={Store}
          title="Sin tiendas"
          subtitle="Aún no hay tiendas con reseñas"
        />
      ) : (
        displayed.map((store, i) => (
          <div
            key={store.id}
            className="flex items-center gap-4 p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl hover:border-[var(--icons-green)]/20 transition-all"
          >
            {/* Rank */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm ${i === 0 ? 'bg-[var(--color-warning)]/15 text-[var(--color-warning)]' : i === 1 ? 'bg-[var(--bg-muted)] text-[var(--text-secondary)]' : i === 2 ? 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]' : 'bg-[var(--bg-muted)] text-[var(--text-muted)]'}`}
            >
              {i < 3 ? <Trophy className="w-4 h-4" /> : i + 1}
            </div>

            {/* Logo */}
            <div className="w-10 h-10 rounded-xl bg-[var(--color-success)]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {store.logo ? (
                <Image
                  src={store.logo}
                  alt={store.name}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              ) : (
                <Store className="w-5 h-5 text-[var(--color-success)]" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5 truncate">
                {store.name}
                <BadgeCheck className="w-3.5 h-3.5 text-[var(--icons-green)] flex-shrink-0" />
              </p>
              <Stars value={store.rating_average} />
            </div>

            {/* Rating */}
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <RatingBadge value={store.rating_average} />
              <p className="text-xs text-[var(--text-muted)]">
                {store.review_count} reseñas
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── Tab: Top Servicios ───────────────────────────────────────────────────────

function TopServicesTab() {
  const [services, setServices] = useState<ServiceRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    setLoading(true);
    setError(null);
    rankingApi
      .getTopServices(100)
      .then((res) => {
        const list = Array.isArray(res) ? res : ((res as any).data ?? []);
        setServices(Array.isArray(list) ? list : []);
      })
      .catch(() => setError('No se pudo cargar el ranking de servicios.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <BaseSkeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    );

  if (error)
    return (
      <div className="flex items-center gap-2 text-[var(--color-error)] text-sm p-4 bg-[var(--color-error)]/5 rounded-2xl">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        {error}
      </div>
    );

  const limited = services.slice(0, limit);
  const totalPages = Math.ceil(limited.length / perPage);
  const paginated = limited.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-4">
      {/* Limit */}
      <div className="flex justify-end">
        <LimitSelector value={limit} onChange={(v) => { setLimit(v); setPage(1); }} />
      </div>

      {/* Tabla */}
      {paginated.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Sin servicios"
          subtitle="Aún no hay servicios con reseñas"
        />
      ) : (
        <div className="space-y-2">
          {paginated.map((service, i) => {
            const rank = (page - 1) * perPage + i + 1;
            return (
              <div
                key={service.id}
                className="flex items-center gap-4 p-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl hover:border-[var(--icons-green)]/20 transition-all group"
              >
                {/* Rank */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm ${rank === 1 ? 'bg-[var(--color-warning)]/15 text-[var(--color-warning)]' : rank === 2 ? 'bg-[var(--bg-muted)] text-[var(--text-secondary)]' : rank === 3 ? 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]' : 'bg-[var(--bg-muted)] text-[var(--text-muted)]'}`}
                >
                  {rank <= 3 ? <Trophy className="w-4 h-4" /> : rank}
                </div>

                {/* Imagen */}
                <div className="w-10 h-10 rounded-xl bg-[var(--icons-green)]/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {service.image ? (
                    <Image
                      src={service.image}
                      alt={service.name}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Calendar className="w-5 h-5 text-[var(--icons-green)]" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                    {service.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] truncate flex items-center gap-2">
                    <Store className="w-3 h-3" />
                    {service.store?.name ?? '—'}
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      {service.duration_minutes} min
                    </span>
                  </p>
                </div>

                {/* Rating */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <RatingBadge value={service.rating_average} />
                  <p className="text-xs text-[var(--text-muted)]">
                    {service.rating_count} reseñas
                  </p>
                </div>

                {/* Precio */}
                <div className="text-right flex-shrink-0 min-w-[60px]">
                  <p className="text-sm font-black text-[var(--text-primary)]">
                    S/ {service.price.toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-[var(--text-muted)]">{limited.length} servicios</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-[var(--border-subtle)] disabled:opacity-40 hover:bg-[var(--bg-muted)] transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-[var(--text-secondary)]" />
            </button>
            <span className="text-xs font-bold text-[var(--text-secondary)]">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-[var(--border-subtle)] disabled:opacity-40 hover:bg-[var(--bg-muted)] transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Moderación ──────────────────────────────────────────────────────────

function ModerationTab() {
  const [reports, setReports] = useState<ReviewReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'pending' | 'accepted' | 'dismissed'>(
    'pending',
  );
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchReports = useCallback(() => {
    setLoading(true);
    setError(null);
    rankingApi
      .getReportedReviews({ status, per_page: 20 })
      .then((res) => {
        // FIX 3: normalizar igual que los otros tabs
        const list = Array.isArray(res) ? res : ((res as any).data ?? []);
        setReports(Array.isArray(list) ? list : []);
      })
      .catch(() => setError('No se pudieron cargar los reportes.'))
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleModerate = async (
    reviewId: string,
    action: 'accept' | 'dismiss',
  ) => {
    setActionId(reviewId);
    try {
      await rankingApi.moderateReview(reviewId, action);
      setReports((prev) => prev.filter((r) => r.review.id !== reviewId));
    } catch {
      setError('Error al moderar. Intenta nuevamente.');
    } finally {
      setActionId(null);
    }
  };

  const REASON_LABELS: Record<string, string> = {
    spam: 'Spam',
    offensive: 'Ofensivo',
    fake: 'Falso',
    irrelevant: 'Irrelevante',
    other: 'Otro',
  };

  return (
    <div className="space-y-4">
      {/* Filtros de status */}
      <div className="flex flex-wrap gap-2">
        {(['pending', 'accepted', 'dismissed'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-2 min-h-[44px] rounded-xl text-xs font-black uppercase tracking-wider transition-all ${status === s ? 'bg-sky-500 text-white shadow-sm' : 'bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}
          >
            {s === 'pending'
              ? 'Pendientes'
              : s === 'accepted'
                ? 'Aceptados'
                : 'Desestimados'}
          </button>
        ))}
        <button
          onClick={fetchReports}
          className="ml-auto min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-muted)] transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-[var(--text-muted)]" />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-[var(--color-error)] text-sm p-3 bg-[var(--color-error)]/5 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <BaseSkeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="Sin reportes pendientes"
          subtitle="Todo está bajo control por ahora"
        />
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className={`p-5 rounded-2xl border ${status === 'pending' ? 'bg-[var(--color-error)]/5 border-[var(--color-error)]/10' : 'bg-[var(--bg-muted)] border-[var(--border-subtle)]'}`}
            >
              {/* Header del reporte */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs font-black uppercase px-2.5 py-1 rounded-lg ${status === 'pending' ? 'bg-[var(--color-error)]/15 text-[var(--color-error)]' : status === 'accepted' ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'}`}
                  >
                    {status === 'pending'
                      ? 'Pendiente'
                      : status === 'accepted'
                        ? 'Aceptado'
                        : 'Desestimado'}
                  </span>
                  <span className="text-xs bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-semibold px-2.5 py-1 rounded-lg">
                    {REASON_LABELS[report.reason] ?? report.reason}
                  </span>
                  {report.reporter && (
                    <span className="text-xs text-[var(--text-muted)]">
                      por{' '}
                      <span className="font-bold">{report.reporter.name}</span>
                    </span>
                  )}
                </div>
                <Stars value={report.review.rating} />
              </div>

              {/* Producto */}
              {report.review.product && (
                <p className="text-xs text-[var(--text-muted)] mb-2 flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  <Link
                    href={`/producto/${report.review.product.slug}`}
                    target="_blank"
                    className="hover:text-[var(--icons-green)] transition-colors font-semibold"
                  >
                    {report.review.product.name}
                  </Link>
                </p>
              )}

              {/* Contenido de la reseña */}
              {report.review.title && (
                <p className="text-sm font-bold text-[var(--text-primary)] mb-1">
                  {report.review.title}
                </p>
              )}
              {report.review.comment && (
                <p className="text-sm text-[var(--text-secondary)] italic leading-relaxed mb-3">
                  "{report.review.comment}"
                </p>
              )}
              {report.details && (
                <p className="text-xs text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 mb-3">
                  <span className="font-bold">Motivo del reporte:</span>{' '}
                  {report.details}
                </p>
              )}

              {/* Moderador */}
              {report.moderator && (
                <p className="text-xs text-[var(--text-muted)] mb-3">
                  Moderado por{' '}
                  <span className="font-bold">{report.moderator.name}</span>
                </p>
              )}

              {/* Acciones — solo en pending */}
              {status === 'pending' && (
                <div className="flex gap-2">
                  <BaseButton
                    variant="danger"
                    size="sm"
                    isLoading={actionId === report.review.id}
                    onClick={() => handleModerate(report.review.id, 'accept')}
                    leftIcon="Trash2"
                  >
                    Eliminar reseña
                  </BaseButton>
                  <BaseButton
                    variant="outline"
                    size="sm"
                    isLoading={actionId === report.review.id}
                    onClick={() => handleModerate(report.review.id, 'dismiss')}
                    leftIcon="XCircle"
                  >
                    Desestimar
                  </BaseButton>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab: Todas las reseñas ───────────────────────────────────────────────────

function AllReviewsTab() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [reported, setReported] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 300);
  };

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const fetchReviews = useCallback(() => {
    setLoading(true);
    rankingApi
      .getAdminReviews({
        page,
        per_page: 15,
        search: debouncedSearch || undefined,
        rating: rating ?? undefined,
        reported: reported || undefined,
      })
      .then((res) => {
        // FIX 4: normalizar igual que los otros tabs
        const list = Array.isArray(res) ? res : ((res as any).data ?? []);
        setReviews(Array.isArray(list) ? list : []);
        const meta = (res as any).meta;
        setTotalPages(meta?.total_pages ?? 1);
      })
      .catch(() => setError('No se pudieron cargar las reseñas.'))
      .finally(() => setLoading(false));
  }, [page, debouncedSearch, rating, reported]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta reseña permanentemente?')) return;
    setDeleting(id);
    try {
      await rankingApi.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError('Error al eliminar.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar en reseñas..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--icons-green)]/30"
          />
        </div>

        {/* Filtro estrellas */}
        <div className="flex gap-1 flex-wrap">
          {[null, 1, 2, 3, 4, 5].map((r) => (
            <button
              key={r ?? 'all'}
              onClick={() => {
                setRating(r);
                setPage(1);
              }}
              className={`px-3 py-2 min-h-[44px] rounded-xl text-xs font-black transition-all ${rating === r ? 'bg-amber-400 text-white' : 'bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}
            >
              {r ? `${r}★` : 'Todas'}
            </button>
          ))}
        </div>

        {/* Filtro reportadas */}
        <button
          onClick={() => {
            setReported((r) => !r);
            setPage(1);
          }}
          className={`flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl text-xs font-black transition-all ${reported ? 'bg-rose-500 text-white' : 'bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          {reported ? 'Reportadas' : 'Con reportes'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-[var(--color-error)] text-sm p-3 bg-[var(--color-error)]/5 rounded-xl">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <BaseSkeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Sin reseñas"
          subtitle="No hay reseñas con esos filtros"
        />
      ) : (
        <div className="space-y-2">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="flex gap-4 p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl"
            >
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Stars value={review.rating} />
                  {review.isVerifiedPurchase && (
                    <span className="text-xs text-[var(--color-success)] font-semibold flex items-center gap-0.5">
                      <BadgeCheck className="w-3 h-3" />
                      Verificada
                    </span>
                  )}
                  {review.reports_count > 0 && (
                    <span className="text-xs text-[var(--color-error)] font-semibold flex items-center gap-0.5 bg-[var(--color-error)]/5 px-2 py-0.5 rounded-lg">
                      <ShieldAlert className="w-3 h-3" />
                      {review.reports_count} reporte
                      {review.reports_count > 1 ? 's' : ''}
                    </span>
                  )}
                  <span className="text-xs text-[var(--text-muted)] ml-auto">
                    {new Date(review.createdAt).toLocaleDateString('es-PE')}
                  </span>
                </div>
                {review.title && (
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    {review.title}
                  </p>
                )}
                {review.comment && (
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                    {review.comment}
                  </p>
                )}
                <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                  {review.user && (
                    <span>
                      por{' '}
                      <span className="font-bold text-[var(--text-secondary)]">
                        {review.user.name}
                      </span>
                    </span>
                  )}
                  {review.product && (
                    <Link
                      href={`/producto/${review.product.slug}`}
                      target="_blank"
                      className="flex items-center gap-1 hover:text-[var(--icons-green)] transition-colors"
                    >
                      <Package className="w-3 h-3" />
                      {review.product.name}
                    </Link>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(review.id)}
                disabled={deleting === review.id}
                className="p-2 rounded-xl hover:bg-red-50 hover:text-red-500 text-[var(--text-muted)] transition-all flex-shrink-0 self-start disabled:opacity-40"
              >
                {deleting === review.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl border border-[var(--border-subtle)] disabled:opacity-40 hover:bg-[var(--bg-muted)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>
          <span className="text-sm font-bold text-[var(--text-secondary)]">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-xl border border-[var(--border-subtle)] disabled:opacity-40 hover:bg-[var(--bg-muted)] transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Medallas Top 100 ──────────────────────────────────────────────────

function MedalsTab() {
  const [medals, setMedals] = useState<TopMedal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filterEntity, setFilterEntity] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, total_pages: 1, total: 0 });

  const fetchMedals = useCallback(() => {
    setLoading(true);
    setError(null);
    medalApi
      .getAdminMedals({
        entity_type: filterEntity || undefined,
        status: filterStatus || undefined,
        page,
        per_page: 15,
      })
      .then((res) => {
        setMedals(res.data ?? []);
        setMeta(res.meta);
      })
      .catch(() => setError('No se pudieron cargar las medallas.'))
      .finally(() => setLoading(false));
  }, [filterEntity, filterStatus, page]);

  useEffect(() => { fetchMedals(); }, [fetchMedals]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await medalApi.approveMedal(id);
      fetchMedals();
    } catch { setError('Error al aprobar la medalla.'); }
    finally { setActionLoading(null); }
  };

  const handleSuspend = async (id: string) => {
    setActionLoading(id);
    try {
      await medalApi.suspendMedal(id);
      fetchMedals();
    } catch { setError('Error al suspender la medalla.'); }
    finally { setActionLoading(null); }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-[var(--color-warning)]/15 text-[var(--color-warning)]',
      approved: 'bg-[var(--color-success)]/15 text-[var(--color-success)]',
      suspended: 'bg-[var(--color-error)]/15 text-[var(--color-error)]',
    };
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      approved: 'Activa',
      suspended: 'Suspendida',
    };
    return (
      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${map[status] ?? 'bg-[var(--bg-muted)] text-[var(--text-secondary)]'}`}>
        {labels[status] ?? status}
      </span>
    );
  };

  const selectCls =
    'px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-xs font-bold text-[var(--text-primary)] focus:ring-4 focus:ring-[var(--icons-green)]/10 transition-all outline-none appearance-none cursor-pointer';

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={filterEntity}
          onChange={(e) => { setFilterEntity(e.target.value); setPage(1); }}
          className={selectCls}
        >
          <option value="">Todas las entidades</option>
          <option value="store">Tiendas</option>
          <option value="product">Productos</option>
          <option value="service">Servicios</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className={selectCls}
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pendientes</option>
          <option value="approved">Activas</option>
          <option value="suspended">Suspendidas</option>
        </select>
        <span className="text-xs font-bold text-[var(--text-muted)] ml-auto">{meta.total} medalla(s)</span>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <BaseSkeleton key={i} className="h-16 rounded-xl bg-[var(--bg-card)]" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-12 text-center bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)]">
          <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
          <p className="text-sm font-bold text-[var(--color-error)]">{error}</p>
          <button onClick={fetchMedals} className="mt-3 text-xs font-bold text-[var(--brand-sky)] hover:text-[var(--brand-sky-hover)] flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Reintentar
          </button>
        </div>
      ) : medals.length === 0 ? (
        <EmptyState icon={Trophy} title="Sin medallas" subtitle="No hay medallas Top 100 registradas aún." />
      ) : (
        <div className="space-y-2">
          {medals.map((medal) => (
            <div key={medal.id} className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-subtle)] dark:hover:border-[var(--border-default)] hover:shadow-sm transition-all">
              {/* Imagen medalla */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img src="/img/INSIGNIA PREMIUM.png" alt="" className="w-full h-full object-contain p-1" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-black text-[var(--text-primary)]">
                    {medal.entity?.name ?? medal.entity?.id ?? 'Sin nombre'}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-[var(--bg-muted)] text-[var(--text-muted)]">
                    {medal.entity_type === 'store' ? 'Tienda' : medal.entity_type === 'product' ? 'Producto' : 'Servicio'}
                  </span>
                  {statusBadge(medal.status)}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] font-medium text-[var(--text-muted)]">
                  {medal.rank_position && <span># {medal.rank_position} en ranking</span>}
                  <span>Ingresos: {medal.times_entered}</span>
                  <span>Salidas: {medal.times_exited}</span>
                  <span>Detectado: {new Date(medal.detected_at).toLocaleDateString()}</span>
                  {medal.grace_ends_at && (
                    <span className="text-amber-500">Gracia hasta: {new Date(medal.grace_ends_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {medal.status !== 'approved' && (
                  <BaseButton
                    size="sm"
                    variant="primary"
                    onClick={() => handleApprove(medal.id)}
                    disabled={actionLoading === medal.id}
                  >
                    {actionLoading === medal.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                    {medal.status === 'suspended' ? 'Reactivar' : 'Aprobar'}
                  </BaseButton>
                )}
                {medal.status !== 'suspended' && (
                  <BaseButton
                    size="sm"
                    variant="secondary"
                    onClick={() => handleSuspend(medal.id)}
                    disabled={actionLoading === medal.id}
                    className="!text-red-500 dark:!text-red-400 !border-red-200 dark:!border-red-800 hover:!bg-red-50 dark:hover:!bg-red-950/20"
                  >
                    {actionLoading === medal.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                    Suspender
                  </BaseButton>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {meta.total_pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-xl border border-[var(--border-subtle)] disabled:opacity-40 hover:bg-[var(--bg-muted)] transition-colors text-[var(--text-muted)]">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-[var(--text-secondary)]">{page} / {meta.total_pages}</span>
          <button onClick={() => setPage((p) => Math.min(meta.total_pages, p + 1))} disabled={page === meta.total_pages} className="p-2 rounded-xl border border-[var(--border-subtle)] disabled:opacity-40 hover:bg-[var(--bg-muted)] transition-colors text-[var(--text-muted)]">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

type TabKey = 'productos' | 'tiendas' | 'servicios' | 'moderacion' | 'reseñas' | 'medallas';

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'tiendas', label: 'Top Tiendas', icon: Store },
  { key: 'productos', label: 'Top Productos', icon: TrendingUp },
  { key: 'servicios', label: 'Top Servicios', icon: Calendar },
  { key: 'moderacion', label: 'Moderación', icon: ShieldAlert },
  { key: 'reseñas', label: 'Todas las reseñas', icon: MessageSquare },
  { key: 'medallas', label: 'Medallas', icon: Trophy },
];

export function ReviewsPageClient() {
  const [activeTab, setActiveTab] = useState<TabKey>('tiendas');

  return (
    <div className="space-y-6 animate-fadeIn">
      <ModuleHeader
        title="Gestión de Puntuación"
        subtitle="Rankings, reseñas y moderación de calidad"
        icon="Star"
      />

      {/* Tabs */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
        {/* Tab headers */}
        <div className="flex border-b border-[var(--border-subtle)] overflow-x-auto">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 -mb-px ${activeTab === key ? 'border-[var(--icons-green)] text-[var(--icons-green)] bg-[var(--icons-green)]/5' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]'}`}
            >
              <Icon
                className={`w-4 h-4 ${activeTab === key ? 'text-[var(--icons-green)]' : ''}`}
              />
              {label}
              {key === 'moderacion' && <ModerationBadge />}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === 'tiendas' && <TopStoresTab />}
          {activeTab === 'productos' && <TopProductsTab />}
          {activeTab === 'servicios' && <TopServicesTab />}
          {activeTab === 'moderacion' && <ModerationTab />}
          {activeTab === 'reseñas' && <AllReviewsTab />}
          {activeTab === 'medallas' && <MedalsTab />}
        </div>
      </div>
    </div>
  );
}

// Badge de reportes pendientes en el tab
function ModerationBadge() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    rankingApi
      .getReportedReviews({ status: 'pending', per_page: 1 })
      .then((res) => {
        const meta = (res as any).meta ?? res;
        setCount(meta?.total ?? null);
      })
      .catch(() => {});
  }, []);

  if (!count) return null;
  return (
    <span className="ml-1 min-w-[18px] h-[18px] flex items-center justify-center bg-rose-500 text-white text-[10px] font-black rounded-full px-1">
      {count > 99 ? '99+' : count}
    </span>
  );
}
