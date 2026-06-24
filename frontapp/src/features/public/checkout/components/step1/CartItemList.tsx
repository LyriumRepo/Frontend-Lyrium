/**
 * CartItemList.tsx
 * ARCHIVO: src/features/public/checkout/components/step1/CartItemList.tsx
 *
 * Lista de productos del carrito en el paso 1.
 * Lee de useCheckoutStore (que useCheckoutSubmit ya pobló con el carrito real).
 */

'use client';

import Image from 'next/image';
import { Trash2, Calendar } from 'lucide-react';
import { useCheckoutStore } from '@/store/checkoutStore';
import { cartApi } from '@/shared/lib/api/cartRepository';
import { serviceRepository } from '@/shared/lib/api/serviRepository';

interface Props {
  onDeleteSelected?: () => void;
}

export default function CartItemList({ onDeleteSelected }: Props) {
  const cartItems = useCheckoutStore((s) => s.cartItems);
  const toggleSelect = useCheckoutStore((s) => s.toggleSelectItem);
  const toggleAll = useCheckoutStore((s) => s.toggleSelectAll);
  const setCartItems = useCheckoutStore((s) => s.setCartItems);

  const allSelected =
    cartItems.length > 0 && cartItems.every((i) => i.selected);
  const selectedCount = cartItems.filter((i) => i.selected).length;

  function isService(id: number) { return id < 0; }
  function holdId(id: number) { return Math.abs(id); }

  // Eliminar un item del carrito (producto o servicio)
  async function handleRemove(itemId: number) {
    try {
      if (isService(itemId)) {
        const token = sessionStorage.getItem('cart_session_id') ?? '';
        await serviceRepository.removeServiceHold(holdId(itemId), token);
      } else {
        await cartApi.removeItem(itemId);
      }
      setCartItems(cartItems.filter((i) => i.id !== itemId));
    } catch (err) {
      console.error('Error eliminando item:', err);
    }
  }

  // Actualizar cantidad (solo productos, no servicios)
  async function handleQuantityChange(itemId: number, delta: number) {
    if (isService(itemId)) return;
    const item = cartItems.find((i) => i.id === itemId);
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty < 1) {
      await handleRemove(itemId);
      return;
    }

    try {
      await cartApi.updateItem(itemId, newQty);
      setCartItems(
        cartItems.map((i) =>
          i.id === itemId ? { ...i, quantity: newQty } : i,
        ),
      );
    } catch (err) {
      console.error('Error actualizando cantidad:', err);
    }
  }

  // Eliminar todos los seleccionados
  async function handleDeleteSelected() {
    const selected = cartItems.filter((i) => i.selected);
    for (const item of selected) {
      if (isService(item.id)) {
        const token = sessionStorage.getItem('cart_session_id') ?? '';
        await serviceRepository.removeServiceHold(holdId(item.id), token);
      } else {
        await cartApi.removeItem(item.id);
      }
    }
    setCartItems(cartItems.filter((i) => !i.selected));
    onDeleteSelected?.();
  }

  // ── Carrito vacío ──────────────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 dark:border-[var(--border-subtle)] p-12 text-center space-y-4 bg-white dark:bg-[var(--bg-card)]">
        <div className="text-5xl">🛒</div>
        <p className="text-gray-500 dark:text-[var(--text-muted)] font-medium">
          Tu carrito está vacío
        </p>
        <a
          href="/tiendas"
          className="inline-block text-sm text-sky-500 hover:underline font-medium"
        >
          Explorar productos →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra de acciones */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-[var(--text-secondary)] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => toggleAll(e.target.checked)}
            className="w-4 h-4 rounded accent-sky-500"
          />
          Seleccionar todos los artículos
        </label>

        {selectedCount > 0 && (
          <button
            onClick={handleDeleteSelected}
            className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Borrar seleccionados ({selectedCount})
          </button>
        )}
      </div>

      {/* Lista de productos */}
      <div className="space-y-3">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className={`flex gap-4 p-4 rounded-2xl border transition
              ${
                item.selected
              ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20'
              : 'border-gray-100 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-card)]'
              }`}
          >
            {/* Checkbox */}
            <div className="pt-1">
              <input
                type="checkbox"
                checked={item.selected}
                onChange={() => toggleSelect(item.id)}
                className="w-4 h-4 rounded accent-sky-500 cursor-pointer"
              />
            </div>

            {/* Imagen */}
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-[var(--bg-muted)] flex-shrink-0">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  unoptimized={item.image.startsWith('data:')}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  {isService(item.id) ? '📅' : '📦'}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-[var(--text-primary)] text-sm leading-tight line-clamp-2">
                {item.name}
              </p>
              {isService(item.id) && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
                  <Calendar className="w-3 h-3 inline mr-0.5" />
                  Servicio
                </span>
              )}
              <p className="text-emerald-600 dark:text-emerald-400 font-bold text-base mt-1">
                S/ {item.price.toFixed(2)}
              </p>
            </div>

            {/* Cantidad + eliminar */}
            <div className="flex flex-col items-end justify-between gap-2">
              <button
                onClick={() => handleRemove(item.id)}
                className="text-gray-400 hover:text-red-500 transition"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {isService(item.id) ? (
                  <span className="text-xs text-gray-400 dark:text-[var(--text-muted)] px-2">
                  1 unidad
                </span>
              ) : (
                <>
                  <div className="flex items-center gap-2 border border-gray-200 dark:border-[var(--border-subtle)] rounded-xl overflow-hidden">
                    <button
                      onClick={() => handleQuantityChange(item.id, -1)}
                      className="px-3 py-1.5 text-gray-600 dark:text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)] transition text-sm font-medium"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-gray-900 dark:text-[var(--text-primary)]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.id, +1)}
                      className="px-3 py-1.5 text-gray-600 dark:text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)] transition text-sm font-medium"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)]">
                    S/ {(item.price * item.quantity).toFixed(2)}
                  </p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
