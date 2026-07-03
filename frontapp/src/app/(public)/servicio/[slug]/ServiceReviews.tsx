'use client';

import { useState, useEffect } from 'react';
import { Star, Loader2, User, CheckCircle, Pencil, Trash2 } from 'lucide-react';
import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import { Button } from '@/components/ui/button';

interface ReviewUser {
  id: string;
  name: string;
  avatar: string | null;
}

export interface ServiceReview {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerifiedPurchase: boolean;
  user: ReviewUser | null;
  createdAt: string;
}

export interface ReviewStats {
  average: number;
  count: number;
  distribution: Record<string, number>;
}

let _tokenCache: { value: string | null; ts: number } | null = null;

async function getClientToken(): Promise<string | null> {
  const now = Date.now();
  if (_tokenCache && now - _tokenCache.ts < 30_000) {
    return _tokenCache.value;
  }
  try {
    const res = await fetch('/api/auth-token', { credentials: 'include', cache: 'no-store' });
    if (!res.ok) return null;
    const { token } = await res.json();
    const clean = token?.replace(/^["']|["']$/g, '').trim() || null;
    _tokenCache = { value: clean, ts: now };
    return clean;
  } catch {
    return null;
  }
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function Stars({ value, size = 'sm' }: { value: number; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${cls} ${n <= value ? 'text-amber-300 fill-amber-300' : 'text-gray-300 dark:text-[var(--text-muted)]'}`}
        />
      ))}
    </div>
  );
}

function RatingForm({
  initialRating = 0,
  initialComment = '',
  onSubmit,
  onCancel,
  loading,
}: {
  initialRating?: number;
  initialComment?: string;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  onCancel?: () => void;
  loading: boolean;
}) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(initialComment);

  const LABELS = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'];

  return (
    <div className="space-y-3 p-4 bg-gray-50 dark:bg-[var(--bg-muted)] rounded-lg border border-gray-100 dark:border-[var(--border-default)]">
      <div>
        <p className="text-xs text-gray-500 mb-2">Calificación</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => setRating(n)}>
              <Star className={`w-6 h-6 transition-colors ${n <= (hover || rating) ? 'fill-amber-300 text-amber-300' : 'text-gray-300 dark:text-[var(--text-muted)]'}`} />
            </button>
          ))}
        </div>
        {rating > 0 && <p className="text-xs text-amber-600 mt-1">{LABELS[rating]}</p>}
      </div>
      <div>
        <textarea
          maxLength={1000}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Cuéntanos tu experiencia..."
          rows={3}
          className="w-full resize-none border border-gray-200 dark:border-[var(--border-default)] rounded-md p-2 text-xs bg-white dark:bg-[var(--bg-card)] focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
        <p className="text-[10px] text-gray-400 text-right mt-0.5">{comment.length}/1000</p>
      </div>
      <div className="flex gap-2 justify-end pt-1 border-t border-gray-200 dark:border-[var(--border-default)]">
        {onCancel && (
          <Button variant="outline" size="sm" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        )}
        <Button size="sm" onClick={() => onSubmit(rating, comment)} disabled={!rating || loading}>
          {loading && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
          {loading ? 'Enviando…' : 'Enviar reseña'}
        </Button>
      </div>
    </div>
  );
}

export function ServiceReviews({ serviceId }: { serviceId: number }) {
  const [reviews, setReviews] = useState<ServiceReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [pendingBookingId, setPendingBookingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadReviews = () => {
    fetch(`${LARAVEL_API_URL}/reviews?product_id=${serviceId}&per_page=100`, {
      headers: { Accept: 'application/json' },
    })
      .then((r) => r.json())
      .then((json) => {
        setReviews(json.data?.data ?? []);
        setStats(json.data?.stats ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReviews();

    (async () => {
      const token = await getClientToken();
      if (!token) return;

      try {
        const meRes = await fetch(`${LARAVEL_API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        });
        if (meRes.ok) {
          const me = await meRes.json();
          setCurrentUserId(String(me.data?.id ?? me.id));
        }
      } catch {}

      try {
        const res = await fetch(`${LARAVEL_API_URL}/services/${serviceId}/pending-review`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data?.id) setPendingBookingId(json.data.id);
        }
      } catch {}
    })();
  }, [serviceId]);

  const handleCreateReview = async (rating: number, comment: string) => {
    if (!pendingBookingId) return;
    setSubmitting(true);
    try {
      const token = await getClientToken();
      await fetch(`${LARAVEL_API_URL}/bookings/${pendingBookingId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating, comment: comment || undefined }),
      });
      setShowForm(false);
      setPendingBookingId(null);
      loadReviews();
    } catch {}
    setSubmitting(false);
  };

  const handleUpdateReview = async (reviewId: string, rating: number, comment: string) => {
    setSubmitting(true);
    try {
      const token = await getClientToken();
      await fetch(`${LARAVEL_API_URL}/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating, comment: comment || undefined }),
      });
      setEditingReviewId(null);
      loadReviews();
    } catch {}
    setSubmitting(false);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('¿Eliminar esta reseña?')) return;
    setDeletingId(reviewId);
    try {
      const token = await getClientToken();
      await fetch(`${LARAVEL_API_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      });
      loadReviews();
    } catch {}
    setDeletingId(null);
  };

  if (loading) return null;
  if (!stats || stats.count === 0) {
    return (
      <div className="bg-white dark:bg-[var(--bg-card)] rounded-xl border border-gray-100 dark:border-[var(--border-subtle)] p-5">
        <h2 className="text-xs font-bold text-gray-400 dark:text-[var(--text-muted)] uppercase tracking-wide mb-4">Reseñas</h2>
        <p className="text-xs text-gray-500 mb-3">
          {pendingBookingId ? 'Sé el primero en calificar este servicio.' : 'Aún no hay reseñas para este servicio.'}
        </p>
        {pendingBookingId && (
          !showForm ? (
            <Button size="sm" onClick={() => setShowForm(true)}>Calificar mi reserva</Button>
          ) : (
            <RatingForm onSubmit={handleCreateReview} onCancel={() => setShowForm(false)} loading={submitting} />
          )
        )}
      </div>
    );
  }

  const displayed = showAll ? reviews : reviews.slice(0, 5);

  return (
    <div className="bg-white dark:bg-[var(--bg-card)] rounded-xl border border-gray-100 dark:border-[var(--border-subtle)] p-5">
      <h2 className="text-xs font-bold text-gray-400 dark:text-[var(--text-muted)] uppercase tracking-wide mb-4">Reseñas</h2>

      {/* Overall rating */}
      <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100 dark:border-[var(--border-subtle)]">
        <div className="text-center">
          <p className="text-3xl font-black text-gray-900 dark:text-[var(--text-primary)]">{stats.average.toFixed(1)}</p>
          <Stars value={Math.round(stats.average)} size="md" />
          <p className="text-[11px] text-gray-400 mt-1">{stats.count} reseña{stats.count !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map((n) => {
            const count = stats.distribution[String(n)] ?? 0;
            const pct = stats.count > 0 ? (count / stats.count) * 100 : 0;
            return (
              <div key={n} className="flex items-center gap-2 text-[11px]">
                <span className="text-gray-400 w-3 text-right">{n}</span>
                <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
                <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-[var(--bg-muted)] overflow-hidden">
                  <div className="h-full rounded-full bg-amber-300" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-gray-400 w-6 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write review for pending booking */}
      {pendingBookingId && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full mb-4 py-2 text-xs font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-950/50 transition-colors"
        >
          Calificar mi reserva
        </button>
      )}
      {showForm && pendingBookingId && (
        <div className="mb-4">
          <RatingForm onSubmit={handleCreateReview} onCancel={() => setShowForm(false)} loading={submitting} />
        </div>
      )}

      {/* Individual reviews */}
      <div className="space-y-4">
        {displayed.map((review) => {
          const isAuthor = currentUserId && review.user?.id === currentUserId;
          const isEditing = editingReviewId === review.id;
          const existingReview = review;

          if (isEditing) {
            return (
              <div key={review.id}>
                <RatingForm
                  initialRating={existingReview.rating}
                  initialComment={existingReview.comment ?? ''}
                  onSubmit={(r, c) => handleUpdateReview(review.id, r, c)}
                  onCancel={() => setEditingReviewId(null)}
                  loading={submitting}
                />
              </div>
            );
          }

          return (
            <div key={review.id} className="border-b border-gray-50 dark:border-[var(--border-subtle)]/50 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/50 dark:to-blue-900/50 flex items-center justify-center overflow-hidden shrink-0">
                  {review.user?.avatar ? (
                    <img src={review.user.avatar} alt="" className="object-cover w-full h-full" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-sky-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 dark:text-[var(--text-primary)] truncate">
                    {review.user?.name ?? 'Usuario'}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Stars value={review.rating} />
                    {review.isVerifiedPurchase && (
                      <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="w-2.5 h-2.5" /> Compra verificada
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {isAuthor && (
                    <>
                      <button onClick={() => setEditingReviewId(review.id)} className="p-1 hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)] rounded transition-colors">
                        <Pencil className="w-3 h-3 text-gray-400" />
                      </button>
                      <button onClick={() => handleDeleteReview(review.id)} disabled={deletingId === review.id} className="p-1 hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)] rounded transition-colors">
                        {deletingId === review.id ? (
                          <Loader2 className="w-3 h-3 text-red-400 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3 text-red-400" />
                        )}
                      </button>
                    </>
                  )}
                  <span className="text-[10px] text-gray-400 shrink-0 ml-1">{formatDate(review.createdAt)}</span>
                </div>
              </div>
              {review.title && (
                <p className="text-xs font-bold text-gray-700 dark:text-[var(--text-secondary)] mb-1">{review.title}</p>
              )}
              {review.comment && (
                <p className="text-xs text-gray-500 dark:text-[var(--text-muted)] leading-relaxed">{review.comment}</p>
              )}
            </div>
          );
        })}
      </div>

      {reviews.length > 5 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full mt-3 py-2 text-xs font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 bg-sky-50 dark:bg-sky-950/30 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-950/50 transition-colors"
        >
          Ver todas las {reviews.length} reseñas
        </button>
      )}
    </div>
  );
}
