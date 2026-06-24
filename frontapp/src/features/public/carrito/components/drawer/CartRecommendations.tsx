'use client';

/**
 * CartRecommendations.tsx
 * Sección "Complementar tu compra" — fija entre ítems y footer.
 * Flechas a los LADOS del carrusel de tarjetas.
 */

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Loader2, Plus } from 'lucide-react';
import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import { cartApi } from '@/shared/lib/api/cartRepository';

function fmt(n: number) {
  return `S/ ${n.toFixed(2)}`;
}

interface ApiImage {
  src: string;
  medium: string;
}

interface RecommendedProduct {
  id: number;
  name: string;
  price: number;
  regular_price: number;
  discount_percentage: number | null;
  in_stock: boolean;
  stock: number;
  image: string;
}

interface Props {
  cartProductIds: number[];
  onAdded: () => void;
}

export default function CartRecommendations({
  cartProductIds,
  onAdded,
}: Props) {
  const [products, setProducts] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [addedIds, setAddedIds] = useState<number[]>([]);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${LARAVEL_API_URL}/products`);
        const json = await res.json();
        const raw: any[] = json.data ?? json;
        const mapped: RecommendedProduct[] = raw
          .filter((p) => p.status === 'approved')
          .map((p) => ({
            id: Number(p.id),
            name: p.name,
            price: Number(p.price ?? 0),
            regular_price: Number(p.regular_price ?? p.price ?? 0),
            discount_percentage: p.discount_percentage
              ? Number(p.discount_percentage)
              : null,
            in_stock: Boolean(p.in_stock),
            stock: Number(p.stock ?? 0),
            image:
              (p.images as ApiImage[])?.[0]?.medium ??
              (p.images as ApiImage[])?.[0]?.src ??
              '/no-image.png',
          }))
          .filter((p) => !cartProductIds.includes(p.id));
        setProducts(mapped);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartProductIds.join(',')]);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // pequeño delay para que el DOM pinte antes de medir
    setTimeout(checkScroll, 50);
    el.addEventListener('scroll', checkScroll, { passive: true });
    return () => el.removeEventListener('scroll', checkScroll);
  }, [products]);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({
      left: dir === 'left' ? -160 : 160,
      behavior: 'smooth',
    });
  };

  const handleAdd = async (productId: number) => {
    if (addingId !== null) return;
    setAddingId(productId);
    try {
      await cartApi.addItem(productId, 1);
      setAddedIds((prev) => [...prev, productId]);
      onAdded();
      setTimeout(() => {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        setAddedIds((prev) => prev.filter((id) => id !== productId));
      }, 900);
    } catch {
      // silencioso
    } finally {
      setAddingId(null);
    }
  };

  if (!loading && products.length === 0) return null;

  return (
    <div
      className="shrink-0"
      style={{ borderTop: '1px solid var(--pd-border)' }}
    >
      {/* ── Label título ── */}
      <div className="px-5 pt-2 pb-1">
        <p
          className="text-[9px] font-medium tracking-[.1em] uppercase"
          style={{ color: 'var(--pd-ink3)' }}
        >
          Complementar tu compra
        </p>
      </div>

      {/* ── Carrusel con flechas a los lados ── */}
      <div className="relative flex items-center px-1 pb-2">
        {/* Flecha izquierda */}
        <button
          onClick={() => scroll('left')}
          disabled={!canLeft}
          className="shrink-0 w-7 h-7 flex items-center justify-center transition-all disabled:opacity-20 disabled:cursor-not-allowed z-10"
          style={{
            border: '1px solid var(--pd-border)',
            background: 'var(--pd-white)',
            color: 'var(--pd-ink3)',
          }}
          onMouseEnter={(e) => {
            if (!canLeft) return;
            (e.currentTarget as HTMLButtonElement).style.background =
              'var(--pd-bg2)';
            (e.currentTarget as HTMLButtonElement).style.color =
              'var(--pd-ink)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'var(--pd-white)';
            (e.currentTarget as HTMLButtonElement).style.color =
              'var(--pd-ink3)';
          }}
          aria-label="Anterior"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Track scrolleable */}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto flex-1 mx-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Skeleton */}
          {loading &&
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[100px] h-[136px] animate-pulse rounded"
                style={{ background: 'var(--pd-bg2)' }}
              />
            ))}

          {/* Tarjetas */}
          {!loading &&
            products.map((p) => {
              const outOfStock = !p.in_stock || p.stock <= 0;
              const isAdding = addingId === p.id;
              const wasAdded = addedIds.includes(p.id);
              const discount =
                p.discount_percentage ??
                (p.regular_price > p.price
                  ? Math.round(
                      ((p.regular_price - p.price) / p.regular_price) * 100,
                    )
                  : 0);

              return (
                <div
                  key={p.id}
                  className="flex-shrink-0 w-[100px] flex flex-col transition-all duration-200"
                  style={{
                    border: '1px solid var(--pd-border)',
                    background: 'var(--pd-white)',
                    opacity: wasAdded ? 0.45 : 1,
                  }}
                >
                  {/* Imagen */}
                  <div
                    className="relative w-full h-[76px] overflow-hidden"
                    style={{ background: 'var(--pd-bg2)' }}
                  >
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="100px"
                      className="object-contain p-1"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/no-image.png';
                      }}
                    />
                    {discount > 0 && (
                      <span
                        className="absolute top-1 left-1 text-[8px] font-medium px-1 py-0.5 leading-none"
                        style={{
                          background: 'var(--pd-red,#c0392b)',
                          color: '#fff',
                        }}
                      >
                        -{discount}%
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-0.5 p-1 flex-1">
                    <p
                      className="text-[9px] leading-snug line-clamp-2 flex-1"
                      style={{ color: 'var(--pd-ink)' }}
                      title={p.name}
                    >
                      {p.name}
                    </p>

                    <div>
                      <p
                        className="text-[11px] font-medium leading-none"
                        style={{ color: 'var(--pd-accent2,#2d5e42)' }}
                      >
                        {fmt(p.price)}
                      </p>
                      {p.regular_price > p.price && (
                        <p
                          className="text-[8px] line-through leading-none"
                          style={{ color: 'var(--pd-ink3)' }}
                        >
                          {fmt(p.regular_price)}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        !outOfStock && !isAdding && handleAdd(p.id)
                      }
                      disabled={outOfStock || isAdding || wasAdded}
                      className="w-full py-0.5 text-[8px] font-medium tracking-[.06em] uppercase flex items-center justify-center gap-0.5 transition-colors disabled:cursor-not-allowed"
                      style={{
                        background: wasAdded
                          ? 'var(--pd-accent2)'
                          : outOfStock
                            ? 'var(--pd-bg2)'
                            : 'var(--pd-accent)',
                        color: outOfStock
                          ? 'var(--pd-ink3)'
                          : 'var(--pd-accent-fg)',
                        opacity: outOfStock ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (outOfStock || wasAdded) return;
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = 'var(--pd-accent2)';
                      }}
                      onMouseLeave={(e) => {
                        if (outOfStock || wasAdded) return;
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = 'var(--pd-accent)';
                      }}
                    >
                      {isAdding ? (
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      ) : wasAdded ? (
                        '✓ Listo'
                      ) : outOfStock ? (
                        'Agotado'
                      ) : (
                        <>
                          <Plus className="w-2.5 h-2.5" /> Agregar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Flecha derecha */}
        <button
          onClick={() => scroll('right')}
          disabled={!canRight}
          className="shrink-0 w-7 h-7 flex items-center justify-center transition-all disabled:opacity-20 disabled:cursor-not-allowed z-10"
          style={{
            border: '1px solid var(--pd-border)',
            background: 'var(--pd-white)',
            color: 'var(--pd-ink3)',
          }}
          onMouseEnter={(e) => {
            if (!canRight) return;
            (e.currentTarget as HTMLButtonElement).style.background =
              'var(--pd-bg2)';
            (e.currentTarget as HTMLButtonElement).style.color =
              'var(--pd-ink)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'var(--pd-white)';
            (e.currentTarget as HTMLButtonElement).style.color =
              'var(--pd-ink3)';
          }}
          aria-label="Siguiente"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
