'use client';

import { useState, useCallback, useEffect } from 'react';
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
  Phone,
  Mail,
  Loader2,
  AlertCircle,
  Check,
  MessageSquare,
  Download,
  Clock,
  MapPin,
  Flame,
  Leaf,
  ChevronDown,
  Pencil,
  Trash2,
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

import { Button } from '@/components/UI/button';
import { Badge } from '@/components/UI/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/UI/Cardt';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/UI/avatar';
import { Separator } from '@/components/UI/separator';
import { ScrollArea } from '@/components/UI/scroll-area';
import { cn } from '@/lib/utils';

// ─── Token (mismo mecanismo que WriteProductReview) ───────────────────────────

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

// ─── Galería ──────────────────────────────────────────────────────────────────

function ProductGallery({
  images,
  name,
}: {
  images: LaravelProduct['images'];
  name: string;
}) {
  const [active, setActive] = useState(0);
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

  return (
    <div className="space-y-4">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-muted border border-border group">
        <Image
          key={src}
          src={src}
          alt={images[active]?.alt ?? name}
          fill
          sizes="(max-width:768px) 100vw, 50vw"
          className="object-contain p-8 transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          priority
        />
        {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={prev}
              aria-label="Anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={next}
              aria-label="Siguiente"
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                'aspect-square rounded-lg overflow-hidden border-2 transition-all',
                i === active
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/50',
              )}
            >
              <div className="relative w-full h-full bg-muted">
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

// ─── StickerBadge ─────────────────────────────────────────────────────────────

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
      <CardContent className="p-4 flex items-center gap-3">
        {icon}
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-semibold text-sm">{value}</p>
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
          icon={<Download className="w-5 h-5 text-primary" />}
          label="Formato"
          value={product.fileType?.toUpperCase() ?? '—'}
        />
        {product.downloadLimit && (
          <TypeItem
            icon={<Package className="w-5 h-5 text-primary" />}
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
          icon={<Clock className="w-5 h-5 text-primary" />}
          label="Duración"
          value={`${product.serviceDuration} min`}
        />
        <TypeItem
          icon={<MapPin className="w-5 h-5 text-primary" />}
          label="Modalidad"
          value={product.serviceModality ?? '—'}
        />
      </div>
    );
  }
  const items = [
    product.stock != null && {
      icon: <Package className="w-5 h-5 text-primary" />,
      label: 'Stock',
      value: `${product.stock} unidades`,
    },
    product.weight && {
      icon: <Weight className="w-5 h-5 text-primary" />,
      label: 'Peso',
      value: `${product.weight} kg`,
    },
    product.dimensions && {
      icon: <Ruler className="w-5 h-5 text-primary" />,
      label: 'Dimensiones',
      value: product.dimensions,
    },
    product.sku && {
      icon: <Calendar className="w-5 h-5 text-primary" />,
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

// ─── NutritionalPanel ─────────────────────────────────────────────────────────

function NutritionalPanel({
  info,
}: {
  info: NonNullable<LaravelProduct['nutritional_info']>;
}) {
  const [open, setOpen] = useState(false);
  const calorieRow = info.rows.find((r) =>
    r.label.toLowerCase().includes('caloría'),
  );
  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Leaf className="w-4 h-4 text-green-600" />
          <span className="text-[11px] font-medium tracking-[.1em] uppercase text-muted-foreground">
            Información nutricional
          </span>
          {calorieRow && (
            <Badge variant="secondary" className="gap-1 text-[10px]">
              <Flame className="w-2.5 h-2.5" />
              {calorieRow.value}
            </Badge>
          )}
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-muted-foreground transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          open ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <Separator />
        {info.serving_note && (
          <p className="px-4 py-2 text-[11px] italic text-muted-foreground bg-muted/30 border-b border-border">
            {info.serving_note}
          </p>
        )}
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-muted/50">
              {['Nutriente', 'Cantidad', '% VD'].map((h, i) => (
                <th
                  key={h}
                  className={cn(
                    'px-4 py-2 text-[10px] font-medium tracking-[.1em] uppercase text-muted-foreground',
                    i === 0
                      ? 'text-left'
                      : i === 1
                        ? 'text-center'
                        : 'text-right',
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {info.rows.map((row, i) => (
              <tr
                key={i}
                className="border-t border-border hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-2.5 font-medium text-foreground">
                  {row.label}
                </td>
                <td className="px-4 py-2.5 text-center font-medium text-primary">
                  {row.value}
                </td>
                <td className="px-4 py-2.5 text-right text-muted-foreground">
                  {row.daily_value ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
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
      <p className="text-sm italic text-muted-foreground">
        Sin características especificadas.
      </p>
    );
  return (
    <div className="space-y-6">
      {hasMain && (
        <div>
          <p className="text-[10px] font-medium tracking-[.12em] uppercase text-muted-foreground mb-3">
            Características principales
          </p>
          <ul className="grid md:grid-cols-2 gap-3">
            {characteristics.map((attr, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {attr.label}:
                  </span>{' '}
                  {attr.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {hasAdditional && (
        <div>
          <p className="text-[10px] font-medium tracking-[.12em] uppercase text-muted-foreground mb-3">
            Información adicional
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {additional_info.map((attr, i) => (
              <Card key={i}>
                <CardContent className="p-4 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {attr.label}
                  </span>
                  <span className="font-semibold text-sm">{attr.value}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RatingDistribution ───────────────────────────────────────────────────────

function RatingDistribution({ stats }: { stats: ReviewStats }) {
  const max = Math.max(...Object.values(stats.distribution), 1);
  return (
    <div className="space-y-1.5">
      {([5, 4, 3, 2, 1] as const).map((n) => {
        const count = stats.distribution[n] ?? 0;
        const pct = Math.round((count / max) * 100);
        return (
          <div key={n} className="flex items-center gap-2 text-[11px]">
            <span className="w-3 text-right text-muted-foreground">{n}</span>
            <Star className="w-2.5 h-2.5 flex-shrink-0 fill-yellow-400 text-yellow-400" />
            <div className="flex-1 h-[4px] bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-5 text-right text-muted-foreground">
              {count}
            </span>
          </div>
        );
      })}
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
        className="w-full border border-input rounded-md p-2 text-sm bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />

      <textarea
        maxLength={2000}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Comentario (opcional)"
        className="w-full resize-none border border-input rounded-md p-2 text-sm bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
        <Button size="sm" onClick={handleSave} disabled={loading}>
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
  // ajusta si tu backend devuelve array
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
            <AvatarImage src={review.user?.avatar} alt={review.user?.name} />
            <AvatarFallback>
              {review.user?.name?.charAt(0).toUpperCase() ?? '?'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-base">
                    {review.user?.name ?? 'Usuario'}
                  </h4>
                  {review.isVerifiedPurchase && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <BadgeCheck className="w-3 h-3" />
                      Compra verificada
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
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

  // Normalizar array
  const reviews: LaravelReview[] = Array.isArray(rawReviews)
    ? rawReviews
    : ((rawReviews as any)?.data ?? (rawReviews as any)?.reviews ?? []);

  // Estado local para ediciones/borrados optimistas
  const [localReviews, setLocalReviews] = useState<LaravelReview[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Sincronizar cuando el hook carga datos
  useEffect(() => {
    setLocalReviews(reviews);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawReviews]);

  const handleDeleted = (id: string) => {
    setLocalReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdated = (updated: LaravelReview) => {
    setLocalReviews((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r)),
    );
  };

  if (loading && localReviews.length === 0)
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );

  if (error)
    return (
      <div className="flex items-center gap-2 text-sm py-4 text-destructive">
        <AlertCircle className="w-4 h-4" />
        {error}
      </div>
    );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="text-3xl mb-2">Reseñas de Clientes</CardTitle>
            <CardDescription className="text-base">
              {localReviews.length} reseñas verificadas
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-4xl font-bold text-foreground">
                {productRating}
              </span>
              <Stars value={productRating} size="lg" />
            </div>
            <p className="text-sm text-muted-foreground">
              Basado en {productReviewCount} reseñas
            </p>
          </div>
        </div>

        {stats && stats.count > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <RatingDistribution stats={stats} />
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Botón / formulario de nueva reseña */}
        <div className="mb-6">
          {!showForm ? (
            <Button variant="outline" onClick={() => setShowForm(true)}>
              Escribir una reseña
            </Button>
          ) : (
            <Card className="mb-4">
              <CardContent className="p-6">
                <WriteProductReview
                  productId={Number(productId)}
                  onSuccess={() => setShowForm(false)}
                  onCancel={() => setShowForm(false)}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {localReviews.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Sin reseñas aún</p>
            <p className="text-sm mt-1">Sé el primero en dejar una opinión.</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {localReviews.map((r) => (
                <ReviewCard
                  key={r.id}
                  review={r}
                  onDeleted={handleDeleted}
                  onUpdated={handleUpdated}
                />
              ))}
            </div>
          </ScrollArea>
        )}

        {pagination?.hasMore && (
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={loading}
            className="w-full mt-4 text-[11px] tracking-[.1em] uppercase"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {loading ? 'Cargando…' : 'Ver más reseñas'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  product: LaravelProduct;
  relatedProducts?: LaravelProduct[];
}

export function ProductDetailPageClient({
  product,
  relatedProducts = [],
}: Props) {
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [relScrollPos, setRelScrollPos] = useState(0);

  const { addToCart, loading: cartLoading, error: cartError } = useAddToCart();
  const [localAdded, setLocalAdded] = useState(false);
  const openPopup = useCarritoStore((s) => s.openPopup);

  const handleAddToCart = async () => {
    if (!product.in_stock || cartLoading) return;
    try {
      await addToCart(Number(product.id), quantity);
    } catch {
      /* handled */
    }
    openPopup();
    setLocalAdded(true);
    setTimeout(() => setLocalAdded(false), 2200);
  };

  const scrollRelated = (dir: 'left' | 'right') => {
    const el = document.getElementById('related-scroll');
    if (!el) return;
    const amount = 320;
    const next =
      dir === 'left'
        ? Math.max(0, relScrollPos - amount)
        : Math.min(el.scrollWidth - el.clientWidth, relScrollPos + amount);
    el.scrollTo({ left: next, behavior: 'smooth' });
    setRelScrollPos(next);
  };

  const discount = discountPercent(product.price, product.regular_price);
  const inStock = product.in_stock;
  const hasNutritional = !!product.nutritional_info?.rows?.length;
  const hasCharacteristics =
    product.characteristics.length > 0 || product.additional_info.length > 0;

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Breadcrumb */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 max-w-7xl py-3 flex items-center gap-2 text-[11px] tracking-[.06em] flex-wrap">
          <Link
            href="/"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Inicio
          </Link>
          {product.categories[0] && (
            <>
              <span className="text-muted-foreground/40">/</span>
              <Link
                href={`/productos/${product.categories[0].slug}`}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {product.categories[0].name}
              </Link>
            </>
          )}
          <span className="text-muted-foreground/40">/</span>
          <span className="text-foreground truncate max-w-[200px]">
            {product.name}
          </span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Galería + Info */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <ProductGallery images={product.images} name={product.name} />

          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {product.categories.map((cat) => (
                  <Link key={cat.slug} href={`/productos/${cat.slug}`}>
                    <Badge
                      variant="secondary"
                      className="hover:bg-secondary/80 transition-colors cursor-pointer"
                    >
                      {cat.name}
                    </Badge>
                  </Link>
                ))}
                <StickerBadge sticker={product.sticker} />
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-2 tracking-tight">
                {product.name}
              </h1>
              {product.short_description && (
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {product.short_description}
                </p>
              )}
              <div className="flex items-center gap-3">
                <Stars value={product.rating.average} size="lg" />
                <span className="text-sm text-muted-foreground">
                  {product.rating.average.toFixed(1)} ({product.rating.count}{' '}
                  reseñas)
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-5xl font-bold text-foreground">
                  {formatPrice(product.price)}
                </span>
                {discount > 0 && (
                  <>
                    <span className="text-lg line-through text-muted-foreground">
                      {formatPrice(product.regular_price)}
                    </span>
                    <Badge
                      variant="destructive"
                      className="text-xs tracking-[.08em]"
                    >
                      −{discount}%
                    </Badge>
                  </>
                )}
              </div>
              <div
                className={cn(
                  'flex items-center gap-2 text-sm',
                  inStock ? 'text-green-600' : 'text-destructive',
                )}
              >
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    inStock ? 'bg-green-600' : 'bg-destructive',
                  )}
                />
                {inStock
                  ? `${product.stock} unidades disponibles`
                  : 'Sin stock'}
              </div>
            </div>

            <ProductInfoCards product={product} />
            {hasNutritional && (
              <NutritionalPanel info={product.nutritional_info!} />
            )}

            <Separator />

            {inStock && (
              <div className="flex items-center gap-5">
                <span className="text-[11px] tracking-[.1em] uppercase text-muted-foreground">
                  Cantidad
                </span>
                <div className="flex items-center border border-border rounded-md overflow-hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="h-9 w-9 rounded-none border-r border-border"
                    aria-label="Reducir"
                  >
                    −
                  </Button>
                  <span className="w-10 text-center text-sm font-medium text-foreground">
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

            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={!inStock || cartLoading}
                size="lg"
                className={cn(
                  'flex-1 text-base h-12',
                  localAdded && 'bg-green-700 hover:bg-green-700',
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
                size="lg"
                onClick={() => setWishlisted((w) => !w)}
                aria-label="Favoritos"
                className={cn(
                  'h-12 w-12',
                  wishlisted &&
                    'border-destructive text-destructive bg-destructive/10 hover:bg-destructive/20',
                )}
              >
                <Heart
                  className="w-5 h-5"
                  style={{ fill: wishlisted ? 'currentColor' : 'transparent' }}
                />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() =>
                  navigator.share?.({
                    title: product.name,
                    url: window.location.href,
                  })
                }
                aria-label="Compartir"
                className="h-12 w-12"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Shield, text: 'Compra segura' },
                { icon: Truck, text: 'Envío rápido' },
                { icon: RotateCcw, text: 'Devoluciones' },
              ].map(({ icon: Icon, text }) => (
                <Card key={text}>
                  <CardContent className="p-3 flex flex-col items-center gap-1.5 text-center">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-[10px] tracking-[.06em] uppercase text-muted-foreground">
                      {text}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>

            {product.store?.name && (
              <Link href={`/tienda/${product.store.slug}`}>
                <Card className="hover:border-primary transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-11 h-11 flex items-center justify-center flex-shrink-0 overflow-hidden rounded-lg bg-primary">
                      {product.store.logo ? (
                        <Image
                          src={product.store.logo}
                          alt={product.store.name}
                          width={44}
                          height={44}
                          className="object-cover rounded-lg"
                        />
                      ) : (
                        <Store className="w-5 h-5 text-primary-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Marca / Vendido por
                      </p>
                      <p className="font-semibold text-lg text-foreground flex items-center gap-1">
                        {product.store.name}
                        <BadgeCheck className="w-4 h-4 text-primary" />
                      </p>
                    </div>
                    <ArrowLeft className="w-4 h-4 rotate-180 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Card className="mb-12">
          <CardContent className="p-6">
            <Tabs defaultValue="descripcion" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="descripcion">Descripción</TabsTrigger>
                <TabsTrigger value="caracteristicas">
                  Características
                </TabsTrigger>
                <TabsTrigger value="nutricion">Nutrición</TabsTrigger>
                <TabsTrigger value="tienda">Tienda</TabsTrigger>
              </TabsList>

              <TabsContent value="descripcion" className="space-y-4">
                <h3 className="text-2xl font-semibold">
                  Descripción del Producto
                </h3>
                {product.description ? (
                  product.description.split('\n').map((p, i) => (
                    <p
                      key={i}
                      className="text-muted-foreground leading-relaxed text-base"
                    >
                      {p}
                    </p>
                  ))
                ) : (
                  <p className="text-muted-foreground italic">
                    Sin descripción disponible.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="caracteristicas" className="space-y-4">
                <h3 className="text-2xl font-semibold">Características</h3>
                {hasCharacteristics ? (
                  <CharacteristicsTable
                    characteristics={product.characteristics}
                    additional_info={product.additional_info}
                  />
                ) : (
                  <p className="text-muted-foreground italic">
                    Sin características especificadas.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="nutricion" className="space-y-4">
                <h3 className="text-2xl font-semibold">
                  Información Nutricional
                </h3>
                {hasNutritional ? (
                  <div>
                    {product.nutritional_info!.serving_note && (
                      <p className="text-sm italic text-muted-foreground mb-4">
                        {product.nutritional_info!.serving_note}
                      </p>
                    )}
                    <div className="grid md:grid-cols-2 gap-4">
                      {product.nutritional_info!.rows.map((row, i) => (
                        <Card key={i}>
                          <CardContent className="p-4 flex justify-between items-center">
                            <span className="text-muted-foreground">
                              {row.label}
                            </span>
                            <span className="font-semibold">{row.value}</span>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">
                    Sin información nutricional.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="tienda" className="space-y-4">
                <h3 className="text-2xl font-semibold">
                  Información de la Tienda
                </h3>
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 flex items-center justify-center flex-shrink-0 overflow-hidden rounded-xl bg-primary">
                    {product.store.logo ? (
                      <Image
                        src={product.store.logo}
                        alt={product.store.name}
                        width={56}
                        height={56}
                        className="object-cover rounded-xl"
                      />
                    ) : (
                      <Store className="w-7 h-7 text-primary-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold flex items-center gap-2 mb-3 text-foreground">
                      {product.store.name}
                      <BadgeCheck className="w-4 h-4 text-primary" />
                    </h4>
                    <div className="space-y-1.5">
                      {product.store.email && (
                        <p className="text-sm flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-3.5 h-3.5" />
                          {product.store.email}
                        </p>
                      )}
                      {product.store.phone && (
                        <p className="text-sm flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-3.5 h-3.5" />
                          {product.store.phone}
                        </p>
                      )}
                    </div>
                    <Link href={`/tienda/${product.store.slug}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 gap-2"
                      >
                        <Store className="w-3.5 h-3.5" />
                        Ver tienda completa
                      </Button>
                    </Link>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Productos relacionados */}
        {relatedProducts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">Productos Relacionados</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => scrollRelated('left')}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => scrollRelated('right')}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div
              id="related-scroll"
              className="flex gap-6 overflow-x-auto scroll-smooth pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {relatedProducts.map((rel) => {
                const relDiscount = discountPercent(
                  rel.price,
                  rel.regular_price,
                );
                return (
                  <Link
                    key={rel.id}
                    href={`/producto/${rel.slug}`}
                    className="flex-shrink-0 w-80"
                  >
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full group">
                      <CardContent className="p-0">
                        <div className="relative aspect-square overflow-hidden rounded-t-xl bg-muted">
                          <Image
                            src={
                              rel.images[0]?.medium ??
                              rel.images[0]?.src ??
                              '/no-image.png'
                            }
                            alt={rel.images[0]?.alt ?? rel.name}
                            fill
                            sizes="320px"
                            className="object-contain p-6 group-hover:scale-105 transition-transform duration-300"
                          />
                          {rel.sticker && (
                            <div className="absolute top-2 left-2">
                              <StickerBadge sticker={rel.sticker} />
                            </div>
                          )}
                        </div>
                        <div className="p-5 space-y-3">
                          <div className="flex flex-wrap items-center gap-1">
                            {rel.categories.slice(0, 1).map((cat) => (
                              <Badge
                                key={cat.slug}
                                variant="secondary"
                                className="text-xs"
                              >
                                {cat.name}
                              </Badge>
                            ))}
                          </div>
                          <h3 className="font-semibold text-lg line-clamp-2 text-foreground">
                            {rel.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Stars value={rel.rating.average} size="sm" />
                            <span className="text-xs text-muted-foreground">
                              ({rel.rating.count})
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold text-foreground">
                                {formatPrice(rel.price)}
                              </span>
                              {relDiscount > 0 && (
                                <Badge
                                  variant="destructive"
                                  className="text-[10px]"
                                >
                                  −{relDiscount}%
                                </Badge>
                              )}
                            </div>
                            <Button size="sm" aria-label="Agregar al carrito">
                              <ShoppingCart className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Reseñas */}
        <ReviewsSection
          productId={product.id}
          productRating={product.rating.average}
          productReviewCount={product.rating.count}
        />
      </div>
    </main>
  );
}
