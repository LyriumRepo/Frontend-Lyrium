'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Mic, Filter, X, Loader2 } from 'lucide-react';
import { Categoria, SearchResult } from '@/types/public';
import { useSearch } from '@/shared/hooks/useSearch';
import { useUIStore } from '@/store/uiStore';
import Image from 'next/image';
import { Package, FolderOpen } from 'lucide-react';
import { createPortal } from 'react-dom';

interface SearchBarProps {
  categorias: Categoria[];
}

export default function SearchBar({ categorias }: SearchBarProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeDropdownLocal, setActiveDropdownLocal] = useState<'autocomplete' | 'filter' | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hoveredCategory, setHoveredCategory] = useState<SearchResult | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<SearchResult[]>([]);
  const [loadingCategoryProducts, setLoadingCategoryProducts] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { activeDropdown: globalDropdown, setActiveDropdown: setGlobalDropdown } = useUIStore();

  const showAutocomplete = activeDropdownLocal === 'autocomplete';
  const filterOpen = activeDropdownLocal === 'filter';

  const setActiveDropdown = (dropdown: 'autocomplete' | 'filter' | null) => {
    setActiveDropdownLocal(dropdown);
    setGlobalDropdown(dropdown ? 'search' : null);
  };

  useEffect(() => {
    if (globalDropdown === 'megaMenu') {
      setActiveDropdownLocal(null);
    }
  }, [globalDropdown]);

  const { results, categoryResults, productResults, isLoading, search, clearResults, getCategoryProducts } = useSearch({
    debounceMs: 300,
    minChars: 2,
    maxResults: 10,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      search(searchTerm);
      setActiveDropdown('autocomplete');
    } else {
      clearResults();
      setActiveDropdown(null);
    }
    setSelectedIndex(-1);
  }, [searchTerm, search, clearResults]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (activeDropdownLocal) {
        setActiveDropdown(null);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeDropdownLocal]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(searchTerm)}&category=${selectedCategory}`);
    }
    setActiveDropdown(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showAutocomplete || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectResult(results[selectedIndex]);
        } else {
          handleSearch(e);
        }
        break;
      case 'Escape':
        setActiveDropdown(null);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    if (result.type === 'product' && result.slug) {
      window.location.href = `/producto/${result.slug}`;
    } else if (result.type === 'category' && result.slug) {
      window.location.href = `/productos/${result.slug}`;
    }
    setActiveDropdown(null);
    setSearchTerm('');
    clearResults();
  };

  const handleCategoryHover = async (category: SearchResult) => {
    setHoveredCategory(category);
    if (category.type === 'category' && category.slug) {
      setLoadingCategoryProducts(true);
      try {
        const products = await getCategoryProducts(category.slug);
        setCategoryProducts(products);
      } catch (error) {
        console.error('Error fetching category products:', error);
        setCategoryProducts([]);
      } finally {
        setLoadingCategoryProducts(false);
      }
    }
  };

  const handleCategoryLeave = () => {
    setHoveredCategory(null);
    setCategoryProducts([]);
  };

  return (
    <div className="border-t border-gray-100 dark:border-[var(--border-subtle)] bg-white/80 dark:bg-[var(--bg-secondary)]/80 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <form onSubmit={handleSearch} className="w-full relative">
          <input type="hidden" name="category" value={selectedCategory} />

          <div className="relative w-full">
            {/* Input Principal */}
            <input
              ref={inputRef}
              type="text"
              name="q"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => searchTerm.length >= 2 && setActiveDropdown('autocomplete')}
              placeholder="¿Qué buscas para tu salud?"
              aria-label="Buscar productos o servicios"
              aria-expanded={showAutocomplete}
              aria-controls="search-results"
              autoComplete="off"
              className="w-full h-12 md:h-14 pl-4 pr-36 md:pl-6 md:pr-56 rounded-full border border-gray-200 dark:border-[var(--border-subtle)] text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all shadow-inner bg-gray-50/50 dark:bg-[var(--bg-muted)]/50 text-gray-800 dark:text-[var(--text-primary)] placeholder:text-gray-400 dark:placeholder:text-[var(--text-placeholder)]"
            />

            {/* Botones de Acción */}
            <div className="absolute right-1 top-1 bottom-1 flex items-center gap-1 md:gap-2">
              <button
                type="button"
                aria-label="Buscar por voz"
                className="h-full w-10 md:w-14 rounded-full bg-sky-500 hover:bg-sky-600 dark:bg-[var(--brand-green)] dark:hover:bg-[var(--brand-green-hover)] text-white font-semibold flex items-center justify-center transition-all duration-200"
              >
                <Mic className="w-5 h-5" />
              </button>

              <button
                type="button"
                aria-label={filterOpen ? "Cerrar filtros" : "Abrir filtros"}
                aria-expanded={filterOpen}
                onClick={() => setActiveDropdown(filterOpen ? null : 'filter')}
                className="flex h-full w-10 md:w-auto md:px-7 rounded-full bg-sky-500 dark:bg-[var(--brand-green)] text-white hover:bg-sky-600 dark:hover:bg-[var(--brand-green-hover)] font-bold items-center justify-center gap-2 transition-all border border-sky-200 dark:border-[var(--border-subtle)]"
              >
                <Filter className="w-5 h-5" />
                <span className="hidden md:inline">Filtros</span>
              </button>

              <button
                type="submit"
                aria-label="Ejecutar búsqueda"
                className="h-full w-10 md:w-auto md:px-7 rounded-full bg-sky-500 hover:bg-sky-600 dark:bg-[var(--brand-green)] dark:hover:bg-[var(--brand-green-hover)] text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Search className="w-5 h-5" />
                <span className="hidden md:inline">Buscar</span>
              </button>
            </div>
          </div>

          {/* AUTOCOMPLETE DROPDOWN */}
          {showAutocomplete && isMounted && createPortal(
            <div
              id="search-results"
              role="listbox"
              aria-modal="true"
              aria-label="Resultados de búsqueda"
              tabIndex={-1}
              className="fixed bg-white dark:bg-[var(--bg-secondary)] rounded-2xl shadow-lg border border-gray-100 dark:border-[var(--border-subtle)] overflow-hidden z-[99998]"
              style={{
                top: inputRef.current ? inputRef.current.getBoundingClientRect().bottom + 8 : 0,
                left: inputRef.current ? inputRef.current.getBoundingClientRect().left : 0,
                width: inputRef.current ? inputRef.current.getBoundingClientRect().width : 0,
              }}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <div className="overflow-y-auto max-h-[320px]">
              {isLoading ? (
                <div className="p-4 flex items-center justify-center gap-2 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Buscando...</span>
                </div>
              ) : results.length > 0 ? (
                <div className="flex">
                  {/* Columna Izquierda: Categorías */}
                  <div className="w-1/3 border-r border-gray-100 dark:border-[var(--border-subtle)] max-h-80 overflow-y-auto">
                    <div className="p-2">
                      <p className="text-xs font-bold text-gray-500 dark:text-[var(--text-placeholder)] px-2 py-1 uppercase">
                        Categorías
                      </p>
                      <ul>
                        {categoryResults.map((result, index) => (
                          <li key={`category-${result.id}`}>
                            <button
                              type="button"
                              onClick={() => handleSelectResult(result)}
                              onMouseEnter={() => handleCategoryHover(result)}
                              onMouseLeave={handleCategoryLeave}
                              className={`w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-[#182420] transition-colors rounded-lg ${
                                hoveredCategory?.id === result.id ? 'bg-gray-50 dark:bg-[var(--bg-muted)]' : ''
                              }`}
                            >
                              <FolderOpen className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)] truncate">
                                {result.titulo}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Columna Derecha: Productos */}
                  <div className="w-2/3 max-h-80 overflow-y-auto">
                    {hoveredCategory ? (
                      <div className="p-2">
                        <p className="text-xs font-bold text-gray-500 dark:text-[var(--text-placeholder)] px-2 py-1 uppercase">
                          en {hoveredCategory.titulo}
                        </p>
                        {loadingCategoryProducts ? (
                          <div className="p-4 flex items-center justify-center gap-2 text-gray-500">
                            <Loader2 className="w-4 h-4 animate-spin" />
                          </div>
                        ) : categoryProducts.length > 0 ? (
                          <ul>
                            {categoryProducts.map((product) => (
                              <li key={`hover-product-${product.id}`}>
                                <button
                                  type="button"
                                  onClick={() => handleSelectResult(product)}
                                  className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-[#182420] transition-colors rounded-lg"
                                >
                                  <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-[var(--bg-muted)]">
                                    <Image
                                      src={product.imagen || '/img/no-image.png'}
                                      alt={product.titulo}
                                      fill
                                      sizes="40px"
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0 text-left">
                                    <span className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)] truncate block">
                                      {product.titulo}
                                    </span>
                                    {product.precio !== undefined && (
                                      <span className="text-xs font-bold text-sky-600 dark:text-[var(--color-success)]">
                                        S/{product.precio.toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-gray-400 px-3 py-2">Sin productos</p>
                        )}
                      </div>
                    ) : (
                      <div className="p-2">
                        <p className="text-xs font-bold text-gray-500 dark:text-[var(--text-placeholder)] px-2 py-1 uppercase">
                          Productos
                        </p>
                        <ul>
                          {productResults.map((result, index) => (
                            <li key={`product-${result.id}`}>
                              <button
                                type="button"
                                onClick={() => handleSelectResult(result)}
                                className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-[#182420] transition-colors rounded-lg"
                              >
                                <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-[var(--bg-muted)]">
                                  <Image
                                    src={result.imagen || '/img/no-image.png'}
                                    alt={result.titulo}
                                    fill
                                    sizes="40px"
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                  <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4 text-sky-500 flex-shrink-0" />
                                    <span className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)] truncate">
                                      {result.titulo}
                                    </span>
                                  </div>
                                  {result.precio !== undefined && (
                                    <span className="text-xs font-bold text-sky-600 dark:text-[var(--color-success)] ml-6">
                                      S/{result.precio.toFixed(2)}
                                    </span>
                                  )}
                                  {result.categoria && (
                                    <span className="text-xs text-gray-500 dark:text-[var(--text-placeholder)] ml-1">
                                      en {result.categoria}
                                    </span>
                                  )}
                                </div>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : searchTerm.length >= 2 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No se encontraron resultados
                </div>
              ) : null}
              {/* Footer: Ver todos */}
              {results.length > 0 && (
                <li className="border-t border-gray-100 dark:border-[var(--border-subtle)]">
                  <button
                    type="submit"
                    className="w-full px-4 py-3 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-[#182420] transition-colors text-sky-500 font-medium text-sm"
                  >
                    <Search className="w-4 h-4" />
                    Ver todos los resultados para &quot;{searchTerm}&quot;
                  </button>
                </li>
              )}
            </div>
            </div>,
            document.body
          )}

          {/* DROPDOWN DE FILTROS */}
          {filterOpen && isMounted && createPortal(
            <div
              role="dialog"
              aria-modal="true"
              tabIndex={-1}
              className="fixed bg-white/95 dark:bg-[var(--bg-card)]/95 backdrop-blur-2xl border border-gray-200 dark:border-[var(--border-subtle)] rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.15)] dark:shadow-[0_30px_70px_rgba(0,0,0,0.4)] p-6 overflow-hidden z-[99998]"
              style={{
                top: inputRef.current ? inputRef.current.getBoundingClientRect().bottom + 16 : 0,
                left: inputRef.current ? inputRef.current.getBoundingClientRect().left : 0,
                width: inputRef.current ? inputRef.current.getBoundingClientRect().width : 0,
              }}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 dark:text-[var(--text-primary)]">Filtros de búsqueda</h3>
                <button
                  type="button"
                  onClick={() => setActiveDropdown(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)] rounded-full transition-colors"
                >
                  <X className="w-5 h-5 dark:text-[var(--text-secondary)]" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Categorías */}
                <div className="p-4 bg-gray-50/50 dark:bg-[var(--bg-muted)]/50 rounded-2xl">
                  <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-[var(--text-secondary)] font-bold inline-flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 bg-sky-500 rounded-full"></span>
                    Categorías
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categorias.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(selectedCategory === cat.nombre ? '' : cat.nombre)}
                        className={`px-3.5 py-2.5 rounded-full border text-xs font-bold transition-all ${selectedCategory === cat.nombre
                            ? 'bg-sky-500 text-white border-sky-500 shadow-md'
                            : 'bg-white dark:bg-[var(--bg-card)] border-gray-100 dark:border-[var(--border-subtle)] text-gray-600 dark:text-[var(--text-secondary)] hover:border-sky-300 dark:hover:border-[var(--brand-green)] hover:bg-sky-50 dark:hover:bg-[var(--bg-muted)]'
                          }`}
                      >
                        {cat.nombre}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ofertas */}
                <div className="p-4 bg-gray-50/50 dark:bg-[var(--bg-muted)]/50 rounded-2xl">
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-bold inline-flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Ofertas Especiales
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="px-3.5 py-2.5 rounded-full bg-white dark:bg-[var(--bg-card)] border border-gray-100 dark:border-[var(--border-subtle)] text-xs font-bold text-sky-600 dark:text-[var(--color-success)] hover:border-sky-300 dark:hover:border-[var(--brand-green)] hover:bg-sky-50 dark:hover:bg-[var(--bg-muted)] transition-all">
                      Descuentos
                    </button>
                    <button type="button" className="px-3.5 py-2.5 rounded-full bg-white dark:bg-[var(--bg-card)] border border-gray-100 dark:border-[var(--border-subtle)] text-xs font-bold text-sky-600 dark:text-[var(--color-success)] hover:border-sky-300 dark:hover:border-[var(--brand-green)] hover:bg-sky-50 dark:hover:bg-[var(--bg-muted)] transition-all">
                      Promociones
                    </button>
                    <button type="button" className="px-3.5 py-2.5 rounded-full bg-white dark:bg-[var(--bg-card)] border border-gray-100 dark:border-[var(--border-subtle)] text-xs font-bold text-sky-600 dark:text-[var(--color-success)] hover:border-sky-300 dark:hover:border-[var(--brand-green)] hover:bg-sky-50 dark:hover:bg-[var(--bg-muted)] transition-all">
                      Ofertas
                    </button>
                  </div>
                </div>

                {/* Precio */}
                <div className="p-4 bg-gray-50/50 dark:bg-[var(--bg-muted)]/50 rounded-2xl">
                  <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-[var(--text-secondary)] font-bold inline-flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Rango de Precio
                  </p>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      className="w-full h-2 bg-gray-200 dark:bg-[var(--border-subtle)] rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-[var(--text-secondary)]">
                      <span>S/ 0</span>
                      <span>S/ 1000</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('');
                    setSearchTerm('');
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-[var(--text-secondary)] font-medium hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)] rounded-full transition-colors"
                >
                  Limpiar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-sky-500 dark:bg-[var(--brand-green)] text-white font-bold rounded-full hover:bg-sky-600 dark:hover:bg-[var(--brand-green-hover)] transition-colors"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>,
            document.body
          )}
        </form>
      </div>
    </div>
  );
}