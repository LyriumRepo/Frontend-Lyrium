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
import { deleteProduct, updateProductPrice, saveProduct } from '@/shared/lib/actions/catalog';
import { USE_MOCKS } from '@/shared/lib/config/flags';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';

interface CatalogClientProps {
  initialProducts: Product[];
}

type ProductFormData = Partial<Product>;

// ─── PriceEditInput ──────────────────────────────────────────────────────────
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
        <button onClick={handleSave} disabled={isUpdating} className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded">
          <Icon name="Check" className="w-4 h-4" />
        </button>
        <button onClick={handleCancel} disabled={isUpdating} className="p-1 text-red-500 hover:bg-red-500/10 rounded">
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

// ─── OptimisticProductCard ───────────────────────────────────────────────────
interface OptimisticProductCardProps {
  product: Product;
  optimisticPrice?: number;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onViewInfo: (product: Product) => void;
  onPriceUpdate: (productId: string, newPrice: number) => void;
}

function OptimisticProductCard({ product, optimisticPrice, onEdit, onDelete, onViewInfo, onPriceUpdate }: OptimisticProductCardProps) {
  const displayProduct = optimisticPrice !== undefined ? { ...product, price: optimisticPrice } : product;
  return (
    <ProductCard
      product={displayProduct}
      onEdit={onEdit}
      onDelete={onDelete}
      onViewInfo={onViewInfo}
      renderPrice={() => (
        <PriceEditInput product={product} onPriceUpdate={onPriceUpdate} />
      )}
    />
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function CatalogClient({ initialProducts }: CatalogClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [optimisticPrices, setOptimisticPrices] = useState<Record<string, number>>({});

  const [optimisticProducts, setOptimisticPrice] = useOptimistic(
    products,
    (state, { productId, newPrice }: { productId: string; newPrice: number }) =>
      state.map(p => p.id === productId ? { ...p, price: newPrice } : p)
  );

  const { showToast } = useToast();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const displayedProducts = optimisticProducts.map(p => {
    const optimisticPrice = optimisticPrices[p.id];
    return optimisticPrice !== undefined ? { ...p, price: optimisticPrice } : p;
  });

  const filteredProducts = displayedProducts.filter(p =>
    p.name.toLowerCase().includes(searchText.toLowerCase()) ||
    p.description.toLowerCase().includes(searchText.toLowerCase())
  );

  const handlePriceUpdate = async (productId: string, newPrice: number) => {
    startTransition(() => {
      setOptimisticPrice({ productId, newPrice });
      setOptimisticPrices(prev => ({ ...prev, [productId]: newPrice }));
    });

    try {
      const result = await updateProductPrice(productId, newPrice);
      if (!result.success) {
        showToast(result.error || 'Error al actualizar precio', 'error');
        startTransition(() => {
          setOptimisticPrices(prev => { const { [productId]: _, ...rest } = prev; return rest; });
        });
      } else {
        showToast('Precio actualizado', 'success');
        startTransition(() => {
          setProducts(prev => prev.map(p => p.id === productId ? { ...p, price: newPrice } : p));
        });
      }
    } catch {
      showToast('Error de conexión', 'error');
      startTransition(() => {
        setOptimisticPrices(prev => { const { [productId]: _, ...rest } = prev; return rest; });
      });
    }
  };

  const handleCreateProduct = () => { setSelectedProduct(null); setIsModalOpen(true); };
  const openEditModal = (product: Product) => { setSelectedProduct(product); setIsModalOpen(true); };
  const openDetailModal = (product: Product) => { setSelectedProduct(product); setIsDetailModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setSelectedProduct(null); };
  const closeDetailModal = () => { setIsDetailModalOpen(false); setSelectedProduct(null); };

  // ✅ onSave usa saveProduct (Server Action) — el token lo lee del servidor via cookie httpOnly
  const onSave = async (product: ProductFormData) => {
    try {
      if (USE_MOCKS) {
        const mockProduct = { id: product.id || Date.now().toString(), ...product } as Product;
        showToast(selectedProduct ? 'Producto actualizado' : 'Producto agregado', 'success');
        startTransition(() => {
          setProducts(prev =>
            selectedProduct
              ? prev.map(p => p.id === selectedProduct.id ? mockProduct : p)
              : [mockProduct, ...prev]
          );
        });
        closeModal();
        return;
      }

      // Preparar payload — no enviar base64 directamente
      const hasBase64Image = product.image?.startsWith('data:');

      const payload: Partial<Product> = {
        ...(selectedProduct ? { id: selectedProduct.id } : {}),
        name: product.name || '',
        category: product.category || '',
        price: product.price || 0,
        stock: product.stock || 0,
        description: product.description || '',
        // Si es base64 no la enviamos aún (se sube por separado)
        image: hasBase64Image ? (selectedProduct?.image || null) : (product.image || null),
        weight: product.weight,
        dimensions: product.dimensions,
        sticker: product.sticker || null,
        mainAttributes: product.mainAttributes || [],
        additionalAttributes: product.additionalAttributes || [],
      };

      // ✅ Server Action — lee laravel_token de cookie httpOnly en el servidor
      const result = await saveProduct(payload);

      if (!result.success || !result.data) {
        showToast(result.error || 'Error al guardar el producto', 'error');
        return;
      }

      let savedProduct = result.data;

      // Subir imagen base64 si hay una nueva
      if (hasBase64Image && product.image && savedProduct.id) {
        try {
          // Convertir base64 a File y subir via Server Action o endpoint dedicado
          const res = await fetch(product.image);
          const blob = await res.blob();
          const file = new File([blob], `product-${Date.now()}.webp`, { type: blob.type });

          const formData = new FormData();
          formData.append('file', file);

          const uploadRes = await fetch(`/api/seller/products/${savedProduct.id}/image`, {
            method: 'POST',
            body: formData,
          });

          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            savedProduct = { ...savedProduct, image: uploadData.url || product.image };
          } else {
            // Si falla la subida, usar el base64 solo para mostrar en UI
            savedProduct = { ...savedProduct, image: product.image };
          }
        } catch (uploadErr) {
          console.error('Error uploading image:', uploadErr);
          savedProduct = { ...savedProduct, image: product.image || savedProduct.image };
        }
      }

      // Merge con datos del formulario para UI inmediata
      const finalProduct: Product = {
        ...savedProduct,
        name: product.name || savedProduct.name,
        category: product.category || savedProduct.category,
        price: product.price ?? savedProduct.price,
        stock: product.stock ?? savedProduct.stock,
        description: product.description || savedProduct.description,
        image: product.image || savedProduct.image,
        weight: product.weight ?? savedProduct.weight,
        dimensions: product.dimensions || savedProduct.dimensions,
        mainAttributes: product.mainAttributes || savedProduct.mainAttributes,
        additionalAttributes: product.additionalAttributes || savedProduct.additionalAttributes,
      };

      showToast(
        selectedProduct ? 'Producto actualizado correctamente' : 'Nuevo producto agregado al catálogo',
        'success'
      );

      startTransition(() => {
        setProducts(prev =>
          selectedProduct
            ? prev.map(p => p.id === selectedProduct.id ? finalProduct : p)
            : [finalProduct, ...prev]
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
          setProducts(prev => prev.filter(p => p.id !== productId));
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
          <BaseButton onClick={handleCreateProduct} variant="action" leftIcon="PlusCircle" size="md" className="!rounded-3xl">
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

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <OptimisticProductCard
              key={product.id}
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

      <ProductModal isOpen={isModalOpen} onClose={closeModal} onSave={onSave} productToEdit={selectedProduct} />
      <ProductDetailModal product={selectedProduct} isOpen={isDetailModalOpen} onClose={closeDetailModal} />
      <ConfirmDialog />
    </div>
  );
}