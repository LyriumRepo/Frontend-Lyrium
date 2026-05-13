'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';

interface WishlistItem {
  id: number;
  nombre: string;
  tienda: string;
  precio: number;
  precioOriginal?: number;
  imagen: string;
  categoria: string;
  enOferta: boolean;
}

interface Category {
  id: string;
  label: string;
  slug: string;
  custom?: boolean;
}

const mockWishlist: WishlistItem[] = [
  { id: 1, nombre: 'Aceite de Coco Orgánico 500ml', tienda: 'Vida Natural Perú', precio: 32, precioOriginal: 40, imagen: '/product-placeholder.jpg', categoria: 'especiales', enOferta: true },
  { id: 2, nombre: 'Auriculares Bluetooth Pro', tienda: 'Tech Store Lima', precio: 150, imagen: '/product-placeholder.jpg', categoria: 'especiales', enOferta: false },
  { id: 3, nombre: 'Proteína Vegana Chocolate 1kg', tienda: 'Vida Natural Perú', precio: 89.90, imagen: '/product-placeholder.jpg', categoria: 'servicio', enOferta: false },
  { id: 4, nombre: 'Vitaminas Multivitaminico Daily', tienda: 'Salud Integral', precio: 45, precioOriginal: 60, imagen: '/product-placeholder.jpg', categoria: 'servicio', enOferta: true },
  { id: 5, nombre: 'Smartwatch Fitness Band 5', tienda: 'Tech Store Lima', precio: 199, imagen: '/product-placeholder.jpg', categoria: 'indispensable', enOferta: false },
  { id: 6, nombre: 'Crema Facial Anti-Aging 50ml', tienda: 'Belleza Natural', precio: 78, imagen: '/product-placeholder.jpg', categoria: 'servicio', enOferta: false },
];

type FilterType = string;

const predefinedCategories: Category[] = [
  { id: 'all', label: 'Todos', slug: 'all' },
  { id: 'ofertas', label: 'En Oferta', slug: 'ofertas' },
  { id: 'especiales', label: 'Días especiales', slug: 'especiales' },
  { id: 'indispensable', label: 'Mis Indispensables', slug: 'indispensable' },
  {id: 'servicio', label: 'Prevención y Chequeos', slug: 'servicio' },
];

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');
}

export default function CustomerWishlistPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<WishlistItem[]>(mockWishlist);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const allCategories = useMemo(() => {
    return [...predefinedCategories, ...customCategories];
  }, [customCategories]);

  const filteredItems = items.filter(item => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'ofertas') return item.enOferta;
    return item.categoria === activeFilter;
  });

  const removeFromWishlist = (id: number) => {
    if (confirm('¿Quitar de Favoritos? El producto saldrá de tu lista de deseos.')) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const getCounts = () => {
    return {
      all: items.length,
      ofertas: items.filter(i => i.enOferta).length,
      especiales: items.filter(i => i.categoria === 'especiales').length,
      indispensable: items.filter(i => i.categoria === 'indispensable').length,
      servicio: items.filter(i => i.categoria === 'servicio').length,
    };
  };

  const counts = getCounts();

  const handleAddCategory = () => {
    const label = newCategory.trim();

    if (!label) {
      alert('Escribe un nombre para la categoría.');
      return;
    }

    if (customCategories.length >= 3) {
      alert('Solo puedes crear hasta 3 categorías personalizadas.');
      return;
    }

    const slug = normalizeSlug(label);

    const alreadyExists = allCategories.some(cat => cat.slug === slug);
    if (alreadyExists) {
      alert('Esa categoría ya existe.');
      return;
    }

    const newCat: Category = {
      id: `custom-${Date.now()}`,
      label,
      slug,
      custom: true,
    };

    setCustomCategories(prev => [...prev, newCat]);
    setActiveFilter(slug);
    setNewCategory('');
  };

  const handleRemoveCustomCategory = (slug: string) => {
    setCustomCategories(prev => prev.filter(cat => cat.slug !== slug));

    setItems(prev =>
      prev.map(item =>
        item.categoria === slug
          ? { ...item, categoria: 'all' }
          : item
      )
    );

    if (activeFilter === slug) {
      setActiveFilter('all');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-[var(--text-primary)]">
          Lista de Deseos
        </h1>
        <p className="text-slate-500 dark:text-[var(--text-muted)] mt-1">
          Productos que te interesan y ofertas guardadas
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          {allCategories.map(category => {
            const isActive = activeFilter === category.slug;

            const count =
              category.slug === 'all'
                ? counts.all
                : category.slug === 'ofertas'
                  ? counts.ofertas
                  : category.slug === 'especiales'
                    ? counts.especiales
                    : category.slug === 'indispensable'
                      ? counts.indispensable
                      : category.slug === 'servicio'
                        ? counts.servicio
                        : items.filter(i => i.categoria === category.slug).length;

            return (
              <div key={category.id} className="relative">
                <button
                  onClick={() => setActiveFilter(category.slug)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-sky-500 dark:bg-[var(--brand-green)] text-white shadow-lg shadow-sky-100'
                      : 'bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-200 dark:hover:bg-[#2A3F33]'
                  }`}
                >
                  {category.label} ({count})
                </button>

                {category.custom && (
                  <button
                    onClick={() => handleRemoveCustomCategory(category.slug)}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center shadow-md"
                    title="Eliminar categoría"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Crear nueva categoría"
            className="w-full sm:w-80 px-4 py-3 rounded-xl border border-gray-200 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-secondary)] text-sm outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-[var(--icons-green)]"
          />
          <button
            onClick={handleAddCategory}
            className="px-5 py-3 rounded-xl bg-sky-500 dark:bg-[var(--brand-green)] text-white text-sm font-bold hover:bg-sky-600 dark:hover:bg-[var(--brand-green-hover)] transition-all"
          >
            Agregar categoría
          </button>
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500">
            {customCategories.length}/3 categorías personalizadas
          </span>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 dark:bg-[var(--bg-muted)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Heart" className="w-12 h-12 text-gray-400 dark:text-gray-400" />
          </div>
          <h3 className="text-xl font-black text-gray-800 dark:text-[var(--text-primary)] mb-2">Tu lista de deseos está vacía</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-[var(--text-muted)] mb-4">Explora nuestros productos y guarda tus favoritos</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 text-white font-bold text-sm hover:bg-sky-600 transition-all shadow-lg"
          >
            <Icon name="Store" className="w-5 h-5" />
            Ir a la Tienda
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all"
            >
              <div className="relative">
                <div className="w-full h-48 bg-gray-200 dark:bg-[var(--bg-muted)] flex items-center justify-center">
                  <Icon name="Image" className="w-12 h-12 text-gray-400 dark:text-gray-400" />
                </div>

                {item.enOferta && item.precioOriginal && (
                  <span className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-black uppercase rounded-full">
                    -{Math.round((1 - item.precio / item.precioOriginal) * 100)}%
                  </span>
                )}

                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-3 right-3 w-10 h-10 bg-white dark:bg-[var(--bg-secondary)] rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <Icon name="Heart" className="w-5 h-5 text-red-500 fill-red-500" />
                </button>
              </div>

              <div className="p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-[var(--text-muted)] mb-1">{item.tienda}</p>
                <h4 className="text-sm font-black text-gray-800 dark:text-[var(--text-primary)] mb-2 line-clamp-2">{item.nombre}</h4>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-black text-sky-600 dark:text-[var(--icons-green)]">S/ {item.precio.toFixed(2)}</span>
                  {item.precioOriginal && (
                    <span className="text-sm text-gray-400 dark:text-gray-400 line-through">S/ {item.precioOriginal.toFixed(2)}</span>
                  )}
                </div>
                <button className="w-full px-4 py-2 rounded-lg bg-sky-500 dark:bg-[var(--brand-green)] text-white text-sm font-bold hover:bg-sky-600 dark:hover:bg-[var(--brand-green-hover)] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                  <Icon name="ShoppingCart" className="w-4 h-4" />
                  Agregar al Carrito
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}