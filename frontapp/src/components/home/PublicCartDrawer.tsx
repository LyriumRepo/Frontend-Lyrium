'use client';

import { X, ShoppingCart, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCarritoStore } from '@/store/carritoStore';
import { money } from '@/modules/cart/utils';

export default function PublicCartDrawer() {
    const router = useRouter();
    const cartItems = useCarritoStore((s) => s.cartItems);
    const cartOpen = useCarritoStore((s) => s.ui.cartOpen);
    const closeCart = useCarritoStore((s) => s.closeCart);
    const removeFromCart = useCarritoStore((s) => s.removeFromCart);
    const updateQuantity = useCarritoStore((s) => s.updateQuantity);
    const [discountOpen, setDiscountOpen] = useState(false);
    const [discountCode, setDiscountCode] = useState('');

    const totalItems = cartItems.reduce((a, i) => a + Number(i.cantidad ?? 0), 0);
    const subtotal = cartItems.reduce((a, i) => a + Number(i.cantidad ?? 0) * Number(i.precio_unitario ?? 0), 0);

    if (!cartOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[200] bg-slate-900/58 dark:bg-black/70 backdrop-blur-[2px] animate-fade-in"
                onClick={closeCart}
            />

            {/* Drawer */}
            <aside className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white dark:bg-[var(--bg-card)] z-[220] shadow-2xl border-l border-gray-200 dark:border-[var(--border-subtle)] flex flex-col animate-fade-in">

                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100 dark:border-[var(--border-subtle)] flex items-center justify-between bg-white dark:bg-[var(--bg-card)]">
                    <h2 className="text-base font-semibold text-gray-800 dark:text-[var(--text-primary)]">
                        🛒 Ver su Carrito de compras ({totalItems})
                    </h2>
                    <button onClick={closeCart} className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)] grid place-items-center text-gray-500 dark:text-[var(--text-muted)] hover:text-gray-700 dark:hover:text-[var(--text-primary)] transition">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-auto px-5 py-4">
                    {cartItems.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 dark:text-[var(--text-muted)]">
                            <div className="mx-auto w-14 h-14 rounded-2xl bg-gray-100 dark:bg-[var(--bg-muted)] grid place-items-center mb-4">
                                <ShoppingCart className="w-7 h-7 text-gray-400 dark:text-[var(--text-muted)]" />
                            </div>
                            <p className="text-gray-700 dark:text-[var(--text-primary)] font-medium">Tu carrito está vacío</p>
                            <p className="text-xs mt-1 text-gray-400 dark:text-[var(--text-muted)]">Agrega productos para verlos aquí.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex gap-3 p-3 bg-gray-50 dark:bg-[var(--bg-muted)] rounded-xl">
                                    {/* Imagen */}
                                    <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-white dark:bg-[var(--bg-secondary)] shrink-0">
                                        <Image
                                            src={item.imagen_url || '/img/placeholder.png'}
                                            alt={item.producto_nombre || 'Producto'}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-gray-800 dark:text-[var(--text-primary)] line-clamp-2">
                                            {item.producto_nombre}
                                        </h3>
                                        
                                        {/* Vendedor */}
                                        {item.vendedor_nombre && (
                                            <p className="text-xs text-gray-500 dark:text-[var(--text-muted)] mt-1">
                                                Vendedor: <span className="font-medium text-gray-600 dark:text-[var(--text-secondary)]">{item.vendedor_nombre}</span>
                                            </p>
                                        )}
                                        
                                        {/* Categorías */}
                                        {item.categorias && item.categorias.length > 0 && (
                                            <p className="text-xs text-gray-400 dark:text-[var(--text-muted)] mt-0.5">
                                                {item.categorias.join(', ')}
                                            </p>
                                        )}
                                        
                                        <p className="text-sm font-bold text-sky-600 dark:text-[var(--brand-sky)] mt-1">
                                            S/ {Number(item.precio_unitario).toFixed(2)}
                                        </p>
                                        
                                        {/* Cantidad controls */}
                                        <div className="flex items-center gap-2 mt-2">
                                            <button
                                                onClick={() => updateQuantity(item.producto_id, Number(item.cantidad) - 1)}
                                                className="w-7 h-7 rounded-full bg-white dark:bg-[var(--bg-card)] border border-gray-200 dark:border-[var(--border-subtle)] flex items-center justify-center text-gray-600 dark:text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-[var(--bg-secondary)]"
                                            >
                                                -
                                            </button>
                                            <span className="text-sm font-medium w-6 text-center text-gray-800 dark:text-[var(--text-primary)]">{item.cantidad}</span>
                                            <button
                                                onClick={() => updateQuantity(item.producto_id, Number(item.cantidad) + 1)}
                                                className="w-7 h-7 rounded-full bg-white dark:bg-[var(--bg-card)] border border-gray-200 dark:border-[var(--border-subtle)] flex items-center justify-center text-gray-600 dark:text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-[var(--bg-secondary)]"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Remove button */}
                                    <button
                                        onClick={() => removeFromCart(item.producto_id)}
                                        className="text-gray-400 dark:text-[var(--text-muted)] hover:text-red-500 dark:hover:text-red-400 self-start"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Discount code */}
                {cartItems.length > 0 && (
                    <div className="border-t border-gray-100 dark:border-[var(--border-subtle)]">
                        <button
                            onClick={() => setDiscountOpen(!discountOpen)}
                            className="w-full px-5 py-3 flex items-center justify-between text-sm text-gray-700 dark:text-[var(--text-secondary)] hover:bg-gray-50 dark:hover:bg-[var(--bg-muted)] transition"
                        >
                            <span>¿Tienes un código de descuento?</span>
                            <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-[var(--text-muted)] transition-transform ${discountOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {discountOpen && (
                            <div className="px-5 pb-4">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={discountCode}
                                        onChange={(e) => setDiscountCode(e.target.value)}
                                        placeholder="Ingresa tu código"
                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-[var(--border-subtle)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-900/30 focus:border-sky-400 dark:focus:border-[var(--brand-sky)] bg-white dark:bg-[var(--bg-card)] text-gray-800 dark:text-[var(--text-primary)]"
                                    />
                                    <button className="px-4 py-2 bg-gray-100 dark:bg-[var(--bg-muted)] hover:bg-gray-200 dark:hover:bg-[var(--bg-secondary)] text-gray-700 dark:text-[var(--text-secondary)] text-sm rounded-lg transition">
                                        Aplicar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="border-t border-gray-100 dark:border-[var(--border-subtle)] px-5 py-4 bg-white dark:bg-[var(--bg-card)]">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-800 dark:text-[var(--text-primary)] font-medium">Subtotal</span>
                            <span className="text-base font-semibold text-gray-800 dark:text-[var(--text-primary)]">{money(subtotal)}</span>
                        </div>
                        <p className="text-xs text-sky-600 dark:text-[var(--brand-sky)] mb-4">El envío y los impuestos pueden volver a calcularse al Finalizar compra.</p>

                        <div className="space-y-2">
                            <button
                                onClick={() => { closeCart(); router.push('/checkout'); }}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-medium inline-flex items-center justify-center gap-2 shadow-lg shadow-sky-200/50 dark:shadow-sky-900/20 transition-all"
                            >
                                Finalizar compra
                            </button>
                            <button
                                onClick={closeCart}
                                className="w-full py-3 rounded-xl bg-white dark:bg-[var(--bg-card)] border-2 border-gray-200 dark:border-[var(--border-subtle)] hover:border-sky-400 dark:hover:border-[var(--brand-sky)] hover:bg-sky-50 dark:hover:bg-sky-900/10 text-gray-700 dark:text-[var(--text-secondary)] hover:text-sky-600 dark:hover:text-[var(--brand-sky)] font-medium inline-flex items-center justify-center gap-2 transition-all"
                            >
                                Ver Carrito de Compras
                            </button>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
}
