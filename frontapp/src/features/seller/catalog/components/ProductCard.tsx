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
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-4 flex flex-col gap-3 transition-all hover:shadow-md hover:-translate-y-0.5 group">

            <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] relative">
                    <Image
                        src={product.image || 'https://placehold.co/48x48/f3f4f6/9ca3af?text=?'}
                        alt={product.name}
                        fill
                        sizes="48px"
                        className="object-contain"
                    />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-[var(--text-primary)] truncate leading-tight">
                        {product.name}
                    </p>
                    {product.category ? (
                        <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">
                            {product.category}
                        </span>
                    ) : (
                        <span className="text-[var(--text-secondary)] opacity-30 text-[9px]">—</span>
                    )}
                </div>
            </div>

            <div className="flex items-end justify-between gap-2 mt-auto">
                <div className="space-y-0.5">
                    {renderPrice ? (
                        renderPrice()
                    ) : (
                        <p className="text-base font-black text-[var(--text-primary)]">
                            S/ {product.price.toFixed(2)}
                        </p>
                    )}
                    <div>
                        <span className={`text-xs font-black ${product.stock === 0 ? 'text-red-400' : 'text-[var(--text-primary)]'}`}>
                            {product.stock} ud.
                        </span>
                        {product.stock === 0 && (
                            <span className="ml-1.5 text-[7px] font-black uppercase tracking-wider text-red-400 border border-red-400/30 px-1 py-0.5 rounded">
                                Agotado
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-0.5">
                    <button
                        onClick={() => onViewInfo(product)}
                        title="Ver detalles"
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-sky-500/10 hover:text-sky-500 dark:hover:bg-[#8FC3A1]/10 dark:hover:text-[#8FC3A1] transition-colors"
                    >
                        <Icon name="ArrowRight" className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => onEdit(product)}
                        title="Editar"
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-sky-500/10 hover:text-sky-500 dark:hover:bg-[#8FC3A1]/10 dark:hover:text-[#8FC3A1] transition-colors"
                    >
                        <Icon name="Pencil" className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => onDelete(product.id)}
                        title="Eliminar"
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-500 transition-colors"
                    >
                        <Icon name="Trash2" className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}