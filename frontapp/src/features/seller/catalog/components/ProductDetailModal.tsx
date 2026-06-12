'use client';

import React from 'react';
import Image from 'next/image';
import { AttributeValue, Product, etiquetasFromProduct } from '@/features/seller/catalog/types';
import BaseModal from '@/components/ui/BaseModal';
import { formatCurrency } from '@/shared/lib/utils/formatters';

interface ProductDetailModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
}
// Agrega este helper al inicio del componente o fuera de él
function normalizeValues(values: unknown): AttributeValue[] {
    if (!values) return [];
    // Si ya es array
    if (Array.isArray(values)) {
        return values.map((v) =>
            typeof v === 'object' && v !== null && 'label' in v
                ? (v as AttributeValue)
                : { label: String(v), value: String(v) }
        );
    }
    // Si es un objeto directo {label, value}
    if (typeof values === 'object' && 'label' in (values as object)) {
        return [values as AttributeValue];
    }
    return [];
}

export default function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
    if (!product) return null;

    const mainAttributes       = product.mainAttributes       || [];
    const additionalAttributes = product.additionalAttributes || [];
    const etiquetas = etiquetasFromProduct(product);
    const hasEtiquetas = etiquetas.nuevo || etiquetas.descuento || etiquetas.oferta || etiquetas.edicionLimitada || etiquetas.promocion;

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={product.name}
            subtitle="Detalle del Producto"
            size="4xl"
            accentColor="from-sky-500 to-sky-700 dark:from-[var(--icons-green)] dark:to-[var(--brand-green)]"
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

                        {/* Gradient overlay */}
                        {hasEtiquetas && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                        )}

                        {/* Etiquetas overlay */}
                        {hasEtiquetas && (
                            <div className="absolute top-3 left-0 flex flex-col gap-1.5 z-10">
                                {etiquetas.nuevo && (
                                    <div
                                        className="inline-flex items-center px-3 py-1.5 text-[9px] font-black tracking-wider"
                                        style={{ background: '#ADEBB3', color: '#0d3318', borderRadius: '4px 999px 999px 4px', boxShadow: '0 3px 14px rgba(173,235,179,0.6)' }}
                                    >
                                        Nuevo
                                    </div>
                                )}
                                {etiquetas.descuento && (
                                    <div
                                        className="inline-flex items-center px-3 py-1.5 text-[9px] font-black tracking-wider"
                                        style={{ background: 'linear-gradient(135deg,#dc2626,#f87171)', color: 'white', borderRadius: '4px 999px 999px 4px', boxShadow: '0 3px 14px rgba(220,38,38,0.65)' }}
                                    >
                                        -{etiquetas.descuento.valor}%
                                    </div>
                                )}
                                {etiquetas.oferta && (
                                    <div
                                        className="inline-flex items-center px-3 py-1.5 text-[9px] font-black tracking-wider"
                                        style={{ background: 'linear-gradient(135deg,#991b1b,#dc2626)', color: 'white', borderRadius: '4px 999px 999px 4px', boxShadow: '0 3px 14px rgba(220,38,38,0.75)' }}
                                    >
                                        −{etiquetas.oferta.valor}%
                                    </div>
                                )}
                                {etiquetas.edicionLimitada && (
                                    <div
                                        className="inline-flex items-center px-3 py-1.5 text-[9px] font-bold tracking-wider"
                                        style={{ background: '#59a6cb', color: '#1a2e3a', borderRadius: '4px 999px 999px 4px' }}
                                    >
                                        Ed. Limitada
                                    </div>
                                )}
                                {etiquetas.promocion && (
                                    <div
                                        className="inline-flex items-center px-3 py-1.5 text-[9px] font-bold tracking-wider"
                                        style={{ background: 'linear-gradient(135deg,#ea580c,#fb923c)', color: 'white', borderRadius: '4px 999px 999px 4px', boxShadow: '0 3px 14px rgba(234,88,12,0.65)' }}
                                    >
                                        Promo
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="p-3 bg-[var(--bg-secondary)] rounded-xl">
                            <p className="text-xs font-black text-[var(--text-secondary)] uppercase">Stock</p>
                            <p className="text-lg font-black text-[var(--text-primary)]">{product.stock ?? 0}</p>
                        </div>
                        <div className="p-3 bg-sky-500/10 dark:bg-[var(--icons-green)]/15 rounded-xl">
                            <p className="text-xs font-black text-sky-400 dark:text-[var(--icons-green)] uppercase">Precio</p>
                            <p className="text-lg font-black text-sky-500 dark:text-[var(--icons-green)]">{formatCurrency(product.price)}</p>
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
                            {/* Etiquetas como chips */}
                            {etiquetas.nuevo && (
                                <span className="px-2 py-1 rounded-md text-xs font-black uppercase tracking-wider" style={{ background: '#ADEBB3', color: '#0d3318' }}>Nuevo</span>
                            )}
                            {etiquetas.descuento && (
                                <span className="px-2 py-1 rounded-md text-xs font-black uppercase tracking-wider" style={{ background: 'linear-gradient(135deg,#dc2626,#f87171)', color: 'white' }}>-{etiquetas.descuento.valor}%</span>
                            )}
                            {etiquetas.oferta && (
                                <span className="px-2 py-1 rounded-md text-xs font-black uppercase tracking-wider" style={{ background: 'linear-gradient(135deg,#991b1b,#dc2626)', color: 'white' }}>−{etiquetas.oferta.valor}% Oferta</span>
                            )}
                            {etiquetas.edicionLimitada && (
                                <span className="px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider" style={{ background: '#59a6cb', color: '#1a2e3a' }}>Ed. Limitada</span>
                            )}
                            {etiquetas.promocion && (
                                <span className="px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider" style={{ background: 'linear-gradient(135deg,#ea580c,#fb923c)', color: 'white' }}>Promo</span>
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
                                    {mainAttributes.map((attr, idx) => {
                                        const vals = normalizeValues(attr.values);
                                        if (!vals.length) return null;
                                        return (
                                            <div key={`main-${idx}`} className="flex justify-between py-2 border-b border-[var(--border-subtle)] border-dashed">
                                                <span className="text-xs font-black text-[var(--text-primary)] uppercase">{vals[0].label}</span>
                                                <span className="text-xs font-bold text-[var(--text-secondary)]">{vals[0].value}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {additionalAttributes.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest border-b border-[var(--border-subtle)] pb-2">Detalles Adicionales</h4>
                                <div className="space-y-2">
                                    {additionalAttributes.map((attr, idx) => {
                                        const vals = normalizeValues(attr.values);
                                        if (!vals.length) return null;
                                        return (
                                            <div key={`additional-${idx}`} className="flex justify-between py-2 border-b border-[var(--border-subtle)] border-dashed">
                                                <span className="text-xs font-black text-[var(--text-secondary)] uppercase">{vals[0].label}</span>
                                                <span className="text-xs font-medium text-[var(--text-secondary)]">{vals[0].value}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </BaseModal>
    );
}