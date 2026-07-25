'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { wishlistApi, WishlistItem as WishlistItemType } from '@/shared/lib/api/wishlistRepository';
import ConfirmDialog from '@/components/ui/confirm-dialog';

interface WishlistItem {
  id: number;
  nombre: string;
  slug: string;
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

type FilterType = string;

const STORAGE_KEY = 'lyrium_wishlist_categories';

const predefinedCategories: Category[] = [
  { id: 'all', label: 'Todos', slug: 'all' },
  { id: 'ofertas', label: 'En Oferta', slug: 'ofertas' },
  { id: 'especiales', label: 'Días especiales', slug: 'especiales' },
  { id: 'indispensable', label: 'Mis Indispensables', slug: 'indispensable' },
  { id: 'servicio', label: 'Prevención y Chequeos', slug: 'servicio' },
];

function loadCustomCategories(): Category[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (c: Category) => c.id && c.label && c.slug && c.custom
    );
  } catch {
    return [];
  }
}

function saveCustomCategories(cats: Category[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
  } catch {
    // storage full or blocked — silently fail
  }
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');
}

function mapApiItem(item: WishlistItemType): WishlistItem {
  const p = item.product;
  return {
    id: item.id,
    nombre: p?.name ?? 'Producto',
    slug: p?.slug ?? '',
    tienda: p?.store_name ?? 'Tienda',
    precio: p?.price ?? 0,
    precioOriginal: p?.original_price ?? undefined,
    imagen: p?.image || '/product-placeholder.jpg',
    categoria: 'all',
    enOferta: (p?.discount_percentage ?? 0) > 0 || !!p?.original_price,
  };
}

export default function CustomerWishlistPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [removeError, setRemoveError] = useState('');
  const [confirmRemoveId, setConfirmRemoveId] = useState<number | null>(null);
  const [customCategories, setCustomCategories] = useState<Category[]>(() => loadCustomCategories());
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    saveCustomCategories(customCategories);
  }, [customCategories]);

  const allCategories = useMemo(() => {
    return [...predefinedCategories, ...customCategories];
  }, [customCategories]);

  const loadItems = useCallback(async () => {
    try {
      setFetching(true);
      setFetchError('');
      const data = await wishlistApi.list();
      setItems(data.map(mapApiItem));
    } catch (err) {
      console.error('Error al cargar lista de deseos:', err);
      const msg = err instanceof TypeError ? 'No pudimos conectar con el servidor. Verifica que el backend esté corriendo.' : 'No pudimos cargar tu lista de deseos.';
      setFetchError(msg);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      loadItems();
    }
  }, [loading, isAuthenticated, loadItems]);

  const filteredItems = items.filter(item => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'ofertas') return item.enOferta;
    return item.categoria === activeFilter;
  });

  const removeFromWishlist = async (id: number) => {
    setConfirmRemoveId(null);
    setRemoveError('');
    try {
      await wishlistApi.remove(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error al eliminar de la lista:', err);
      setRemoveError('Ocurrió un error al eliminar el producto.');
    }
  };

  const getCounts = () => {
    const base: Record<string, number> = {
      all: items.length,
      ofertas: items.filter(i => i.enOferta).length,
      especiales: items.filter(i => i.categoria === 'especiales').length,
      indispensable: items.filter(i => i.categoria === 'indispensable').length,
      servicio: items.filter(i => i.categoria === 'servicio').length,
    };
    for (const cat of customCategories) {
      base[cat.slug] = items.filter(i => i.categoria === cat.slug).length;
    }
    return base;
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

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <Icon name="AlertCircle" className="w-10 h-10 text-red-500" />
        </div>
        <p className="text-lg font-bold text-gray-800 dark:text-[var(--text-primary)]">{fetchError}</p>
        <button
          onClick={loadItems}
          className="px-6 py-3 rounded-xl bg-sky-500 dark:bg-[var(--brand-green)] text-white font-bold text-sm hover:bg-sky-600 dark:hover:bg-[var(--brand-green-hover)] transition-all"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <ModuleHeader
        title="Lista de Deseos"
        subtitle="Productos que te interesan y ofertas guardadas"
        icon="Heart"
      />

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
                      : 'bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-200 dark:hover:bg-[var(--border-default)]'
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
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 dark:bg-[var(--brand-green)] text-white font-bold text-sm hover:bg-sky-600 dark:hover:bg-[var(--brand-green-hover)] transition-all shadow-lg"
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
                <div className="w-full h-48 bg-gray-200 dark:bg-[var(--bg-muted)] flex items-center justify-center overflow-hidden">
                  {item.imagen && item.imagen !== '/product-placeholder.jpg' ? (
                    <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <Icon name="Image" className="w-12 h-12 text-gray-400" />
                  )}
                </div>

                {item.enOferta && item.precioOriginal && (
                  <span className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-black uppercase rounded-full">
                    -{Math.round((1 - item.precio / item.precioOriginal) * 100)}%
                  </span>
                )}

                <button
                  onClick={() => setConfirmRemoveId(item.id)}
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
                <a
                  href={`/producto/${item.slug}`}
                  className="w-full px-4 py-2 rounded-lg bg-sky-500 dark:bg-[var(--brand-green)] text-white text-sm font-bold hover:bg-sky-600 dark:hover:bg-[var(--brand-green-hover)] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Icon name="ShoppingCart" className="w-4 h-4" />
                  Ver Producto
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {removeError && (
        <div className="fixed bottom-6 right-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 shadow-2xl flex items-start gap-3 z-50 animate-fadeIn">
          <Icon name="AlertCircle" className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">{removeError}</p>
            <button onClick={() => setRemoveError('')} className="text-[10px] font-bold text-rose-500 hover:underline mt-1">Cerrar</button>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmRemoveId !== null}
        onClose={() => setConfirmRemoveId(null)}
        onConfirm={() => removeFromWishlist(confirmRemoveId!)}
        title="¿Quitar de Favoritos?"
        message="El producto saldrá de tu lista de deseos."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}