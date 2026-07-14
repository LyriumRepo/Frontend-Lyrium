'use client';

import React, { useState, useEffect, useTransition, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useFormState, useFormStatus } from 'react-dom';
import { createProduct, ProductActionResult } from '@/shared/lib/actions/product-form';
import { ProductFormSchema } from '@/shared/lib/schemas/product.schema';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import Icon from '@/components/ui/Icon';
import { useToast } from '@/shared/lib/context/ToastContext';
import { useRouter } from 'next/navigation';

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';

interface UploadedImage {
  id: string;
  url: string;
  file?: File;
  isUploading?: boolean;
}

const initialState: ProductActionResult = { success: false, error: '' };

function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || isSubmitting}
      className="flex-1 py-4 bg-emerald-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {pending || isSubmitting ? (
        <>
          <Icon name="Loader2" className="w-5 h-5 animate-spin" />
          <span>Guardando...</span>
        </>
      ) : (
        <>
          <Icon name="Check" className="w-5 h-5" />
          <span>Publicar Producto</span>
        </>
      )}
    </button>
  );
}

async function uploadImageToLaravel(productId: string, file: File): Promise<{ url?: string; error?: string }> {
  const token = localStorage.getItem('laravel_token');
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(`${LARAVEL_API_URL}/products/${productId}/media`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!res.ok) return { error: 'Error al subir la imagen' };
    const data = await res.json();
    return { url: data.data?.url || data.url || '' };
  } catch {
    return { error: 'Error de conexión al subir imagen' };
  }
}

function ImageUploader({
  images,
  onRemove,
  onSetPrimary,
}: {
  images: UploadedImage[];
  onUpload: (file: File) => void;
  onRemove: (id: string) => void;
  onSetPrimary: (id: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback((files: FileList) => {
    if (images.length >= 5) return;

    for (const file of Array.from(files)) {
      if (images.length >= 5) break;
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) continue;
      if (file.size > 5 * 1024 * 1024) continue;

      const previewUrl = URL.createObjectURL(file);
      const tempId = `temp-${Date.now()}-${Math.random()}`;

      const customEvent = new CustomEvent('image-add', {
        detail: { id: tempId, url: previewUrl, file },
      });
      document.dispatchEvent(customEvent);
    }
  }, [images.length]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
        Imágenes del Producto
      </label>

      <div
        role="button"
        tabIndex={0}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${isDragging
          ? 'border-sky-500 bg-sky-50'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        <div className="space-y-2">
          <Icon name="Upload" className="w-8 h-8 text-gray-400 mx-auto" />
          <p className="text-sm text-gray-500">
            Arrastra imágenes o <span className="text-sky-500 font-bold">haz clic para seleccionar</span>
          </p>
          <p className="text-xs text-gray-400">JPEG, PNG, WebP o GIF. Máximo 5MB cada una.</p>
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-100 group"
            >
              <Image
                src={img.url}
                alt="Product image"
                fill
                sizes="(max-width: 768px) 25vw, 20vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => onSetPrimary(img.id)}
                  className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                  title="Imagen principal"
                >
                  <Icon name="Star" className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(img.id)}
                  className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50"
                  title="Eliminar"
                >
                  <Icon name="Trash2" className="w-4 h-4" />
                </button>
              </div>

              {img.isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Icon name="Loader2" className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductFormClient() {
  const router = useRouter();
  const { showToast } = useToast();
  const [state, formAction] = useFormState(createProduct, initialState);

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [featuredImage, setFeaturedImage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [categoryValue, setCategoryValue] = useState('');

  const [categories, setCategories] = useState<{ id: number; name: string; slug: string; level: number }[]>([]);

  // Retiro en Tienda
  const [pickupEnabled, setPickupEnabled] = useState(false);
  const [branches, setBranches] = useState<{ id: number; name: string; address: string; district: string; is_principal: boolean }[]>([]);
  const [branchStockMap, setBranchStockMap] = useState<Record<number, { stock: number; pickup_enabled: boolean }>>({});
  const [hasFetchedBranches, setHasFetchedBranches] = useState(false);

  useEffect(() => {
    fetch(`${LARAVEL_API_URL}/categories?type=product&tree=1&per_page=100`)
      .then(r => r.json())
      .then(json => {
        const tree = json.data || json || [];
        const flat: typeof categories = [];
        function flatten(nodes: any[], level = 0) {
          for (const node of nodes) {
            flat.push({ id: node.id, name: node.name, slug: node.slug, level });
            if (node.children?.length) flatten(node.children, level + 1);
          }
        }
        flatten(tree);
        setCategories(flat);
      })
      .catch(() => {});
  }, []);

  // Cargar sucursales del vendedor cuando activa RT
  useEffect(() => {
    if (!pickupEnabled || hasFetchedBranches) return;
    const token = localStorage.getItem('laravel_token');
    fetch(`${LARAVEL_API_URL}/stores/me`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
      .then(r => r.json())
      .then(json => {
        const data = (json.data?.branches || json.branches || []) as { id: number; name: string; address: string; district: string; is_principal: boolean }[];
        const active = data.filter((b: any) => b.is_active !== false);
        setBranches(active);
        const map: Record<number, { stock: number; pickup_enabled: boolean }> = {};
        active.forEach((b: any) => { map[b.id] = { stock: 0, pickup_enabled: true }; });
        setBranchStockMap(map);
        setHasFetchedBranches(true);
      })
      .catch(() => {});
  }, [pickupEnabled, hasFetchedBranches]);

  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as UploadedImage;
      setImages(prev => [...prev, detail]);
    };
    document.addEventListener('image-add', handler);
    return () => document.removeEventListener('image-add', handler);
  }, []);

  const validateField = useCallback((name: string, value: string) => {
    const testData = {
      name: name === 'name' ? value : '',
      price: name === 'price' ? value : '0',
      stock: name === 'stock' ? value : '0',
      category: name === 'category' ? value : '',
    };

    const result = ProductFormSchema.safeParse(testData);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setFieldErrors(prev => ({
        ...prev,
        [name]: errors[name as keyof typeof errors] || [],
      }));
    } else {
      setFieldErrors(prev => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  }, []);

  const handleImageUpload = useCallback((file: File) => {
    const tempId = `temp-${Date.now()}`;
    const previewUrl = URL.createObjectURL(file);

    setImages(prev => [...prev, {
      id: tempId,
      url: previewUrl,
      file,
      isUploading: true,
    }]);

    if (images.length === 0) {
      setFeaturedImage(tempId);
    }
  }, [images.length]);

  const handleImageRemove = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    if (featuredImage === id) {
      const remaining = images.filter(img => img.id !== id);
      setFeaturedImage(remaining.length > 0 ? remaining[0].id : '');
    }
  }, [featuredImage, images]);

  const handleSetPrimary = useCallback((id: string) => {
    setFeaturedImage(id);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const result = await createProduct({ success: false, error: '' }, formData);

      if (result.success && result.productId) {
        // Upload images to Laravel after product creation
        const imageFiles = images.filter(img => img.file);
        for (const img of imageFiles) {
          if (!img.file) continue;
          setImages(prev => prev.map(i => i.id === img.id ? { ...i, isUploading: true } : i));
          const uploadResult = await uploadImageToLaravel(result.productId, img.file);
          setImages(prev => prev.map(i => i.id === img.id ? { ...i, isUploading: false } : i));
          if (uploadResult.error) {
            showToast(`Error al subir ${img.file.name}: ${uploadResult.error}`, 'error');
          }
        }

        // Guardar stock por sucursal (Retiro en Tienda)
        if (pickupEnabled) {
          const token = localStorage.getItem('laravel_token');
          const branchesPayload = Object.entries(branchStockMap)
            .filter(([_, v]) => v.pickup_enabled !== false || v.stock > 0)
            .map(([branchId, v]) => ({
              branch_id: parseInt(branchId),
              stock: v.stock,
              pickup_enabled: v.pickup_enabled !== false,
            }));

          if (branchesPayload.length > 0) {
            await fetch(`${LARAVEL_API_URL}/products/${result.productId}/branches`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({ branches: branchesPayload }),
            });
          }
        }

        showToast('Producto creado exitosamente', 'success');
        router.push('/seller/catalog');
      } else if (!result.success) {
        showToast(result.error || 'Error al crear el producto', 'error');
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Error al procesar el producto', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <ModuleHeader
        title="Nuevo Producto"
        subtitle="Crea un nuevo producto en tu catálogo"
        icon="PlusCircle"
      />

      <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
        <input type="hidden" name="featuredImage" value={featuredImage} />

        <div className="glass-card p-8 rounded-3xl bg-white border border-gray-100 shadow-xl">
          <h3 className="text-sm font-black text-gray-800 uppercase mb-6">Información Básica</h3>

          <div className="space-y-6">
            <div>
              <label htmlFor="product-name" className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                Nombre del Producto *
              </label>
              <input
                id="product-name"
                type="text"
                name="name"
                required
                onBlur={(e) => validateField('name', e.target.value)}
                className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl font-bold text-gray-700 focus:outline-none focus:ring-2 transition-all ${fieldErrors.name?.length
                  ? 'border-red-300 focus:ring-red-100'
                  : 'border-gray-100 focus:border-sky-500 focus:ring-sky-100'
                  }`}
                placeholder="Ej: Vitamina C 1000mg"
              />
              {fieldErrors.name?.[0] && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.name[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="product-description" className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                Descripción
              </label>
              <textarea
                id="product-description"
                name="description"
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl font-bold text-gray-700 focus:outline-none focus:ring-2 focus:border-sky-500 focus:ring-sky-100"
                placeholder="Describe las características de tu producto..."
              />
            </div>

            <div>
              <label htmlFor="product-category" className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                Categoría *
              </label>
              <select
                id="product-category"
                name="category"
                required
                value={categoryValue}
                onChange={(e) => setCategoryValue(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl font-bold text-gray-700 focus:outline-none focus:ring-2 focus:border-sky-500 focus:ring-sky-100"
              >
                <option value="">Seleccionar Categoría...</option>
                {categories.map((cat) => {
                  const isParent = cat.level < 2;
                  return (
                    <option key={cat.id} value={isParent ? '' : cat.slug} disabled={isParent}>
                      {'\u00A0\u00A0'.repeat(cat.level)}{isParent ? '-- ' : ''}{cat.name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl bg-white border border-gray-100 shadow-xl">
          <h3 className="text-sm font-black text-gray-800 uppercase mb-6">Precios y Stock</h3>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="product-price" className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                Precio de Venta *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">S/</span>
                <input
                  id="product-price"
                  type="number"
                  name="price"
                  required
                  step="0.01"
                  onBlur={(e) => validateField('price', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 border-2 rounded-xl font-bold text-gray-700 focus:outline-none focus:ring-2 ${fieldErrors.price?.length
                    ? 'border-red-300 focus:ring-red-100'
                    : 'border-gray-100 focus:border-sky-500 focus:ring-sky-100'
                    }`}
                  placeholder="0.00"
                />
              </div>
              {fieldErrors.price?.[0] && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.price[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="product-stock" className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                Stock *
              </label>
              <input
                id="product-stock"
                type="number"
                name="stock"
                min="0"
                onBlur={(e) => validateField('stock', e.target.value)}
                className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl font-bold text-gray-700 focus:outline-none focus:ring-2 ${fieldErrors.stock?.length
                  ? 'border-red-300 focus:ring-red-100'
                  : 'border-gray-100 focus:border-sky-500 focus:ring-sky-100'
                  }`}
                placeholder="0"
              />
              {fieldErrors.stock?.[0] && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.stock[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="product-sku" className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                SKU
              </label>
              <input
                id="product-sku"
                type="text"
                name="sku"
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl font-bold text-gray-700 focus:outline-none focus:ring-2 focus:border-sky-500 focus:ring-sky-100"
                placeholder="Código interno"
              />
            </div>
          </div>
        </div>

        {/* Retiro en Tienda */}
        <div className="glass-card p-8 rounded-3xl bg-white border border-gray-100 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-black text-gray-800 uppercase">Retiro en Tienda</h3>
              <p className="text-xs text-gray-500 mt-1">Disponible para recoger en tus sucursales</p>
            </div>
            <button
              type="button"
              onClick={() => setPickupEnabled(!pickupEnabled)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${pickupEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${pickupEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {pickupEnabled && (
            <input type="hidden" name="pickup_enabled" value="true" />
          )}

          {pickupEnabled && branches.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Selecciona sucursales y stock disponible
              </p>
              {branches.map(branch => (
                <div
                  key={branch.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">{branch.name}</p>
                    <p className="text-xs text-gray-500">{branch.address}, {branch.district}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-gray-500">Stock:</label>
                    <input
                      type="number"
                      min="0"
                      value={branchStockMap[branch.id]?.stock ?? 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setBranchStockMap(prev => ({
                          ...prev,
                          [branch.id]: { ...prev[branch.id], stock: val },
                        }));
                      }}
                      className="w-20 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-sm font-bold text-gray-700 focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setBranchStockMap(prev => ({
                          ...prev,
                          [branch.id]: {
                            ...prev[branch.id],
                            pickup_enabled: !prev[branch.id]?.pickup_enabled,
                          },
                        }));
                      }}
                      className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${
                        branchStockMap[branch.id]?.pickup_enabled !== false ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        branchStockMap[branch.id]?.pickup_enabled !== false ? 'translate-x-5' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pickupEnabled && branches.length === 0 && hasFetchedBranches && (
            <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <Icon name="Store" className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No tienes sucursales registradas</p>
              <a
                href="/seller/store"
                className="text-sm font-bold text-sky-500 hover:underline mt-1 inline-block"
              >
                Crear sucursal
              </a>
            </div>
          )}
        </div>

        <div className="glass-card p-8 rounded-3xl bg-white border border-gray-100 shadow-xl">
          <ImageUploader
            images={images}
            onUpload={handleImageUpload}
            onRemove={handleImageRemove}
            onSetPrimary={handleSetPrimary}
          />
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-4 bg-gray-100 text-gray-600 font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all"
          >
            Cancelar
          </button>
          <SubmitButton isSubmitting={isSubmitting} />
        </div>
      </form>
    </div>
  );
}
