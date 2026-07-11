'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CartRecommendations from './CartRecommendations';
import { useCheckoutGuard } from '@/shared/hooks/useCheckoutGuard';
import {
  X,
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  ArrowRight,
  Loader2,
  AlertCircle,
  PackageOpen,
  Tag,
  Clock,
  User,
  Calendar,
} from 'lucide-react';
import { useCarritoStore } from '@/store/carritoStore';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
import { cartApi } from '@/shared/lib/api/cartRepository';
import { serviceRepository } from '@/shared/lib/api/serviRepository';
import type { CartItem, CartResource } from '@/shared/lib/api/cartRepository';
import type { ServiceHold } from '@/shared/lib/api/serviRepository';

function fmt(n: number) {
  return `S/ ${n.toFixed(2)}`;
}
function img(url?: string | null) {
  return url && url.startsWith('http') ? url : '/no-image.png';
}


// ─── CartLineItem ─────────────────────────────────────────────────────────────

interface LineProps {
  item: CartItem;
  loading: boolean;
  onIncrease: (id: number) => void;
  onDecrease: (id: number) => void;
  onRemove: (id: number) => void;
}

function CartLineItem({
  item,
  loading,
  onIncrease,
  onDecrease,
  onRemove,
}: LineProps) {
  const maxStock = item.product.stock ?? 99;
  const canIncrease = item.quantity < maxStock;
  const discount =
    item.product.regular_price &&
    item.product.regular_price > item.product.price
      ? Math.round(
          ((item.product.regular_price - item.product.price) /
            item.product.regular_price) *
            100,
        )
      : 0;

  return (
    <div
      className="flex gap-3 py-4 last:border-0 group relative"
      style={{
        borderBottom: '1px solid var(--pd-border2, rgba(15,14,12,0.05))',
      }}
    >
      {/* Imagen */}
      <Link
        href={`/producto/${item.product.slug}`}
        className="relative w-[68px] h-[68px] flex-shrink-0 overflow-hidden hover:opacity-80 transition-opacity"
        style={{
          background: 'var(--pd-bg2,#f2f0ea)',
          border: '1px solid var(--pd-border)',
        }}
      >
        <Image
          src={img(item.product.image)}
          alt={item.product.name}
          fill
          sizes="68px"
          className="object-contain p-1"
        />
        {discount > 0 && (
          <span
            className="absolute bottom-1 left-1 px-1 py-0.5 text-[8px] font-medium leading-none"
            style={{ background: 'var(--pd-red,#c0392b)', color: '#fff' }}
          >
            -{discount}%
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-1 pr-5">
        <Link
          href={`/producto/${item.product.slug}`}
          className="text-[12px] font-medium line-clamp-2 leading-snug transition-colors"
          style={{ color: 'var(--pd-ink,#0f0e0c)' }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = 'var(--pd-accent2)')
          }
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--pd-ink)')}
        >
          {item.product.name}
        </Link>

        <div className="flex items-baseline gap-1.5">
          <span
            className="text-[12px] font-medium"
            style={{ color: 'var(--pd-accent2,#2d5e42)' }}
          >
            {fmt(item.unitPrice)}
          </span>
          {item.product.regular_price &&
            item.product.regular_price > item.unitPrice && (
              <span
                className="text-[10px] line-through"
                style={{ color: 'var(--pd-ink3,#7a7970)' }}
              >
                {fmt(item.product.regular_price)}
              </span>
            )}
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div
            className="flex items-center overflow-hidden"
            style={{ border: '1px solid var(--pd-border)' }}
          >
            <button
              onClick={() => onDecrease(item.productId)}
              disabled={loading || item.quantity <= 1}
              className="w-7 h-7 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ color: 'var(--pd-ink2)' }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = 'var(--pd-bg2)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'transparent')
              }
              aria-label="Reducir"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span
              className="w-7 h-7 flex items-center justify-center text-[12px] font-medium"
              style={{
                color: 'var(--pd-ink)',
                borderLeft: '1px solid var(--pd-border)',
                borderRight: '1px solid var(--pd-border)',
              }}
            >
              {loading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                item.quantity
              )}
            </span>
            <button
              onClick={() => onIncrease(item.productId)}
              disabled={loading || !canIncrease}
              className="w-7 h-7 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ color: 'var(--pd-ink2)' }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = 'var(--pd-bg2)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'transparent')
              }
              aria-label="Aumentar"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <span
            className="text-[12px] font-medium"
            style={{ color: 'var(--pd-ink)' }}
          >
            {fmt(item.lineTotal)}
          </span>
        </div>

        {!canIncrease && (
          <p
            className="text-[10px] flex items-center gap-1"
            style={{ color: '#d97706' }}
          >
            <AlertCircle className="w-3 h-3" />
            Máximo disponible: {maxStock}
          </p>
        )}
      </div>

      {/* Eliminar */}
      <button
        onClick={() => onRemove(item.productId)}
        disabled={loading}
        className="absolute top-4 right-0 p-1.5 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:cursor-not-allowed"
        style={{ color: 'var(--pd-ink3)' }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--pd-red)';
          (e.currentTarget as HTMLButtonElement).style.background =
            'color-mix(in srgb, var(--pd-red) 8%, transparent)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--pd-ink3)';
          (e.currentTarget as HTMLButtonElement).style.background =
            'transparent';
        }}
        aria-label="Eliminar"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Helper: get cart_token from sessionStorage ───────────────────────────────

function getCartToken(): string {
  if (typeof window === 'undefined') return '';
  let sid = sessionStorage.getItem('cart_session_id');
  if (!sid) {
    sid = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem('cart_session_id', sid);
  }
  return sid;
}

// ─── ServiceHoldLineItem ───────────────────────────────────────────────────────

function ServiceHoldLineItem({
  hold,
  onRemove,
  removing,
}: {
  hold: ServiceHold;
  onRemove: (id: number) => void;
  removing: boolean;
}) {
  const [remaining, setRemaining] = useState(hold.seconds_remaining);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setRemaining(Math.max(0, Math.round((new Date(hold.expires_at).getTime() - Date.now()) / 1000)));
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hold.expires_at]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const expired = remaining <= 0;

  const dateStr = new Date(hold.appointment_date + 'T00:00:00').toLocaleDateString('es-PE', {
    day: 'numeric', month: 'short',
  });

  function holdImg(url?: string | null) {
    if (!url) return '/no-image.png';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return '/no-image.png';
  }

  return (
    <div className="flex gap-3 py-4 last:border-0 group relative" style={{ borderBottom: '1px solid var(--pd-border2, rgba(15,14,12,0.05))' }}>
      {/* Image */}
      <div className="relative w-[68px] h-[68px] flex-shrink-0 overflow-hidden" style={{ background: 'var(--pd-bg2,#f2f0ea)', border: '1px solid var(--pd-border)' }}>
        <Image
          src={holdImg(hold.service_image)}
          alt={hold.service_name}
          fill
          sizes="68px"
          className="object-contain p-1"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-1 pr-5">
        <p className="text-[12px] font-medium leading-snug line-clamp-2" style={{ color: 'var(--pd-ink,#0f0e0c)' }}>
          {hold.service_name}
        </p>
        <div className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--pd-ink3,#7a7970)' }}>
          <User className="w-3 h-3" />
          <span>{hold.specialist_name}</span>
        </div>
        <p className="text-[10px]" style={{ color: 'var(--pd-ink3,#7a7970)' }}>
          {dateStr} — {hold.start_time}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-[12px] font-medium" style={{ color: 'var(--pd-accent2,#2d5e42)' }}>
            S/ {Number(hold.service_price).toFixed(2)}
          </span>
          <div className={`flex items-center gap-1 text-[10px] font-semibold ${expired ? 'text-red-500' : 'text-amber-600'}`}>
            <Clock className="w-3 h-3" />
            {expired ? 'Por vencer' : `${minutes}:${String(seconds).padStart(2, '0')}`}
          </div>
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(hold.id)}
        disabled={removing || expired}
        className="absolute top-4 right-0 p-1.5 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:cursor-not-allowed"
        style={{ color: 'var(--pd-ink3)' }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--pd-red)';
          (e.currentTarget as HTMLButtonElement).style.background = 'color-mix(in srgb, var(--pd-red) 8%, transparent)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--pd-ink3)';
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        }}
        aria-label="Eliminar"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── CartDrawer ───────────────────────────────────────────────────────────────

export default function CartDrawer() {
  const { ui, closeCart, setServiceHoldCount } = useCarritoStore();
  const [cart, setCart] = useState<CartResource | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [mutatingId, setMutatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Service holds
  const [serviceHolds, setServiceHolds] = useState<ServiceHold[]>([]);
  const [holdsLoading, setHoldsLoading] = useState(false);
  const [removingHoldId, setRemovingHoldId] = useState<number | null>(null);

  const { goToCheckout } = useCheckoutGuard();

  const drawerRef = useFocusTrap<HTMLElement>(ui.cartOpen, closeCart);

  const loadCart = useCallback(async () => {
    setFetchLoading(true);
    setError(null);
    try {
      setCart(await cartApi.getCart());
    } catch {
      setError('No se pudo cargar el carrito. Intenta de nuevo.');
    } finally {
      setFetchLoading(false);
    }
  }, []);

  const loadHolds = useCallback(async () => {
    const token = getCartToken();
    if (!token) return;
    setHoldsLoading(true);
    try {
      const res = await serviceRepository.getServiceHolds(token);
      const holds = res.holds ?? [];
      setServiceHolds(holds);
      setServiceHoldCount(holds.length);
    } catch {
      // silently fail — holds are optional
    } finally {
      setHoldsLoading(false);
    }
  }, [setServiceHoldCount]);

  useEffect(() => {
    if (ui.cartOpen) {
      loadCart();
      loadHolds();
    }
  }, [ui.cartOpen, loadCart, loadHolds]);

  const handleRemoveHold = async (holdId: number) => {
    setRemovingHoldId(holdId);
    try {
      await serviceRepository.removeServiceHold(holdId, getCartToken());
      setServiceHolds((prev) => {
        const updated = prev.filter((h) => h.id !== holdId);
        setServiceHoldCount(updated.length);
        return updated;
      });
    } catch {
      setError('Error al eliminar el servicio del carrito.');
    } finally {
      setRemovingHoldId(null);
    }
  };

  useEffect(() => {
    document.body.style.overflow = ui.cartOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [ui.cartOpen]);

  const handleIncrease = async (productId: number) => {
    const item = cart?.items.find((i) => i.productId === productId);
    if (!item) return;
    setMutatingId(productId);
    setError(null);
    try {
      setCart(await cartApi.updateItem(productId, item.quantity + 1));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al actualizar.');
    } finally {
      setMutatingId(null);
    }
  };

  const handleDecrease = async (productId: number) => {
    const item = cart?.items.find((i) => i.productId === productId);
    if (!item) return;
    setMutatingId(productId);
    setError(null);
    try {
      setCart(
        item.quantity <= 1
          ? await cartApi.removeItem(productId)
          : await cartApi.updateItem(productId, item.quantity - 1),
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al actualizar.');
    } finally {
      setMutatingId(null);
    }
  };

  const handleRemove = async (productId: number) => {
    setMutatingId(productId);
    setError(null);
    try {
      setCart(await cartApi.removeItem(productId));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al eliminar.');
    } finally {
      setMutatingId(null);
    }
  };

  const handleClear = () => {
    if ((cart?.items.length ?? 0) === 0) return;
    setShowClearConfirm(true);
  };

  const confirmedClear = async () => {
    setShowClearConfirm(false);
    setFetchLoading(true);
    setError(null);
    try {
      if (typeof cartApi.clearCart === 'function') {
        setCart(await cartApi.clearCart());
      } else {
        let updated: CartResource | null = null;
        for (const item of cart!.items) {
          updated = await cartApi.removeItem(item.productId);
        }
        if (updated) setCart(updated);
        else
          setCart((prev) =>
            prev
              ? { ...prev, items: [], itemCount: 0, subtotal: 0, total: 0 }
              : null,
          );
      }
    } catch {
      setError('Error al vaciar el carrito.');
    } finally {
      setFetchLoading(false);
    }
  };

  const items = cart?.items ?? [];
  const totalItems = (cart?.itemCount ?? 0) + serviceHolds.length;
  const isEmpty = !fetchLoading && items.length === 0 && serviceHolds.length === 0;
  const serviceTotal = serviceHolds.reduce((sum, h) => sum + (h.service_price ?? 0), 0);
  const combinedTotal = (cart?.total ?? 0) + serviceTotal;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          ui.cartOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer — flex column, altura fija = pantalla */}
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        tabIndex={-1}
        className={`fixed inset-y-0 right-0 z-50 flex flex-col w-full max-w-[400px] shadow-2xl transition-transform duration-300 ease-in-out ${
          ui.cartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ background: 'var(--pd-white,#ffffff)' }}
      >
        {/* ── 1. HEADER — shrink-0 ── */}
        <div
          className="shrink-0 flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--pd-border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 flex items-center justify-center"
              style={{
                background: 'var(--pd-accent)',
                color: 'var(--pd-accent-fg)',
              }}
            >
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h2
                className="font-medium text-[14px] leading-none"
                style={{ color: 'var(--pd-ink)' }}
              >
                Mi carrito
              </h2>
              <p
                className="text-[11px] mt-0.5 tracking-[.04em]"
                style={{ color: 'var(--pd-ink3)' }}
              >
                {fetchLoading
                  ? 'Cargando…'
                  : `${totalItems} ${totalItems === 1 ? 'artículo' : 'artículos'}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={handleClear}
                disabled={fetchLoading}
                className="text-[11px] tracking-[.06em] uppercase px-2.5 py-1.5 transition-all disabled:opacity-40"
                style={{
                  color: 'var(--pd-ink3)',
                  border: '1px solid var(--pd-border)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color =
                    'var(--pd-red)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    'var(--pd-red)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color =
                    'var(--pd-ink3)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    'var(--pd-border)';
                }}
              >
                Vaciar
              </button>
            )}
            <button
              onClick={closeCart}
              className="w-8 h-8 flex items-center justify-center transition-colors"
              style={{
                color: 'var(--pd-ink3)',
                border: '1px solid var(--pd-border)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  'var(--pd-bg2)';
                (e.currentTarget as HTMLButtonElement).style.color =
                  'var(--pd-ink)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  'transparent';
                (e.currentTarget as HTMLButtonElement).style.color =
                  'var(--pd-ink3)';
              }}
              aria-label="Cerrar carrito"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Error banner — shrink-0 ── */}
        {error && (
          <div
            className="shrink-0 mx-4 mt-3 flex items-center gap-2 px-3 py-2 text-[12px]"
            style={{
              color: 'var(--pd-red)',
              background: 'color-mix(in srgb, var(--pd-red) 8%, transparent)',
              border:
                '1px solid color-mix(in srgb, var(--pd-red) 25%, transparent)',
            }}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              style={{ color: 'var(--pd-ink3)' }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ── 2. BODY SCROLL — flex-1 + overflow-y-auto ── */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Loading */}
          {fetchLoading && (
            <div
              className="flex flex-col items-center justify-center h-full gap-3"
              style={{ color: 'var(--pd-ink3)' }}
            >
              <Loader2 className="w-7 h-7 animate-spin" />
              <p className="text-[13px]">Cargando tu carrito…</p>
            </div>
          )}

          {/* Vacío */}
          {isEmpty && !error && (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-16">
              <div
                className="w-16 h-16 flex items-center justify-center"
                style={{ background: 'var(--pd-bg2)' }}
              >
                <PackageOpen
                  className="w-8 h-8"
                  style={{ color: 'var(--pd-ink3)' }}
                />
              </div>
              <div className="text-center">
                <p
                  className="font-medium text-[14px] mb-1"
                  style={{ color: 'var(--pd-ink)' }}
                >
                  Tu carrito está vacío
                </p>
                <p
                  className="text-[12px] font-light"
                  style={{ color: 'var(--pd-ink3)' }}
                >
                  Agrega productos para continuar
                </p>
              </div>
              <button
                onClick={closeCart}
                className="mt-2 px-5 py-2.5 text-[12px] font-medium tracking-[.08em] uppercase transition-colors"
                style={{
                  background: 'var(--pd-accent)',
                  color: 'var(--pd-accent-fg)',
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
                Explorar productos
              </button>
            </div>
          )}

          {/* ── Lista de ítems (productos) ── */}
          {!fetchLoading && items.length > 0 && (
            <div className="px-5 pt-2">
              {items.map((item) => (
                <CartLineItem
                  key={item.id}
                  item={item}
                  loading={mutatingId === item.productId}
                  onIncrease={handleIncrease}
                  onDecrease={handleDecrease}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}

          {/* ── Service Holds ── */}
          {!fetchLoading && serviceHolds.length > 0 && (
            <div className="px-5 pt-2">
              <div
                className="flex items-center gap-2 py-2 text-[11px] font-bold uppercase tracking-wide"
                style={{ color: 'var(--pd-ink3,#7a7970)' }}
              >
                <Calendar className="w-3.5 h-3.5" />
                Servicios ({serviceHolds.length})
              </div>
              {serviceHolds.map((hold) => (
                <ServiceHoldLineItem
                  key={hold.id}
                  hold={hold}
                  onRemove={handleRemoveHold}
                  removing={removingHoldId === hold.id}
                />
              ))}
            </div>
          )}
          {holdsLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--pd-ink3)' }} />
            </div>
          )}

        </div>
        {/* ── FIN BODY SCROLL ── */}

        {/* ── 3. RECOMENDACIONES — shrink-0, FUERA del scroll ── */}
        {!fetchLoading && (items.length > 0 || serviceHolds.length > 0) && (
          <CartRecommendations
            cartProductIds={items.map((i) => i.productId)}
            onAdded={loadCart}
          />
        )}

        {/* ── 4. FOOTER — shrink-0 ── */}
        {!fetchLoading && !isEmpty && (
          <div
            className="shrink-0 px-5 py-4 space-y-3"
            style={{ borderTop: '1px solid var(--pd-border)' }}
          >
            {/* Cupón */}
            <div
              className="flex items-center gap-2 px-3 py-2.5 text-[12px] cursor-pointer transition-colors"
              style={{
                border: '1px dashed var(--pd-border)',
                color: 'var(--pd-ink3)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor =
                  'var(--pd-accent2)';
                (e.currentTarget as HTMLDivElement).style.color =
                  'var(--pd-accent2)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor =
                  'var(--pd-border)';
                (e.currentTarget as HTMLDivElement).style.color =
                  'var(--pd-ink3)';
              }}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Agregar código de descuento</span>
            </div>

            {/* Resumen */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[13px]">
                <span style={{ color: 'var(--pd-ink3)' }}>Subtotal</span>
                <span style={{ color: 'var(--pd-ink2)' }}>
                  {fmt(cart?.subtotal ?? 0)}
                </span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span style={{ color: 'var(--pd-ink3)' }}>Envío</span>
                <span
                  className="font-medium text-[12px] tracking-[.04em]"
                  style={{ color: 'var(--pd-accent2)' }}
                >
                  Calcular en checkout
                </span>
              </div>
              <div
                className="flex justify-between pt-2"
                style={{ borderTop: '1px solid var(--pd-border)' }}
              >
                <span
                  className="text-[13px] font-medium tracking-[.06em] uppercase"
                  style={{ color: 'var(--pd-ink2)' }}
                >
                  Total
                </span>
                <span
                  className="font-['DM_Serif_Display',Georgia,serif] text-[22px] leading-none"
                  style={{ color: 'var(--pd-ink)' }}
                >
                  {fmt(combinedTotal)}
                </span>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={async () => {
                closeCart();
                await goToCheckout();
              }}
              className="flex items-center justify-center gap-2 w-full py-3.5 text-[12px] font-medium tracking-[.1em] uppercase transition-colors"
              style={{
                background: 'var(--pd-accent)',
                color: 'var(--pd-accent-fg)',
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
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>
        )}

        {/* ── Confirmación "Vaciar carrito" ── */}
        {showClearConfirm && (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)' }}
          >
            <div
              className="w-full max-w-[280px] p-5 flex flex-col items-center text-center gap-4"
              style={{ background: 'var(--pd-white,#fff)' }}
            >
              <div
                className="w-10 h-10 flex items-center justify-center"
                style={{ background: 'color-mix(in srgb, var(--pd-red) 10%, transparent)' }}
              >
                <Trash2 className="w-5 h-5" style={{ color: 'var(--pd-red)' }} />
              </div>
              <p className="text-[14px] font-medium leading-snug" style={{ color: 'var(--pd-ink)' }}>
                ¿Vaciar todo el carrito?
              </p>
              <p className="text-[12px]" style={{ color: 'var(--pd-ink3)' }}>
                Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2.5 text-[11px] font-medium tracking-[.06em] uppercase transition-colors"
                  style={{
                    color: 'var(--pd-ink2)',
                    border: '1px solid var(--pd-border)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--pd-bg2)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmedClear}
                  className="flex-1 py-2.5 text-[11px] font-medium tracking-[.06em] uppercase transition-colors"
                  style={{
                    background: 'var(--pd-red)',
                    color: '#fff',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.opacity = '0.85';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.opacity = '1';
                  }}
                >
                  Vaciar
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
