/**
 * CartItemList.tsx
 * ARCHIVO: src/features/public/checkout/components/step1/CartItemList.tsx
 *
 * Lista de productos del carrito en el paso 1.
 * Lee de useCheckoutStore (que useCheckoutSubmit ya pobló con el carrito real).
 */

'use client';

import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { useCheckoutStore } from '@/store/checkoutStore';
import { cartApi } from '@/shared/lib/api/cartRepository';

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

  // Eliminar un item del carrito (llama al backend y actualiza el store)
  async function handleRemove(productId: number) {
    try {
      await cartApi.removeItem(productId);
      setCartItems(cartItems.filter((i) => i.id !== productId));
    } catch (err) {
      console.error('Error eliminando item:', err);
    }
  }

  // Actualizar cantidad
  async function handleQuantityChange(productId: number, delta: number) {
    const item = cartItems.find((i) => i.id === productId);
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty < 1) {
      await handleRemove(productId);
      return;
    }

    try {
      await cartApi.updateItem(productId, newQty);
      setCartItems(
        cartItems.map((i) =>
          i.id === productId ? { ...i, quantity: newQty } : i,
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
      await cartApi.removeItem(item.id);
    }
    setCartItems(cartItems.filter((i) => !i.selected));
    onDeleteSelected?.();
  }

  // ── Carrito vacío ──────────────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-12 text-center space-y-4">
        <div className="text-5xl">🛒</div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">
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
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
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
                  ? 'border-sky-200 dark:border-sky-900 bg-sky-50/30 dark:bg-sky-950/20'
                  : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/40'
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

<<<<<<< HEAD
            <div className="p-4">
                {cartItems.length === 0 ? (
                    <div className="py-12 flex flex-col items-center gap-3 text-gray-400 dark:text-[var(--text-muted)]">
                        <Package className="w-10 h-10 opacity-30" />
                        <p className="text-sm font-medium">No tienes productos en el carrito, puedes seguir comprando.</p>
                    </div>
                ) : (
                    Object.entries(stores).map(([storeId, group]) => (
                        <div key={storeId} className="store-group mb-6 last:mb-0">
                            {/* Store header */}
                            <div className="store-header flex items-center gap-3 px-4 py-3 mb-3 rounded-2xl bg-gradient-to-r from-sky-500/5 to-lime-500/5 dark:from-sky-500/10 dark:to-lime-500/10 border border-sky-500/10 dark:border-[var(--border-subtle)]">
                                <Package className="w-4 h-4 text-sky-500 dark:text-[var(--brand-sky)]" />
                                <h3 className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">{group.name}</h3>
                            </div>
                            {/* Items */}
                            {group.items.map((item) => (
                                <CartItemCard key={item.id} item={item} onToggle={toggleSelectItem} />
                            ))}
                        </div>
                    ))
                )}
=======
            {/* Imagen */}
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  📦
                </div>
              )}
>>>>>>> d9aece4d89ab271e219257a158b75b5f636b3361
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white text-sm leading-tight line-clamp-2">
                {item.name}
              </p>
              <p className="text-sky-600 dark:text-sky-400 font-bold text-base mt-1">
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

              <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => handleQuantityChange(item.id, -1)}
                  className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm font-medium"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-semibold text-gray-900 dark:text-white">
                  {item.quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(item.id, +1)}
                  className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm font-medium"
                >
                  +
                </button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                S/ {(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
