'use client';

import React, { ReactNode } from 'react';
import Image from 'next/image';
import { Product, etiquetasFromProduct } from '@/features/seller/catalog/types';
import Icon from '@/components/ui/Icon';

const PRODUCT_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    approved:       { label: 'Aprobado',  className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400' },
    inactive:       { label: 'Inactivo',  className: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
    pending_review: { label: 'Pendiente', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400' },
    rejected:       { label: 'Rechazado', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
    draft:          { label: 'Borrador',  className: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
};

export function ProductStatusBadge({ status }: { status?: string }) {
    const config = PRODUCT_STATUS_CONFIG[status ?? 'draft'] ?? PRODUCT_STATUS_CONFIG.draft;
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${config.className}`}>
            {config.label}
        </span>
    );
}

interface ProductCardProps {
    product:    Product;
    onEdit:     (product: Product) => void;
    onDelete:   (productId: string) => void;
    onViewInfo: (product: Product) => void;
    onToggleVisibility?: (productId: string, visible: boolean) => void;
    renderPrice?: () => ReactNode;
}

export default function ProductCard({
    product,
    onEdit,
    onDelete,
    onViewInfo,
    onToggleVisibility,
    renderPrice,
}: ProductCardProps) {

    return (
        <tr className="border-b border-[var(--border-subtle)] last:border-b-0 hover:bg-[var(--bg-secondary)]/60 transition-colors group">

            {/* ── Producto ── */}
            <td className="px-4 py-3 w-[260px]">
                <div className="flex items-center gap-3">
                    {/* Imagen — siempre visible (en móvil se usa el accordion) */}
                    <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] relative">
                        <Image
                            src={product.image || 'https://placehold.co/36x36/f3f4f6/9ca3af?text=?'}
                            alt={product.name}
                            fill
                            sizes="36px"
                            className="object-contain"
                        />
                        {(() => {
                            const e = etiquetasFromProduct(product);
                            if (!e.nuevo && !e.descuento && !e.oferta && !e.edicionLimitada) return null;
                            return (
                                <div className="absolute -top-0.5 -left-0.5 z-10">
                                    <div className={`text-[6px] font-black uppercase tracking-wider px-1 py-[1px] leading-tight ${
                                        e.nuevo ? 'bg-[#ADEBB3] text-[#0d3318]' :
                                        e.descuento || e.oferta ? 'bg-red-500 text-white' :
                                        'bg-[#59a6cb] text-[#1a2e3a]'
                                    }`} style={{ borderRadius: '2px 6px 6px 2px' }}>
                                        {e.nuevo ? 'NUEVO' : e.descuento ? `-${e.descuento.valor}%` : e.oferta ? `-${e.oferta.valor}%` : 'ED.LIM'}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--text-primary)] whitespace-nowrap leading-tight">
                            {product.name}
                        </p>
                    </div>
                </div>
            </td>

            {/* ── Categoría ── */}
            <td className="px-4 py-3 w-[220px]">
                {product.category ? (
                    <span className="whitespace-nowrap text-xs text-[var(--text-secondary)]">
                        {product.category}
                    </span>
                ) : (
                    <span className="text-[var(--text-secondary)] opacity-30 text-sm">—</span>
                )}
            </td>

            {/* ── Precio ── */}
            <td className="px-4 py-3 whitespace-nowrap text-center">
                {renderPrice ? (
                    renderPrice()
                ) : (
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                        S/ {product.price.toFixed(2)}
                    </span>
                )}
            </td>

            {/* ── Stock ── */}
            <td className="px-4 py-3 whitespace-nowrap">
                <span className={`text-sm font-semibold ${product.stock === 0 ? 'text-red-400' : 'text-[var(--text-primary)]'}`}>
                    {product.stock}
                    {product.stock === 0 && (
                        <span className="ml-1.5 text-[8px] font-semibold uppercase tracking-wider text-red-400 border border-red-400/30 px-1 py-0.5 rounded">
                            Agotado
                        </span>
                    )}
                </span>
            </td>

            {/* ── Estado / Visibilidad ── */}
            <td className="px-4 py-3 whitespace-nowrap">
                {(product.status === 'approved' || product.status === 'inactive') && onToggleVisibility ? (
                    <button
                        onClick={() => onToggleVisibility(product.id, product.status !== 'approved')}
                        className={`relative inline-flex items-center h-5 w-9 rounded-full transition-colors ${
                            product.status === 'approved' ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                        title={product.status === 'approved' ? 'Ocultar producto' : 'Publicar producto'}
                    >
                        <span className={`inline-block w-3.5 h-3.5 bg-white rounded-full transition-transform ${
                            product.status === 'approved' ? 'translate-x-[18px]' : 'translate-x-1'
                        }`} />
                    </button>
                ) : (
                    <ProductStatusBadge status={product.status} />
                )}
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