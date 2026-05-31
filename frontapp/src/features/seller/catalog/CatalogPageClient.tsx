'use client';

import React, { useState, useTransition, useOptimistic } from 'react';
import { Product } from '@/features/seller/catalog/types';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
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

    const onSave = async (product: ProductFormData) => {
        try {
            let savedProduct;

            if (!USE_MOCKS) {
                const hasBase64Image = product.image && product.image.startsWith('data:');
                const payload = {
                    name:                 product.name || '',
                    category:             product.category || '',
                    price:                product.price || 0,
                    stock:                product.stock || 0,
                    description:          product.description || '',
                    image:                hasBase64Image ? null : product.image || null,
                    weight:               product.weight,
                    dimensions:           product.dimensions,
                    mainAttributes:       product.mainAttributes || [],
                    additionalAttributes: product.additionalAttributes || [],
                };

                if (selectedProduct) {
                    savedProduct = await productRepository.updateProduct(selectedProduct.id, payload);
                    if (hasBase64Image && product.image) {
                        try {
                            const blob = await (await fetch(product.image)).blob();
                            await productRepository.uploadProductImage(
                                savedProduct.id,
                                new File([blob], `product-${Date.now()}.webp`, { type: blob.type }),
                            );
                        } catch {}
                    }
                    savedProduct = { ...savedProduct, ...product, id: selectedProduct.id } as Product;
                } else {
                    savedProduct = await productRepository.createProduct(payload);
                    if (hasBase64Image && product.image && savedProduct.id) {
                        try {
                            const blob = await (await fetch(product.image)).blob();
                            const r    = await productRepository.uploadProductImage(
                                savedProduct.id,
                                new File([blob], `product-${Date.now()}.webp`, { type: blob.type }),
                            );
                            savedProduct = { ...savedProduct, image: r.url } as Product;
                        } catch {}
                    }
                    savedProduct = { ...savedProduct, ...product, id: savedProduct.id } as Product;
                }
            } else {
                savedProduct = { id: product.id || Date.now().toString(), ...product } as Product;
            }

            showToast(
                selectedProduct ? 'Producto actualizado correctamente' : 'Nuevo producto agregado al catálogo',
                'success',
            );

            startTransition(() => {
                setProducts((prev) =>
                    selectedProduct
                        ? prev.map((p) => (p.id === selectedProduct.id ? savedProduct as Product : p))
                        : [savedProduct as Product, ...prev],
                );
            });

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
        <div className="space-y-8 animate-fadeIn pb-20">

            <ModuleHeader
                title="Gestión de Catálogo"
                subtitle="Administra tus productos, precios e inventario centralizado."
                icon="Catalog"
                actions={
                    <BaseButton
                        onClick={handleCreateProduct}
                        variant="action"
                        leftIcon="PlusCircle"
                    >
                        Nuevo Producto
                    </BaseButton>
                }
            />

            {/* ── Tabla ── */}
            <div className="space-y-4 mt-8">

                {/* Barra superior */}
                <div className="flex items-center justify-between px-1">

                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-sky-500/10 dark:bg-[#8FC3A1]/10 rounded-xl flex items-center justify-center border border-sky-500/20 dark:border-[#8FC3A1]/20 text-sky-500 dark:text-[#8FC3A1]">
                            <Icon name="Catalog" className="w-4 h-4 stroke-[2.5px]" />
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

                    {/* Buscador */}
                    <div className="relative">
                        <Icon name="Search" className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-secondary)] pointer-events-none" />
                        <input
                            type="text"
                            value={searchText}
                            onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
                            placeholder="Buscar producto..."
                            className="pl-8 pr-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[11px] font-bold text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-sky-500/50 dark:focus:border-[#8FC3A1]/50 transition-colors w-44"
                        />
                    </div>
                </div>

                {/* Tabla */}
                {filteredProducts.length > 0 ? (
                    <>
                        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-visible">
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
                                            key={p.id}
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
                        </div>

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
        </div>
    );
}