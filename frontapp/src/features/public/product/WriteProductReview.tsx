'use client';

import { useState, useEffect } from 'react';
import { Star, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LARAVEL_API_URL } from '@/shared/lib/config/flags';

interface Props {
  productId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ─── Mecanismo de Token Idéntico al Repositorio ─────────────────────────────
let _tokenCache: { value: string | null; ts: number } | null = null;

async function getClientToken(): Promise<string | null> {
  const now = Date.now();
  if (_tokenCache && now - _tokenCache.ts < 30_000) {
    return _tokenCache.value;
  }
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

export function WriteProductReview({ productId, onSuccess, onCancel }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reemplazo de useSession: Estados locales para controlar el auth-flow
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const LABELS = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'];

  // Verificar si el usuario está autenticado al montar el componente
  useEffect(() => {
    async function checkAuth() {
      const token = await getClientToken();
      setIsAuthenticated(!!token);
    }
    checkAuth();
  }, []);

  const handleSubmit = async () => {
    if (!rating) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Recuperamos el token guardado en la cookie HttpOnly a través del Route Handler
      const token = await getClientToken();

      if (!token) {
        throw new Error(
          'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.',
        );
      }

      // 2. Realizamos el envío a Laravel
      const res = await fetch(`${LARAVEL_API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`, // Soluciona el error 401
        },
        body: JSON.stringify({
          product_id: productId,
          rating,
          title: title || undefined,
          comment: comment || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Manejo específico si el backend devuelve un 401 inesperado
        if (res.status === 401) {
          setIsAuthenticated(false);
          throw new Error('Sesión no válida o expirada.');
        }
        throw new Error(data.message ?? 'Error al enviar la reseña.');
      }

      onSuccess?.();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Estado de carga inicial mientras verifica si hay token
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center p-6 text-muted-foreground gap-2 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Verificando sesión...
      </div>
    );
  }

  // Vista si el usuario no tiene token válido (Sustituye status === 'unauthenticated')
  if (!isAuthenticated) {
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

  return (
    <div className="space-y-4">
      {/* Estrellas */}
      <div>
        <p className="text-sm text-muted-foreground mb-2">
          Calificación general *
        </p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(n)}
              aria-label={`${n} estrellas`}
            >
              <Star
                className={cn(
                  'w-8 h-8 transition-colors',
                  n <= (hover || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-muted text-muted-foreground',
                )}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-xs text-medium text-yellow-600 mt-1">
            {LABELS[rating]}
          </p>
        )}
      </div>

      {/* Título */}
      <div>
        <label className="text-sm text-muted-foreground block mb-1">
          Título <span className="text-xs">(opcional)</span>
        </label>
        <input
          type="text"
          maxLength={255}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Resumen breve de tu experiencia"
          className="w-full border border-input rounded-md p-2 text-sm bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          placeholder="Cuéntanos más sobre el producto…"
          rows={4}
          className="w-full resize-none border border-input rounded-md p-2 text-sm bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

      {/* Acciones */}
      <div className="flex gap-3 justify-end pt-2 border-t border-border">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        )}
        <Button onClick={handleSubmit} disabled={!rating || loading}>
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Enviando…' : 'Enviar reseña'}
        </Button>
      </div>
    </div>
  );
}
