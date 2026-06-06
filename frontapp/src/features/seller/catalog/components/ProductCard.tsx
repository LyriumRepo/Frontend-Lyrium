'use client';

import React, { ReactNode } from 'react';
import Image from 'next/image';
import { Product } from '@/features/seller/catalog/types';
import Icon from '@/components/ui/Icon';

interface ProductCardProps {
    product:    Product;
    onEdit:     (product: Product) => void;
    onDelete:   (productId: string) => void;
    onViewInfo: (product: Product) => void;
    renderPrice?: () => ReactNode;
}

export default function ProductCard({
    product,
    onEdit,
    onDelete,
    onViewInfo,
    renderPrice,
}: ProductCardProps) {

    return (
        <tr className="border-b border-[var(--border-subtle)] last:border-b-0 hover:bg-[var(--bg-secondary)]/60 transition-colors group">

            {/* ── Producto ── */}
            <td className="px-4 py-3 w-[260px] max-w-[260px]">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] relative">
                        <Image
                            src={product.image || 'https://placehold.co/36x36/f3f4f6/9ca3af?text=?'}
                            alt={product.name}
                            fill
                            sizes="36px"
                            className="object-contain"
                        />
                    </div>
                    <div className="relative group/name min-w-0">
                        <p className="text-sm font-black text-[var(--text-primary)] truncate leading-tight cursor-default">
                            {product.name}
                        </p>
                        <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-xl bg-black px-3 py-2 text-xs font-bold text-white shadow-lg group-hover/name:block">
                            {product.name}
                            <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-black" />
                        </div>
                    </div>
                </div>
            </td>

            {/* ── Categoría ── */}
            <td className="px-4 py-3 w-[200px] max-w-[200px]">
                {product.category ? (
                    <div className="relative group/cat">
                        <span className="block truncate text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide cursor-default">
                            {product.category}
                        </span>
                        <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-xl bg-black px-3 py-2 text-xs font-bold text-white shadow-lg group-hover/cat:block">
                            {product.category}
                            <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-black" />
                        </div>
                    </div>
                ) : (
                    <span className="text-[var(--text-secondary)] opacity-30 text-sm">—</span>
                )}
            </td>

            {/* ── Precio ── */}
            <td className="px-4 py-3 whitespace-nowrap">
                {renderPrice ? (
                    renderPrice()
                ) : (
                    <span className="text-sm font-black text-[var(--text-primary)]">
                        S/ {product.price.toFixed(2)}
                    </span>
                )}
            </td>

            {/* ── Stock ── */}
            <td className="px-4 py-3 whitespace-nowrap">
                <span className={`text-sm font-black ${product.stock === 0 ? 'text-red-400' : 'text-[var(--text-primary)]'}`}>
                    {product.stock}
                    {product.stock === 0 && (
                        <span className="ml-1.5 text-[8px] font-black uppercase tracking-wider text-red-400 border border-red-400/30 px-1 py-0.5 rounded">
                            Agotado
                        </span>
                    )}
                </span>
            </td>

            {/* ── Acciones ── */}
            <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-0.5">

                    {/* Ver info */}
                    <button
                        onClick={() => onViewInfo(product)}
                        title="Ver detalles"
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-sky-500/10 hover:text-sky-500 dark:hover:bg-[#8FC3A1]/10 dark:hover:text-[#8FC3A1] transition-colors"
                    >
                        <Icon name="ArrowRight" className="w-3.5 h-3.5" />
                    </button>

                    {/* Editar */}
                    <button
                        onClick={() => onEdit(product)}
                        title="Editar"
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-sky-500/10 hover:text-sky-500 dark:hover:bg-[#8FC3A1]/10 dark:hover:text-[#8FC3A1] transition-colors"
                    >
                        <Icon name="Pencil" className="w-3.5 h-3.5" />
                    </button>

                    {/* Eliminar */}
                    <button
                        onClick={() => onDelete(product.id)}
                        title="Eliminar"
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-500 transition-colors"
                    >
                        <Icon name="Trash2" className="w-3.5 h-3.5" />
                    </button>
                </div>
            </td>
        </tr>
    );
}