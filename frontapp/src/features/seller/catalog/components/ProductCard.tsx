'use client';

import React, { ReactNode } from 'react';
import Image from 'next/image';
import { Product } from '@/features/seller/catalog/types';
import { formatCurrency } from '@/shared/lib/utils/formatters';
import Icon from '@/components/ui/Icon';

interface ProductCardProps {
    product: Product;
    onEdit: (product: Product) => void;
    onDelete: (productId: string) => void;
    onViewInfo: (product: Product) => void;
    renderPrice?: () => ReactNode;
}

export default function ProductCard({ product, onEdit, onDelete, onViewInfo, renderPrice }: ProductCardProps) {

    return (
        <div className="product-card glass-card p-4 hover:shadow-lg transition-all cursor-pointer group animate-fadeIn h-full flex flex-col relative">
            <div className="relative mb-3 overflow-hidden rounded-xl bg-[var(--bg-secondary)] aspect-square flex items-center justify-center p-2 border border-[var(--border-subtle)]">

                {/* Stickers */}
                <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                    {product.sticker === 'liquidacion' && (
                        <div className="relative group/sticker">
                            <span className="bg-red-500/90 backdrop-blur-sm text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm uppercase cursor-help border border-white/20">
                                Liquidación
                            </span>
                            <div className="absolute left-full ml-2 top-0 px-2 py-1 bg-gray-900 text-white text-xs font-bold rounded opacity-0 group-hover/sticker:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                                Producto en remate total
                            </div>
                        </div>
                    )}
                    {product.sticker === 'oferta' && (
                        <div className="relative group/sticker">
                            <span className="bg-lime-400/90 backdrop-blur-sm text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm uppercase cursor-help border border-white/20">
                                Oferta
                            </span>
                            <div className="absolute left-full ml-2 top-0 px-2 py-1 bg-gray-900 text-white text-xs font-bold rounded opacity-0 group-hover/sticker:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                                Precio especial por tiempo limitado
                            </div>
                        </div>
                    )}
                    {product.sticker === 'descuento' && (
                        <div className="relative group/sticker">
                            <span className="bg-emerald-500/90 backdrop-blur-sm text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm uppercase cursor-help border border-white/20">
                                {product.discountPercentage ? `-${product.discountPercentage}%` : 'Descuento'}
                            </span>
                            <div className="absolute left-full ml-2 top-0 px-2 py-1 bg-gray-900 text-white text-xs font-bold rounded opacity-0 group-hover/sticker:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                                Ahorro directo aplicado
                            </div>
                        </div>
                    )}
                    {product.sticker === 'nuevo' && (
                        <div className="relative group/sticker">
                            <span className="bg-sky-500/90 backdrop-blur-sm text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm uppercase cursor-help border border-white/20">
                                Nuevo
                            </span>
                            <div className="absolute left-full ml-2 top-0 px-2 py-1 bg-gray-900 text-white text-xs font-bold rounded opacity-0 group-hover/sticker:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                                Recién llegado al catálogo
                            </div>
                        </div>
                    )}
                    {product.sticker === 'bestseller' && (
                        <div className="relative group/sticker">
                            <span className="bg-purple-500/90 backdrop-blur-sm text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm uppercase cursor-help border border-white/20">
                                Top Ventas
                            </span>
                            <div className="absolute left-full ml-2 top-0 px-2 py-1 bg-gray-900 text-white text-xs font-bold rounded opacity-0 group-hover/sticker:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                                El favorito de la comunidad
                            </div>
                        </div>
                    )}
                    {product.sticker === 'envio_gratis' && (
                        <div className="relative group/sticker">
                            <span className="bg-teal-500/90 backdrop-blur-sm text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm uppercase cursor-help border border-white/20">
                                Envío Gratis
                            </span>
                            <div className="absolute left-full ml-2 top-0 px-2 py-1 bg-gray-900 text-white text-xs font-bold rounded opacity-0 group-hover/sticker:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                                Costo de envío cubierto por la tienda
                            </div>
                        </div>
                    )}
                </div>

                <Image
                    src={product.image || 'https://placehold.co/300x300/f3f4f6/9ca3af?text=No+Image'}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="product-image object-contain group-hover:scale-110 transition-transform"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
            </div>

            <div className="flex-1 min-h-0 text-center">
                <h3 className="product-name font-black text-xs text-[var(--text-primary)] truncate mb-1 uppercase tracking-tight" title={product.name}>
                    {product.name}
                </h3>
                <div className="flex items-center justify-center gap-2">
                    {renderPrice ? (
                        renderPrice()
                    ) : (
                        <span className="product-price text-sm font-black text-sky-600">
                            {formatCurrency(product.price)}
                        </span>
                    )}
                    <span className="product-stock text-xs font-bold text-[var(--text-secondary)]">
                        Stock: {product.stock}
                    </span>
                </div>
            </div>

            <div className="mt-2 flex gap-1 pt-2 border-t border-[var(--border-subtle)] items-center justify-center">
                <button
                    onClick={(e) => { e.stopPropagation(); onViewInfo(product); }}
                    className="flex-1 py-1.5 bg-[var(--bg-secondary)] text-xs font-black text-[var(--text-secondary)] rounded-lg hover:bg-sky-500/10 hover:text-sky-500 transition-all uppercase"
                >
                    Info
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(product); }}
                    className="p-1.5 text-sky-500 hover:text-sky-600 transition-all"
                >
                    <Icon name="Pencil" className="text-sm w-4 h-4" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(product.id); }}
                    className="p-1.5 text-sky-500 hover:text-red-500 transition-all"
                >
                    <Icon name="Trash2" className="text-sm w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
