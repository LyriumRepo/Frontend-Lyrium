"use client";


/**
 * CartDrawer.tsx — R20: Detalle carrito
 * Drawer lateral con modificación, actualización y eliminación de productos.
 * Se conecta a Laravel CartController via cartRepository.ts
 * Usa carritoStore (Zustand) como fuente de verdad local.
 *
 * Ubicación: src/features/public/carrito/components/drawer/CartDrawer.tsx
 */

import { useEffect, useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
} from "lucide-react";
import { useCarritoStore } from "@/store/carritoStore";
import { cartApi } from "@/shared/lib/api/cartRepository";
import type { CartItem, CartResource } from "@/shared/lib/api/cartRepository";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(n: number): string {
  return `S/ ${n.toFixed(2)}`;
}

function resolveImg(url?: string | null): string {
  return url && url.startsWith("http") ? url : "/no-image.png";
}


// ─── CartLineItem ─────────────────────────────────────────────────────────────

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
    item.product.regular_price &&
    item.product.regular_price > item.product.price
      ? Math.round(
          ((item.product.regular_price - item.product.price) /
            item.product.regular_price) *
            100,
        )
      : 0;

  return (
    <div className="flex gap-3 py-4 border-b border-gray-100 dark:border-[var(--border-subtle)] last:border-0 group relative">
      {/* Imagen */}
      <Link
        href={`/producto/${item.product.slug}`}
        className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 dark:bg-[var(--bg-primary)] border border-gray-100 dark:border-[var(--border-subtle)] hover:opacity-90 transition-opacity"
      >
        <Image
          src={resolveImg(item.product.image)}
          alt={item.product.name}
          fill
          sizes="80px"
          className="object-cover"
        />
        {discount > 0 && (
          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full leading-none">
            -{discount}%
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <Link
          href={`/producto/${item.product.slug}`}
          className="text-sm font-semibold text-gray-800 dark:text-[var(--text-primary)] line-clamp-2 leading-tight hover:text-sky-500 transition-colors"
        >
          {item.product.name}
        </Link>

        {/* Precio unitario */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-sky-600 dark:text-sky-400 font-black text-sm">
            {formatPrice(item.unitPrice)}
          </span>
          {item.product.regular_price &&
            item.product.regular_price > item.unitPrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(item.product.regular_price)}
              </span>
            )}
        </div>

        {/* Controles cantidad + subtotal */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center border border-gray-200 dark:border-[var(--border-subtle)] rounded-xl overflow-hidden">
            <button
              onClick={() => onDecrease(item.productId)}
              disabled={loading || item.quantity <= 1}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-[var(--bg-secondary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Reducir"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 h-8 flex items-center justify-center text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                item.quantity
              )}
            </span>
            <button
              onClick={() => onIncrease(item.productId)}
              disabled={loading || !canIncrease}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-[var(--bg-secondary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Aumentar"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="text-sm font-black text-gray-800 dark:text-[var(--text-primary)]">
            {formatPrice(item.lineTotal)}
          </span>
        </div>


        {/* Stock warning */}
        {!canIncrease && (
          <p className="text-[10px] text-amber-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Máximo disponible: {maxStock}
          </p>
        )}
      </div>

      {/* Botón eliminar */}
      <button
        onClick={() => onRemove(item.productId)}
        disabled={loading}
        className="absolute top-4 right-0 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all disabled:cursor-not-allowed"
        aria-label="Eliminar del carrito"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── CartDrawer ───────────────────────────────────────────────────────────────

export default function CartDrawer() {
  const { ui, closeCart } = useCarritoStore();
  const [cart, setCart] = useState<CartResource | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [mutatingId, setMutatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Cargar carrito al abrir ────────────────────────────────────────────────
  const loadCart = useCallback(async () => {
    setFetchLoading(true);
    setError(null);
    try {
      const data = await cartApi.getCart();
      setCart(data);
    } catch (e) {
      setError("No se pudo cargar el carrito. Intenta de nuevo.");
    } finally {
      setFetchLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ui.cartOpen) {
      loadCart();
    }
  }, [ui.cartOpen, loadCart]);

  // ── Bloquear scroll cuando el drawer está abierto ─────────────────────────
  useEffect(() => {
    if (ui.cartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [ui.cartOpen]);

  // ── Mutaciones ─────────────────────────────────────────────────────────────

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
        // Eliminar si llega a 0
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
    if (!cart?.items.length) return;
    if (!confirm("¿Vaciar todo el carrito?")) return;
    setFetchLoading(true);
    setError(null);
    try {
      const updated = await cartApi.clearCart();
      setCart(updated);
    } catch {
      setError("Error al vaciar el carrito.");
    } finally {
      setFetchLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  const items = cart?.items ?? [];
  const isEmpty = !fetchLoading && items.length === 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          ui.cartOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        className={`fixed inset-y-0 right-0 z-50 flex flex-col w-full max-w-[420px] bg-white dark:bg-[var(--bg-secondary)] shadow-2xl transition-transform duration-300 ease-in-out ${
          ui.cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-sky-500 dark:text-sky-400" />
            </div>
            <div>
              <h2 className="font-black text-gray-900 dark:text-[var(--text-primary)] leading-none">
                Mi carrito
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {fetchLoading
                  ? "Cargando…"
                  : `${cart?.itemCount ?? 0} ${cart?.itemCount === 1 ? "artículo" : "artículos"}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Vaciar carrito */}
            {items.length > 0 && (
              <button
                onClick={handleClear}
                disabled={fetchLoading}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Vaciar
              </button>
            )}
            <button
              onClick={closeCart}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-[var(--bg-primary)] text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              aria-label="Cerrar carrito"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
            <button
              className="ml-auto text-red-400 hover:text-red-600"
              onClick={() => setError(null)}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-2">
          {/* Estado: cargando */}
          {fetchLoading && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm">Cargando tu carrito…</p>
            </div>
          )}

          {/* Estado: vacío */}
          {isEmpty && !error && (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-16">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-[var(--bg-primary)] flex items-center justify-center">
                <PackageOpen className="w-10 h-10 text-gray-300 dark:text-gray-600" />
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-700 dark:text-[var(--text-primary)] mb-1">
                  Tu carrito está vacío
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Agrega productos para continuar
                </p>
              </div>
              <button
                onClick={closeCart}
                className="mt-2 px-5 py-2.5 bg-sky-500 dark:bg-[#4A7C59] text-white text-sm font-bold rounded-xl hover:bg-sky-600 dark:hover:bg-[#3D6B4A] transition-colors"
              >
                Explorar productos
              </button>
            </div>
          )}

          {/* Lista de ítems */}
          {!fetchLoading && items.length > 0 && (
            <div>
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
        </div>

        {/* ── Footer con resumen y CTA ── */}
        {!fetchLoading && items.length > 0 && cart && (
          <div className="border-t border-gray-100 dark:border-[var(--border-subtle)] px-5 py-4 space-y-3">
            {/* Cupón placeholder */}
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-gray-200 dark:border-[var(--border-subtle)] text-sm text-gray-400 dark:text-gray-500 cursor-pointer hover:border-sky-400 hover:text-sky-500 transition-colors">
              <Tag className="w-4 h-4" />
              <span>Agregar código de descuento</span>
            </div>

            {/* Resumen de precios */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-gray-500 dark:text-[var(--text-secondary)]">
                <span>Subtotal</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 dark:text-[var(--text-secondary)]">
                <span>Envío</span>
                <span className="text-emerald-500 font-semibold">
                  Calcular en checkout
                </span>
              </div>
              <div className="flex justify-between font-black text-base text-gray-900 dark:text-[var(--text-primary)] pt-2 border-t border-gray-100 dark:border-[var(--border-subtle)]">
                <span>Total</span>
                <span className="text-sky-600 dark:text-sky-400">
                  {formatPrice(cart.total)}
                </span>
              </div>
            </div>

            {/* Botón checkout */}
            <Link
              href="/checkout"
              onClick={closeCart}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-sky-500 hover:bg-sky-600 dark:bg-[#4A7C59] dark:hover:bg-[#3D6B4A] text-white font-black text-sm rounded-2xl transition-all shadow-lg shadow-sky-500/20 dark:shadow-none hover:-translate-y-0.5"
            >
              Ir a pagar
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={closeCart}
              className="w-full py-2.5 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Seguir comprando
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
