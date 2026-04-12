'use client';

import React, { useState, useTransition, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useFormState, useFormStatus } from 'react-dom';
import { createProduct, uploadImageToWordPress, ProductActionResult } from '@/shared/lib/actions/product-form';
import { ProductFormSchema, ProductFormData } from '@/shared/lib/schemas/product.schema';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import Icon from '@/components/ui/Icon';
import { useToast } from '@/shared/lib/context/ToastContext';
import { useRouter } from 'next/navigation';

interface UploadedImage {
  id: string;
  url: string;
  file?: File;
  isUploading?: boolean;
}

const initialState: ProductActionResult = { success: false, error: '' };

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SUBMIT BUTTON
 * ═══════════════════════════════════════════════════════════════════════════
 */
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

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * IMAGE UPLOAD COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 */
function ImageUploader({
  images,
  onUpload,
  onRemove,
  onSetPrimary
}: {
  images: UploadedImage[];
  onUpload: (file: File) => Promise<void>;
  onRemove: (id: string) => void;
  onSetPrimary: (id: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFiles = useCallback(async (files: FileList) => {
    if (images.length >= 5) return;

    setIsUploading(true);

    for (const file of Array.from(files)) {
      if (images.length >= 5) break;

      // Validar tipo
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        continue;
      }

      // Validar tamaño
      if (file.size > 5 * 1024 * 1024) {
        continue;
      }

      // Preview local
      const previewUrl = URL.createObjectURL(file);
      const tempId = `temp-${Date.now()}-${Math.random()}`;

      onUpload(file);

      // Subir a WP en background (no bloquea UI)
      const formData = new FormData();
      formData.append('file', file);

      try {
        const result = await uploadImageToWordPress(formData);

        if (result.success && result.imageId) {
          onUpload(file); // Actualiza con el ID real
        }
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }

    setIsUploading(false);
  }, [images.length, onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  return (
    <div className="space-y-4">
      <label htmlFor="product-images" className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
        Imágenes del Producto
      </label>

      {/* Drop Zone */}
      <div
        id="product-images"
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

      {/* Image Grid */}
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

              {/* Overlay */}
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

      {isUploading && (
        <p className="text-xs text-gray-500 flex items-center gap-2">
          <Icon name="Loader2" className="w-4 h-4 animate-spin" />
          Subiendo imágenes...
        </p>
      )}
    </div>
  );
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MAIN FORM COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 */
export default function ProductFormClient() {
  const router = useRouter();
  const { showToast } = useToast();

  // useFormState para Server Actions en Next.js
  // El primer argumento es la Server Action
  // El segundo es el estado inicial
  const [state, formAction] = useFormState(createProduct, initialState);

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [featuredImage, setFeaturedImage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Nonce - en producción obtener de window.wpApiSettings
  const [nonce] = useState(() => `wp_nonce_${Date.now()}`);

  // Validación en tiempo real
  const validateField = useCallback((name: string, value: string) => {
    const testData = {
      name: name === 'name' ? value : '',
      price: name === 'price' ? value : '0',
      stock: name === 'stock' ? value : '0',
      category: name === 'category' ? value : '',
      nonce,
      images: [],
      featuredImage: '',
      description: '',
      regularPrice: null,
      sku: '',
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
  }, [nonce]);

  // Handlers de imágenes
  const handleImageUpload = useCallback(async (file: File) => {
    const tempId = `temp-${Date.now()}`;
    const previewUrl = URL.createObjectURL(file);

    // Agregar con preview local inmediatamente (no espera al servidor)
    setImages(prev => [...prev, {
      id: tempId,
      url: previewUrl,
      file,
      isUploading: true
    }]);

    // Subir a WP
    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadImageToWordPress(formData);

    if (result.success && result.imageId) {
      setImages(prev => prev.map(img =>
        img.id === tempId
          ? { ...img, id: result.imageId!, url: result.imageUrl!, isUploading: false }
          : img
      ));

      // Si es la primera, establecer como principal
      if (images.length === 0 && result.imageId) {
        setFeaturedImage(result.imageId);
      }
    } else {
      // Error - remover
      setImages(prev => prev.filter(img => img.id !== tempId));
      if (result.error) {
        showToast(result.error, 'error');
      }
    }
  }, [images.length, showToast]);

  const handleImageRemove = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    if (featuredImage === id) {
      setFeaturedImage('');
    }
  }, [featuredImage]);

  const handleSetPrimary = useCallback((id: string) => {
    setFeaturedImage(id);
  }, []);

  // Manejo de respuesta
  React.useEffect(() => {
    if (state.success) {
      showToast(state.message, 'success');
      router.push('/seller/catalog');
    } else if (state.error) {
      showToast(state.error, 'error');
      if (state.fieldErrors) {
        setFieldErrors(state.fieldErrors);
      }
    }
  }, [state, showToast, router]);

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <ModuleHeader
        title="Nuevo Producto"
        subtitle="Crea un nuevo producto en tu catálogo"
        icon="PlusCircle"
      />

      <form action={formAction} className="space-y-8 max-w-3xl">
        {/* Hidden fields */}
        <input type="hidden" name="nonce" value={nonce} />
        <input type="hidden" name="images" value={JSON.stringify(images.map(i => i.id))} />
        <input type="hidden" name="featuredImage" value={featuredImage} />

        {/* Basic Info */}
        <div className="glass-card p-8 rounded-3xl bg-white border border-gray-100 shadow-xl">
          <h3 className="text-sm font-black text-gray-800 uppercase mb-6">Información Básica</h3>

          <div className="space-y-6">
            {/* Nombre */}
            <div>
              <label htmlFor="product-name" className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                Nombre del Producto *
              </label>
              <input
                id="product-name"
                type="text"
                name="name"
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

            {/* Descripción */}
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
          </div>
        </div>

        {/* Pricing */}
        <div className="glass-card p-8 rounded-3xl bg-white border border-gray-100 shadow-xl">
          <h3 className="text-sm font-black text-gray-800 uppercase mb-6">Precios y Stock</h3>

          <div className="grid grid-cols-2 gap-6">
            {/* Precio */}
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

            {/* Precio regular */}
            <div>
              <label htmlFor="product-regular-price" className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                Precio Regular
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">S/</span>
                <input
                  id="product-regular-price"
                  type="number"
                  name="regularPrice"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl font-bold text-gray-700 focus:outline-none focus:ring-2 focus:border-sky-500 focus:ring-sky-100"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Stock */}
            <div>
              <label htmlFor="product-stock" className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                Stock *
              </label>
              <input
                id="product-stock"
                type="number"
                name="stock"
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

            {/* SKU */}
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

        {/* Images */}
        <div className="glass-card p-8 rounded-3xl bg-white border border-gray-100 shadow-xl">
          <ImageUploader
            images={images}
            onUpload={handleImageUpload}
            onRemove={handleImageRemove}
            onSetPrimary={handleSetPrimary}
          />
        </div>

        {/* Actions */}
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
