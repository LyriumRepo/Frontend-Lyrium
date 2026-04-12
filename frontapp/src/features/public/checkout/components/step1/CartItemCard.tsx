'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem } from '@/store/checkoutStore';

interface Props {
    item: CartItem;
    onToggle: (id: number) => void;
}

export default function CartItemCard({ item, onToggle }: Props) {
    const savings = (item.originalPrice - item.price) * item.quantity;

    return (
        <div className="item-card flex gap-4 p-4 bg-white dark:bg-[var(--bg-card)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-2xl mb-3 transition-all duration-300 hover:shadow-[0_8px_24px_rgba(14,165,233,0.12)] hover:-translate-y-0.5 hover:border-sky-200/50 dark:hover:border-sky-500/50 relative group">

            {/* Checkbox */}
            <div className="flex items-start pt-1">
                <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => onToggle(item.id)}
                    className="w-4 h-4 rounded accent-sky-500 border-gray-300 cursor-pointer"
                />
            </div>

            {/* Image */}
            <div className="item-image-wrapper w-[90px] h-[90px] rounded-xl overflow-hidden bg-gray-50 dark:bg-[var(--bg-muted)] border border-gray-100 dark:border-[var(--border-subtle)] flex-shrink-0">
                <Image
                    src={item.image}
                    alt={item.name}
                    width={90}
                    height={90}
                    className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-[1.08]"
                />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="item-name text-[0.95rem] font-semibold text-gray-900 dark:text-[var(--text-primary)] mb-1 truncate">{item.name}</p>
                <p className="text-xs text-gray-400 dark:text-[var(--text-muted)] mb-2">Vendido por: <span className="font-bold text-gray-600 dark:text-[var(--text-secondary)]">{item.storeName}</span></p>

                <div className="flex items-center justify-between">
                    {/* Prices */}
                    <div>
                        <span className="price-current text-xl font-bold text-emerald-600 dark:text-emerald-400">S/ {(item.price * item.quantity).toFixed(2)}</span>
                        {savings > 0 && (
                            <span className="ml-2 text-xs text-gray-400 dark:text-[var(--text-muted)] line-through">S/ {(item.originalPrice * item.quantity).toFixed(2)}</span>
                        )}
                        <p className="price-unit text-[0.8rem] text-gray-400 dark:text-[var(--text-muted)]">S/ {item.price.toFixed(2)} c/u</p>
                    </div>

                    {/* Qty + Remove */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 border border-gray-200 dark:border-[var(--border-subtle)] rounded-xl overflow-hidden">
                            <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)] transition-colors text-gray-500 dark:text-[var(--text-muted)]">
                                <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">{item.quantity}</span>
                            <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)] transition-colors text-gray-500 dark:text-[var(--text-muted)]">
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>
                        <button className="p-1.5 text-gray-300 dark:text-[var(--text-muted)] hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
