'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Star,
  Heart,
  Share2,
  ShoppingCart,
  Store,
  Package,
  Weight,
  Ruler,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Shield,
  Truck,
  RotateCcw,
  BadgeCheck,
  Tag,
  Loader2,
  AlertCircle,
  Check,
  MessageSquare,
  Download,
  Clock,
  MapPin,
  Pencil,
  Trash2,
  FileText,
  Zap,
  Salad,
  Pause,
  Play,
} from 'lucide-react';
import type {
  LaravelProduct,
  LaravelReview,
  ReviewStats,
} from '@/features/public/product/types';
import { useAddToCart } from '@/features/public/product/hooks/useAddToCart';
import { useReviews } from '@/features/public/product/hooks/useReview';
import { useCarritoStore } from '@/store/carritoStore';
import { useCurrentUser } from '@/features/public/product/hooks/useCurrentUser';
import { WriteProductReview } from '@/features/public/product/WriteProductReview';
import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { useToast } from '@/shared/lib/context/ToastContext';
import { useWishlist } from '@/shared/hooks/useWishlist';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/Cardt';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import TopMedalBadge from '@/components/ui/TopMedalBadge';
import { cn } from '@/lib/utils';

// ─── Token ────────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(price: number) {
  return `S/ ${price.toFixed(2)}`;
}

function discountPercent(price: number, regular: number) {
  if (!regular || regular <= price) return 0;
  return Math.round(((regular - price) / regular) * 100);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ─── Stars ────────────────────────────────────────────────────────────────────

function Stars({
  value,
  size = 'sm',
}: {
  value: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sz = { sm: 'w-3 h-3', md: 'w-[14px] h-[14px]', lg: 'w-5 h-5' }[size];
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            sz,
            n <= Math.round(value)
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-muted text-muted',
          )}
        />
      ))}
    </div>
  );
}

// ─── StickerBadge ─────────────────────────────────────────────────────────────

const STICKER_MAP: Record<
  string,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  oferta: { label: 'Oferta', variant: 'destructive' },
  liquidacion: { label: 'Liquidación', variant: 'destructive' },
  nuevo: { label: 'Nuevo', variant: 'default' },
  bestseller: { label: 'Más vendido', variant: 'secondary' },
  envio_gratis: { label: 'Envío gratis', variant: 'default' },
  descuento: { label: 'Descuento', variant: 'secondary' },
};

function StickerBadge({ sticker }: { sticker: string | null }) {
  if (!sticker) return null;
  const cfg = STICKER_MAP[sticker] ?? {
    label: sticker,
    variant: 'secondary' as const,
  };
  return (
    <Badge
      variant={cfg.variant}
      className="gap-1 uppercase tracking-[.1em] text-[10px]"
    >
      <Tag className="w-2.5 h-2.5" />
      {cfg.label}
    </Badge>
  );
}

// ─── TypeItem / ProductInfoCards ──────────────────────────────────────────────

function TypeItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="p-3 flex items-center gap-2">
        <div className="text-teal-500 shrink-0">{icon}</div>
        <div>
          <p className="text-[10px] font-semibold text-foreground/70">
            {label}
          </p>
          <p className="font-bold text-sm text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ProductInfoCards({ product }: { product: LaravelProduct }) {
  if (product.type === 'digital') {
    return (
      <div className="grid grid-cols-2 gap-4">
        <TypeItem
          icon={<Download className="w-4 h-4" />}
          label="Formato"
          value={product.fileType?.toUpperCase() ?? '—'}
        />
        {product.downloadLimit && (
          <TypeItem
            icon={<Package className="w-4 h-4" />}
            label="Descargas"
            value={`${product.downloadLimit}x`}
          />
        )}
      </div>
    );
  }
  if (product.type === 'service') {
    return (
      <div className="grid grid-cols-2 gap-4">
        <TypeItem
          icon={<Clock className="w-4 h-4" />}
          label="Duración"
          value={`${product.serviceDuration} min`}
        />
        <TypeItem
          icon={<MapPin className="w-4 h-4" />}
          label="Modalidad"
          value={product.serviceModality ?? '—'}
        />
      </div>
    );
  }
  const items = [
    product.stock != null && {
      icon: <Package className="w-4 h-4" />,
      label: 'Stock',
      value: `${product.stock} unidades`,
    },
    product.weight && {
      icon: <Weight className="w-4 h-4" />,
      label: 'Peso',
      value: `${product.weight} kg`,
    },
    product.dimensions && {
      icon: <Ruler className="w-4 h-4" />,
      label: 'Dimensiones',
      value: product.dimensions,
    },
    product.sku && {
      icon: <Calendar className="w-4 h-4" />,
      label: 'SKU',
      value: product.sku,
    },
  ].filter(Boolean) as {
    icon: React.ReactNode;
    label: string;
    value: string;
  }[];

  if (items.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-4">
      {items.map((item, i) => (
        <TypeItem key={i} {...item} />
      ))}
    </div>
  );
}

// ─── CharacteristicsTable ─────────────────────────────────────────────────────

function CharacteristicsTable({
  characteristics,
  additional_info,
}: {
  characteristics: LaravelProduct['characteristics'];
  additional_info: LaravelProduct['additional_info'];
}) {
  const hasMain = characteristics.length > 0;
  const hasAdditional = additional_info.length > 0;
  if (!hasMain && !hasAdditional)
    return (
      <p className="text-sm font-semibold italic text-foreground/60">
        Sin características especificadas.
      </p>
    );
  return (
    <div className="space-y-6">
      {hasMain && (
        <div>
          <p className="text-[10px] font-semibold tracking-[.12em] uppercase text-teal-600 mb-3">
            Características principales
          </p>
          <ul className="grid md:grid-cols-2 gap-3">
            {characteristics.map((attr, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 flex-shrink-0" />
                <span className="text-sm text-foreground">
                  <span className="font-bold text-foreground">
                    {attr.label}:
                  </span>{' '}
                  <span className="font-semibold text-foreground/80">
                    {attr.value}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {hasAdditional && (
        <div>
          <p className="text-[10px] font-semibold tracking-[.12em] uppercase text-teal-600 mb-3">
            Información adicional
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {additional_info.map((attr, i) => (
              <Card key={i} className="border-teal-100 dark:border-teal-900/30">
                <CardContent className="p-4">
                  <p className="text-[10px] font-semibold tracking-[.08em] uppercase text-teal-500 mb-1">
                    {attr.label}
                  </p>
                  <p className="font-bold text-sm text-foreground">
                    {attr.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── EditReviewForm ───────────────────────────────────────────────────────────

function EditReviewForm({
  review,
  onSaved,
  onCancel,
}: {
  review: LaravelReview;
  onSaved: (updated: LaravelReview) => void;
  onCancel: () => void;
}) {
  const [rating, setRating] = useState(review.rating);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState(review.title ?? '');
  const [comment, setComment] = useState(review.comment ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const LABELS = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'];

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getClientToken();
      const res = await fetch(`${LARAVEL_API_URL}/reviews/${review.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating,
          title: title || undefined,
          comment: comment || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Error al guardar.');
      onSaved(data.data ?? data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 pt-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
          >
            <Star
              className={cn(
                'w-6 h-6 transition-colors',
                n <= (hover || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-muted text-muted-foreground',
              )}
            />
          </button>
        ))}
        <span className="text-xs text-yellow-600 self-center ml-1">
          {LABELS[rating]}
        </span>
      </div>
      <input
        type="text"
        maxLength={255}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título (opcional)"
        className="w-full border border-input rounded-md p-2 text-sm bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
      />
      <textarea
        maxLength={2000}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Comentario (opcional)"
        className="w-full resize-none border border-input rounded-md p-2 text-sm bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
      />
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={loading}
          className="bg-teal-500 hover:bg-teal-600 text-white"
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {loading ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </div>
    </div>
  );
}

// ─── ReviewCard ───────────────────────────────────────────────────────────────

function ReviewCard({
  review,
  onDeleted,
  onUpdated,
}: {
  review: LaravelReview;
  onDeleted?: (id: string) => void;
  onUpdated?: (updated: LaravelReview) => void;
}) {
  const { user } = useCurrentUser();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isAuthor = String(user?.id) === String(review.user?.id);
  const canAct = isAuthor;

  const handleDelete = async () => {
    if (!confirm('¿Eliminar esta reseña?')) return;
    setDeleting(true);
    try {
      const token = await getClientToken();
      const res = await fetch(`${LARAVEL_API_URL}/reviews/${review.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (res.ok) onDeleted?.(review.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12 flex-shrink-0">
            <AvatarImage src={review.user?.avatar ?? undefined} alt={review.user?.name ?? undefined} />
            <AvatarFallback>
              {review.user?.name?.charAt(0).toUpperCase() ?? '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-base">
                    {review.user?.name ?? 'Usuario'}
                  </h4>
                  {review.isVerifiedPurchase && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <BadgeCheck className="w-3 h-3" />
                      Compra verificada
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-semibold text-muted-foreground">
                  {formatDate(review.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Stars value={review.rating} size="sm" />
                {canAct && !editing && (
                  <div className="flex gap-1 ml-2">
                    {isAuthor && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => setEditing(true)}
                        aria-label="Editar reseña"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={handleDelete}
                      disabled={deleting}
                      aria-label="Eliminar reseña"
                    >
                      {deleting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
            {editing ? (
              <EditReviewForm
                review={review}
                onSaved={(updated) => {
                  onUpdated?.(updated);
                  setEditing(false);
                }}
                onCancel={() => setEditing(false)}
              />
            ) : (
              <>
                {review.title && (
                  <p className="font-medium text-sm">{review.title}</p>
                )}
                {review.comment && (
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── ReviewsSection ───────────────────────────────────────────────────────────

function ReviewsSection({
  productId,
  productRating,
  productReviewCount,
}: {
  productId: string;
  productRating: number;
  productReviewCount: number;
}) {
  const {
    reviews: rawReviews,
    stats,
    pagination,
    loading,
    error,
    loadMore,
  } = useReviews(productId);

  const reviews: LaravelReview[] = Array.isArray(rawReviews)
    ? rawReviews
    : ((rawReviews as any)?.data ?? (rawReviews as any)?.reviews ?? []);

  const [localReviews, setLocalReviews] = useState<LaravelReview[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setLocalReviews(reviews);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawReviews]);

  const handleDeleted = (id: string) =>
    setLocalReviews((prev) => prev.filter((r) => r.id !== id));

  const handleUpdated = (updated: LaravelReview) =>
    setLocalReviews((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r)),
    );

  if (loading && localReviews.length === 0)
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
      </div>
    );

  if (error)
    return (
      <div className="flex items-center gap-2 text-sm py-4 text-destructive">
        <AlertCircle className="w-4 h-4" />
        {error}
      </div>
    );

  const totalReviews = stats?.count ?? productReviewCount;
  const distributionTotal = Math.max(totalReviews, 1);

  return (
    <Card className="border border-border bg-card">
      <CardHeader className="pb-0">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <CardTitle className="text-3xl font-bold text-foreground mb-1">
              Reseñas de Clientes
            </CardTitle>
            <CardDescription className="text-base text-foreground/80">
              {totalReviews} reseñas reales
            </CardDescription>
          </div>
          <Link
            href="#reviews-list"
            className="text-sm font-semibold text-teal-600 hover:text-teal-500"
          >
            Ver todas las reseñas
          </Link>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid lg:grid-cols-[320px_minmax(0,1fr)] gap-6">
          {/* Resumen */}
          <section className="rounded-3xl border border-teal-100 dark:border-teal-900/30 bg-gradient-to-br from-teal-50/60 to-cyan-50/40 dark:from-teal-950/20 dark:to-cyan-950/10 p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">
              Resumen de Calificaciones
            </h3>
            <div className="pb-4 border-b border-teal-100 dark:border-teal-900/30 mb-6">
              <div className="text-5xl font-bold text-foreground">
                {productRating.toFixed(1)}
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Stars value={productRating} size="lg" />
                <span className="text-sm font-semibold text-foreground">
                  {totalReviews} reseñas
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {([5, 4, 3, 2, 1] as const).map((n) => {
                const count = stats?.distribution[n] ?? 0;
                const pct = Math.round((count / distributionTotal) * 100);
                return (
                  <div key={n} className="flex items-center gap-3">
                    <span className="w-24 text-sm font-semibold text-foreground">
                      {n} estrellas
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-teal-100 dark:bg-teal-900/30 overflow-hidden">
                      <div
                        className="h-full bg-teal-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-sm font-semibold text-foreground">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
            <Button
              variant="outline"
              className="mt-6 w-full justify-start border-teal-300 text-teal-700 hover:bg-teal-50 dark:border-teal-700 dark:text-teal-400 dark:hover:bg-teal-950/30"
              onClick={() => setShowForm(true)}
            >
              Escribir una reseña
            </Button>
            {showForm && (
              <div className="mt-5 rounded-3xl border border-teal-100 dark:border-teal-900/30 bg-card p-4">
                <WriteProductReview
                  productId={Number(productId)}
                  onSuccess={() => setShowForm(false)}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            )}
          </section>

          {/* Lista */}
          <section className="space-y-4">
            {localReviews.length === 0 ? (
              <div className="rounded-3xl border border-border bg-card p-8 text-center text-foreground">
                <MessageSquare className="w-10 h-10 mx-auto mb-4 text-teal-300" />
                <p className="text-lg font-bold">Sin reseñas aún</p>
                <p className="text-sm text-foreground/80 mt-2">
                  Sé el primero en dejar una opinión.
                </p>
              </div>
            ) : (
              <div id="reviews-list" className="space-y-4">
                {localReviews.map((r) => (
                  <ReviewCard
                    key={r.id}
                    review={r}
                    onDeleted={handleDeleted}
                    onUpdated={handleUpdated}
                  />
                ))}
              </div>
            )}
            {pagination?.hasMore && (
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loading}
                className="w-full mt-1 text-[11px] tracking-[.1em] uppercase border-teal-300 text-teal-700 hover:bg-teal-50"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {loading ? 'Cargando…' : 'Ver más reseñas'}
              </Button>
            )}
          </section>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── ProductTabs (Nivel 2) ────────────────────────────────────────────────────

type TabId = 'descripcion' | 'caracteristicas' | 'nutricion';

function ProductTabs({ product }: { product: LaravelProduct }) {
  const hasCharacteristics =
    (product.characteristics?.length ?? 0) > 0 ||
    (product.additional_info?.length ?? 0) > 0;
  const hasNutritional = !!product.nutritional_info?.rows?.length;

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    {
      id: 'descripcion',
      label: 'Descripción',
      icon: <FileText className="w-4 h-4" />,
    },
    ...(hasCharacteristics
      ? [
          {
            id: 'caracteristicas' as TabId,
            label: 'Características',
            icon: <Zap className="w-4 h-4" />,
          },
        ]
      : []),
    ...(hasNutritional
      ? [
          {
            id: 'nutricion' as TabId,
            label: 'Nutricional',
            icon: <Salad className="w-4 h-4" />,
          },
        ]
      : []),
  ];

  const [active, setActive] = useState<TabId>('descripcion');

  return (
    <div className="mt-6">
      {/* Tab headers */}
      <div className="flex border-b border-border overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={cn(
                'flex items-center gap-2 px-5 py-3 text-sm font-semibold whitespace-nowrap transition-all duration-200 border-b-2 -mb-px',
                isActive
                  ? 'border-teal-500 text-teal-600 dark:text-teal-400 bg-teal-50/60 dark:bg-teal-950/30'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-teal-200',
              )}
            >
              <span
                className={cn(
                  'transition-colors',
                  isActive ? 'text-teal-500' : 'text-muted-foreground',
                )}
              >
                {tab.icon}
              </span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="mt-5 rounded-xl border border-teal-100 dark:border-teal-900/30 bg-teal-50/30 dark:bg-teal-950/10 p-5">
        {active === 'descripcion' && (
          <div>
            {product.description ? (
              <div className="space-y-3">
                {product.description.split('\n').map((p, i) => (
                  <p
                    key={i}
                    className="text-sm text-foreground leading-relaxed"
                  >
                    {p}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-foreground/60 italic">
                Sin descripción disponible.
              </p>
            )}
          </div>
        )}

        {active === 'caracteristicas' && (
          <CharacteristicsTable
            characteristics={product.characteristics}
            additional_info={product.additional_info}
          />
        )}

        {active === 'nutricion' && hasNutritional && (
          <div>
            {product.nutritional_info!.serving_note && (
              <p className="text-sm italic text-foreground/70 mb-4">
                {product.nutritional_info!.serving_note}
              </p>
            )}
            <div className="grid md:grid-cols-2 gap-3">
              {product.nutritional_info!.rows.map((row, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center rounded-lg border border-teal-100 dark:border-teal-900/30 bg-white dark:bg-teal-950/20 px-4 py-3"
                >
                  <span className="font-semibold text-foreground/70 text-sm">
                    {row.label}
                  </span>
                  <span className="font-bold text-sm text-teal-700 dark:text-teal-400">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── RelatedProductsCarousel (auto-scroll infinito) ──────────────────────────

function RelatedProductCard({ rel }: { rel: LaravelProduct }) {
  const { addToCart, loading, addedToCart } = useAddToCart();
  const handleAdd = useCallback(() => addToCart(Number(rel.id), 1), [addToCart, rel.id]);
  const relDiscount = discountPercent(rel.price, rel.regular_price);
  return (
    <Link
      href={`/producto/${rel.slug}`}
      className="flex-shrink-0 w-72"
      tabIndex={0}
    >
      <Card
        className="group cursor-pointer h-full overflow-hidden border-border/60 
  hover:border-teal-400 hover:shadow-xl hover:-translate-y-2 
  transition-all duration-300 rounded-[2rem] py-0 gap-0"
      >
        <CardContent className="p-0">
          <div className="relative aspect-square overflow-hidden bg-muted/40 dark:bg-muted/20">
            <Image
              src={
                rel.images[0]?.medium ?? rel.images[0]?.src ?? '/no-image.png'
              }
              alt={rel.images[0]?.alt ?? rel.name}
              fill
              sizes="288px"
              className="object-contain p-6 group-hover:scale-110 transition-transform duration-500 ease-out"
            />
            {rel.sticker && (
              <div className="absolute top-2 left-2">
                <StickerBadge sticker={rel.sticker} />
              </div>
            )}
            {relDiscount > 0 && (
              <div className="absolute top-2 right-2">
                <Badge variant="destructive" className="text-[10px] font-bold">
                  −{relDiscount}%
                </Badge>
              </div>
            )}
            <TopMedalBadge entityType="product" entityId={rel.id} size="xl" className="absolute bottom-6 right-6" />
          </div>
          <div className="p-4 space-y-2">
            <div className="flex flex-wrap items-center gap-1">
              {rel.categories.slice(0, 1).map((cat) => (
                <Badge key={cat.slug} variant="secondary" className="text-xs">
                  {cat.name}
                </Badge>
              ))}
            </div>
            <h3 className="font-bold text-sm line-clamp-2 text-foreground group-hover:text-teal-600 transition-colors leading-snug">
              {rel.name}
            </h3>
            <div className="flex items-center gap-1.5">
              <Stars value={rel.rating.average} size="sm" />
              <span className="text-xs text-muted-foreground">
                ({rel.rating.count})
              </span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xl font-bold text-foreground">
                {formatPrice(rel.price)}
              </span>
              <Button
                size="sm"
                aria-label="Agregar al carrito"
                disabled={loading}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAdd(); }}
                className="opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 bg-teal-500 hover:bg-teal-600 h-8 w-8 p-0"
              >
                {addedToCart ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function RelatedProductsCarousel({ products }: { products: LaravelProduct[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const pausedRef = useRef(false);
  const posRef = useRef(0);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const SPEED = 0.5;
  const CARD_STEP = 296; // ancho de card + gap aprox
  const RESUME_DELAY = 2500; // ms antes de reanudar auto-scroll tras interacción manual
  // Pausa manual (botón/tecla): a diferencia de pausedRef, esta no se reanuda
  // sola — el usuario decide cuándo volver a activar el auto-scroll.
  const [isPaused, setIsPaused] = useState(false);
  const dragRef = useRef<{ startX: number; startPos: number; dragging: boolean }>({
    startX: 0, startPos: 0, dragging: false,
  });

  // Con 1 solo producto, duplicar rompe el auto-scroll infinito (loop entre 2 copias idénticas
  // sin nada más que mostrar); con 0 no debería renderizarse (el caller ya filtra products.length > 0).
  const items = products.length > 1 ? [...products, ...products] : products;
  const canAutoScroll = products.length > 1;

  // Pausa temporal y programa reanudación automática
  const pauseTemporarily = () => {
    pausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      setIsPaused((manuallyPaused) => {
        if (!manuallyPaused) pausedRef.current = false;
        return manuallyPaused;
      });
    }, RESUME_DELAY);
  };

  const togglePause = () => {
    setIsPaused((prev) => {
      const next = !prev;
      pausedRef.current = next;
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      return next;
    });
  };

  // Mueve el carrusel en una dirección, respetando el loop infinito
  const shift = (direction: 'left' | 'right') => {
    const track = trackRef.current;
    if (!track || !canAutoScroll) return;
    pauseTemporarily();
    const half = track.scrollWidth / 2;
    let next =
      posRef.current + (direction === 'right' ? CARD_STEP : -CARD_STEP);
    // Mantener dentro del rango [0, half)
    if (next < 0) next += half;
    if (next >= half) next -= half;
    // Animación suave manual con requestAnimationFrame
    const start = posRef.current;
    const diff = next - start;
    // Si el salto es muy grande (wrap-around), ajusta dirección
    const adjustedDiff =
      Math.abs(diff) > half / 2 ? (diff > 0 ? diff - half : diff + half) : diff;
    const duration = 300;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOut
      let current = start + adjustedDiff * ease;
      if (current < 0) current += half;
      if (current >= half) current -= half;
      posRef.current = current;
      track.style.transform = `translateX(-${current}px)`;
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !canAutoScroll) return;

    const step = () => {
      if (!pausedRef.current) {
        posRef.current += SPEED;
        const half = track.scrollWidth / 2;
        if (posRef.current >= half) posRef.current = 0;
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

  // Rueda del mouse — scroll horizontal
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const onWheel = (e: WheelEvent) => {
      // Solo si hay más delta vertical que horizontal (scroll vertical del usuario)
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      e.preventDefault();
      shift(e.deltaY > 0 ? 'right' : 'left');
    };
    wrap.addEventListener('wheel', onWheel, { passive: false });
    return () => wrap.removeEventListener('wheel', onWheel);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); shift('left'); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); shift('right'); }
    else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); togglePause(); }
  };

  // Arrastre con mouse/touch — además de la rueda del mouse y las flechas
  const handlePointerDown = (e: React.PointerEvent) => {
    dragRef.current = { startX: e.clientX, startPos: posRef.current, dragging: true };
    pausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    const track = trackRef.current;
    if (!track) return;
    const half = track.scrollWidth / 2;
    if (half === 0) return;
    const delta = e.clientX - dragRef.current.startX;
    let current = dragRef.current.startPos - delta;
    current = ((current % half) + half) % half;
    posRef.current = current;
    track.style.transform = `translateX(-${current}px)`;
  };
  const handlePointerUp = () => {
    if (!dragRef.current.dragging) return;
    dragRef.current.dragging = false;
    pauseTemporarily();
  };

  return (
    <div className="mb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold">Productos Relacionados</h2>
          {canAutoScroll && (
            <p className="text-sm text-muted-foreground mt-1">
              Usa las flechas o la rueda del mouse para explorar
            </p>
          )}
        </div>
        {canAutoScroll && (
          <button
            type="button"
            onClick={togglePause}
            aria-pressed={isPaused}
            aria-label={isPaused ? 'Reanudar carrusel automático' : 'Pausar carrusel automático'}
            className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors"
          >
            {isPaused ? (
              <Play className="w-3 h-3 text-teal-600 dark:text-teal-400" />
            ) : (
              <Pause className="w-3 h-3 text-teal-600 dark:text-teal-400" />
            )}
            <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
              {isPaused ? 'En pausa' : 'Auto-scroll'}
            </span>
          </button>
        )}
      </div>

      {/* Contenedor con flechas superpuestas */}
      <div className="relative group/carousel">
        {/* Flecha izquierda */}
        {canAutoScroll && (
        <button
          onClick={() => shift('left')}
          aria-label="Anterior"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20
            w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-lg
            border border-teal-100 dark:border-teal-900/40
            flex items-center justify-center
            text-teal-600 dark:text-teal-400
            hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:border-teal-400
            transition-all duration-200
            opacity-0 group-hover/carousel:opacity-100 focus-visible:opacity-100
            -translate-x-1 group-hover/carousel:translate-x-0 focus-visible:translate-x-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        )}

        {/* Flecha derecha */}
        {canAutoScroll && (
        <button
          onClick={() => shift('right')}
          aria-label="Siguiente"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20
            w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-lg
            border border-teal-100 dark:border-teal-900/40
            flex items-center justify-center
            text-teal-600 dark:text-teal-400
            hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:border-teal-400
            transition-all duration-200
            opacity-0 group-hover/carousel:opacity-100 focus-visible:opacity-100
            translate-x-1 group-hover/carousel:translate-x-0 focus-visible:translate-x-0"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        )}

        {/* Fade + overflow */}
        <div
          ref={wrapRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Productos relacionados"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="overflow-hidden relative focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-xl cursor-grab active:cursor-grabbing"
          style={{
            maskImage:
              'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
          }}
          onMouseEnter={() => {
            pausedRef.current = true;
            if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
          }}
          onMouseLeave={() => {
            if (!isPaused) pausedRef.current = false;
          }}
          onTouchStart={() => pauseTemporarily()}
          onTouchEnd={() => {}}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div
            ref={trackRef}
            className="flex gap-5 will-change-transform py-4 px-2"
            style={{ width: 'max-content' }}
          >
            {items.map((rel, i) => (
              <RelatedProductCard key={`${rel.id}-${i}`} rel={rel} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Componente Principal ────────────────────────────────────────────────────

export function ProductDetailPageClient({
  product,
  relatedProducts,
}: {
  product: LaravelProduct;
  relatedProducts: LaravelProduct[];
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isDark, setIsDark] = useState(false);
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { isWishlisted, toggle: toggleWishlist, loading: wishlistLoading } = useWishlist(product.id);

  const handleToggleWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      showToast('Inicia sesión para guardar productos en tu lista de deseos', 'info');
      return;
    }
    const wasWishlisted = isWishlisted;
    await toggleWishlist();
    showToast(
      wasWishlisted ? 'Producto quitado de tu lista de deseos' : 'Agregado a tu lista de deseos',
      'success',
    );
  }, [isAuthenticated, isWishlisted, toggleWishlist, showToast]);
  const [gallerySize, setGallerySize] = useState<number | null>(null);
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const buyBoxColRef = useRef<HTMLDivElement | null>(null);

  // Stock RT (Retiro en Tienda)
  const [rtStock, setRtStock] = useState<number | null>(null);
  useEffect(() => {
    if (!product.id) return;
    fetch(`${process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api'}/products/${product.id}/branches/public`)
      .then(r => r.json())
      .then(json => {
        const branches = json.data || [];
        const total = branches.reduce((sum: number, b: any) => sum + (b.branch_stock ?? 0), 0);
        setRtStock(total);
      })
      .catch(() => {});
  }, [product.id]);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const gridContainer = gridContainerRef.current;
    const buyBoxCol = buyBoxColRef.current;
    if (!gridContainer || !buyBoxCol) return;

    const recompute = () => {
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
      if (!isDesktop) {
        setGallerySize(null);
        return;
      }
      // 32px = gap-8 entre columnas; se mide el ancho real de la columna de compra
      // en vez de asumir un valor fijo, para que siempre calce con el layout actual
      const availableWidth = gridContainer.clientWidth - buyBoxCol.getBoundingClientRect().width - 32;
      const size = Math.min(buyBoxCol.clientHeight, availableWidth);
      setGallerySize(size > 0 ? size : null);
    };

    recompute();
    const observer = new ResizeObserver(recompute);
    observer.observe(gridContainer);
    observer.observe(buyBoxCol);
    return () => observer.disconnect();
  }, []);

  const {
    addToCart,
    loading: cartLoading,
    error: cartError,
    addedToCart: localAdded,
  } = useAddToCart();

  const inStock = product.stock > 0;
  const handleAddToCart = () => addToCart(Number(product.id), quantity);

  const discount = discountPercent(product.price, product.regular_price);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 space-y-10">
      {/* Navegación */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 text-muted-foreground"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al catálogo
      </Button>

      {/* ── NIVEL 1: Imagen + Info de compra ─────────────────────────────── */}
      <div ref={gridContainerRef} className="grid lg:grid-cols-[1fr_minmax(360px,420px)] gap-8 items-stretch">
        {/* Columna izquierda: galería */}
        <div className="sticky top-24 h-full flex flex-col justify-center">
          <ProductGallery images={product.images} name={product.name} size={gallerySize} productId={product.id} />
        </div>

        {/* Columna derecha: info de compra */}
        <div ref={buyBoxColRef} className="space-y-5">
          {/* Categorías + título */}
          <div>
            {product.categories.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {product.categories.slice(0, 3).map((cat) => (
                  <Link key={cat.slug} href={`/productos/${cat.slug}`}>
                    <Badge
                      variant="secondary"
                      className="text-xs font-bold uppercase tracking-wider px-2.5 py-1"
                    >
                      {cat.name}
                    </Badge>
                  </Link>
                ))}
                <StickerBadge sticker={product.sticker ?? null} />
              </div>
            )}
            <h1 className="text-4xl font-bold text-foreground mb-2 tracking-tight">
              {product.name}
            </h1>
            {product.short_description && (
              <p className="text-sm font-semibold text-muted-foreground leading-relaxed mb-3">
                {product.short_description}
              </p>
            )}
            <div className="flex items-center gap-3">
              <Stars value={product.rating.average} size="lg" />
              <span className="text-sm font-semibold text-muted-foreground">
                {product.rating.average.toFixed(1)} ({product.rating.count}{' '}
                reseñas)
              </span>
            </div>
          </div>

          <Separator />

          {/* Precio */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-5xl font-bold text-foreground">
                {formatPrice(product.price)}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-lg line-through font-semibold text-muted-foreground">
                    {formatPrice(product.regular_price)}
                  </span>
                  <Badge
                    variant="destructive"
                    className="text-sm font-bold px-2 py-0.5"
                  >
                    -{discount}%
                  </Badge>
                </>
              )}
            </div>
            {product.stock !== undefined && (
              <p className="text-sm font-semibold text-muted-foreground">
                {product.stock > 0
                  ? `Stock: ${product.stock} unidades`
                  : 'No disponible'}
              </p>
            )}
            {rtStock !== null && rtStock > 0 && (
              <p className="text-xs font-semibold text-sky-600 dark:text-emerald-400 flex items-center gap-1.5 mt-1">
                <Store className="w-3.5 h-3.5" />
                Stock RT: {rtStock} unidades disponibles para retiro
              </p>
            )}
          </div>

          <Separator />

          {/* Cantidad */}
          {inStock && (
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">
                Cantidad
              </p>
              <div className="flex items-center border border-border rounded-lg w-fit">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="h-9 w-9 rounded-none border-r border-border"
                  aria-label="Reducir"
                >
                  −
                </Button>
                <span className="w-10 text-center text-sm font-bold text-foreground">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock, q + 1))
                  }
                  className="h-9 w-9 rounded-none border-l border-border"
                  aria-label="Aumentar"
                >
                  +
                </Button>
              </div>
            </div>
          )}

          {cartError && (
            <div className="flex items-center gap-2 text-sm px-3 py-2 text-destructive bg-destructive/10 border border-destructive/25 rounded-md">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {cartError}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3">
            <Button
              onClick={handleAddToCart}
              disabled={!inStock || cartLoading}
              size="lg"
              className={cn(
                'flex-1 text-base h-12 bg-teal-500 hover:bg-teal-600 text-white',
                localAdded && 'bg-green-600 hover:bg-green-600',
              )}
            >
              {cartLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : localAdded ? (
                <Check className="w-5 h-5" />
              ) : (
                <ShoppingCart className="w-5 h-5" />
              )}
              {cartLoading
                ? 'Agregando…'
                : localAdded
                  ? '¡Agregado!'
                  : inStock
                    ? 'Añadir al Carrito'
                    : 'Sin stock'}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleWishlist}
              disabled={wishlistLoading}
              aria-label="Favoritos"
              className={cn(
                'h-12 w-12',
                isWishlisted
                  ? 'border-rose-400 text-rose-500 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20'
                  : 'hover:border-teal-300',
              )}
            >
              <Heart
                className="w-5 h-5"
                style={{ fill: isWishlisted ? 'currentColor' : 'transparent' }}
              />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                navigator.share?.({
                  title: product.name,
                  url: window.location.href,
                })
              }
              aria-label="Compartir"
              className="h-12 w-12 hover:border-teal-300"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>

          {/* ── Métodos de pago aceptados ── */}
          <div className="rounded-xl bg-white dark:bg-[var(--bg-secondary)] border border-teal-100 dark:border-teal-900/30 p-4">
            <p className="text-[10px] font-bold tracking-[.1em] uppercase text-teal-600 dark:text-teal-400 mb-3 text-center">
              Medios de pago aceptados
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {([
                { dark: '/img/intro/visa1.png', light: '/img/intro/visanuevo-Photoroom(1).png', alt: 'Visa' },
                { dark: '/img/intro/mastercard.png', light: '/img/intro/mastercadnuevo-Photoroom(1).png', alt: 'Mastercard' },
                { dark: '/img/intro/amex1.png', light: '/img/intro/amexnuevo-Photoroom(1).png', alt: 'American Express' },
                { dark: '/img/intro/yape.png', light: '/img/intro/yapenuevo-Photoroom(1).png', alt: 'Yape' },
                { dark: '/img/intro/logo-plin.png', light: '/img/intro/plinnuevo-Photoroom(1).png', alt: 'Plin' },
              ] as const).map((icon) => (
                <div
                  key={icon.alt}
                  className="flex items-center justify-center rounded-lg px-3 py-2 dark:bg-[var(--bg-secondary)]"
                >
                  <Image
                    src={isDark ? icon.dark : icon.light}
                    alt={icon.alt}
                    width={60}
                    height={36}
                    className="h-9 dark:h-14 w-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Garantías */}
          <div className={product.type === 'physical' ? 'grid grid-cols-3 gap-2' : 'grid grid-cols-1 gap-2'}>
            {(product.type === 'physical'
              ? [
                  { icon: Shield, text: 'Compra segura' },
                  { icon: Truck, text: 'Envío rápido' },
                  { icon: RotateCcw, text: 'Devoluciones' },
                ]
              : [{ icon: Shield, text: 'Compra segura' }]
            ).map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex flex-col items-center gap-1.5 text-center p-3 rounded-xl border border-teal-100 dark:border-teal-900/30 bg-teal-50/50 dark:bg-[var(--bg-secondary)]"
              >
                <Icon className="w-4 h-4 text-teal-500" />
                <span className="text-[10px] font-semibold tracking-[.06em] uppercase text-teal-700 dark:text-white">
                  {text}
                </span>
              </div>
            ))}
          </div>

          {/* Tienda */}
          {product.store?.name && (
            <Link href={`/tienda/${product.store.slug}`}>
              <Card className="hover:border-teal-400 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-11 h-11 flex items-center justify-center flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                    {product.store.logo ? (
                      <Image
                        src={product.store.logo}
                        alt={product.store.name}
                        width={44}
                        height={44}
                        className="object-cover rounded-lg"
                      />
                    ) : (
                      <Store className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground mb-0.5">
                      Marca / Vendido por
                    </p>
                    <p className="font-bold text-lg text-foreground flex items-center gap-1">
                      {product.store.name}
                      <BadgeCheck className="w-4 h-4 text-teal-500" />
                    </p>
                  </div>
                  <ArrowLeft className="w-4 h-4 rotate-180 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      </div>

      {/* ── NIVEL 2: Tabs debajo de la imagen ────────────────────────────── */}
      {/* 452px = ancho máximo de la columna de compra (420px, minmax de grid-cols arriba) + gap-8 (32px) */}
      <div className="lg:w-[calc(100%-452px)]">
        <ProductTabs product={product} />
      </div>

      {/* ── NIVEL 3: Reseñas ──────────────────────────────────────────────── */}
      <ReviewsSection
        productId={product.id}
        productRating={product.rating.average}
        productReviewCount={product.rating.count}
      />

      {/* ── NIVEL 4: Productos relacionados (auto-scroll infinito) ───────── */}
      {relatedProducts.length > 0 && (
        <RelatedProductsCarousel products={relatedProducts} />
      )}
    </main>
  );
}

// ─── Galería ──────────────────────────────────────────────────────────────────

function ProductGallery({
  images,
  name,
  size,
  productId,
}: {
  images: LaravelProduct['images'];
  name: string;
  size?: number | null;
  productId: string;
}) {
  const [active, setActive] = useState(0);
  const [zooming, setZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastTap = useRef(0);

  const prev = useCallback(
    () => setActive((i) => (i === 0 ? images.length - 1 : i - 1)),
    [images.length],
  );
  const next = useCallback(
    () => setActive((i) => (i === images.length - 1 ? 0 : i + 1)),
    [images.length],
  );

  const src =
    images[active]?.large ??
    images[active]?.medium ??
    images[active]?.src ??
    '/no-image.png';

  const handlePointer = (clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = Math.max(
      0,
      Math.min(100, ((clientX - rect.left) / rect.width) * 100),
    );
    const ny = Math.max(
      0,
      Math.min(100, ((clientY - rect.top) / rect.height) * 100),
    );
    setZoomPos({ x: nx, y: ny });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const now = Date.now();
    const t = e.touches[0];
    if (now - lastTap.current < 300) {
      handlePointer(t.clientX, t.clientY);
      setZooming((s) => !s);
      lastTap.current = 0;
      return;
    }
    lastTap.current = now;
  };

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={`Imágenes de ${name}`}
        tabIndex={images.length > 1 ? 0 : undefined}
        onKeyDown={(e) => {
          if (images.length <= 1) return;
          if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
          else if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
        }}
        className={cn(
          'relative rounded-xl overflow-hidden bg-white border border-teal-100 dark:border-teal-900/30 group focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
          size ? 'mx-auto' : 'aspect-square w-full',
        )}
        style={size ? { width: size, height: size } : undefined}
        onMouseLeave={() => setZooming(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={(e) => {
          if (!zooming) return;
          const t = e.touches[0];
          handlePointer(t.clientX, t.clientY);
        }}
      >
        <Image
          key={src}
          src={src}
          alt={images[active]?.alt ?? name}
          fill
          sizes="(max-width:768px) 100vw, 50vw"
          className="object-contain p-8 transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          onMouseMove={(e: any) => {
            handlePointer(e.clientX, e.clientY);
            setZooming(true);
          }}
          priority
        />

        <TopMedalBadge entityType="product" entityId={productId} size="xxl" className="absolute bottom-4 right-4 z-10" />

        {/* Lupa */}
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute w-40 h-40 rounded-full border border-teal-200 bg-no-repeat bg-center transform -translate-x-1/2 -translate-y-1/2',
            zooming ? 'opacity-100 block' : 'opacity-0 hidden md:block',
          )}
          style={{
            left: `${zoomPos.x}%`,
            top: `${zoomPos.y}%`,
            backgroundImage: `url(${src})`,
            backgroundSize: '250%',
            backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
            transition: 'opacity 120ms linear',
          }}
        />

        {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={prev}
              aria-label="Anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm hover:border-teal-400"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={next}
              aria-label="Siguiente"
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm hover:border-teal-400"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Ver imagen ${i + 1} de ${images.length}`}
              aria-current={i === active}
              className={cn(
                'aspect-square rounded-lg overflow-hidden border-2 transition-all',
                i === active
                  ? 'border-teal-500 ring-2 ring-teal-400/30'
                  : 'border-border hover:border-teal-300',
              )}
            >
              <div className="relative w-full h-full bg-white">
                <Image
                  src={img.thumb ?? img.src}
                  alt={img.alt ?? name}
                  fill
                  sizes="100px"
                  className="object-contain p-1"
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}