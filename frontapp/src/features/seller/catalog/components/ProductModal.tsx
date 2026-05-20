'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import type {
  Product,
  ProductAttribute,
  NutritionalAttribute,
  ProductSticker,
  ProductType,
} from '@/features/seller/catalog/types';
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
  onSave: (product: Partial<Product>) => void;
  productToEdit?: Product | null;
}

// ─── Helpers de fábrica ───────────────────────────────────────────────────────
const makeEmptyAttr = (): ProductAttribute => ({
  values: { label: '', value: '' },
});
const makeEmptyNutri = (): NutritionalAttribute => ({
  values: { label: '', value: '', daily_value: '' },
});

// ─── Estado inicial ───────────────────────────────────────────────────────────
function buildInitial(): Partial<Product> {
  return {
    id: '',
    name: '',
    type: 'physical',
    category: '',
    price: 0,
    stock: 0,
    description: '',
    short_description: '',
    image: '',
    sticker: null,
    discountPercentage: undefined,
    weight: undefined,
    dimensions: '',
    expirationDate: '',
    mainAttributes: [makeEmptyAttr()],
    additionalAttributes: [],
    nutritionalAttributes: [],
    servingNote: '',
  };
}

export default function ProductModal({
  isOpen,
  onClose,
  onSave,
  productToEdit,
}: ProductModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>(buildInitial());
  const [previewImage, setPreviewImage] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'attrs' | 'nutri'>(
    'info',
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // ─── Categorías ────────────────────────────────────────────────────────────
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['seller', 'categories'],
    queryFn: async () => {
      const LARAVEL_API_URL =
        process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';
      const res = await fetch(
        `${LARAVEL_API_URL}/categories?type=product&per_page=100`,
      );
      const data = await res.json();
      return data.data ?? data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // ─── Cargar producto al abrir ──────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    setActiveTab('info');

    if (productToEdit) {
      const imgUrl =
        productToEdit.image || (productToEdit as any).images?.[0]?.src || '';
      const catSlug =
        productToEdit.category ||
        (productToEdit as any).categories?.[0]?.slug ||
        '';

      setFormData({
        ...productToEdit,
        image: imgUrl,
        category: catSlug,
        mainAttributes: productToEdit.mainAttributes?.length
          ? productToEdit.mainAttributes
          : [makeEmptyAttr()],
        additionalAttributes: productToEdit.additionalAttributes ?? [],
        nutritionalAttributes: productToEdit.nutritionalAttributes ?? [],
        servingNote: productToEdit.servingNote ?? '',
      });
      setPreviewImage(imgUrl);
    } else {
      setFormData(buildInitial());
      setPreviewImage('');
    }
  }, [isOpen, productToEdit]);

  // ─── Handlers genéricos ────────────────────────────────────────────────────
  const set = (key: keyof Product, value: any) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    set(
      name as keyof Product,
      type === 'number'
        ? value === ''
          ? undefined
          : parseFloat(value)
        : value,
    );
  };

  // ─── Imagen ────────────────────────────────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreviewImage(result);
      set('image', result);
    };
    reader.readAsDataURL(file);
  };

  // ─── Atributos principales / adicionales ───────────────────────────────────
  const addAttr = (type: 'main' | 'additional') => {
    const key = type === 'main' ? 'mainAttributes' : 'additionalAttributes';
    const current = (formData[key] as ProductAttribute[]) ?? [];
    if (current.length >= 10) return;
    set(key as keyof Product, [...current, makeEmptyAttr()]);
  };

  const removeAttr = (type: 'main' | 'additional', idx: number) => {
    const key = type === 'main' ? 'mainAttributes' : 'additionalAttributes';
    const current = (formData[key] as ProductAttribute[]) ?? [];
    set(
      key as keyof Product,
      current.filter((_, i) => i !== idx),
    );
  };

  const updateAttr = (
    type: 'main' | 'additional',
    idx: number,
    field: 'label' | 'value',
    val: string,
  ) => {
    const key = type === 'main' ? 'mainAttributes' : 'additionalAttributes';
    const arr = [...((formData[key] as ProductAttribute[]) ?? [])];
    arr[idx] = {
      values: {
        ...(arr[idx]?.values ?? { label: '', value: '' }),
        [field]: val,
      },
    };
    set(key as keyof Product, arr);
  };

  // ─── Atributos nutricionales ───────────────────────────────────────────────
  const addNutri = () => {
    const current = formData.nutritionalAttributes ?? [];
    if (current.length >= 15) return;
    set('nutritionalAttributes', [...current, makeEmptyNutri()]);
  };

  const removeNutri = (idx: number) => {
    const current = formData.nutritionalAttributes ?? [];
    set(
      'nutritionalAttributes',
      current.filter((_, i) => i !== idx),
    );
  };

  const updateNutri = (
    idx: number,
    field: 'label' | 'value' | 'daily_value',
    val: string,
  ) => {
    const arr = [...(formData.nutritionalAttributes ?? [])];
    arr[idx] = {
      values: {
        ...(arr[idx]?.values ?? { label: '', value: '', daily_value: '' }),
        [field]: val,
      },
    };
    set('nutritionalAttributes', arr);
  };

  // ─── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      showToast('El nombre es obligatorio', 'error');
      return;
    }
    if (!formData.image) {
      showToast('Es obligatorio adjuntar una foto del producto', 'error');
      return;
    }
    if (formData.type === 'physical') {
      if (!formData.weight || formData.weight <= 0) {
        showToast('Especifica un peso válido para logística', 'error');
        return;
      }
      if (!formData.dimensions) {
        showToast(
          'Las dimensiones son necesarias para el cálculo de envío',
          'error',
        );
        return;
      }
    }

    // Limpiar filas vacías antes de enviar
    const cleanAttrs = (arr: ProductAttribute[]) =>
      arr.filter((a) => a.values.label?.trim() && a.values.value?.trim());

    const cleanNutri = (arr: NutritionalAttribute[]) =>
      arr.filter((a) => a.values.label?.trim() && a.values.value?.trim());

    onSave({
      ...formData,
      mainAttributes: cleanAttrs(formData.mainAttributes ?? []),
      additionalAttributes: cleanAttrs(formData.additionalAttributes ?? []),
      nutritionalAttributes: cleanNutri(formData.nutritionalAttributes ?? []),
    });
  };

  // ─── Render filas de atributos ─────────────────────────────────────────────
  const renderAttrRows = (type: 'main' | 'additional') => {
    const attrs =
      type === 'main'
        ? (formData.mainAttributes ?? [])
        : (formData.additionalAttributes ?? []);

    return attrs.map((attr, idx) => (
      <tr
        key={idx}
        className="divide-x divide-[var(--border-subtle)] group border-b last:border-none"
      >
        <td className="px-3 py-2 w-2/5">
          <input
            type="text"
            value={attr.values.label ?? ''}
            onChange={(e) => updateAttr(type, idx, 'label', e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 text-[10px] font-bold text-[var(--text-primary)] outline-none"
            placeholder="Ej: Marca"
          />
        </td>
        <td className="px-3 py-2">
          <input
            type="text"
            value={attr.values.value ?? ''}
            onChange={(e) => updateAttr(type, idx, 'value', e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 text-[10px] font-bold text-[var(--text-primary)] outline-none"
            placeholder="Ej: Bitoka"
          />
        </td>
        <td className="px-2 py-2 text-center w-8">
          <button
            type="button"
            onClick={() => removeAttr(type, idx)}
            className="text-[var(--text-secondary)] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Icon name="Trash2" className="w-3.5 h-3.5" />
          </button>
        </td>
      </tr>
    ));
  };

  const productType = formData.type ?? 'physical';
  const hasNutri =
    (formData.nutritionalAttributes?.length ?? 0) > 0 || formData.servingNote;

  // ─── JSX ──────────────────────────────────────────────────────────────────
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={productToEdit ? 'Editar Producto' : 'Nuevo Producto'}
      subtitle="Gestión estratégica de catálogo e inventario"
      size="4xl"
      accentColor="from-emerald-400 via-sky-500 to-indigo-500"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ── Tabs de navegación ─────────────────────────────────────────── */}
        <div className="flex gap-1 border-b border-[var(--border-subtle)]">
          {(
            [
              { key: 'info', label: 'Información', icon: 'Info' },
              { key: 'attrs', label: 'Atributos', icon: 'List' },
              { key: 'nutri', label: 'Nutrición', icon: 'Leaf' },
            ] as const
          ).map(({ key, label, icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 -mb-px transition-all ${
                activeTab === key
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon name={icon} className="w-3.5 h-3.5" />
              {label}
              {key === 'nutri' && hasNutri && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1" />
              )}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* TAB: INFORMACIÓN                                                */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Imagen */}
            <div className="lg:col-span-3 space-y-3">
              <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-1">
                Foto del Producto
              </p>
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ')
                    fileInputRef.current?.click();
                }}
                className="relative bg-[var(--bg-secondary)] border-2 border-dashed border-[var(--border-subtle)] aspect-square flex flex-col items-center justify-center cursor-pointer group rounded-[2rem] overflow-hidden hover:border-emerald-400/50 transition-all"
              >
                {previewImage ? (
                  <Image
                    src={previewImage}
                    fill
                    sizes="100vw"
                    className="object-contain p-3"
                    alt="Preview"
                    unoptimized
                  />
                ) : (
                  <div className="text-center group-hover:scale-110 transition-transform">
                    <Icon
                      name="Image"
                      className="w-10 h-10 mx-auto text-[var(--text-secondary)]"
                    />
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

            {/* Metadatos */}
            <div className="lg:col-span-9 space-y-3">
              <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-1">
                Metadatos del Producto
              </p>
              <div className="overflow-hidden border border-[var(--border-subtle)] rounded-[2rem] shadow-sm bg-[var(--bg-card)]">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {/* Tipo */}
                    <tr className="bg-[var(--bg-secondary)]/10">
                      <td className="px-5 py-3 font-black text-[var(--text-secondary)] text-[10px] uppercase tracking-tighter w-1/4">
                        Tipo
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          {(
                            ['physical', 'digital', 'service'] as ProductType[]
                          ).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => set('type', t)}
                              className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all border ${
                                productType === t
                                  ? 'bg-emerald-500 text-white border-emerald-500'
                                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-emerald-300'
                              }`}
                            >
                              {t === 'physical'
                                ? '📦 Físico'
                                : t === 'digital'
                                  ? '💾 Digital'
                                  : '🛠 Servicio'}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>

                    {/* Nombre */}
                    <tr>
                      <td className="px-5 py-3 font-black text-[var(--text-secondary)] text-[10px] uppercase tracking-tighter">
                        Nombre
                      </td>
                      <td className="px-5 py-3">
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name ?? ''}
                          onChange={handleChange}
                          className="w-full bg-transparent border-none focus:ring-0 font-black text-[var(--text-primary)] p-0 outline-none text-base"
                          placeholder="Nombre comercial del producto"
                        />
                      </td>
                    </tr>

                    {/* Descripción corta */}
                    <tr className="bg-[var(--bg-secondary)]/10">
                      <td className="px-5 py-3 font-black text-[var(--text-secondary)] text-[10px] uppercase tracking-tighter align-top pt-4">
                        Subtítulo
                      </td>
                      <td className="px-5 py-2">
                        <input
                          type="text"
                          name="short_description"
                          value={formData.short_description ?? ''}
                          onChange={handleChange}
                          maxLength={300}
                          className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-[var(--text-primary)] p-0 outline-none"
                          placeholder="Breve descripción (opcional, máx. 300 caracteres)"
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
                          value={formData.category ?? ''}
                          onChange={handleChange}
                          className="w-full bg-transparent border-none focus:ring-0 font-bold text-[var(--text-primary)] p-0 outline-none cursor-pointer"
                        >
                          <option value="">Seleccionar categoría...</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.slug}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>

                    {/* Precio + Stock */}
                    <tr className="bg-[var(--bg-secondary)]/10">
                      <td className="px-5 py-3 font-black text-[var(--text-secondary)] text-[10px] uppercase tracking-tighter">
                        Precio / Stock
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-500 font-black text-sm">
                              S/
                            </span>
                            <input
                              type="number"
                              name="price"
                              step="0.01"
                              min="0"
                              required
                              value={formData.price ?? ''}
                              onChange={handleChange}
                              className="w-24 bg-transparent border-none focus:ring-0 font-black text-[var(--text-primary)] p-0 outline-none"
                              placeholder="0.00"
                            />
                          </div>
                          <div className="flex items-center gap-2 border-l border-[var(--border-subtle)] pl-6">
                            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase">
                              Stock
                            </span>
                            <input
                              type="number"
                              name="stock"
                              min="0"
                              required
                              value={formData.stock ?? ''}
                              onChange={handleChange}
                              className="w-16 bg-transparent border-none focus:ring-0 font-black text-[var(--text-primary)] p-0 outline-none"
                            />
                          </div>
                          <div className="flex items-center gap-2 border-l border-[var(--border-subtle)] pl-6">
                            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase">
                              Desc %
                            </span>
                            <input
                              type="number"
                              name="discountPercentage"
                              min="0"
                              max="100"
                              step="1"
                              value={formData.discountPercentage ?? ''}
                              onChange={handleChange}
                              className="w-14 bg-transparent border-none focus:ring-0 font-bold text-[var(--text-primary)] p-0 outline-none"
                              placeholder="—"
                            />
                          </div>
                        </div>
                      </td>
                    </tr>

                    {/* Campos físicos */}
                    {productType === 'physical' && (
                      <tr>
                        <td className="px-5 py-3 font-black text-[var(--text-secondary)] text-[10px] uppercase tracking-tighter">
                          Logística
                        </td>
                        <td className="px-5 py-3">
                          <div className="grid grid-cols-3 gap-4 divide-x divide-[var(--border-subtle)]">
                            <div className="flex flex-col gap-1">
                              <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase">
                                Peso (kg)
                              </span>
                              <input
                                type="number"
                                name="weight"
                                step="0.01"
                                min="0"
                                value={formData.weight ?? ''}
                                onChange={handleChange}
                                className="w-full bg-transparent border-none focus:ring-0 font-black text-[var(--text-primary)] p-0 outline-none"
                                placeholder="0.0"
                              />
                            </div>
                            <div className="flex flex-col gap-1 pl-4">
                              <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase">
                                Dimen (LxWxH)
                              </span>
                              <input
                                type="text"
                                name="dimensions"
                                value={formData.dimensions ?? ''}
                                onChange={handleChange}
                                className="w-full bg-transparent border-none focus:ring-0 font-bold text-[var(--text-primary)] p-0 outline-none font-mono text-[10px]"
                                placeholder="24x8x22"
                              />
                            </div>
                            <div className="flex flex-col gap-1 pl-4">
                              <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase">
                                Vencimiento
                              </span>
                              <input
                                type="date"
                                name="expirationDate"
                                value={formData.expirationDate ?? ''}
                                onChange={handleChange}
                                className="w-full bg-transparent border-none focus:ring-0 font-bold text-[var(--text-primary)] p-0 outline-none text-[10px]"
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Campos digital */}
                    {productType === 'digital' && (
                      <tr>
                        <td className="px-5 py-3 font-black text-[var(--text-secondary)] text-[10px] uppercase tracking-tighter">
                          Digital
                        </td>
                        <td className="px-5 py-3">
                          <div className="space-y-2">
                            <input
                              type="url"
                              name="downloadUrl"
                              required
                              value={formData.downloadUrl ?? ''}
                              onChange={handleChange}
                              className="w-full bg-[var(--bg-secondary)] rounded-lg px-3 py-2 text-xs font-bold text-[var(--text-primary)] outline-none border border-[var(--border-subtle)] focus:border-emerald-400"
                              placeholder="URL de descarga"
                            />
                            <div className="flex gap-3">
                              <input
                                type="text"
                                name="fileType"
                                value={formData.fileType ?? ''}
                                onChange={handleChange}
                                className="w-24 bg-[var(--bg-secondary)] rounded-lg px-3 py-2 text-xs font-bold text-[var(--text-primary)] outline-none border border-[var(--border-subtle)]"
                                placeholder="PDF / ZIP"
                              />
                              <input
                                type="number"
                                name="downloadLimit"
                                min="1"
                                value={formData.downloadLimit ?? ''}
                                onChange={handleChange}
                                className="w-24 bg-[var(--bg-secondary)] rounded-lg px-3 py-2 text-xs font-bold text-[var(--text-primary)] outline-none border border-[var(--border-subtle)]"
                                placeholder="Descargas"
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Campos servicio */}
                    {productType === 'service' && (
                      <tr>
                        <td className="px-5 py-3 font-black text-[var(--text-secondary)] text-[10px] uppercase tracking-tighter">
                          Servicio
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex gap-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase">
                                Duración (min)
                              </span>
                              <input
                                type="number"
                                name="serviceDuration"
                                min="1"
                                required
                                value={formData.serviceDuration ?? ''}
                                onChange={handleChange}
                                className="w-20 bg-transparent border-none focus:ring-0 font-black text-[var(--text-primary)] p-0 outline-none"
                              />
                            </div>
                            <div className="flex flex-col gap-1 border-l border-[var(--border-subtle)] pl-4">
                              <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase">
                                Modalidad
                              </span>
                              <select
                                name="serviceModality"
                                required
                                value={formData.serviceModality ?? ''}
                                onChange={handleChange}
                                className="bg-transparent border-none focus:ring-0 font-bold text-[var(--text-primary)] p-0 outline-none text-sm"
                              >
                                <option value="">Seleccionar...</option>
                                <option value="presencial">Presencial</option>
                                <option value="virtual">Virtual</option>
                                <option value="domicilio">Domicilio</option>
                              </select>
                            </div>
                            <div className="flex flex-col gap-1 border-l border-[var(--border-subtle)] pl-4 flex-1">
                              <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase">
                                Dirección (opcional)
                              </span>
                              <input
                                type="text"
                                name="serviceLocation"
                                value={formData.serviceLocation ?? ''}
                                onChange={handleChange}
                                className="w-full bg-transparent border-none focus:ring-0 font-bold text-[var(--text-primary)] p-0 outline-none text-sm"
                                placeholder="Av. ..."
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Sticker */}
                    <tr className="bg-[var(--bg-secondary)]/10">
                      <td className="px-5 py-2.5 font-black text-[var(--text-secondary)] text-[10px] uppercase tracking-tighter">
                        Promoción
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="flex flex-wrap gap-2">
                          {(
                            [
                              { val: null, label: 'Ninguno', color: 'gray' },
                              { val: 'nuevo', label: 'Nuevo', color: 'sky' },
                              { val: 'oferta', label: 'Oferta', color: 'lime' },
                              {
                                val: 'bestseller',
                                label: 'Top',
                                color: 'purple',
                              },
                              {
                                val: 'descuento',
                                label: 'Desc %',
                                color: 'emerald',
                              },
                              {
                                val: 'liquidacion',
                                label: 'Liquidación',
                                color: 'red',
                              },
                              {
                                val: 'envio_gratis',
                                label: 'Envío gratis',
                                color: 'teal',
                              },
                            ] as const
                          ).map((opt) => (
                            <button
                              key={opt.val ?? 'none'}
                              type="button"
                              onClick={() =>
                                set('sticker', opt.val as ProductSticker)
                              }
                              className={`px-3 py-1.5 rounded-xl border text-[8px] font-black uppercase transition-all ${
                                formData.sticker === opt.val
                                  ? {
                                      gray: 'bg-gray-800 text-white border-gray-800',
                                      sky: 'bg-sky-500 text-white border-sky-500',
                                      lime: 'bg-lime-500 text-white border-lime-500',
                                      purple:
                                        'bg-purple-500 text-white border-purple-500',
                                      emerald:
                                        'bg-emerald-500 text-white border-emerald-500',
                                      red: 'bg-red-500 text-white border-red-500',
                                      teal: 'bg-teal-500 text-white border-teal-500',
                                    }[opt.color]
                                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-default)]'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Descripción */}
              <textarea
                name="description"
                rows={3}
                required
                value={formData.description ?? ''}
                onChange={handleChange}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-4 text-sm font-medium text-[var(--text-primary)] outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-[var(--bg-card)] transition-all resize-none"
                placeholder="Describe los beneficios clave del producto..."
              />
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* TAB: ATRIBUTOS                                                  */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'attrs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Técnicos (main) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-3 bg-sky-500 rounded-full" />
                  Características principales
                </h3>
                <button
                  type="button"
                  onClick={() => addAttr('main')}
                  className="w-7 h-7 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-center text-sky-500 hover:bg-sky-50 transition-all"
                >
                  <Icon name="Plus" className="w-3 h-3" />
                </button>
              </div>
              <div className="rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-card)]">
                <table className="w-full text-xs">
                  <thead className="bg-[var(--bg-secondary)]/50">
                    <tr className="divide-x divide-[var(--border-subtle)]">
                      <th className="px-3 py-2 text-left text-[9px] font-black text-[var(--text-secondary)] uppercase w-2/5">
                        Atributo
                      </th>
                      <th className="px-3 py-2 text-left text-[9px] font-black text-[var(--text-secondary)] uppercase">
                        Valor
                      </th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {renderAttrRows('main')}
                    {!formData.mainAttributes?.length && (
                      <tr>
                        <td
                          colSpan={3}
                          className="p-4 text-center text-[9px] font-black text-[var(--text-secondary)] uppercase italic"
                        >
                          Sin atributos técnicos
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Adicionales */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-3 bg-indigo-500 rounded-full" />
                  Información adicional
                </h3>
                <button
                  type="button"
                  onClick={() => addAttr('additional')}
                  className="w-7 h-7 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-center text-indigo-500 hover:bg-indigo-50 transition-all"
                >
                  <Icon name="Plus" className="w-3 h-3" />
                </button>
              </div>
              <div className="rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-card)]">
                <table className="w-full text-xs">
                  <thead className="bg-[var(--bg-secondary)]/50">
                    <tr className="divide-x divide-[var(--border-subtle)]">
                      <th className="px-3 py-2 text-left text-[9px] font-black text-[var(--text-secondary)] uppercase w-2/5">
                        Etiqueta
                      </th>
                      <th className="px-3 py-2 text-left text-[9px] font-black text-[var(--text-secondary)] uppercase">
                        Detalle
                      </th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {renderAttrRows('additional')}
                    {!formData.additionalAttributes?.length && (
                      <tr>
                        <td
                          colSpan={3}
                          className="p-4 text-center text-[9px] font-black text-[var(--text-secondary)] uppercase italic"
                        >
                          Sin adicionales
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* TAB: NUTRICIÓN                                                  */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'nutri' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
              <Icon
                name="Leaf"
                className="w-4 h-4 text-emerald-600 flex-shrink-0"
              />
              <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                Solo para productos alimenticios. Si el producto no tiene
                información nutricional, deja esta sección vacía.
              </p>
            </div>

            {/* Nota de porción */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-1">
                Nota de porción
              </label>
              <input
                type="text"
                name="servingNote"
                value={formData.servingNote ?? ''}
                onChange={handleChange}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] outline-none focus:border-emerald-400 transition-colors"
                placeholder="Ej: Valores referenciales por porción de 240ml."
              />
            </div>

            {/* Tabla nutricional */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                  Filas nutricionales
                </label>
                <button
                  type="button"
                  onClick={addNutri}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase rounded-lg border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                >
                  <Icon name="Plus" className="w-3 h-3" />
                  Agregar fila
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-card)]">
                <table className="w-full text-xs">
                  <thead className="bg-emerald-50/50 dark:bg-emerald-900/10">
                    <tr className="divide-x divide-[var(--border-subtle)]">
                      <th className="px-3 py-2.5 text-left text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase">
                        Nutriente
                      </th>
                      <th className="px-3 py-2.5 text-left text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase">
                        Cantidad
                      </th>
                      <th className="px-3 py-2.5 text-left text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase w-24">
                        % VD
                      </th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {(formData.nutritionalAttributes ?? []).map((attr, idx) => (
                      <tr
                        key={idx}
                        className="divide-x divide-[var(--border-subtle)] group hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10"
                      >
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={attr.values.label ?? ''}
                            onChange={(e) =>
                              updateNutri(idx, 'label', e.target.value)
                            }
                            className="w-full bg-transparent border-none focus:ring-0 text-[10px] font-bold text-[var(--text-primary)] outline-none"
                            placeholder="Ej: Calorías"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={attr.values.value ?? ''}
                            onChange={(e) =>
                              updateNutri(idx, 'value', e.target.value)
                            }
                            className="w-full bg-transparent border-none focus:ring-0 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 outline-none"
                            placeholder="Ej: 30 kcal"
                          />
                        </td>
                        <td className="px-3 py-2 w-24">
                          <input
                            type="text"
                            value={attr.values.daily_value ?? ''}
                            onChange={(e) =>
                              updateNutri(idx, 'daily_value', e.target.value)
                            }
                            className="w-full bg-transparent border-none focus:ring-0 text-[10px] font-bold text-[var(--text-secondary)] outline-none"
                            placeholder="2%"
                          />
                        </td>
                        <td className="px-2 py-2 text-center w-8">
                          <button
                            type="button"
                            onClick={() => removeNutri(idx)}
                            className="text-[var(--text-secondary)] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Icon name="Trash2" className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!formData.nutritionalAttributes?.length && (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-6 text-center text-[9px] font-black text-[var(--text-secondary)] uppercase italic"
                        >
                          Sin filas nutricionales — usa el botón "Agregar fila"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)] sticky bottom-0 bg-[var(--bg-card)]/90 backdrop-blur-md -mx-8 -mb-8 px-8 py-5">
          <BaseButton variant="ghost" onClick={onClose} type="button">
            Cancelar
          </BaseButton>
          <BaseButton type="submit" variant="primary" className="px-10">
            {productToEdit ? 'Guardar cambios' : 'Crear producto'}
          </BaseButton>
        </div>
      </form>
    </BaseModal>
  );
}
