"use client";

import { useEffect, useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Loader2,
  AlertCircle,
  PackageOpen,
  ArrowRight,
  Minus,
  Plus,
  Trash2,
  Tag,
  ChevronLeft,
  Trash,
} from "lucide-react";
import { cartApi } from "@/shared/lib/api/cartRepository";
import type { CartResource, CartItem } from "@/shared/lib/api/cartRepository";
import { useCarritoStore } from "@/store/carritoStore";

function formatPrice(n: number): string {
  return `S/ ${n.toFixed(2)}`;
}

function resolveImg(url?: string | null): string {
  if (!url) return "/no-image.png";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return url;
  return "/no-image.png";
}

interface CartLineItemProps {
  item: CartItem;
  loading: boolean;
  onIncrease: (productId: number) => void;
  onDecrease: (productId: number) => void;
  onRemove: (productId: number) => void;
}

function CartLineItem({
  item,
  loading,
  onIncrease,
  onDecrease,
  onRemove,
}: CartLineItemProps) {
  const maxStock = item.product.stock ?? 99;
  const canIncrease = item.quantity < maxStock;
  const discount =
    item.product.regular_price && item.product.regular_price > item.product.price
      ? Math.round(
          ((item.product.regular_price - item.product.price) /
            item.product.regular_price) *
            100,
        )
      : 0;

  return (
    <div className="flex gap-5 py-6 border-b border-gray-100 dark:border-[var(--border-subtle)] last:border-0 group/item relative">
      {/* Imagen */}
      <Link
        href={`/producto/${item.product.slug}`}
        className="relative w-28 h-28 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-50 dark:bg-[var(--bg-primary)] border border-gray-100 dark:border-[var(--border-subtle)] hover:opacity-90 transition-opacity shadow-sm"
      >
        <Image
          src={resolveImg(item.product.image)}
          alt={item.product.name}
          fill
          sizes="112px"
          className="object-cover"
        />
        {discount > 0 && (
          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-lg leading-none shadow-sm">
            -{discount}%
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/producto/${item.product.slug}`}
            className="text-sm font-semibold text-gray-800 dark:text-[var(--text-primary)] line-clamp-2 leading-tight hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors pr-2"
          >
            {item.product.name}
          </Link>
          <button
            onClick={() => onRemove(item.productId)}
            disabled={loading}
            className="p-2 rounded-xl text-gray-400 dark:text-[var(--text-muted)] hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0 disabled:cursor-not-allowed opacity-0 group-hover/item:opacity-100"
            aria-label="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Precio unitario */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">
            {formatPrice(item.unitPrice)}
          </span>
          {item.product.regular_price &&
            item.product.regular_price > item.unitPrice && (
              <span className="text-xs text-gray-400 dark:text-[var(--text-muted)] line-through">
                {formatPrice(item.product.regular_price)}
              </span>
            )}
        </div>

        {/* Controles cantidad + subtotal */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center border border-gray-200 dark:border-[var(--border-subtle)] rounded-xl overflow-hidden bg-gray-50 dark:bg-[var(--bg-muted)]">
            <button
              onClick={() => onDecrease(item.productId)}
              disabled={loading || item.quantity <= 1}
              className="w-9 h-9 flex items-center justify-center text-gray-500 dark:text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-[var(--bg-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Reducir"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 h-9 flex items-center justify-center text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] border-x border-gray-200 dark:border-[var(--border-subtle)]">
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                item.quantity
              )}
            </span>
            <button
              onClick={() => onIncrease(item.productId)}
              disabled={loading || !canIncrease}
              className="w-9 h-9 flex items-center justify-center text-gray-500 dark:text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-[var(--bg-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Aumentar"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-right">
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              {formatPrice(item.lineTotal)}
            </span>
          </div>
        </div>

        {/* Stock warning */}
        {!canIncrease && (
          <p className="text-[10px] text-amber-500 dark:text-amber-400 flex items-center gap-1 mt-0.5">
            <AlertCircle className="w-3 h-3" />
            Máximo disponible: {maxStock}
          </p>
        )}
      </div>
    </div>
  );
}

export default function CarritoPage() {
  const openCart = useCarritoStore((s) => s.openCart);
  const [cart, setCart] = useState<CartResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [mutatingId, setMutatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cartApi.getCart();
      setCart(data);
    } catch {
      setError("No se pudo cargar el carrito. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleIncrease = async (productId: number) => {
    const item = cart?.items.find((i) => i.productId === productId);
    if (!item) return;
    setMutatingId(productId);
    setError(null);
    try {
      const updated = await cartApi.updateItem(productId, item.quantity + 1);
      setCart(updated);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al actualizar.");
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
      if (item.quantity <= 1) {
        const updated = await cartApi.removeItem(productId);
        setCart(updated);
      } else {
        const updated = await cartApi.updateItem(productId, item.quantity - 1);
        setCart(updated);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al actualizar.");
    } finally {
      setMutatingId(null);
    }
  };

  const handleRemove = async (productId: number) => {
    setMutatingId(productId);
    setError(null);
    try {
      const updated = await cartApi.removeItem(productId);
      setCart(updated);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al eliminar.");
    } finally {
      setMutatingId(null);
    }
  };

  const handleClear = async () => {
    setError(null);
    try {
      const updated = await cartApi.clearCart();
      setCart(updated);
    } catch {
      setError("No se pudo vaciar el carrito.");
    }
  };

  const items = cart?.items ?? [];
  const isEmpty = !loading && items.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[var(--bg-primary)]">
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* ── Back link ── */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-400 dark:text-[var(--text-muted)] hover:text-gray-600 dark:hover:text-[var(--text-primary)] transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Seguir comprando
        </Link>

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 dark:text-[var(--text-primary)]">
                Mi Carrito
              </h1>
              <p className="text-sm text-gray-400 dark:text-[var(--text-muted)]">
                {loading
                  ? "Cargando…"
                  : `${cart?.itemCount ?? 0} ${cart?.itemCount === 1 ? "artículo" : "artículos"}`}
              </p>
            </div>
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 dark:border-[var(--border-subtle)] text-sm text-gray-500 dark:text-[var(--text-muted)] hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)] hover:text-red-500 transition-colors"
              >
                <Trash className="w-3.5 h-3.5" />
                Vaciar
              </button>
              <button
                onClick={openCart}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-sky-500 dark:bg-[var(--brand-green)] text-white font-medium text-sm hover:bg-sky-600 dark:hover:bg-[var(--brand-green-hover)] transition shadow-lg shadow-sky-200/50 dark:shadow-emerald-900/30"
              >
                <ShoppingCart className="w-4 h-4" />
                Seguir comprando
              </button>
            </div>
          )}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-2xl text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
            <button
              className="ml-auto text-red-400 hover:text-red-600"
              onClick={() => setError(null)}
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Loading with skeletons ── */}
        {loading && (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-[var(--bg-card)] rounded-3xl border border-gray-100 dark:border-[var(--border-subtle)] p-6 shadow-sm dark:shadow-none">
                <div className="flex gap-5 animate-pulse">
                  <div className="w-28 h-28 rounded-2xl bg-gray-200 dark:bg-[var(--bg-muted)] flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-[var(--bg-muted)] rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-[var(--bg-muted)] rounded w-1/4" />
                    <div className="flex justify-between items-end mt-auto pt-2">
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-[var(--bg-muted)]" />
                        <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-[var(--bg-muted)]" />
                        <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-[var(--bg-muted)]" />
                      </div>
                      <div className="h-4 bg-gray-200 dark:bg-[var(--bg-muted)] rounded w-16" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Empty ── */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="w-32 h-32 rounded-[2rem] bg-gray-100 dark:bg-[var(--bg-muted)] flex items-center justify-center ring-8 ring-gray-50 dark:ring-[var(--bg-primary)]">
              <PackageOpen className="w-16 h-16 text-gray-300 dark:text-[var(--text-muted)]" />
            </div>
            <div className="text-center max-w-xs">
              <p className="text-xl font-bold text-gray-800 dark:text-[var(--text-primary)] mb-2">
                Tu carrito está vacío
              </p>
              <p className="text-sm text-gray-400 dark:text-[var(--text-muted)] leading-relaxed">
                Aún no has agregado productos a tu carrito. Explora nuestro catálogo y encuentra lo que buscas.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 dark:bg-[var(--brand-green)] text-white font-bold text-sm rounded-2xl hover:bg-sky-600 dark:hover:bg-[var(--brand-green-hover)] transition shadow-lg shadow-sky-200/50 dark:shadow-emerald-900/30"
            >
              Explorar productos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* ── Cart Content ── */}
        {!loading && items.length > 0 && cart && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Items list */}
            <div className="lg:col-span-2 bg-white dark:bg-[var(--bg-card)] rounded-3xl border border-gray-100 dark:border-[var(--border-subtle)] shadow-sm dark:shadow-none">
              <div className="flex items-center justify-between px-6 pt-6 pb-1">
                <div>
                  <h2 className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">
                    Productos
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-[var(--text-muted)] mt-0.5">
                    Revisa las cantidades antes de continuar
                  </p>
                </div>
                <span className="text-xs font-semibold text-gray-400 dark:text-[var(--text-muted)] bg-gray-100 dark:bg-[var(--bg-muted)] px-2.5 py-1 rounded-full">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              </div>
              <div className="px-6 pb-2">
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
            </div>

            {/* Totals sidebar */}
            <div className="lg:col-span-1 order-first lg:order-last">
              <div className="bg-white dark:bg-[var(--bg-card)] rounded-3xl border border-gray-100 dark:border-[var(--border-subtle)] p-6 shadow-sm dark:shadow-none lg:sticky lg:top-6">
                <h3 className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] mb-5 pb-4 border-b border-gray-100 dark:border-[var(--border-subtle)]">
                  Resumen de compra
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-[var(--text-muted)]">Subtotal</span>
                    <span className="font-semibold text-gray-800 dark:text-[var(--text-primary)]">
                      {formatPrice(cart.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-[var(--text-muted)]">Envios</span>
                    <span className="text-emerald-500 dark:text-emerald-400 font-medium text-xs">
                      Calcular en checkout
                    </span>
                  </div>
                  <div className="border-t border-gray-100 dark:border-[var(--border-subtle)] pt-3 mt-3">
                    <div className="flex justify-between font-black text-base text-gray-900 dark:text-[var(--text-primary)]">
                      <span>Total</span>
                      <span className="text-emerald-600 dark:text-emerald-400 text-lg">
                        {formatPrice(cart.total)}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-[var(--text-muted)] mt-1 text-right">
                      IGV incluido
                    </p>
                  </div>
                </div>

                {/* Coupon placeholder */}
                <div className="mt-5 flex items-center gap-2.5 px-3 py-3 rounded-xl border border-dashed border-gray-200 dark:border-[var(--border-subtle)] text-sm text-gray-400 dark:text-[var(--text-muted)] cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  <Tag className="w-4 h-4" />
                  <span>Agregar código de descuento</span>
                </div>

                <Link
                  href="/checkout"
                  className="mt-4 flex items-center justify-center gap-2 w-full py-3.5 bg-sky-500 dark:bg-[var(--brand-green)] hover:bg-sky-600 dark:hover:bg-[var(--brand-green-hover)] text-white font-black text-sm rounded-2xl transition-all shadow-lg shadow-sky-500/20 dark:shadow-emerald-900/20 hover:-translate-y-0.5"
                >
                  Ir a pagar
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
