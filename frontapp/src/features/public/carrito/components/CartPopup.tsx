'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import Image from 'next/image';
import { useCheckoutGuard } from '@/shared/hooks/useCheckoutGuard';
import Link from 'next/link';
import {
  X,
  ShoppingCart,
  ArrowRight,
  Check,
  ChevronRight,
  Package,
  Loader2,
  Calendar,
} from 'lucide-react';
import { useCarritoStore } from '@/store/carritoStore';
import { cartApi } from '@/shared/lib/api/cartRepository';
import type { CartResource } from '@/shared/lib/api/cartRepository';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return `S/ ${n.toFixed(2)}`;
}

function img(url?: string | null) {
  return url && url.startsWith('http') ? url : '/no-image.png';
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const AUTO_CLOSE_MS = 4000;

// ─── Componente ───────────────────────────────────────────────────────────────

export default function CartPopup() {
  const popupOpen = useCarritoStore((s) => s.ui.popupOpen);
  const closePopup = useCarritoStore((s) => s.closePopup);
  const openCart = useCarritoStore((s) => s.openCart);
  const lastAddedService = useCarritoStore((s) => s.lastAddedService);
  const setLastAddedService = useCarritoStore((s) => s.setLastAddedService);
  const lastAddedProductId = useCarritoStore((s) => s.lastAddedProductId);

  const { goToCheckout } = useCheckoutGuard();

  const [cart, setCart] = useState<CartResource | null>(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClose = useCallback(() => {
    closePopup();
    setLastAddedService(null);
  }, [closePopup, setLastAddedService]);

  // Cargar carrito cuando se abre (solo para el flujo de productos)
  useEffect(() => {
    if (!popupOpen || lastAddedService) return;
    setLoading(true);
    cartApi
      .getCart()
      .then(setCart)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [popupOpen, lastAddedService]);

  // Auto-cerrar
  const startTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(handleClose, AUTO_CLOSE_MS);
  }, [handleClose]);

  useEffect(() => {
    if (popupOpen) startTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [popupOpen, startTimer]);

  const pauseTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };
  const resumeTimer = () => startTimer();

  // Datos del carrito
  const lastItem =
    cart?.items?.find((item) => item.productId === lastAddedProductId) ??
    cart?.items?.[0] ??
    null;
  const itemCount = cart?.itemCount ?? 0;
  const total = cart?.total ?? 0;

  // No montar nada si está cerrado
  if (!popupOpen) return null;

  return (
    <>
      {/* Backdrop invisible — click cierra */}
      <div
        className="fixed inset-0 z-[60]"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Popup */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={lastAddedService ? 'Servicio agregado al carrito' : 'Producto agregado al carrito'}
        onMouseEnter={pauseTimer}
        onMouseLeave={resumeTimer}
        className="
          fixed z-[70]
          bottom-6 right-6
          w-[340px]
          animate-in slide-in-from-bottom-3 fade-in duration-200
        "
        style={{
          background: 'var(--pd-white, #ffffff)',
          border: '1px solid var(--pd-border, rgba(15,14,12,0.10))',
          boxShadow:
            '0 24px 64px rgba(0,0,0,0.13), 0 4px 16px rgba(0,0,0,0.07)',
        }}
      >
        {/* ── Barra de progreso auto-close ── */}
        <div style={{ height: 2, background: 'var(--pd-bg2, #f2f0ea)' }}>
          <div
            style={{
              height: '100%',
              background: 'var(--pd-accent2, #2d5e42)',
              animation: `pd-shrink ${AUTO_CLOSE_MS}ms linear forwards`,
            }}
          />
        </div>

        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{
            borderBottom: '1px solid var(--pd-border, rgba(15,14,12,0.08))',
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: 'var(--pd-accent, #1a3a2a)',
                color: 'var(--pd-accent-fg, #e8f5ee)',
              }}
            >
              <Check className="w-3 h-3" />
            </span>
            <span
              className="text-[11px] font-medium tracking-[.08em] uppercase"
              style={{ color: 'var(--pd-ink2, #3a3935)' }}
            >
              {lastAddedService ? 'Servicio agregado' : 'Producto agregado'}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="w-6 h-6 flex items-center justify-center transition-colors"
            style={{ color: 'var(--pd-ink3, #7a7970)' }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color =
                'var(--pd-ink)')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color =
                'var(--pd-ink3)')
            }
            aria-label="Cerrar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── Último ítem ── */}
        <div className="px-4 pt-4 pb-3">
          {lastAddedService ? (
            <div className="flex items-start gap-3">
              {/* Imagen / ícono */}
              <div
                className="relative w-14 h-14 flex-shrink-0 overflow-hidden flex items-center justify-center"
                style={{
                  background: 'var(--pd-bg2)',
                  border: '1px solid var(--pd-border)',
                }}
              >
                {lastAddedService.image ? (
                  <Image
                    src={img(lastAddedService.image)}
                    alt={lastAddedService.name}
                    fill
                    sizes="56px"
                    className="object-contain p-1"
                  />
                ) : (
                  <Calendar
                    className="w-6 h-6"
                    style={{ color: 'var(--pd-ink3)' }}
                  />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-[13px] font-medium leading-snug line-clamp-2"
                  style={{ color: 'var(--pd-ink, #0f0e0c)' }}
                >
                  {lastAddedService.name}
                </p>
                {lastAddedService.specialistName && (
                  <p
                    className="text-[11px] mt-0.5"
                    style={{ color: 'var(--pd-ink3)' }}
                  >
                    con {lastAddedService.specialistName}
                  </p>
                )}
                <span
                  className="text-[12px] font-medium block mt-1"
                  style={{ color: 'var(--pd-accent2, #2d5e42)' }}
                >
                  {fmt(lastAddedService.price)}
                </span>
              </div>
            </div>
          ) : loading ? (
            /* Skeleton */
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 flex-shrink-0 animate-pulse"
                style={{ background: 'var(--pd-bg2)' }}
              />
              <div className="flex-1 space-y-2">
                <div
                  className="h-2.5 rounded animate-pulse"
                  style={{ background: 'var(--pd-bg3)', width: '72%' }}
                />
                <div
                  className="h-2.5 rounded animate-pulse"
                  style={{ background: 'var(--pd-bg3)', width: '40%' }}
                />
              </div>
            </div>
          ) : lastItem ? (
            <div className="flex items-start gap-3">
              {/* Imagen */}
              <div
                className="relative w-14 h-14 flex-shrink-0 overflow-hidden"
                style={{
                  background: 'var(--pd-bg2)',
                  border: '1px solid var(--pd-border)',
                }}
              >
                <Image
                  src={img(lastItem.product.image)}
                  alt={lastItem.product.name}
                  fill
                  sizes="56px"
                  className="object-contain p-1"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-[13px] font-medium leading-snug line-clamp-2"
                  style={{ color: 'var(--pd-ink, #0f0e0c)' }}
                >
                  {lastItem.product.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-[12px] font-medium"
                    style={{ color: 'var(--pd-accent2, #2d5e42)' }}
                  >
                    {fmt(lastItem.unitPrice)}
                  </span>
                  <span
                    className="text-[11px]"
                    style={{ color: 'var(--pd-ink3)' }}
                  >
                    × {lastItem.quantity}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Fallback sin datos */
            <div
              className="flex items-center gap-2 py-1"
              style={{ color: 'var(--pd-ink3)' }}
            >
              <Package className="w-4 h-4" />
              <span className="text-[13px]">Producto en tu carrito</span>
            </div>
          )}
        </div>

        {/* ── Resumen total ── */}
        {!lastAddedService && !loading && itemCount > 0 && (
          <div
            className="mx-4 mb-4 px-3 py-2 flex items-center justify-between"
            style={{
              background: 'var(--pd-bg2, #f2f0ea)',
              border: '1px solid var(--pd-border)',
            }}
          >
            <div className="flex items-center gap-1.5">
              <ShoppingCart
                className="w-3 h-3"
                style={{ color: 'var(--pd-ink3)' }}
              />
              <span
                className="text-[11px] tracking-[.04em]"
                style={{ color: 'var(--pd-ink3)' }}
              >
                {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}
              </span>
            </div>
            <span
              className="text-[15px] font-['DM_Serif_Display',Georgia,serif]"
              style={{ color: 'var(--pd-ink)' }}
            >
              {fmt(total)}
            </span>
          </div>
        )}

        {/* ── CTAs ── */}
        <div
          className={`px-4 pb-3 grid gap-2 ${lastAddedService ? 'grid-cols-1' : 'grid-cols-2'}`}
        >
          {/* Ver carrito (solo flujo de productos) */}
          {!lastAddedService && (
            <button
              onClick={() => {
                closePopup();
                openCart();
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium tracking-[.08em] uppercase transition-colors duration-150"
              style={{
                border: '1px solid var(--pd-border)',
                color: 'var(--pd-ink2)',
                background: 'transparent',
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background =
                  'var(--pd-bg2)')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background =
                  'transparent')
              }
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Ver carrito
            </button>
          )}

          {/* Ir a pagar */}
          <button
            onClick={async () => {
              handleClose();
              await goToCheckout();
            }}
            className="flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium tracking-[.08em] uppercase transition-colors duration-150"
            style={{
              background: 'var(--pd-accent, #1a3a2a)',
              color: 'var(--pd-accent-fg, #e8f5ee)',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                'var(--pd-accent2)')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                'var(--pd-accent)')
            }
          >
            Ir a pagar
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── Seguir comprando ── */}
        <button
          onClick={handleClose}
          className="w-full pb-3 text-[11px] flex items-center justify-center gap-0.5 transition-colors"
          style={{ color: 'var(--pd-ink3)' }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color =
              'var(--pd-ink2)')
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color =
              'var(--pd-ink3)')
          }
        >
          Seguir comprando
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Keyframe barra de progreso */}
      <style>{`
        @keyframes pd-shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </>
  );
}
