'use client';

import React, { useState, useTransition, useOptimistic } from 'react';
import Image from 'next/image';
import { Product } from '@/features/seller/catalog/types';
import ProductCard from './components/ProductCard';
import dynamic from 'next/dynamic';
const ProductModal = dynamic(() => import('./components/ProductModal'), { ssr: false });
import ProductDetailModal from './components/ProductDetailModal';
import BaseEmptyState from '@/components/ui/BaseEmptyState';
import BaseButton from '@/components/ui/BaseButton';
import BaseLoading from '@/components/ui/BaseLoading';
import Icon from '@/components/ui/Icon';
import { useToast } from '@/shared/lib/context/ToastContext';
import { deleteProduct, updateProductPrice } from '@/shared/lib/actions/catalog';
import { productRepository } from '@/shared/lib/api/factory';
import { USE_MOCKS } from '@/shared/lib/config/flags';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import CatalogGuideModal from './components/CatalogGuideModal';

function toRelativeStorageUrl(url: string): string {
    const idx = url.indexOf('/storage/');
    return idx >= 0 ? url.substring(idx) : url;
}

interface CatalogClientProps {
    initialProducts: Product[];
}

type ProductFormData = Partial<Product>;

// ─── Inline price editor ──────────────────────────────────────────────────────

interface PriceEditInputProps {
    product: Product;
    onPriceUpdate: (productId: string, newPrice: number) => void;
}

function PriceEditInput({ product, onPriceUpdate }: PriceEditInputProps) {
    const [isEditing, setIsEditing]   = useState(false);
    const [price, setPrice]           = useState(String(product.price));
    const [isUpdating, setIsUpdating] = useState(false);

    const handleSave = async () => {
        const newPrice = Number(price);
        if (isNaN(newPrice) || newPrice < 0) {
            setPrice(String(product.price));
            setIsEditing(false);
            return;
        }
        setIsUpdating(true);
        onPriceUpdate(product.id, newPrice);
        setIsEditing(false);
        setIsUpdating(false);
    };

    const handleCancel = () => {
        setPrice(String(product.price));
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-1.5">
                <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-20 px-2 py-1 text-xs border border-sky-500/30 rounded-lg focus:ring-2 focus:ring-sky-500/20 bg-[var(--bg-card)] text-[var(--text-primary)] font-black"
                    step="0.01"
                    disabled={isUpdating}
                    autoFocus
                />
                <button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="w-6 h-6 flex items-center justify-center rounded-lg text-sky-500 hover:bg-sky-500/10 transition-colors"
                >
                    <Icon name="Check" className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={handleCancel}
                    disabled={isUpdating}
                    className="w-6 h-6 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                >
                    <Icon name="X" className="w-3.5 h-3.5" />
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 group/price"
            title="Editar precio"
        >
            <span className="text-sm font-black text-[var(--text-primary)]">
                S/ {product.price.toFixed(2)}
            </span>
            <Icon name="Pencil" className="w-3 h-3 text-[var(--text-secondary)] opacity-0 group-hover/price:opacity-50 transition-opacity" />
        </button>
    );
}

// ─── Mobile accordion card ────────────────────────────────────────────────────

interface MobileProductCardProps {
    product:    Product;
    onEdit:     (product: Product) => void;
    onDelete:   (productId: string) => void;
    onViewInfo: (product: Product) => void;
}

function MobileProductCard({ product, onEdit, onDelete, onViewInfo }: MobileProductCardProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={`rounded-2xl border bg-[var(--bg-card)] overflow-hidden transition-colors ${
            expanded
                ? 'border-sky-500/40 dark:border-[#8FC3A1]/40'
                : 'border-[var(--border-subtle)]'
        }`}>
            {/* ── Fila colapsada — siempre visible ── */}
            <button
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors active:bg-[var(--bg-secondary)]/60"
            >
                {/* Imagen */}
                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] relative">
                    <Image
                        src={product.image || 'https://placehold.co/40x40/f3f4f6/9ca3af?text=?'}
                        alt={product.name}
                        fill
                        sizes="40px"
                        className="object-contain"
                    />
                </div>

                {/* Nombre + precio */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-[var(--text-primary)] truncate leading-tight">
                        {product.name}
                    </p>
                    <p className="text-[11px] font-bold text-sky-500 dark:text-[#8FC3A1] mt-0.5">
                        S/ {product.price.toFixed(2)}
                    </p>
                </div>

                {/* Stock pill */}
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg flex-shrink-0 ${
                    product.stock === 0
                        ? 'bg-red-500/10 text-red-400 border border-red-400/20'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
                }`}>
                    {product.stock === 0 ? 'Agotado' : `${product.stock} uds`}
                </span>

                {/* Chevron */}
                <Icon
                    name={expanded ? 'ChevronUp' : 'ChevronDown'}
                    className="w-4 h-4 flex-shrink-0 text-[var(--text-secondary)] transition-transform"
                />
            </button>

            {/* ── Panel expandido ── */}
            {expanded && (
                <div className="border-t border-[var(--border-subtle)] px-4 py-3 space-y-2.5">

                    {/* Detalle: Categoría */}
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Categoría</span>
                        <span className="text-xs font-bold text-[var(--text-primary)]">
                            {product.category || <span className="opacity-30">—</span>}
                        </span>
                    </div>

                    {/* Detalle: Precio */}
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Precio</span>
                        <span className="text-sm font-black text-[var(--text-primary)]">S/ {product.price.toFixed(2)}</span>
                    </div>

                    {/* Detalle: Stock */}
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Stock</span>
                        <span className={`text-sm font-black ${product.stock === 0 ? 'text-red-400' : 'text-[var(--text-primary)]'}`}>
                            {product.stock}
                            {product.stock === 0 && (
                                <span className="ml-1.5 text-[8px] font-black uppercase tracking-wider text-red-400 border border-red-400/30 px-1 py-0.5 rounded">
                                    Agotado
                                </span>
                            )}
                        </span>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 pt-1">
                        <button
                            onClick={() => onViewInfo(product)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[var(--border-subtle)] text-[11px] font-black text-[var(--text-secondary)] hover:border-sky-500/30 hover:text-sky-500 hover:bg-sky-500/5 dark:hover:border-[#8FC3A1]/30 dark:hover:text-[#8FC3A1] transition-colors"
                        >
                            <Icon name="ArrowRight" className="w-3.5 h-3.5" /> Ver
                        </button>
                        <button
                            onClick={() => onEdit(product)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[var(--border-subtle)] text-[11px] font-black text-[var(--text-secondary)] hover:border-sky-500/30 hover:text-sky-500 hover:bg-sky-500/5 dark:hover:border-[#8FC3A1]/30 dark:hover:text-[#8FC3A1] transition-colors"
                        >
                            <Icon name="Pencil" className="w-3.5 h-3.5" /> Editar
                        </button>
                        <button
                            onClick={() => onDelete(product.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-red-500/20 text-[11px] font-black text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                            <Icon name="Trash2" className="w-3.5 h-3.5" /> Eliminar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Optimistic wrapper ───────────────────────────────────────────────────────

interface OptimisticProductRowProps {
    product:        Product;
    optimisticPrice?: number;
    onEdit:         (product: Product) => void;
    onDelete:       (productId: string) => void;
    onViewInfo:     (product: Product) => void;
    onPriceUpdate:  (productId: string, newPrice: number) => void;
}

function OptimisticProductRow({
    product,
    optimisticPrice,
    onEdit,
    onDelete,
    onViewInfo,
    onPriceUpdate,
}: OptimisticProductRowProps) {
    const displayProduct = optimisticPrice !== undefined
        ? { ...product, price: optimisticPrice }
        : product;

    return (
        <ProductCard
            product={displayProduct}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewInfo={onViewInfo}
            renderPrice={() => (
                <PriceEditInput
                    product={product}
                    onPriceUpdate={onPriceUpdate}
                />
            )}
        />
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CatalogClient({ initialProducts }: CatalogClientProps) {
    const [products, setProducts]               = useState<Product[]>(initialProducts);
    const [searchText, setSearchText]           = useState('');
    const [currentPage, setCurrentPage]         = useState(1);
    const [isModalOpen, setIsModalOpen]         = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isDeleting, setIsDeleting]           = useState(false);
    const [optimisticPrices, setOptimisticPrices] = useState<Record<string, number>>({});
    const [showSuccessModal, setShowSuccessModal]   = useState(false);
    const [showGuide, setShowGuide]                 = useState(false);

    const [isPending, startTransition] = useTransition();
    const [optimisticProducts, setOptimisticPrice] = useOptimistic(
        products,
        (state, { productId, newPrice }: { productId: string; newPrice: number }) =>
            state.map((p) => (p.id === productId ? { ...p, price: newPrice } : p)),
    );

    const { showToast }          = useToast();
    const { confirm, ConfirmDialog } = useConfirmDialog();

    // ── Derived ──────────────────────────────────────────────────────────────

    const displayedProducts = optimisticProducts.map((p) => {
        const op = optimisticPrices[p.id];
        return op !== undefined ? { ...p, price: op } : p;
    });

    const filteredProducts = displayedProducts.filter(
        (p) =>
            p.name.toLowerCase().includes(searchText.toLowerCase()) ||
            p.description.toLowerCase().includes(searchText.toLowerCase()),
    );

    const PAGE_SIZE   = 10;
    const totalPages  = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
    const safePage    = Math.min(currentPage, totalPages);
    const pagedProducts = filteredProducts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    // ── Handlers ─────────────────────────────────────────────────────────────

    const handlePriceUpdate = async (productId: string, newPrice: number) => {
        startTransition(() => {
            setOptimisticPrice({ productId, newPrice });
            setOptimisticPrices((prev) => ({ ...prev, [productId]: newPrice }));
        });

        try {
            const result = await updateProductPrice(productId, newPrice);
            if (!result.success) {
                showToast(result.error || 'Error al actualizar precio', 'error');
                startTransition(() => {
                    setOptimisticPrices((prev) => { const { [productId]: _, ...rest } = prev; return rest; });
                });
            } else {
                showToast('Precio actualizado', 'success');
                startTransition(() => {
                    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, price: newPrice } : p)));
                });
            }
        } catch {
            showToast('Error de conexión', 'error');
            startTransition(() => {
                setOptimisticPrices((prev) => { const { [productId]: _, ...rest } = prev; return rest; });
            });
        }
    };

    const handleCreateProduct = () => { setSelectedProduct(null); setIsModalOpen(true); };
    const openEditModal       = (p: Product) => { setSelectedProduct(p); setIsModalOpen(true); };
    const openDetailModal     = (p: Product) => { setSelectedProduct(p); setIsDetailModalOpen(true); };
    const closeModal          = () => { setIsModalOpen(false); setSelectedProduct(null); };
    const closeDetailModal    = () => { setIsDetailModalOpen(false); setSelectedProduct(null); };

    const onSave = async (product: ProductFormData, file?: File) => {
        try {
            let savedProduct;

            if (!USE_MOCKS) {
                if (selectedProduct) {
                    // UPDATE: solo enviar campos escalares, NO atributos (ya existen en BD)
                    const payload: Record<string, unknown> = {};
                    if (product.name !== undefined) payload.name = product.name;
                    if (product.description !== undefined) payload.description = product.description;
                    if (product.short_description !== undefined) payload.short_description = product.short_description || null;
                    if (product.price !== undefined) payload.price = Number(product.price);
                    if (product.stock !== undefined) payload.stock = Number(product.stock);
                    if (product.category !== undefined) payload.category = product.category || null;
                    if (product.sticker !== undefined) payload.sticker = product.sticker || null;
                    if (product.discountPercentage !== undefined) payload.discountPercentage = product.discountPercentage ?? null;
                    if (product.weight !== undefined) payload.weight = product.weight ? Number(product.weight) : null;
                    if (product.dimensions !== undefined) payload.dimensions = product.dimensions || null;
                    if (product.servingNote !== undefined) payload.servingNote = product.servingNote || null;
                    if ((product as any).expirationDate !== undefined) payload.expirationDate = (product as any).expirationDate || null;

                    savedProduct = await productRepository.updateProduct(selectedProduct.id, payload);
                    if (file) {
                        try {
                            const uploadResult = await productRepository.uploadProductImage(savedProduct.id, file);
                            if (uploadResult.url) {
                                const newImage = toRelativeStorageUrl(uploadResult.url);
                                savedProduct = {
                                    ...savedProduct,
                                    image: newImage,
                                    images: savedProduct.images?.length
                                        ? savedProduct.images.map((img, i) => (i === 0 ? { ...img, src: newImage } : img))
                                        : [{ src: newImage }],
                                } as Product;
                            }
                        } catch (err: any) {
                            showToast(err.message || 'No se pudo subir la imagen', 'error');
                        }
                    }
                } else {
                    // CREATE: payload completo
                    const payload = {
                        type:                   product.type || 'physical',
                        name:                   product.name || '',
                        category:               product.category || '',
                        price:                  Number(product.price) || 0,
                        stock:                  Number(product.stock) || 0,
                        description:            product.description || '',
                        short_description:      product.short_description || undefined,
                        sticker:                product.sticker || null,
                        discountPercentage:     product.discountPercentage ?? null,
                        weight:                 product.weight ? Number(product.weight) : null,
                        dimensions:             product.dimensions || null,
                        mainAttributes:         product.mainAttributes || [],
                        additionalAttributes:   product.additionalAttributes || [],
                        nutritionalAttributes:  product.nutritionalAttributes || [],
                        servingNote:            product.servingNote || null,
                        image:                  null,
                        expirationDate:         (product as any).expirationDate || null,
                    } as any;

                    savedProduct = await productRepository.createProduct(payload);
                    if (file && savedProduct.id) {
                        try {
                            const uploadResult = await productRepository.uploadProductImage(savedProduct.id, file);
                            if (uploadResult.url) {
                                const fresh = await productRepository.getProductById(savedProduct.id);
                                if (fresh) savedProduct = fresh;
                            }
                        } catch (err: any) {
                            showToast(err.message || 'No se pudo subir la imagen', 'error');
                        }
                    }
                }
            } else {
                savedProduct = { id: product.id || Date.now().toString(), ...product } as Product;
            }

            if (!selectedProduct) {
                setShowSuccessModal(true);
                setProducts((prev) => [savedProduct as Product, ...prev]);
                closeModal();
                return;
            }

            showToast('Producto actualizado correctamente', 'success');

            setProducts((prev) =>
                prev.map((p) => (p.id === selectedProduct.id ? savedProduct as Product : p)),
            );

            closeModal();
        } catch (err: any) {
            showToast(err.message || 'Error al procesar el producto', 'error');
        }
    };

    const onDelete = async (productId: string) => {
        const confirmed = await confirm('Eliminar producto', '¿Estás seguro de eliminar este ítem del catálogo activo?');
        if (!confirmed) return;

        setIsDeleting(true);
        try {
            const result = await deleteProduct(productId);
            if (result.success) {
                showToast('Producto eliminado exitosamente', 'info');
                startTransition(() => {
                    setProducts((prev) => prev.filter((p) => p.id !== productId));
                });
            } else {
                showToast(result.error || 'No se pudo eliminar el producto', 'error');
            }
        } catch {
            showToast('No se pudo eliminar el producto', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    if (isPending || isDeleting) return <BaseLoading message="Procesando..." />;

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <>
        <CatalogGuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
        <div className="space-y-8 animate-fadeIn pb-20">

            <ModuleHeader
                title="Gestión de Catálogo"
                subtitle="Administra tus productos, precios e inventario centralizado."
                icon="Package"
            />

            {/* ── Tabla ── */}
            <div className="space-y-4 mt-8">

                {/* Barra superior */}
                <div className="bg-[var(--bg-card)] p-6 sm:p-8 rounded-[2.5rem] shadow-xl border border-[var(--border-subtle)] animate-fadeIn">

                    {/* Header */}
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[var(--brand-green)] rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                                <Icon name="Package" className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">
                                    Catálogo de Productos
                                </h2>
                                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">
                                    {products.length} producto{products.length !== 1 ? 's' : ''} registrado{products.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => { setSearchText(''); setCurrentPage(1); }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 dark:from-emerald-700 dark:to-teal-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-sky-500/25 dark:shadow-emerald-900/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                            title="Limpiar Filtros"
                        >
                            <Icon name="RotateCcw" className="w-4 h-4" />
                            <span className="hidden sm:inline">Limpiar</span>
                        </button>
                    </div>

                    {/* Buscador + acciones */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="relative flex-1">
                            <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
                            <input
                                type="text"
                                value={searchText}
                                onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
                                placeholder="Buscar producto..."
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-sky-500/50 dark:focus:border-[#8FC3A1]/50 transition-colors"
                            />
                        </div>

                        <div className="flex items-center justify-center sm:justify-end gap-3 shrink-0">
                            <BaseButton
                                onClick={handleCreateProduct}
                                variant="action"
                                leftIcon="PlusCircle"
                                size="lg"
                            >
                                Nuevo Producto
                            </BaseButton>
                            <button
                                onClick={() => setShowGuide(true)}
                                title="Guía para imágenes de productos"
                                className="w-9 h-9 flex-shrink-0 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-sky-500 hover:border-sky-500/30 hover:bg-sky-500/5 transition-all"
                            >
                                <Icon name="HelpCircle" className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabla */}
                {filteredProducts.length > 0 ? (
                    <>
                        {/* ══ MÓVIL: tarjetas accordion (sm:hidden) ══════════════════════ */}
                        <div className="sm:hidden space-y-2">
                            {pagedProducts.map((p) => (
                                <MobileProductCard
                                    key={p.id}
                                    product={p}
                                    onEdit={openEditModal}
                                    onDelete={onDelete}
                                    onViewInfo={openDetailModal}
                                />
                            ))}
                        </div>

                        {/* ══ DESKTOP: tabla (hidden sm:block) ══════════════════════════ */}
                        <div className="hidden sm:block rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-visible">
                            <table className="w-full border-separate border-spacing-0">
                                <thead>
                                    <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                                        {['Producto', 'Categoría', 'Precio', 'Stock', 'Acciones'].map(
                                            (h, i, arr) => (
                                                <th
                                                    key={h}
                                                    className={`px-4 py-2.5 text-left text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]
                                                        ${i === 0 ? 'rounded-tl-2xl' : ''}
                                                        ${i === arr.length - 1 ? 'rounded-tr-2xl' : ''}`}
                                                >
                                                    {h}
                                                </th>
                                            ),
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagedProducts.map((p) => (
                                        <OptimisticProductRow
                                            key={`${p.id}-${p.image}`}
                                            product={p}
                                            optimisticPrice={optimisticPrices[p.id]}
                                            onEdit={openEditModal}
                                            onDelete={onDelete}
                                            onViewInfo={openDetailModal}
                                            onPriceUpdate={handlePriceUpdate}
                                        />
                                    ))}
                                </tbody>
                            </table>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-1 pt-1">
                                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                                    Página {safePage} de {totalPages} · {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
                                </p>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={safePage === 1}
                                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Icon name="ChevronLeft" className="w-3.5 h-3.5" />
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-black transition-colors
                                                ${safePage === page
                                                    ? 'bg-sky-500/20 dark:bg-[#8FC3A1]/20 text-sky-500 dark:text-[#8FC3A1] border border-sky-500/30 dark:border-[#8FC3A1]/30'
                                                    : 'border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={safePage === totalPages}
                                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Icon name="ChevronRight" className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        )}
                        </div>{/* /desktop table */}

                        {/* Paginación móvil */}
                        {totalPages > 1 && (
                            <div className="sm:hidden flex items-center justify-between px-1">
                                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                                    {safePage} / {totalPages}
                                </p>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={safePage === 1}
                                        className="w-8 h-8 flex items-center justify-center rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Icon name="ChevronLeft" className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={safePage === totalPages}
                                        className="w-8 h-8 flex items-center justify-center rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Icon name="ChevronRight" className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <BaseEmptyState
                        title="Tu catálogo está vacío"
                        description={
                            searchText.trim()
                                ? `No hay productos que coincidan con "${searchText}".`
                                : 'Comienza agregando tu primer producto al catálogo.'
                        }
                        icon="Catalog"
                        actionLabel={!searchText.trim() ? 'Nuevo Producto' : undefined}
                        onAction={!searchText.trim() ? handleCreateProduct : undefined}
                    />
                )}
            </div>

            {/* ── Modals ── */}
            <ProductModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSave={onSave}
                productToEdit={selectedProduct}
            />

            <ProductDetailModal
                product={selectedProduct}
                isOpen={isDetailModalOpen}
                onClose={closeDetailModal}
            />

            <ConfirmDialog />

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowSuccessModal(false)}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div
                        className="relative z-10 w-full max-w-md rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8 shadow-2xl animate-fadeIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center border border-emerald-500/30">
                                <Icon name="CheckCircle" className="w-8 h-8 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-widest">
                                    Producto Enviado
                                </h3>
                                <p className="text-sm font-medium text-[var(--text-secondary)] mt-2 leading-relaxed">
                                    Tu producto ha sido registrado y será evaluado por un administrador.
                                    Recibirás una notificación cuando sea aprobado.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="px-8 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black text-sm uppercase tracking-widest transition-all active:scale-95"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </>
    );
}