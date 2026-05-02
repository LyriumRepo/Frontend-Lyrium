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
import { deleteProduct, updateProductPrice, getProducts, createProduct, updateProduct } from '@/shared/lib/actions/catalog';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';

interface CatalogClientProps {
  initialProducts: Product[];
}

type ProductFormData = Partial<Product>;

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * OPTIMISTIC UI: Componente de edición de precio inline
 * 
 * useOptimistic mantiene el estado de la UI sincronizado con la acción
 * antes de que el servidor confirme. Si falla, se revierte automáticamente.
 * ═══════════════════════════════════════════════════════════════════════════
 */
interface PriceEditInputProps {
  product: Product;
  onPriceUpdate: (productId: string, newPrice: number) => void;
}

function PriceEditInput({ product, onPriceUpdate }: PriceEditInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [price, setPrice] = useState(String(product.price));
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    const newPrice = Number(price);
    if (isNaN(newPrice) || newPrice < 0) {
      setPrice(String(product.price));
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);

    // Optimistic update - UI se actualiza inmediatamente
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
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-20 px-2 py-1 text-sm border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-[var(--bg-card)] text-[var(--text-primary)]"
          step="0.01"
          disabled={isUpdating}
        />
        <button
          onClick={handleSave}
          disabled={isUpdating}
          className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded"
        >
          <Icon name="Check" className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancel}
          disabled={isUpdating}
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

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ProductCard con Precio Editable (Optimistic)
 * ═══════════════════════════════════════════════════════════════════════════
 */
interface OptimisticProductCardProps {
  product: Product;
  optimisticPrice?: number;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onViewInfo: (product: Product) => void;
  onPriceUpdate: (productId: string, newPrice: number) => void;
}

function OptimisticProductCard({
  product,
  optimisticPrice,
  onEdit,
  onDelete,
  onViewInfo,
  onPriceUpdate
}: OptimisticProductCardProps) {
  // Usar precio optimístico si está disponible, sino el original
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

export default function CatalogClient({ initialProducts }: CatalogClientProps) {
  // Estado base
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Transiciones
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  // Optimistic state para precios
  const [optimisticPrices, setOptimisticPrices] = useState<Record<string, number>>({});

  // Optimistic hook: actualiza el estado antes de que la acción confirme
  const [optimisticProducts, setOptimisticPrice] = useOptimistic(
    products,
    (state, { productId, newPrice }: { productId: string; newPrice: number }) => {
      return state.map(p =>
        p.id === productId
          ? { ...p, price: newPrice }
          : p
      );
    }
  );

  const { showToast } = useToast();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Productos a mostrar: usar los optimísticos si existen, sino los originales
  const displayedProducts = optimisticProducts.map(p => {
    const optimisticPrice = optimisticPrices[p.id];
    return optimisticPrice !== undefined
      ? { ...p, price: optimisticPrice }
      : p;
  });

  const filteredProducts = displayedProducts.filter(p =>
    p.name.toLowerCase().includes(searchText.toLowerCase()) ||
    p.description.toLowerCase().includes(searchText.toLowerCase())
  );

  // Handler para actualización optimista de precio
  const handlePriceUpdate = async (productId: string, newPrice: number) => {
    // 1. Optimistic update - instantánea
    startTransition(() => {
      setOptimisticPrice({ productId, newPrice });
      setOptimisticPrices(prev => ({ ...prev, [productId]: newPrice }));
    });

    // 2. Llamar al servidor en background
    try {
      const result = await updateProductPrice(productId, newPrice);

      if (!result.success) {
        // Error - revertir
        showToast(result.error || 'Error al actualizar precio', 'error');

        startTransition(() => {
          setOptimisticPrices(prev => {
            const { [productId]: _, ...rest } = prev;
            return rest;
          });
        });
      } else {
        // Éxito
        showToast('Precio actualizado', 'success');

        // Actualizar estado real
        startTransition(() => {
          setProducts(prev => prev.map(p =>
            p.id === productId ? { ...p, price: newPrice } : p
          ));
        });
      }
    } catch (err) {
      // Error de red - revertir
      showToast('Error de conexión', 'error');

      startTransition(() => {
        setOptimisticPrices(prev => {
          const { [productId]: _, ...rest } = prev;
          return rest;
        });
      });
    }
  };

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

  const onSave = async (product: ProductFormData) => {
    try {
      // Limpiar atributos vacíos
      const cleanAttributes = (attrs: any[] | undefined) => {
        if (!attrs) return [];
        return attrs
          .map(attr => ({
            values: (attr.values || [])
              .filter((v: any) => v && String(v).trim().length > 0)
              .map((v: any) => String(v))
          }))
          .filter(attr => attr.values.length > 0);
      };

      const payload = {
        name: product.name || '',
        category: product.category || '',
        price: product.price || 0,
        stock: product.stock || 0,
        description: product.description || '',
        image: product.image || null,
        weight: product.weight,
        dimensions: product.dimensions,
        sticker: product.sticker || null,
        mainAttributes: cleanAttributes(product.mainAttributes),
        additionalAttributes: cleanAttributes(product.additionalAttributes),
      };

      console.log('[onSave] Starting product save', { isUpdate: !!selectedProduct });
      
      let result;

      if (selectedProduct) {
        // UPDATE existing product (via Server Action)
        result = await updateProduct(selectedProduct.id, payload);
      } else {
        // CREATE new product (via Server Action)
        result = await createProduct(payload);
      }

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Error al guardar producto');
      }

      showToast(
        selectedProduct ? 'Producto actualizado correctamente' : 'Nuevo producto agregado al catálogo',
        'success'
      );

      console.log('[onSave] Refreshing product list from server');
      
      // Refresh from server to ensure consistency
      startTransition(async () => {
        const refreshedProducts = await getProducts();
        console.log('[onSave] Refreshed products count:', refreshedProducts.length);
        setProducts(refreshedProducts);
      });

      closeModal();
    } catch (error) {
      console.error('[onSave] Error:', error);
      showToast(
        error instanceof Error ? error.message : 'Error al guardar producto',
        'error'
      );
    }
  };

  const onDelete = async (productId: string) => {
    const confirmed = await confirm(
      'Eliminar producto',
      '¿Estás seguro de eliminar este ítem del catálogo activo?'
    );
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const result = await deleteProduct(productId);

      if (result.success) {
        showToast('Producto eliminado exitosamente', 'info');

        startTransition(() => {
          setProducts(prev => prev.filter(p => p.id !== productId));
        });
      } else {
        showToast(result.error || 'No se pudo eliminar el producto', 'error');
      }
    } catch (err) {
      showToast('No se pudo eliminar el producto', 'error');
    } finally {
      setIsDeleting(false);
    }
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

      {/* Filters */}
      <div className="glass-card p-6 rounded-[2.5rem] bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl shadow-black/5">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Icon name="Search" className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-[var(--bg-secondary)] border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-[var(--bg-card)] transition-all font-bold text-[var(--text-primary)] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Product Grid con Optimistic Updates */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product, index) => (
            <OptimisticProductCard
              key={product.id || `product-${index}`}
              product={product}
              optimisticPrice={optimisticPrices[product.id]}
              onEdit={openEditModal}
              onDelete={onDelete}
              onViewInfo={openDetailModal}
              onPriceUpdate={handlePriceUpdate}
            />
          ))
        ) : (
          <div className="col-span-full">
            <BaseEmptyState
              title="Tu catálogo está vacío"
              description="Comienza a construir tu presencia digital agregando tu primer producto estrella."
              icon="Catalog"
              actionLabel="Nuevo Producto"
              onAction={handleCreateProduct}
              suggestion="Los productos con buenas fotos y descripciones técnicas convierten un 40% más."
            />
          </div>
        )}
      </div>

      {/* Modals */}
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
