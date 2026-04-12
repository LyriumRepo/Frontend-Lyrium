'use client';

import React from 'react';
import Image from 'next/image';
import { Product } from '@/features/seller/catalog/types';
import BaseModal from '@/components/ui/BaseModal';
import { formatCurrency } from '@/shared/lib/utils/formatters';

interface ProductDetailModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
    if (!product) return null;

    const mainAttributes = product.mainAttributes || [];
    const additionalAttributes = product.additionalAttributes || [];

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={product.name}
            subtitle="Detalle del Producto"
            size="4xl"
            accentColor="from-sky-500 to-indigo-500"
        >
            <div className="flex flex-col md:flex-row gap-8">
                {/* Image Side */}
                <div className="w-full md:w-1/3 space-y-4">
                    <div className="relative aspect-square bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center p-4 border border-[var(--border-subtle)] overflow-hidden">
                        {product.image ? (
                            <Image 
                                src={product.image} 
                                alt={product.name} 
                                fill 
                                sizes="(max-width: 768px) 100vw, 33vw" 
                                className="object-cover"
                            />
                        ) : (
                            <div className="text-center text-[var(--text-secondary)]">
                                <p className="text-xs font-black uppercase">Sin imagen</p>
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="p-3 bg-[var(--bg-secondary)] rounded-xl">
                            <p className="text-xs font-black text-[var(--text-secondary)] uppercase">Stock</p>
                            <p className="text-lg font-black text-[var(--text-primary)]">{product.stock ?? 0}</p>
                        </div>
                        <div className="p-3 bg-sky-500/10 rounded-xl">
                            <p className="text-xs font-black text-sky-400 uppercase">Precio</p>
                            <p className="text-lg font-black text-sky-500">{formatCurrency(product.price)}</p>
                        </div>
                    </div>
                </div>

                {/* Details Side */}
                <div className="flex-1 space-y-6">
                    <div>
                        <div className="flex gap-2 mb-4 flex-wrap">
                            {product.category && (
                                <span className="px-2 py-1 bg-[var(--bg-secondary)] rounded-md text-xs font-bold text-[var(--text-secondary)] uppercase">{product.category}</span>
                            )}
                            {product?.sticker && (
                                <span className="px-2 py-1 bg-sky-500/10 rounded-md text-xs font-bold text-sky-500 uppercase">{product.sticker}</span>
                            )}
                        </div>
                    </div>

                    {product.description && (
                        <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                            {product.description}
                        </p>
                    )}

                    <div className="space-y-6">
                        {mainAttributes.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-xs font-black text-sky-500 uppercase tracking-widest border-b border-sky-500/20 pb-2">Información Principal</h4>
                                <div className="space-y-2">
                                    {mainAttributes.map((attr, idx) => (
                                        <div key={`main-${attr.name || idx}`} className="grid grid-cols-2 md:grid-cols-3 gap-4 py-2 border-b border-[var(--border-subtle)] border-dashed">
                                            {attr.values && Array.isArray(attr.values) && attr.values.map((val, vIdx) => (
                                                <span key={`${attr.name}-${vIdx}`} className={`text-xs ${vIdx === 0 ? 'font-black text-[var(--text-primary)] uppercase' : 'font-bold text-[var(--text-secondary)]'}`}>
                                                    {val}
                                                </span>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {additionalAttributes.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest border-b border-[var(--border-subtle)] pb-2">Detalles Adicionales</h4>
                                <div className="space-y-2">
                                    {additionalAttributes.map((attr, idx) => (
                                        <div key={`additional-${attr.name || idx}`} className="grid grid-cols-2 md:grid-cols-3 gap-4 py-2 border-b border-[var(--border-subtle)] border-dashed">
                                            {attr.values && Array.isArray(attr.values) && attr.values.map((val, vIdx) => (
                                                <span key={`${attr.name}-${vIdx}`} className={`text-xs ${vIdx === 0 ? 'font-bold text-[var(--text-secondary)] uppercase' : 'font-medium text-[var(--text-secondary)]'}`}>
                                                    {val}
                                                </span>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}
