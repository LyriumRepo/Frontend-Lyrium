'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Product, ProductAttribute, ProductSticker } from '@/features/seller/catalog/types';
import BaseModal from '@/components/ui/BaseModal';
import BaseButton from '@/components/ui/BaseButton';
import { useToast } from '@/shared/lib/context/ToastContext';
import Icon from '@/components/ui/Icon';

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: Product) => void;
    productToEdit?: Product | null;
}

// Único formato aceptado: { values: { label: string, value: string } }
// Ya NO hay normalización de formato legacy — se eliminaron esos productos
function makeEmptyAttr(): ProductAttribute {
    return { values: { label: '', value: '' } };
}

export default function ProductModal({ isOpen, onClose, onSave, productToEdit }: ProductModalProps) {
    const initialProduct: Product = {
        id: '',
        name: '',
        category: '',
        price: 0,
        stock: 0,
        weight: 0,
        dimensions: '',
        description: '',
        image: '',
        sticker: null,
        mainAttributes: [makeEmptyAttr()],
        additionalAttributes: [],
        createdAt: new Date().toISOString(),
    };

    const [formData, setFormData] = useState<Product>(initialProduct);
    const [previewImage, setPreviewImage] = useState<string>('');
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: categories = [] } = useQuery<Category[]>({
        queryKey: ['seller', 'categories'],
        queryFn: async () => {
            const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';
            const res = await fetch(`${LARAVEL_API_URL}/categories?type=product&per_page=100`);
            const data = await res.json();
            return data.data || data || [];
        },
        staleTime: 5 * 60 * 1000,
    });

    // ─── Carga el producto al abrir el modal ────────────────────────────────
    useEffect(() => {
        if (isOpen) {
            if (productToEdit) {
                // Mapear categories[] → category slug (formato API real)
                const categorySlug =
                    (productToEdit as any).category ||
                    (productToEdit as any).categories?.[0]?.slug ||
                    '';

                // Mapear images[] → image string (formato API real)
                const imageUrl =
                    (productToEdit as any).image ||
                    (productToEdit as any).images?.[0]?.src ||
                    '';

                // Los atributos YA deben venir en formato { values: { label, value } }
                // No hay normalización legacy — si no tienen ese formato, se ignoran
                const safeAttrs = (attrs: any[]): ProductAttribute[] =>
                    (attrs || [])
                        .filter(
                            (a) =>
                                a?.values &&
                                typeof a.values === 'object' &&
                                !Array.isArray(a.values) &&
                                'label' in a.values &&
                                'value' in a.values
                        )
                        .map((a) => ({
                            values: {
                                label: a.values.label ?? '',
                                value: a.values.value ?? '',
                            },
                        }));

                setFormData({
                    ...productToEdit,
                    category: categorySlug,
                    image: imageUrl,
                    mainAttributes: safeAttrs(productToEdit.mainAttributes),
                    additionalAttributes: safeAttrs(productToEdit.additionalAttributes),
                });
                setPreviewImage(imageUrl);
            } else {
                setFormData({ ...initialProduct, id: Date.now().toString() });
                setPreviewImage('');
            }
        }
    }, [isOpen, productToEdit]);

    // ─── Handlers genéricos ──────────────────────────────────────────────────
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleStickerChange = (sticker: ProductSticker) => {
        setFormData((prev) => ({ ...prev, sticker }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
                setFormData((prev) => ({ ...prev, image: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    // ─── Atributos: único formato { values: { label, value } } ───────────────
    const addAttribute = (type: 'main' | 'additional') => {
        const total =
            (formData.mainAttributes?.length || 0) +
            (formData.additionalAttributes?.length || 0);
        if (total >= 6) return;

        const key = type === 'main' ? 'mainAttributes' : 'additionalAttributes';
        setFormData((prev) => ({
            ...prev,
            [key]: [...(prev[key] || []), makeEmptyAttr()],
        }));
    };

    const removeAttribute = (type: 'main' | 'additional', index: number) => {
        const key = type === 'main' ? 'mainAttributes' : 'additionalAttributes';
        setFormData((prev) => ({
            ...prev,
            [key]: (prev[key] || []).filter((_: any, i: number) => i !== index),
        }));
    };

    const updateAttribute = (
        type: 'main' | 'additional',
        rowIndex: number,
        field: 'label' | 'value',
        val: string
    ) => {
        const key = type === 'main' ? 'mainAttributes' : 'additionalAttributes';
        const newAttrs = [...(formData[key] || [])];
        newAttrs[rowIndex] = {
            values: {
                ...(newAttrs[rowIndex].values as { label: string; value: string }),
                [field]: val,
            },
        };
        setFormData((prev) => ({ ...prev, [key]: newAttrs }));
    };

    // ─── Submit ──────────────────────────────────────────────────────────────
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.image) {
            showToast('Es obligatorio adjuntar una foto del producto', 'error');
            return;
        }
        if (!formData.weight || formData.weight <= 0) {
            showToast('Especifica un peso válido para logística', 'error');
            return;
        }
        if (!formData.dimensions) {
            showToast('Las dimensiones son necesarias para el cálculo de envío', 'error');
            return;
        }

        onSave(formData);
        onClose();
    };

    // ─── Render filas de atributos ───────────────────────────────────────────
    const renderAttributeRows = (type: 'main' | 'additional') => {
        const attrs = type === 'main' ? formData.mainAttributes : formData.additionalAttributes;
        return (attrs || []).map((attr, rowIndex) => {
            const vals = attr.values as { label: string; value: string };
            return (
                <tr
                    key={rowIndex}
                    className="divide-x divide-[var(--border-subtle)] group border-b last:border-none"
                >
                    <td className="px-3 py-2">
                        <input
                            type="text"
                            value={vals.label || ''}
                            onChange={(e) => updateAttribute(type, rowIndex, 'label', e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 text-[10px] font-bold text-[var(--text-primary)] outline-none"
                            placeholder="Ej: Marca"
                        />
                    </td>
                    <td className="px-3 py-2">
                        <input
                            type="text"
                            value={vals.value || ''}
                            onChange={(e) => updateAttribute(type, rowIndex, 'value', e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 text-[10px] font-bold text-[var(--text-primary)] outline-none"
                            placeholder="Ej: Drasanvi"
                        />
                    </td>
                    <td className="px-2 py-2 text-center w-8">
                        <button
                            type="button"
                            onClick={() => removeAttribute(type, rowIndex)}
                            className="text-[var(--text-secondary)] hover:text-[var(--text-danger)] transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Icon name="Trash2" className="font-bold w-4 h-4" />
                        </button>
                    </td>
                </tr>
            );
        });
    };

    // ─── JSX ─────────────────────────────────────────────────────────────────
    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={productToEdit ? 'Editar Producto' : 'Ficha de Producto'}
            subtitle="Gestión estratégica de catálogo e inventario"
            size="4xl"
            accentColor="from-emerald-400 via-sky-500 to-indigo-500"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* ── Imagen principal ── */}
                    <div className="lg:col-span-3 space-y-3">
                        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-1">
                            Visual Principal
                        </p>
                        <div
                            role="button"
                            tabIndex={0}
                            className="relative bg-[var(--bg-secondary)] border-2 border-dashed border-[var(--border-subtle)] aspect-square flex flex-col items-center justify-center cursor-pointer group rounded-[2rem] overflow-hidden hover:border-[var(--brand-sky)]/30 transition-all shadow-inner"
                            onClick={() => fileInputRef.current?.click()}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
                            }}
                        >
                            {previewImage ? (
                                <Image
                                    src={previewImage}
                                    fill
                                    sizes="100vw"
                                    className="object-cover"
                                    alt="Product"
                                    unoptimized={previewImage.startsWith('data:') || previewImage.startsWith('http')}
                                />
                            ) : (
                                <div className="text-center group-hover:scale-110 transition-transform">
                                    <Icon name="Image" className="text-4xl text-[var(--text-secondary)] w-10 h-10 mx-auto" />
                                    <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase mt-2">
                                        Adjuntar Foto
                                    </p>
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>
                    </div>

                    {/* ── Metadatos ── */}
                    <div className="lg:col-span-9 space-y-3">
                        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-1">
                            Metadatos del Producto
                        </p>
                        <div className="overflow-hidden border border-[var(--border-subtle)] rounded-[2rem] shadow-sm bg-[var(--bg-card)]">
                            <table className="w-full text-sm">
                                <tbody className="divide-y divide-[var(--border-subtle)]">
                                    {/* Nombre */}
                                    <tr className="bg-[var(--bg-secondary)]/10">
                                        <td className="px-5 py-3 font-black text-[var(--text-secondary)] text-[10px] uppercase tracking-tighter w-1/4">
                                            Denominación
                                        </td>
                                        <td className="px-5 py-3">
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full bg-transparent border-none focus:ring-0 font-black text-[var(--text-primary)] p-0 outline-none text-base"
                                                placeholder="Nombre comercial"
                                            />
                                        </td>
                                    </tr>
                                    {/* Categoría */}
                                    <tr>
                                        <td className="px-5 py-3 font-black text-[var(--text-secondary)] text-[10px] uppercase tracking-tighter">
                                            Categoría
                                        </td>
                                        <td className="px-5 py-3">
                                            <select
                                                name="category"
                                                required
                                                value={formData.category}
                                                onChange={handleChange}
                                                className="w-full bg-transparent border-none focus:ring-0 font-bold text-[var(--text-primary)] p-0 outline-none cursor-pointer"
                                            >
                                                <option value="">Seleccionar Categoría...</option>
                                                {categories.map((cat) => (
                                                    <option key={cat.id} value={cat.slug}>
                                                        {cat.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                    {/* Precio */}
                                    <tr className="bg-[var(--bg-secondary)]/10">
                                        <td className="px-5 py-3 font-black text-[var(--text-secondary)] text-[10px] uppercase tracking-tighter">
                                            Valorización
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-emerald-500 font-black">S/</span>
                                                <input
                                                    type="number"
                                                    name="price"
                                                    step="0.01"
                                                    required
                                                    value={formData.price}
                                                    onChange={handleChange}
                                                    className="w-full bg-transparent border-none focus:ring-0 font-black text-[var(--text-primary)] p-0 outline-none"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                    {/* Stock / Peso / Dimensiones */}
                                    <tr>
                                        <td className="px-5 py-3 font-black text-[var(--text-secondary)] text-[10px] uppercase tracking-tighter">
                                            Operativo
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="grid grid-cols-3 gap-6 divide-x divide-[var(--border-subtle)]">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase">Stock</span>
                                                    <input
                                                        type="number"
                                                        name="stock"
                                                        min="0"
                                                        required
                                                        value={formData.stock}
                                                        onChange={handleChange}
                                                        className="w-full bg-transparent border-none focus:ring-0 font-black text-[var(--text-primary)] p-0 outline-none"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1 pl-4">
                                                    <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase">Peso (kg)</span>
                                                    <input
                                                        type="number"
                                                        name="weight"
                                                        step="0.1"
                                                        value={formData.weight || ''}
                                                        onChange={handleChange}
                                                        className="w-full bg-transparent border-none focus:ring-0 font-black text-[var(--text-primary)] p-0 outline-none"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1 pl-4">
                                                    <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase">Dimen (LxWxH)</span>
                                                    <input
                                                        type="text"
                                                        name="dimensions"
                                                        value={formData.dimensions || ''}
                                                        onChange={handleChange}
                                                        className="w-full bg-transparent border-none focus:ring-0 font-black text-[var(--text-primary)] p-0 outline-none font-mono text-[10px]"
                                                        placeholder="0x0x0 cm"
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    {/* Sticker */}
                                    <tr className="bg-[var(--bg-secondary)]/10">
                                        <td className="px-5 py-2 font-black text-[var(--text-secondary)] text-[10px] uppercase tracking-tighter">
                                            Promoción
                                        </td>
                                        <td className="px-5 py-2">
                                            <div className="flex flex-wrap gap-2">
                                                {[
                                                    { val: null,          label: 'Ninguno',  color: 'gray'    },
                                                    { val: 'nuevo',       label: 'Nuevo',    color: 'sky'     },
                                                    { val: 'oferta',      label: 'Oferta',   color: 'lime'    },
                                                    { val: 'bestseller',  label: 'Top',      color: 'purple'  },
                                                    { val: 'descuento',   label: 'Desc %',   color: 'emerald' },
                                                ].map((opt) => (
                                                    <label key={opt.val || 'none'} className="cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="sticker"
                                                            checked={formData.sticker === opt.val}
                                                            onChange={() => handleStickerChange(opt.val as ProductSticker)}
                                                            className="sr-only"
                                                        />
                                                        <div
                                                            className={`px-3 py-1.5 rounded-xl border text-[8px] font-black uppercase transition-all ${
                                                                formData.sticker === opt.val
                                                                    ? opt.color === 'gray'
                                                                        ? 'bg-gray-900 text-white border-gray-900 scale-105 shadow-sm'
                                                                        : opt.color === 'sky'
                                                                        ? 'bg-sky-500 text-white border-sky-500 scale-105 shadow-sm'
                                                                        : opt.color === 'lime'
                                                                        ? 'bg-lime-400 text-white border-lime-400 scale-105 shadow-sm'
                                                                        : opt.color === 'purple'
                                                                        ? 'bg-purple-500 text-white border-purple-500 scale-105 shadow-sm'
                                                                        : 'bg-emerald-500 text-white border-emerald-500 scale-105 shadow-sm'
                                                                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-default)]'
                                                            }`}
                                                        >
                                                            {opt.label}
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ── Descripción y Atributos ── */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label
                            htmlFor="product-description"
                            className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-2"
                        >
                            Reseña del Producto
                        </label>
                        <textarea
                            id="product-description"
                            name="description"
                            rows={2}
                            required
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[1.5rem] p-4 text-sm font-medium text-[var(--text-primary)] outline-none focus:ring-4 focus:ring-[var(--brand-sky)]/5 focus:bg-[var(--bg-card)] transition-all resize-none"
                            placeholder="Describe los beneficios clave..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* ── Atributos Técnicos (main) ── */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-3 bg-sky-500 rounded-full" />
                                    Técnicos
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => addAttribute('main')}
                                    className="w-7 h-7 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-center text-sky-500 hover:bg-sky-50 transition-all shadow-xs active:scale-90"
                                >
                                    <Icon name="Plus" className="font-bold text-xs w-3 h-3" />
                                </button>
                            </div>
                            <div className="rounded-[1.5rem] overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-xs">
                                <table className="w-full text-xs">
                                    <tbody className="divide-y divide-[var(--border-subtle)]">
                                        {renderAttributeRows('main')}
                                        {(!formData.mainAttributes || formData.mainAttributes.length === 0) && (
                                            <tr>
                                                <td className="p-4 text-center text-[9px] font-black text-[var(--text-secondary)] uppercase italic">
                                                    Sin atributos técnicos
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* ── Atributos Adicionales ── */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-3 bg-indigo-500 rounded-full" />
                                    Detalles
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => addAttribute('additional')}
                                    className="w-7 h-7 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-center text-indigo-500 hover:bg-indigo-50 transition-all shadow-xs active:scale-90"
                                >
                                    <Icon name="Plus" className="font-bold text-xs w-3 h-3" />
                                </button>
                            </div>
                            <div className="rounded-[1.5rem] overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-xs">
                                <table className="w-full text-xs text-[var(--text-secondary)]">
                                    <tbody className="divide-y divide-[var(--border-subtle)]">
                                        {renderAttributeRows('additional')}
                                        {(!formData.additionalAttributes || formData.additionalAttributes.length === 0) && (
                                            <tr>
                                                <td className="p-4 text-center text-[9px] font-black text-[var(--text-secondary)] uppercase italic">
                                                    Sin adicionales
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border-subtle)] sticky bottom-0 bg-[var(--bg-card)]/90 backdrop-blur-md -mx-8 -mb-8 p-6">
                    <BaseButton variant="ghost" onClick={onClose}>
                        Cancelar
                    </BaseButton>
                    <BaseButton type="submit" variant="primary" className="px-10">
                        Guardar Ficha
                    </BaseButton>
                </div>
            </form>
        </BaseModal>
    );
}