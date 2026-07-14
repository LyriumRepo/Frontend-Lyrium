'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Product, ProductAttribute, ProductSticker, etiquetasFromProduct } from '@/features/seller/catalog/types';
import BaseModal from '@/components/ui/BaseModal';
import BaseButton from '@/components/ui/BaseButton';
import { useToast } from '@/shared/lib/context/ToastContext';
import Icon from '@/components/ui/Icon';
import { usePlanCapabilities } from '@/shared/lib/hooks/usePlanCapabilities';
import PlanUpgradeMessage from '@/features/seller/store/components/PlanUpgradeMessage';

interface Category {
    id: number;
    name: string;
    slug: string;
    children?: Category[];
    level?: number;
}

function flattenCategoryTree(nodes: Category[], level = 0): Category[] {
    const result: Category[] = [];
    for (const node of nodes) {
        const children = node.children ?? [];
        result.push({ ...node, children: [], level });
        if (children.length > 0) {
            result.push(...flattenCategoryTree(children, level + 1));
        }
    }
    return result;
}

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: Product, file?: File) => void;
    productToEdit?: Product | null;
}

// ── Etiquetas ──────────────────────────────────────────────────────────────────
interface EtiquetaDescuentoData {
    valor: number;
    inicio: string;
    fin: string | null;
}
interface EtiquetaOfertaData {
    valor: number;
    inicio: string;
    fin: string;
}
interface EtiquetaEdicionData {
    inicio: string;
    fin: string;
}
interface EtiquetaPromocionData {
    productosIds: string[];
}
interface ProductEtiquetaConfig {
    nuevo: boolean;
    descuento?: EtiquetaDescuentoData;
    oferta?: EtiquetaOfertaData;
    edicionLimitada?: EtiquetaEdicionData;
    promocion?: EtiquetaPromocionData;
}

const inputCls = 'w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-sky-500/50 transition-colors';

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';

interface BranchStockItem {
    id: number;
    name: string;
    address: string;
    district: string;
    is_principal: boolean;
}

function BranchStockSection({ productId, storeId }: { productId?: string | number; storeId?: number }) {
    const [branches, setBranches] = useState<BranchStockItem[]>([]);
    const [branchStockMap, setBranchStockMap] = useState<Record<number, { stock: number; pickup_enabled: boolean }>>({});
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (!productId) return;
        setLoading(true);
        const token = localStorage.getItem('laravel_token');
        const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };

        // Intentar cargar branch stock del producto; si falla (403/404), cargar sucursales desde /stores/me
        fetch(`${LARAVEL_API_URL}/products/${productId}/branches`, { headers })
            .then(async r => {
                if (!r.ok) {
                    // Fallback: obtener sucursales desde la tienda del vendedor
                    const storeRes = await fetch(`${LARAVEL_API_URL}/stores/me`, { headers });
                    if (!storeRes.ok) return [];
                    const storeJson = await storeRes.json();
                    const storeBranches = (storeJson.data?.branches || storeJson.branches || []) as any[];
                    return storeBranches.filter((b: any) => b.is_active !== false).map((b: any) => ({
                        id: b.id, name: b.name, address: b.address, district: b.district,
                        branch_stock: 0, pickup_enabled: true,
                    }));
                }
                const json = await r.json();
                return json.data || [];
            })
            .then(data => {
                setBranches(data);
                const map: Record<number, { stock: number; pickup_enabled: boolean }> = {};
                data.forEach((b: any) => {
                    map[b.id] = { stock: b.branch_stock ?? 0, pickup_enabled: b.pickup_enabled ?? true };
                });
                setBranchStockMap(map);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [productId]);

    const handleSave = async () => {
        if (!productId) return;
        const token = localStorage.getItem('laravel_token');
        const payload = Object.entries(branchStockMap).map(([branchId, v]) => ({
            branch_id: parseInt(branchId),
            stock: v.stock,
            pickup_enabled: v.pickup_enabled,
        }));
        try {
            const res = await fetch(`${LARAVEL_API_URL}/products/${productId}/branches`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ branches: payload }),
            });
            if (res.ok) {
                setSaved(true);
                showToast('Stock por sucursal guardado', 'success');
                setTimeout(() => setSaved(false), 2000);
            } else {
                const err = await res.json().catch(() => ({ message: 'Error al guardar' }));
                showToast(err.message || 'Error al guardar stock por sucursal', 'error');
            }
        } catch {
            showToast('Error de conexión al guardar stock', 'error');
        }
    };

    if (!productId) {
        return (
            <p className="text-[10px] text-[var(--text-secondary)] italic">
                Guarda el producto primero para configurar stock por sucursal.
            </p>
        );
    }

    if (loading) {
        return <p className="text-[10px] text-[var(--text-secondary)]">Cargando sucursales...</p>;
    }

    if (branches.length === 0) {
        return (
            <p className="text-[10px] text-[var(--text-secondary)]">
                No hay sucursales activas.{' '}
                <a href="/seller/store" className="text-sky-500 dark:text-[var(--icons-green)] underline font-bold">
                    Crear sucursal
                </a>
            </p>
        );
    }

    return (
        <div className="space-y-2">
            {branches.map(branch => (
                <div key={branch.id} className="flex items-center gap-3 py-1.5 border-b border-[var(--border-subtle)] last:border-0">
                    <span className="text-[10px] font-bold text-[var(--text-primary)] flex-1 truncate">
                        {branch.name}
                        {branch.is_principal && <span className="text-[var(--brand-sky)] dark:text-[var(--icons-green)] ml-1">(Principal)</span>}
                    </span>
                    <input
                        type="number"
                        min="0"
                        value={branchStockMap[branch.id]?.stock ?? 0}
                        onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setBranchStockMap(prev => ({ ...prev, [branch.id]: { ...prev[branch.id], stock: val } }));
                        }}
                        className="w-16 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-[10px] font-bold text-[var(--text-primary)] text-center focus:outline-none focus:border-sky-500/50"
                    />
                    <button
                        type="button"
                        onClick={() => {
                            setBranchStockMap(prev => ({
                                ...prev,
                                [branch.id]: { ...prev[branch.id], pickup_enabled: !prev[branch.id]?.pickup_enabled },
                            }));
                        }}
                        className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                            branchStockMap[branch.id]?.pickup_enabled !== false ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}
                    >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                            branchStockMap[branch.id]?.pickup_enabled !== false ? 'translate-x-3.5' : 'translate-x-0.5'
                        }`} />
                    </button>
                </div>
            ))}
            <button
                type="button"
                onClick={handleSave}
                className={`mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    saved
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'bg-sky-500 hover:bg-sky-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white shadow-md shadow-sky-200/50 dark:shadow-emerald-900/20'
                }`}
            >
                {saved ? (
                    <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        Guardado
                    </>
                ) : (
                    <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                        Guardar stock
                    </>
                )}
            </button>
        </div>
    );
}

export default function ProductModal({ isOpen, onClose, onSave, productToEdit }: ProductModalProps) {
    const initialProduct: Product = {
        id: '',
        name: '',
        type: 'physical',
        category: '',
        price: 0,
        stock: 0,
        weight: 0,
        dimensions: '',
        description: '',
        short_description: '',
        image: '',
        sticker: null,
        mainAttributes: [{ values: ['', ''] }],
        additionalAttributes: [],
        nutritionalAttributes: [],
        servingNote: '',
        createdAt: new Date().toISOString()
    };

    const [formData, setFormData] = useState<Product>(initialProduct);
    const [etiquetas, setEtiquetas] = useState<ProductEtiquetaConfig>({ nuevo: false });
    const [previewImage, setPreviewImage] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDark, setIsDark] = useState(false);
    const [showTagPreview, setShowTagPreview] = useState(false);
    const [showStickerUpgrade, setShowStickerUpgrade] = useState(false);
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { stickerTypes, capabilities } = usePlanCapabilities();
    const isStickerAllowed = (sticker: string) => !capabilities || stickerTypes.includes(sticker);

    const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';

    const { data: categories = [] } = useQuery<Category[]>({
        queryKey: ['seller', 'categories'],
        queryFn: async () => {
            const res = await fetch(`${LARAVEL_API_URL}/categories?type=product&tree=1&per_page=100`);
            const data = await res.json();
            const tree = data.data || data || [];
            return flattenCategoryTree(tree);
        },
        staleTime: 5 * 60 * 1000,
    });

    const { data: allProducts = [] } = useQuery<Product[]>({
        queryKey: ['seller', 'products'],
        queryFn: async () => {
            const res = await fetch(`${LARAVEL_API_URL}/products?per_page=100`);
            const data = await res.json();
            return data.data || data || [];
        },
        staleTime: 5 * 60 * 1000,
        enabled: !!etiquetas.promocion,
    });

    const otherProducts = allProducts.filter(p => p.id !== formData.id);

    useEffect(() => {
        if (isOpen) {
            setSelectedFile(null);
            if (productToEdit) {
                setFormData(productToEdit);
                setPreviewImage(productToEdit.image);
                setEtiquetas(etiquetasFromProduct(productToEdit));
            } else {
                setFormData({ ...initialProduct, id: Date.now().toString() });
                setPreviewImage('');
                setEtiquetas({ nuevo: true });
            }
        }
    }, [isOpen, productToEdit]);

    useEffect(() => {
        const check = () => setIsDark(document.documentElement.classList.contains('dark'));
        check();
        const observer = new MutationObserver(check);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    // ── Etiquetas helpers ──────────────────────────────────────────────────────
    const todayStr = () => new Date().toISOString().split('T')[0];
    const addMonthsStr = (months: number) => {
        const d = new Date(); d.setMonth(d.getMonth() + months);
        return d.toISOString().split('T')[0];
    };
    const addMonthsFrom = (from: string, months: number) => {
        const d = new Date(from + 'T00:00:00');
        d.setMonth(d.getMonth() + months);
        return d.toISOString().split('T')[0];
    };

    const STICKER_BY_TAG: Partial<Record<'nuevo' | 'descuento' | 'oferta' | 'edicionLimitada' | 'promocion', string>> = {
        nuevo: 'nuevo',
        descuento: 'descuento',
        oferta: 'oferta',
        edicionLimitada: 'liquidacion',
    };

    const toggleTag = (tag: 'nuevo' | 'descuento' | 'oferta' | 'edicionLimitada' | 'promocion') => {
        const e = etiquetas;
        const sticker = STICKER_BY_TAG[tag];
        const isTurningOn = !(
            (tag === 'nuevo' && e.nuevo) ||
            (tag === 'descuento' && e.descuento) ||
            (tag === 'oferta' && e.oferta) ||
            (tag === 'edicionLimitada' && e.edicionLimitada) ||
            (tag === 'promocion' && e.promocion)
        );
        if (isTurningOn && sticker && !isStickerAllowed(sticker)) {
            setShowStickerUpgrade(true);
            return;
        }
        setShowStickerUpgrade(false);
        switch (tag) {
            case 'nuevo':
                setEtiquetas({ ...e, nuevo: !e.nuevo, edicionLimitada: !e.nuevo ? undefined : e.edicionLimitada });
                break;
            case 'descuento':
                setEtiquetas(e.descuento
                    ? { ...e, descuento: undefined }
                    : { ...e, descuento: { valor: 20, inicio: todayStr(), fin: null }, oferta: undefined, promocion: undefined });
                break;
            case 'oferta':
                setEtiquetas(e.oferta
                    ? { ...e, oferta: undefined }
                    : { ...e, oferta: { valor: 30, inicio: todayStr(), fin: addMonthsStr(1) }, descuento: undefined, promocion: undefined });
                break;
            case 'edicionLimitada':
                setEtiquetas(e.edicionLimitada
                    ? { ...e, edicionLimitada: undefined }
                    : { ...e, edicionLimitada: { inicio: todayStr(), fin: addMonthsStr(1) }, nuevo: false });
                break;
            case 'promocion':
                setEtiquetas(e.promocion
                    ? { ...e, promocion: undefined }
                    : { ...e, promocion: { productosIds: [] }, descuento: undefined, oferta: undefined });
                break;
        }
    };

    const togglePromoProduct = (id: string) => {
        if (!etiquetas.promocion) return;
        const ids = etiquetas.promocion.productosIds;
        setEtiquetas({ ...etiquetas, promocion: { productosIds: ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id] } });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const addAttribute = (type: 'main' | 'additional') => {
        const totalRows = (formData.mainAttributes?.length || 0) + (formData.additionalAttributes?.length || 0);
        if (totalRows >= 6) return;

        const numCols = type === 'main'
            ? (formData.mainAttributes?.[0]?.values.length || 2)
            : (formData.additionalAttributes?.[0]?.values.length || 2);

        const newAttr: ProductAttribute = { values: Array(numCols).fill('') };
        if (type === 'main') {
            setFormData(prev => ({ ...prev, mainAttributes: [...(prev.mainAttributes || []), newAttr] }));
        } else {
            setFormData(prev => ({ ...prev, additionalAttributes: [...(prev.additionalAttributes || []), newAttr] }));
        }
    };

    const addAttributeColumn = (type: 'main' | 'additional') => {
        const currentCols = type === 'main'
            ? (formData.mainAttributes?.[0]?.values.length || 2)
            : (formData.additionalAttributes?.[0]?.values.length || 2);

        if (currentCols >= 3) return;

        if (type === 'main') {
            setFormData(prev => ({
                ...prev,
                mainAttributes: (prev.mainAttributes || []).map(attr => ({ values: [...attr.values, ''] }))
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                additionalAttributes: (prev.additionalAttributes || []).map(attr => ({ values: [...attr.values, ''] }))
            }));
        }
    };

    const removeAttribute = (type: 'main' | 'additional', index: number) => {
        if (type === 'main') {
            setFormData(prev => ({
                ...prev,
                mainAttributes: (prev.mainAttributes || []).filter((_, i) => i !== index)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                additionalAttributes: (prev.additionalAttributes || []).filter((_, i) => i !== index)
            }));
        }
    };

    const updateAttribute = (type: 'main' | 'additional', rowIndex: number, colIndex: number, value: string) => {
        if (type === 'main') {
            const newAttrs = [...(formData.mainAttributes || [])];
            const newValues = [...newAttrs[rowIndex].values];
            newValues[colIndex] = value;
            newAttrs[rowIndex] = { values: newValues };
            setFormData(prev => ({ ...prev, mainAttributes: newAttrs }));
        } else {
            const newAttrs = [...(formData.additionalAttributes || [])];
            const newValues = [...newAttrs[rowIndex].values];
            newValues[colIndex] = value;
            newAttrs[rowIndex] = { values: newValues };
            setFormData(prev => ({ ...prev, additionalAttributes: newAttrs }));
        }
    };

    // ── Ficha nutricional ─────────────────────────────────────────────────────
    const addNutritionalRow = () => {
        setFormData(prev => ({
            ...prev,
            nutritionalAttributes: [
                ...(prev.nutritionalAttributes || []),
                { values: { label: '', value: '', daily_value: '' } },
            ],
        }));
    };

    const removeNutritionalRow = (index: number) => {
        setFormData(prev => ({
            ...prev,
            nutritionalAttributes: (prev.nutritionalAttributes || []).filter((_, i) => i !== index),
        }));
    };

    const updateNutritionalRow = (index: number, field: 'label' | 'value' | 'daily_value', val: string) => {
        setFormData(prev => {
            const rows = [...(prev.nutritionalAttributes || [])];
            rows[index] = {
                values: { ...rows[index].values, [field]: val },
            };
            return { ...prev, nutritionalAttributes: rows };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedFile && !formData.image) {
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

        // Mapear etiquetas complejas → sticker simple + discount_percentage
        let sticker: ProductSticker = null;
        let discountPercentage: number | null = null;
        if (etiquetas.descuento) {
            sticker = 'descuento';
            discountPercentage = etiquetas.descuento.valor;
        } else if (etiquetas.oferta) {
            sticker = 'oferta';
            discountPercentage = etiquetas.oferta.valor;
        } else if (etiquetas.nuevo) {
            sticker = 'nuevo';
        } else if (etiquetas.edicionLimitada) {
            sticker = 'liquidacion';
        }

        onSave({
            ...formData,
            sticker,
            discountPercentage,
            etiquetas,
        } as any, selectedFile ?? undefined);
        onClose();
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={productToEdit ? 'Editar Producto' : 'Ficha de Producto'}
            subtitle="Gestión estratégica de catálogo e inventario"
            size="4xl"
            accentColor={isDark ? 'from-[#0F2A24] via-[#2A5A4D] to-[#8FC3A1]' : 'from-emerald-400 via-sky-500 to-indigo-500'}
        >
            {showTagPreview && (
                <ProductTagPreviewModal
                    isOpen={showTagPreview}
                    onClose={() => setShowTagPreview(false)}
                    imagenPreview={previewImage || null}
                    etiquetas={etiquetas}
                />
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Image Preview */}
                    <div className="lg:col-span-3 space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Visual Principal</p>
                            <button
                                type="button"
                                onClick={() => setShowTagPreview(true)}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:border-sky-500/40 dark:hover:border-[var(--icons-green)]/40 hover:text-sky-500 dark:hover:text-[var(--icons-green)] transition-all"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                </svg>
                                Vista previa
                            </button>
                        </div>
                        <div
                            role="button"
                            tabIndex={0}
                            className="relative bg-[var(--bg-secondary)] border-2 border-dashed border-[var(--border-subtle)] aspect-square flex flex-col items-center justify-center cursor-pointer group rounded-[2rem] overflow-hidden hover:border-[var(--brand-sky)]/30 dark:hover:border-[var(--icons-green)]/90 transition-all shadow-inner"
                            onClick={() => fileInputRef.current?.click()}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                        >
                            {previewImage ? (
                                <Image
                                    src={previewImage}
                                    fill
                                    sizes="100vw"
                                    className="object-cover"
                                    alt="Product"
                                    unoptimized={previewImage.startsWith('data:')}
                                />
                            ) : (
                                <div className="text-center group-hover:scale-110 transition-transform">
                                    <Icon name="Image" className="text-4xl text-[var(--text-secondary)] w-10 h-10 mx-auto" />
                                    <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase mt-2">Adjuntar Foto</p>
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

                    {/* Metadata Table + Etiqueta Config Panels */}
                    <div className="lg:col-span-9 space-y-3">
                        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-1">Metadatos del Producto</p>
                        <div className="overflow-hidden border border-[var(--border-subtle)] rounded-[2rem] shadow-sm bg-[var(--bg-card)]">
                            <table className="w-full text-sm">
                                <tbody className="divide-y divide-[var(--border-subtle)]">
                                    <tr className="bg-[var(--bg-secondary)]/10">
                                        <td className="px-5 py-3 font-black text-[var(--text-secondary)] text-[10px] uppercase tracking-tighter w-1/4">Denominación</td>
                                        <td className="px-5 py-3">
                                            <input
                                                type="text" name="name" required
                                                value={formData.name} onChange={handleChange}
                                                className="w-full bg-transparent border-none focus:ring-0 font-black text-[var(--text-primary)] p-0 outline-none text-base"
                                                placeholder="Nombre comercial"
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-5 py-3 font-black text-[var(--text-secondary)] text-[10px] uppercase tracking-tighter">Categoría</td>
                                        <td className="px-5 py-3">
                                            <select
                                                name="category" required
                                                value={formData.category} onChange={handleChange}
                                                className="w-full bg-[var(--bg-card)] border-none focus:ring-0 font-bold text-[var(--text-primary)] p-0 outline-none cursor-pointer"
                                            >
                                                <option value="">Seleccionar Categoría...</option>
                                                {categories.map((cat) => {
                                                    const isParent = (cat.level || 0) < 2;
                                                    return (
                                                        <option key={cat.id} value={isParent ? '' : cat.slug} disabled={isParent}>
                                                            {'\u00A0\u00A0'.repeat(cat.level || 0)}{isParent ? '-- ' : ''}{cat.name}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </td>
                                    </tr>
                                    <tr className="bg-[var(--bg-secondary)]/10">
                                        <td className="px-5 py-3 font-black text-[var(--text-secondary)] text-[10px] uppercase tracking-tighter">Valorización</td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-emerald-500 font-black">S/</span>
                                                <input
                                                    type="number" name="price" step="0.01" required
                                                    value={formData.price} onChange={handleChange}
                                                    className="w-full bg-transparent border-none focus:ring-0 font-black text-[var(--text-primary)] p-0 outline-none"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-5 py-3 font-black text-[var(--text-secondary)] text-[10px] uppercase tracking-tighter">Operativo</td>
                                        <td className="px-5 py-3">
                                            <div className="grid grid-cols-3 gap-6 divide-x divide-[var(--border-subtle)]">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase">Stock</span>
                                                    <input
                                                        type="number" name="stock" min="0" required
                                                        value={formData.stock} onChange={handleChange}
                                                        className="w-full bg-transparent border-none focus:ring-0 font-black text-[var(--text-primary)] p-0 outline-none"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1 pl-4">
                                                    <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase">Peso kg 📦</span>
                                                    <input
                                                        type="number" name="weight" step="0.1" min="0.1"
                                                        value={formData.weight || ''} onChange={handleChange}
                                                        placeholder="ej: 1.5"
                                                        title="Peso real del producto en kilogramos. Se usa para calcular el costo de envío."
                                                        className="w-full bg-transparent border-none focus:ring-0 font-black text-[var(--text-primary)] p-0 outline-none"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1 pl-4">
                                                    <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase">Medidas cm 📐</span>
                                                    <input
                                                        type="text" name="dimensions"
                                                        value={formData.dimensions || ''} onChange={handleChange}
                                                        className="w-full bg-transparent border-none focus:ring-0 font-black text-[var(--text-primary)] p-0 outline-none font-mono text-[10px]"
                                                        placeholder="largo×ancho×alto"
                                                        title="Dimensiones del paquete en centímetros: Largo × Ancho × Alto. Ejemplo: 30x20x15"
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    {/* Retiro en Tienda */}
                                    <tr>
                                        <td className="px-5 py-3 font-black text-[var(--text-secondary)] text-[10px] uppercase tracking-tighter">Retiro en Tienda</td>
                                        <td className="px-5 py-3">
                                            <BranchStockSection
                                                productId={formData.id}
                                                storeId={(formData as any).store_id}
                                            />
                                        </td>
                                    </tr>
                                    <tr className="bg-[var(--bg-secondary)]/10">
                                        <td className="px-5 py-2 font-black text-[var(--text-secondary)] text-[10px] uppercase tracking-tighter">Etiquetas</td>
                                        <td className="px-5 py-2">
                                            <div className="flex flex-wrap gap-1.5">

                                                {/* NUEVO */}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleTag('nuevo')}
                                                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all
                                                        ${etiquetas.nuevo
                                                            ? 'bg-sky-500/15 dark:bg-[var(--icons-green)]/15 border-sky-500/40 dark:border-[var(--icons-green)]/40 text-sky-600 dark:text-[var(--icons-green)]'
                                                            : etiquetas.edicionLimitada || !isStickerAllowed('nuevo')
                                                                ? 'bg-[var(--bg-card)] border-dashed border-[var(--border-subtle)] text-[var(--text-secondary)]/40'
                                                                : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-sky-500/30 dark:hover:border-[var(--icons-green)]/40'
                                                        }`}
                                                >
                                                    {!isStickerAllowed('nuevo') && !etiquetas.nuevo && <Icon name="Lock" className="w-2.5 h-2.5" />}
                                                    Nuevo
                                                    {etiquetas.nuevo && <span className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-[var(--icons-green)] flex-shrink-0" />}
                                                </button>

                                                {/* DESC% */}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleTag('descuento')}
                                                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all
                                                        ${etiquetas.descuento
                                                            ? 'bg-sky-500/15 dark:bg-[var(--icons-green)]/15 border-sky-500/40 dark:border-[var(--icons-green)]/40 text-sky-600 dark:text-[var(--icons-green)]'
                                                            : (etiquetas.oferta || etiquetas.promocion)
                                                                ? 'bg-[var(--bg-card)] border-dashed border-[var(--border-subtle)] text-[var(--text-secondary)]/40'
                                                                : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-sky-500/30 dark:hover:border-[var(--icons-green)]/40'
                                                        }`}
                                                >
                                                    Desc%
                                                    {etiquetas.descuento && <span className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-[var(--icons-green)] flex-shrink-0" />}
                                                </button>

                                                {/* OFERTA */}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleTag('oferta')}
                                                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all
                                                        ${etiquetas.oferta
                                                            ? 'bg-sky-500/15 dark:bg-[var(--icons-green)]/15 border-sky-500/40 dark:border-[var(--icons-green)]/40 text-sky-600 dark:text-[var(--icons-green)]'
                                                            : (etiquetas.descuento || etiquetas.promocion || !isStickerAllowed('oferta'))
                                                                ? 'bg-[var(--bg-card)] border-dashed border-[var(--border-subtle)] text-[var(--text-secondary)]/40'
                                                                : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-sky-500/30 dark:hover:border-[var(--icons-green)]/40'
                                                        }`}
                                                >
                                                    {!isStickerAllowed('oferta') && !etiquetas.oferta && <Icon name="Lock" className="w-2.5 h-2.5" />}
                                                    Oferta
                                                    {etiquetas.oferta && <span className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-[var(--icons-green)] flex-shrink-0" />}
                                                </button>

                                                {/* ED. LIMITADA */}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleTag('edicionLimitada')}
                                                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all
                                                        ${etiquetas.edicionLimitada
                                                            ? 'bg-sky-500/15 dark:bg-[var(--icons-green)]/15 border-sky-500/40 dark:border-[var(--icons-green)]/40 text-sky-600 dark:text-[var(--icons-green)]'
                                                            : etiquetas.nuevo || !isStickerAllowed('liquidacion')
                                                                ? 'bg-[var(--bg-card)] border-dashed border-[var(--border-subtle)] text-[var(--text-secondary)]/40'
                                                                : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-sky-500/30 dark:hover:border-[var(--icons-green)]/40'
                                                        }`}
                                                >
                                                    {!isStickerAllowed('liquidacion') && !etiquetas.edicionLimitada && <Icon name="Lock" className="w-2.5 h-2.5" />}
                                                    Ed. Lim.
                                                    {etiquetas.edicionLimitada && <span className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-[var(--icons-green)] flex-shrink-0" />}
                                                </button>

                                                {/* PROMOCIÓN */}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleTag('promocion')}
                                                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all
                                                        ${etiquetas.promocion
                                                            ? 'bg-sky-500/15 dark:bg-[var(--icons-green)]/15 border-sky-500/40 dark:border-[var(--icons-green)]/40 text-sky-600 dark:text-[var(--icons-green)]'
                                                            : (etiquetas.descuento || etiquetas.oferta)
                                                                ? 'bg-[var(--bg-card)] border-dashed border-[var(--border-subtle)] text-[var(--text-secondary)]/40'
                                                                : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-sky-500/30 dark:hover:border-[var(--icons-green)]/30'
                                                        }`}
                                                >
                                                    Promo
                                                    {etiquetas.promocion && <span className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-[var(--icons-green)] flex-shrink-0" />}
                                                </button>

                                            </div>
                                            {showStickerUpgrade && (
                                                <div className="mt-2">
                                                    <PlanUpgradeMessage message="Tu plan actual solo permite el sticker de Descuento. Actualiza tu plan para usar todos los stickers (Nuevo, Oferta, Edición Limitada)." />
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* ── Config panels ──────────────────────────────────── */}

                        {/* DESC% config */}
                        {etiquetas.descuento && (() => {
                            const d = etiquetas.descuento!;
                            const setD = (patch: Partial<EtiquetaDescuentoData>) =>
                                setEtiquetas(prev => ({ ...prev, descuento: { ...d, ...patch } }));
                            return (
                                <div className="rounded-2xl border border-sky-500/20 dark:border-[var(--icons-green)]/20 bg-sky-500/5 dark:bg-[var(--icons-green)]/5 p-4 space-y-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-[var(--icons-green)]">
                                        Configuración del descuento
                                    </p>
                                    <div className="space-y-1.5">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                                            Descuento · mín 10% · máx 70%
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <input type="number" min={10} max={70} step={1} value={d.valor}
                                                onChange={(e) => setD({ valor: Math.max(10, Math.min(70, parseInt(e.target.value) || 10)) })}
                                                className="w-20 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-sky-500/50 rounded-xl px-3 py-2 text-sm font-black text-[var(--text-primary)] focus:outline-none transition-colors"
                                            />
                                            <span className="text-sm font-black text-sky-500 dark:text-[var(--icons-green)]">%</span>
                                            <input type="range" min={10} max={70} value={d.valor}
                                                onChange={(e) => setD({ valor: parseInt(e.target.value) })}
                                                className="flex-1 accent-sky-500 dark:accent-[var(--icons-green)]" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 items-start">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Inicio</p>
                                            <input type="date" value={d.inicio}
                                                onChange={(e) => setD({ inicio: e.target.value })}
                                                className={inputCls} />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between h-5">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Fin</p>
                                                <button type="button"
                                                    onClick={() => setD({ fin: d.fin === null ? addMonthsFrom(d.inicio, 1) : null })}
                                                    className={`text-[9px] font-bold px-2 py-0.5 rounded-lg border transition-all
                                                        ${d.fin === null
                                                            ? 'bg-sky-500/10 dark:bg-[var(--icons-green)]/10 border-sky-500/20 dark:border-[var(--icons-green)]/20 text-sky-500 dark:text-[var(--icons-green)]'
                                                            : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-sky-500/20 dark:hover:border-[var(--icons-green)]/20'
                                                        }`}>
                                                    {d.fin === null ? '∞ Ilimitado' : 'Ilimitado'}
                                                </button>
                                            </div>
                                            {d.fin !== null
                                                ? <input type="date" value={d.fin} min={d.inicio}
                                                    onChange={(e) => setD({ fin: e.target.value })}
                                                    className={inputCls} />
                                                : <div className={`${inputCls} flex items-center text-[var(--text-secondary)]/40 text-xs italic`}>
                                                    Sin fecha límite
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* OFERTA config */}
                        {etiquetas.oferta && (() => {
                            const o = etiquetas.oferta!;
                            const setO = (patch: Partial<EtiquetaOfertaData>) =>
                                setEtiquetas(prev => ({ ...prev, oferta: { ...o, ...patch } }));
                            const maxFin = addMonthsFrom(o.inicio, 3);
                            return (
                                <div className="rounded-2xl border border-sky-500/20 dark:border-[var(--icons-green)]/20 bg-sky-500/5 dark:bg-[var(--icons-green)]/5 p-4 space-y-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-[var(--icons-green)]">
                                        Configuración de la oferta
                                    </p>
                                    <div className="space-y-1.5">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                                            Descuento · mín 10% · máx 90%
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <input type="number" min={10} max={90} step={1} value={o.valor}
                                                onChange={(e) => setO({ valor: Math.max(10, Math.min(90, parseInt(e.target.value) || 10)) })}
                                                className="w-20 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-sky-500/50 dark:focus:border-[var(--icons-green)]/50 rounded-xl px-3 py-2 text-sm font-black text-[var(--text-primary)] focus:outline-none transition-colors"
                                            />
                                            <span className="text-sm font-black text-sky-500 dark:text-[var(--icons-green)]">%</span>
                                            <input type="range" min={10} max={90} value={o.valor}
                                                onChange={(e) => setO({ valor: parseInt(e.target.value) })}
                                                className="flex-1 accent-sky-500 dark:accent-[var(--icons-green)]" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Inicio</p>
                                            <input type="date" value={o.inicio}
                                                onChange={(e) => {
                                                    const newInicio = e.target.value;
                                                    const newMax = addMonthsFrom(newInicio, 3);
                                                    setO({ inicio: newInicio, fin: o.fin > newMax ? newMax : o.fin });
                                                }}
                                                className={inputCls} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                                                Fin <span className="normal-case font-normal">(máx. 3 meses)</span>
                                            </p>
                                            <input type="date" value={o.fin} min={o.inicio} max={maxFin}
                                                onChange={(e) => setO({ fin: e.target.value })}
                                                className={inputCls} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* EDICIÓN LIMITADA config */}
                        {etiquetas.edicionLimitada && (() => {
                            const el = etiquetas.edicionLimitada!;
                            const setEl = (patch: Partial<EtiquetaEdicionData>) =>
                                setEtiquetas(prev => ({ ...prev, edicionLimitada: { ...el, ...patch } }));
                            return (
                                <div className="rounded-2xl border border-sky-500/20 dark:border-[var(--icons-green)]/20 bg-sky-500/5 dark:bg-[var(--icons-green)]/5 p-4 space-y-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-[var(--icons-green)]">
                                        Período de edición limitada
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Inicio</p>
                                            <input type="date" value={el.inicio}
                                                onChange={(e) => setEl({ inicio: e.target.value })}
                                                className={inputCls} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Fin</p>
                                            <input type="date" value={el.fin} min={el.inicio}
                                                onChange={(e) => setEl({ fin: e.target.value })}
                                                className={inputCls} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* PROMOCIÓN config */}
                        {etiquetas.promocion && (
                            <div className="rounded-2xl border border-sky-500/20 dark:border-[var(--icons-green)]/20 bg-sky-500/5 dark:bg-[var(--icons-green)]/5 p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-[var(--icons-green)]">
                                        Productos de la promoción
                                    </p>
                                    {etiquetas.promocion.productosIds.length > 0 && (
                                        <span className="text-[9px] font-black px-2 py-0.5 rounded-lg bg-sky-500/15 dark:bg-[var(--icons-green)]/15 border border-sky-500/30 dark:border-[var(--icons-green)]/30 text-sky-600 dark:text-[var(--icons-green)]">
                                            {etiquetas.promocion.productosIds.length} seleccionado{etiquetas.promocion.productosIds.length > 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[9px] text-[var(--text-secondary)]">
                                    Al comprar este producto, el cliente puede agregar los seleccionados. Vigente hasta agotar stock.
                                </p>
                                <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
                                    {otherProducts.length === 0 ? (
                                        <p className="col-span-2 text-[9px] text-[var(--text-secondary)] italic text-center py-6">
                                            Sin otros productos en el catálogo
                                        </p>
                                    ) : (
                                        otherProducts.map((p) => {
                                            const selected = etiquetas.promocion!.productosIds.includes(p.id);
                                            return (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => togglePromoProduct(p.id)}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all
                                                        ${selected
                                                            ? 'bg-sky-500/15 dark:bg-[var(--icons-green)]/15 border-sky-500/40 dark:border-[var(--icons-green)]/40 text-sky-600 dark:text-[var(--icons-green)]'
                                                            : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-sky-500/30 dark:hover:border-[var(--icons-green)]/70'
                                                        }`}
                                                >
                                                    {p.image && (
                                                        <img src={p.image} alt="" className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
                                                    )}
                                                    <span className="text-[10px] font-bold truncate flex-1">{p.name}</span>
                                                    {selected && <span className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-[var(--icons-green)] flex-shrink-0" />}
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* Description and Attributes */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="product-description" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-2">Reseña del Producto</label>
                        <textarea
                            id="product-description"
                            name="description" rows={2} required
                            value={formData.description} onChange={handleChange}
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[1.5rem] p-4 text-sm font-medium text-[var(--text-primary)] outline-none focus:ring-4 focus:ring-[var(--brand-sky)]/5 focus:bg-[var(--bg-card)] transition-all resize-none"
                            placeholder="Describe los beneficios clave..."
                        ></textarea>
                    </div>

                    {/* Descripción corta */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-2">Descripción Corta (opcional)</label>
                        <textarea
                            name="short_description" rows={1}
                            value={formData.short_description || ''} onChange={handleChange}
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[1.5rem] p-3 text-sm font-medium text-[var(--text-primary)] outline-none focus:ring-4 focus:ring-[var(--brand-sky)]/5 focus:bg-[var(--bg-card)] transition-all resize-none"
                            placeholder="Breve resumen del producto..."
                        ></textarea>
                    </div>

                    {/* Ficha Nutricional */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-3 bg-amber-500 rounded-full"></div>
                                Ficha Nutricional
                            </h3>
                            <div className="flex gap-2">
                                <button type="button" onClick={addNutritionalRow} className="w-7 h-7 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-center text-amber-500 hover:bg-amber-50 transition-all shadow-xs active:scale-90">
                                    <Icon name="Plus" className="font-bold text-xs w-3 h-3" />
                                </button>
                            </div>
                        </div>
                        <div className="rounded-[1.5rem] overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-xs">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)]">
                                        <th className="px-3 py-2 text-left text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] w-2/5">Nutriente</th>
                                        <th className="px-3 py-2 text-left text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] w-1/4">Valor</th>
                                        <th className="px-3 py-2 text-left text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] w-1/4">% VD</th>
                                        <th className="px-3 py-2 w-8"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-subtle)]">
                                    {(formData.nutritionalAttributes || []).map((attr, rowIndex) => (
                                        <tr key={rowIndex} className="divide-x divide-[var(--border-subtle)] group">
                                            <td className="px-3 py-2">
                                                <input
                                                    type="text"
                                                    value={(attr.values as any).label || ''}
                                                    onChange={(e) => updateNutritionalRow(rowIndex, 'label', e.target.value)}
                                                    className="w-full bg-transparent border-none focus:ring-0 text-[11px] font-black text-[var(--text-primary)] outline-none"
                                                    placeholder="Ej: Calorías"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="text"
                                                    value={(attr.values as any).value || ''}
                                                    onChange={(e) => updateNutritionalRow(rowIndex, 'value', e.target.value)}
                                                    className="w-full bg-transparent border-none focus:ring-0 text-[11px] font-medium text-[var(--text-secondary)] outline-none"
                                                    placeholder="250 kcal"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="text"
                                                    value={(attr.values as any).daily_value || ''}
                                                    onChange={(e) => updateNutritionalRow(rowIndex, 'daily_value', e.target.value)}
                                                    className="w-full bg-transparent border-none focus:ring-0 text-[11px] font-medium text-[var(--text-secondary)] outline-none"
                                                    placeholder="12%"
                                                />
                                            </td>
                                            <td className="px-2 py-2 text-center w-8">
                                                <button type="button" onClick={() => removeNutritionalRow(rowIndex)} className="text-[var(--text-secondary)] hover:text-[var(--text-danger)] transition-colors opacity-0 group-hover:opacity-100">
                                                    <Icon name="Trash2" className="font-bold w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!formData.nutritionalAttributes || formData.nutritionalAttributes.length === 0) && (
                                        <tr>
                                            <td colSpan={4} className="p-4 text-center text-[9px] font-black text-[var(--text-secondary)] uppercase italic">Sin información nutricional</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-2">
                            <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Nota de porción</label>
                            <input
                                type="text"
                                value={formData.servingNote || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, servingNote: e.target.value }))}
                                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-amber-500/50 transition-colors mt-1"
                                placeholder="Ej: Porción: 100g"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Main Attributes */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-3 bg-sky-500 dark:bg-[var(--icons-green)] rounded-full"></div>
                                    Técnicos
                                </h3>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => addAttribute('main')} className="w-7 h-7 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-center text-sky-500 hover:bg-sky-50 transition-all shadow-xs active:scale-90">
                                        <Icon name="Plus" className="font-bold text-xs w-3 h-3" />
                                    </button>
                                    <button type="button" onClick={() => addAttributeColumn('main')} className="px-2 h-7 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg flex items-center gap-1 text-[8px] font-black text-emerald-500 hover:bg-emerald-50 transition-all shadow-xs uppercase active:scale-90">
                                        <Icon name="Columns" className="font-bold w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                            <div className="rounded-[1.5rem] overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-xs">
                                <table className="w-full text-xs">
                                    <tbody className="divide-y divide-[var(--border-subtle)]">
                                        {(formData.mainAttributes || []).map((attr, rowIndex) => (
                                            <tr key={rowIndex} className="divide-x divide-[var(--border-subtle)] group border-b last:border-none">
                                                {attr.values.map((val, colIndex) => (
                                                    <td key={colIndex} className="px-3 py-2">
                                                        <input
                                                            type="text"
                                                            value={val}
                                                            onChange={(e) => updateAttribute('main', rowIndex, colIndex, e.target.value)}
                                                            className={`w-full bg-transparent border-none focus:ring-0 text-[11px] outline-none ${colIndex === 0 ? 'font-black text-[var(--text-primary)] uppercase tracking-tighter' : 'font-medium text-[var(--text-secondary)]'}`}
                                                            placeholder={colIndex === 0 ? 'Ej: Material' : 'Valor'}
                                                        />
                                                    </td>
                                                ))}
                                                <td className="px-2 py-2 text-center w-8">
                                                    <button type="button" onClick={() => removeAttribute('main', rowIndex)} className="text-[var(--text-secondary)] hover:text-[var(--text-danger)] transition-colors opacity-0 group-hover:opacity-100">
                                                        <Icon name="Trash2" className="font-bold w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Additional Attributes */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-3 bg-indigo-500 rounded-full"></div>
                                    Detalles
                                </h3>
                                <button type="button" onClick={() => addAttribute('additional')} className="w-7 h-7 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-center text-indigo-500 hover:bg-indigo-50 transition-all shadow-xs active:scale-90">
                                    <Icon name="Plus" className="font-bold text-xs w-3 h-3" />
                                </button>
                            </div>
                            <div className="rounded-[1.5rem] overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-xs">
                                <table className="w-full text-xs text-[var(--text-secondary)] font-mono">
                                    <tbody className="divide-y divide-[var(--border-subtle)]">
                                        {(formData.additionalAttributes || []).map((attr, rowIndex) => (
                                            <tr key={rowIndex} className="divide-x divide-[var(--border-subtle)] group border-b last:border-none">
                                                {attr.values.map((val, colIndex) => (
                                                    <td key={colIndex} className="px-3 py-2">
                                                        <input
                                                            type="text"
                                                            value={val}
                                                            onChange={(e) => updateAttribute('additional', rowIndex, colIndex, e.target.value)}
                                                            className="w-full bg-transparent border-none focus:ring-0 text-[10px] font-bold text-[var(--text-primary)] outline-none"
                                                            placeholder="..."
                                                        />
                                                    </td>
                                                ))}
                                                <td className="px-2 py-2 text-center w-8">
                                                    <button type="button" onClick={() => removeAttribute('additional', rowIndex)} className="text-[var(--text-secondary)] hover:text-[var(--text-danger)] transition-colors opacity-0 group-hover:opacity-100">
                                                        <Icon name="Trash2" className="font-bold w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {(!formData.additionalAttributes || formData.additionalAttributes.length === 0) && (
                                            <tr>
                                                <td className="p-4 text-center text-[9px] font-black text-[var(--text-secondary)] uppercase italic">Sin adicionales</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-[var(--border-subtle)] -mx-8 -mb-8 px-8 pt-6 pb-8 bg-[var(--bg-card)]/90 backdrop-blur-md mt-6">
                    <BaseButton
                        variant="ghost"
                        onClick={onClose}
                    >
                        Cancelar
                    </BaseButton>
                    <BaseButton
                        type="submit"
                        variant="primary"
                        className="px-10"
                    >
                        Guardar Ficha
                    </BaseButton>
                </div>
            </form>
        </BaseModal>
    );
}

// ── Tag Preview Modal ──────────────────────────────────────────────────────────
function ProductTagPreviewModal({
    isOpen,
    onClose,
    imagenPreview,
    etiquetas,
}: {
    isOpen: boolean;
    onClose: () => void;
    imagenPreview: string | null;
    etiquetas: ProductEtiquetaConfig;
}) {
    if (!isOpen) return null;

    const hasAny = etiquetas.nuevo || etiquetas.descuento || etiquetas.oferta || etiquetas.edicionLimitada || etiquetas.promocion;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <div
                className="relative z-10 w-full max-w-[300px] rounded-3xl overflow-hidden shadow-2xl"
                style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', animation: 'fadeIn .15s ease' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-4 py-3"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                >
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        Vista previa · cliente
                    </p>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-6 h-6 flex items-center justify-center rounded-lg transition-opacity hover:opacity-70"
                        style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Image + tags */}
                <div className="relative w-full" style={{ aspectRatio: '1/1', background: '#1c1c1c' }}>
                    {imagenPreview ? (
                        <img src={imagenPreview} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ color: 'rgba(255,255,255,0.12)' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} className="w-10 h-10">
                                <rect x="3" y="3" width="18" height="18" rx="3" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                            </svg>
                            <span className="text-[9px] font-bold uppercase tracking-widest">Sin imagen</span>
                        </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                    {/* Tags */}
                    {hasAny && (
                        <div className="absolute top-3 left-0 flex flex-col gap-1.5">
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
                                    style={{ background: 'linear-gradient(135deg,#991b1b,#dc2626)', color: 'white', borderRadius: '4px 999px 999px 4px', boxShadow: '0 3px 14px rgba(220,38,38,0.75)' }}
                                >
                                    Promo!
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-[9px] text-center font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>
                        Así verá el cliente las etiquetas asignadas
                    </p>
                </div>
            </div>
        </div>
    );
}