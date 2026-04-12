'use client';

import { X, ShoppingCart, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { money, ApiProduct } from '@/modules/cart/utils';
import CartItem from './CartItem';
import { useCarritoStore } from '@/store/carritoStore';

interface Props {
    productsCache: ApiProduct[];
    onAdd: (id: number | string) => void;
    onIncrease: (id: number | string) => void;
    onDecrease: (id: number | string) => void;
    onDelete: (id: number | string) => void;
    onViewProduct: (id: number | string) => void;
}

export default function CartDrawer({ productsCache, onAdd, onIncrease, onDecrease, onDelete, onViewProduct }: Props) {
    const router = useRouter();
    const cartItems = useCarritoStore((s) => s.cartItems);
    const cartOpen = useCarritoStore((s) => s.ui.cartOpen);
    const closeCart = useCarritoStore((s) => s.closeCart);
    const [discountOpen, setDiscountOpen] = useState(false);
    const [discountCode, setDiscountCode] = useState('');

    const totalItems = cartItems.reduce((a, i) => a + Number(i.cantidad ?? 0), 0);
    const subtotal = cartItems.reduce((a, i) => a + Number(i.cantidad ?? 0) * Number(i.precio_unitario ?? 0), 0);

    function findProduct(productId: number | string) {
        return productsCache.find((p) => String(p.id) === String(productId));
    }

    return (
        <>
            {/* Backdrop */}
            {cartOpen && (
                <div
                    className="fixed inset-0 z-[200] bg-slate-900/58 backdrop-blur-[2px] animate-fade-in"
                    onClick={closeCart}
                />
            )}

            {/* Drawer */}
            <aside className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[220] shadow-2xl border-l border-gray-200 flex flex-col transition-transform duration-300 ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
                    <h2 className="text-base font-semibold text-gray-800">
                        🛒 Carrito de compras ({totalItems})
                    </h2>
                    <button onClick={closeCart} className="w-8 h-8 rounded-full hover:bg-gray-100 grid place-items-center text-gray-500 hover:text-gray-700 transition">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-auto px-5 py-4">
                    {cartItems.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <div className="mx-auto w-14 h-14 rounded-2xl bg-gray-100 grid place-items-center mb-4">
                                <ShoppingCart className="w-7 h-7 text-gray-400" />
                            </div>
                            <p className="text-gray-700 font-medium">Tu carrito está vacío</p>
                            <p className="text-xs mt-1 text-gray-400">Agrega productos para verlos aquí.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {cartItems.map((item, idx) => (
                                <CartItem
                                    key={item.id}
                                    item={item}
                                    product={findProduct(item.producto_id)}
                                    isFirst={idx === 0}
                                    onIncrease={onIncrease}
                                    onDecrease={onDecrease}
                                    onDelete={onDelete}
                                    onView={onViewProduct}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Discount code */}
                <div className="border-t border-gray-100">
                    <button
                        onClick={() => setDiscountOpen(!discountOpen)}
                        className="w-full px-5 py-3 flex items-center justify-between text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                        <span>¿Tienes un código de descuento?</span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${discountOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {discountOpen && (
                        <div className="px-5 pb-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={discountCode}
                                    onChange={(e) => setDiscountCode(e.target.value)}
                                    placeholder="Ingresa tu código"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
                                />
                                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition">
                                    Aplicar
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 px-5 py-4 bg-white">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-800 font-medium">Subtotal</span>
                        <span className="text-base font-semibold text-gray-800">{money(subtotal)}</span>
                    </div>
                    <p className="text-xs text-sky-600 mb-4">El envío y los impuestos pueden volver a calcularse al finalizar compra.</p>

                    <div className="space-y-2">
                        <button
                            onClick={() => { closeCart(); router.push('/checkout'); }}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-medium inline-flex items-center justify-center gap-2 shadow-lg shadow-sky-200/50 transition-all"
                        >
                            🛒 Continuar compra
                        </button>
                        <button
                            onClick={closeCart}
                            className="w-full py-3 rounded-xl bg-white border-2 border-gray-200 hover:border-sky-400 hover:bg-sky-50 text-gray-700 hover:text-sky-600 font-medium inline-flex items-center justify-center gap-2 transition-all"
                        >
                            ← Seguir comprando
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
