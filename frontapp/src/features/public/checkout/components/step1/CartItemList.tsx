/**
 * CartItemList.tsx
 * ARCHIVO: src/features/public/checkout/components/step1/CartItemList.tsx
 *
 * Lista de productos del carrito en el paso 1, agrupados por tienda.
 * Lee de useCheckoutStore (que useCheckoutSubmit ya pobló con el carrito real).
 * Sincroniza las operaciones de cantidad y eliminación con el backend.
 */

'use client';

import { Package, Trash2 } from 'lucide-react';
import { useCheckoutStore } from '@/store/checkoutStore';
import { cartApi } from '@/shared/lib/api/cartRepository';
import CartItemCard from './CartItemCard';

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

  // Group by store
  const stores = cartItems.reduce<Record<number, { name: string; items: typeof cartItems }>>((acc, item) => {
    const storeId = item.storeId || 0;
    const storeName = item.storeName || 'Tienda';
    if (!acc[storeId]) {
      acc[storeId] = { name: storeName, items: [] };
    }
    acc[storeId].items.push(item);
    return acc;
  }, {});

  if (cartItems.length === 0) {
    return (
      <div className="bg-white dark:bg-[var(--bg-card)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-2xl shadow-sm p-12 text-center space-y-4">
        <div className="text-5xl">🛒</div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          Tu carrito está vacío
        </p>
        <a
          href="/productos"
          className="inline-block text-sm text-sky-500 hover:underline font-medium"
        >
          Explorar productos →
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[var(--bg-card)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-2xl shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-[var(--border-subtle)] flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => toggleAll(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 accent-sky-500"
          />
          <span className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">
            Seleccionar todos los artículos
          </span>
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

      <div className="p-4">
        {Object.entries(stores).map(([storeId, group]) => (
          <div key={storeId} className="store-group mb-6 last:mb-0">
            {/* Store header */}
            <div className="store-header flex items-center gap-3 px-4 py-3 mb-3 rounded-2xl bg-gradient-to-r from-sky-500/5 to-lime-500/5 dark:from-sky-500/10 dark:to-lime-500/10 border border-sky-500/10 dark:border-[var(--border-subtle)]">
              <Package className="w-4 h-4 text-sky-500 dark:text-[var(--brand-sky)]" />
              <h3 className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">
                {group.name}
              </h3>
            </div>
            {/* Items */}
            {group.items.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onToggle={toggleSelect}
                onRemove={handleRemove}
                onIncrease={(id) => handleQuantityChange(id, 1)}
                onDecrease={(id) => handleQuantityChange(id, -1)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
