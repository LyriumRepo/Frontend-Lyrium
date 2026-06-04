'use client';

import React, { useState, useTransition, useOptimistic } from 'react';
import type { Product } from '@/features/seller/catalog/types';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import ProductDetailModal from './components/ProductDetailModal';
import BaseEmptyState from '@/components/ui/BaseEmptyState';
import BaseButton from '@/components/ui/BaseButton';
import BaseLoading from '@/components/ui/BaseLoading';
import Icon from '@/components/ui/Icon';
import { useToast } from '@/shared/lib/context/ToastContext';
import {
  deleteProduct,
  updateProductPrice,
  saveProduct,
  uploadProductImageAction,
} from '@/shared/lib/actions/catalog';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';

interface CatalogClientProps {
  initialProducts: Product[];
}

// ─── PriceEditInput ───────────────────────────────────────────────────────────
function PriceEditInput({
  product,
  onPriceUpdate,
}: {
  product: Product;
  onPriceUpdate: (id: string, price: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [price, setPrice] = useState(String(product.price));

  const handleSave = async () => {
    const newPrice = Number(price);
    if (isNaN(newPrice) || newPrice < 0) {
      setPrice(String(product.price));
      setIsEditing(false);
      return;
    }
    onPriceUpdate(product.id, newPrice);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-20 px-2 py-1 text-sm border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-[var(--bg-card)] text-[var(--text-primary)]"
          step="0.01"
        />
        <button
          onClick={handleSave}
          className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded"
        >
          <Icon name="Check" className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setPrice(String(product.price));
            setIsEditing(false);
          }}
          className="p-1 text-red-500 hover:bg-red-500/10 rounded"
        >
          <Icon name="X" className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="flex items-center gap-1 text-emerald-500 font-bold hover:text-emerald-400 transition-colors"
    >
      <span>S/{product.price.toFixed(2)}</span>
      <Icon name="Pencil" className="w-3 h-3 opacity-50" />
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CatalogClient({ initialProducts }: CatalogClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [optimisticPrices, setOptimisticPrices] = useState<
    Record<string, number>
  >({});

  const [optimisticProducts, setOptimisticPrice] = useOptimistic(
    products,
    (state, { productId, newPrice }: { productId: string; newPrice: number }) =>
      state.map((p) => (p.id === productId ? { ...p, price: newPrice } : p)),
  );

  const { showToast } = useToast();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const displayedProducts = optimisticProducts.map((p) => {
    const op = optimisticPrices[p.id];
    return op !== undefined ? { ...p, price: op } : p;
  });

  const filteredProducts = displayedProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.description.toLowerCase().includes(searchText.toLowerCase()),
  );

  // ─── Precio ─────────────────────────────────────────────────────────────────
  const handlePriceUpdate = async (productId: string, newPrice: number) => {
    startTransition(() => {
      setOptimisticPrice({ productId, newPrice });
      setOptimisticPrices((prev) => ({ ...prev, [productId]: newPrice }));
    });

    const result = await updateProductPrice(productId, newPrice);
    if (!result.success) {
      showToast(result.error ?? 'Error al actualizar precio', 'error');
      setOptimisticPrices((prev) => {
        const { [productId]: _, ...rest } = prev;
        return rest;
      });
    } else {
      showToast('Precio actualizado', 'success');
      startTransition(() => {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, price: newPrice } : p)),
        );
      });
    }
  };

  // ─── CRUD ────────────────────────────────────────────────────────────────────
  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };
  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };
  const openDetailModal = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };
  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedProduct(null);
  };

  // ─── Image compression utility ────────────────────────────────────────────────
  function compressImage(
    dataUrl: string,
    maxWidth = 1920,
    quality = 0.85,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      if (typeof Image === 'undefined') {
        resolve(dataUrl);
        return;
      }
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/webp', quality));
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = dataUrl;
    });
  }

  const onSave = async (productData: Partial<Product>) => {
    try {
      const hasBase64Image = productData.image?.startsWith('data:');

      // Sin base64: enviar imagen existente. Con base64: preservar la anterior
      const payload = !hasBase64Image
        ? productData
        : { ...productData, image: (selectedProduct?.image ?? '') };

      const result = await saveProduct(payload);

      if (!result.success || !result.data) {
        showToast(result.error ?? 'Error al guardar el producto', 'error');
        return;
      }

      let savedProduct = result.data;

      // Subir imagen comprimida vía server action (evita CORS, PHP upload limits, httpOnly cookie)
      if (hasBase64Image && productData.image && savedProduct.id) {
        try {
          const compressed = await compressImage(productData.image);
          const uploadResult = await uploadProductImageAction(
            Number(savedProduct.id),
            compressed,
          );
          if (uploadResult.success && uploadResult.url) {
            savedProduct = { ...savedProduct, image: uploadResult.url };
          } else {
            console.error('Upload failed:', uploadResult.error);
          }
        } catch (uploadErr) {
          console.error('Upload exception:', uploadErr);
        }
      }

      showToast(
        selectedProduct
          ? 'Producto actualizado correctamente'
          : 'Producto agregado al catálogo',
        'success',
      );

      startTransition(() => {
        setProducts((prev) =>
          selectedProduct
            ? prev.map((p) => (p.id === selectedProduct.id ? savedProduct : p))
            : [savedProduct, ...prev],
        );
      });

      closeModal();
    } catch (err: any) {
      showToast(err.message ?? 'Error al procesar el producto', 'error');
    }
  };

  const onDelete = async (productId: string) => {
    const confirmed = await confirm(
      'Eliminar producto',
      '¿Estás seguro de eliminar este ítem del catálogo?',
    );
    if (!confirmed) return;

    setIsDeleting(true);
    const result = await deleteProduct(productId);
    if (result.success) {
      showToast('Producto eliminado', 'info');
      startTransition(() => {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      });
    } else {
      showToast(result.error ?? 'No se pudo eliminar el producto', 'error');
    }
    setIsDeleting(false);
  };

  if (isPending || isDeleting) {
    return (
      <div className="space-y-8 animate-fadeIn pb-20">
        <ModuleHeader
          title="Gestión de Catálogo"
          subtitle="Administra tus productos, precios e inventario centralizado."
          icon="Catalog"
        />
        <div className="flex items-center justify-center py-32">
          <BaseLoading message="Procesando..." />
        </div>
      </div>
    );
  }

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
            size="md"
            className="!rounded-3xl"
          >
            Nuevo Producto
          </BaseButton>
        }
      />

      {/* Filtros */}
      <div className="glass-card p-6 rounded-[2.5rem] bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl shadow-black/5">
        <div className="relative">
          <Icon
            name="Search"
            className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] w-5 h-5"
          />
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-[var(--bg-secondary)] border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-[var(--bg-card)] transition-all font-bold text-[var(--text-primary)] outline-none"
          />
        </div>
      </div>

      {/* Grid de productos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={openEditModal}
              onDelete={onDelete}
              onViewInfo={openDetailModal}
              renderPrice={() => (
                <PriceEditInput
                  product={product}
                  onPriceUpdate={handlePriceUpdate}
                />
              )}
            />
          ))
        ) : (
          <div className="col-span-full">
            <BaseEmptyState
              title="Tu catálogo está vacío"
              description="Comienza a construir tu presencia digital agregando tu primer producto."
              icon="Catalog"
              actionLabel="Nuevo Producto"
              onAction={handleCreateProduct}
              suggestion="Los productos con buenas fotos y descripciones técnicas convierten un 40% más."
            />
          </div>
        )}
      </div>

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
