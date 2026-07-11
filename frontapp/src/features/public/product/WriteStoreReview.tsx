'use client';

import { useState } from 'react';
import { Star, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LARAVEL_API_URL } from '@/shared/lib/config/flags';

interface Props {
  storeSlug: string;
  reviewId?: string;
  initialValues?: {
    rating: number;
    rating_communication?: number;
    rating_shipping?: number;
    rating_packaging?: number;
    title?: string;
    comment?: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ─── Helper para obtener el token (Igual al de tu repositorio) ───
async function getAuthToken(): Promise<string | null> {
  try {
    const res = await fetch('/api/auth-token', {
      credentials: 'include',
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const { token } = await res.json();
    return token?.replace(/^["']|["']$/g, '').trim() || null;
  } catch {
    return null;
  }
}

function StarPicker({
  value,
  onChange,
  size = 'md',
}: {
  value: number;
  onChange: (v: number) => void;
  size?: 'sm' | 'md';
}) {
  const [hover, setHover] = useState(0);
  const sz = size === 'sm' ? 'w-5 h-5' : 'w-8 h-8';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          aria-label={`${n} estrellas`}
        >
          <Star
            className={cn(
              sz,
              'transition-colors',
              n <= (hover || value)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-muted text-muted-foreground',
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function WriteStoreReview({ storeSlug, reviewId, initialValues, onSuccess, onCancel }: Props) {
  const [rating, setRating] = useState(initialValues?.rating ?? 0);
  const [ratingComm, setRatingComm] = useState(initialValues?.rating_communication ?? 0);
  const [ratingShip, setRatingShip] = useState(initialValues?.rating_shipping ?? 0);
  const [ratingPack, setRatingPack] = useState(initialValues?.rating_packaging ?? 0);
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [comment, setComment] = useState(initialValues?.comment ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditing = !!reviewId;

  // ⚠️ NOTA: Asegúrate de definir de dónde viene 'status' si usas NextAuth.
  // Por ahora lo dejamos simulado o puedes usar un estado/hook real aquí:
  // const { status } = useSession();
  const status = 'authenticated';

  if (false) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>
          Debes{' '}
          <a href="/login" className="font-medium underline">
            iniciar sesión
          </a>{' '}
          para dejar una reseña.
        </span>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!rating) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Obtener el token de forma segura (Server-Side proxy)
      const token = await getAuthToken();

      // 2. Realizar la petición inyectando el header de Authorization
      const url = isEditing
        ? `${LARAVEL_API_URL}/stores/reviews/${reviewId}`
        : `${LARAVEL_API_URL}/stores/${storeSlug}/reviews`;

      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          rating,
          rating_communication: ratingComm || undefined,
          rating_shipping: ratingShip || undefined,
          rating_packaging: ratingPack || undefined,
          title: title || undefined,
          comment: comment || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message ?? 'Error al enviar la reseña.');

      onSuccess?.();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Rating principal */}
      <div>
        <p className="text-sm text-muted-foreground mb-2">
          Calificación general *
        </p>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      {/* Sub-ratings */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Comunicación', val: ratingComm, set: setRatingComm },
          { label: 'Envío', val: ratingShip, set: setRatingShip },
          { label: 'Empaque', val: ratingPack, set: setRatingPack },
        ].map(({ label, val, set }) => (
          <div key={label}>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <StarPicker value={val} onChange={set} size="sm" />
          </div>
        ))}
      </div>

      {/* Título */}
      <div>
        <label className="text-sm text-muted-foreground block mb-1">
          Título <span className="text-xs">(opcional)</span>
        </label>
        <input
          type="text"
          maxLength={150}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Resumen breve"
          className="w-full border border-input rounded-md p-2 text-sm bg-background"
        />
      </div>

      {/* Comentario */}
      <div>
        <label className="text-sm text-muted-foreground block mb-1">
          Comentario <span className="text-xs">(opcional)</span>
        </label>
        <textarea
          maxLength={2000}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Describe tu experiencia con la tienda…"
          rows={4}
          className="w-full resize-none border border-input rounded-md p-2 text-sm bg-background"
        />
        <p className="text-xs text-muted-foreground text-right mt-1">
          {comment.length}/2000
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="flex gap-3 justify-end pt-2 border-t border-border">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        )}
        <Button onClick={handleSubmit} disabled={!rating || loading}>
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Enviando…' : (isEditing ? 'Guardar cambios' : 'Enviar reseña')}
        </Button>
      </div>
    </div>
  );
}
