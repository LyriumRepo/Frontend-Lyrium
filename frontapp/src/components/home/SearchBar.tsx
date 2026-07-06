'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Mic, Filter, X, Loader2, Keyboard } from 'lucide-react';
import { Categoria, SearchResult } from '@/types/public';
import { useSearch } from '@/shared/hooks/useSearch';
import { useUIStore } from '@/store/uiStore';
import Image from 'next/image';
import { Package, FolderOpen } from 'lucide-react';
import { createPortal } from 'react-dom';
import VirtualKeyboard from '@/components/ui/VirtualKeyboard';

interface SearchBarProps {
  categoriasServicios?: Categoria[];
  categoriasProductos?: Categoria[];
  // Props opcionales para pre-rellenar desde la página de resultados
  initialQuery?: string;
  initialCategory?: string;
  initialMinPrice?: string;
  initialMaxPrice?: string;
  initialOffer?: string;
  autoSearch?: boolean;
}

export default function SearchBar({ categoriasServicios = [], categoriasProductos = [], initialQuery = '', initialCategory = '', initialMinPrice = '', initialMaxPrice = '', initialOffer = '', autoSearch = false, }: SearchBarProps) {
  const router = useRouter();
  const categoryName = useMemo(() => {
    if (!initialCategory) return '';
    const allCats = [...categoriasServicios, ...categoriasProductos];
    const found = allCats.find(
      c => c.slug === initialCategory || c.slug === initialCategory.split('/').pop()
    );
    if (found) return found.nombre;
    // Fallback: extraer último segmento del slug
    const last = initialCategory.split('-').pop() || initialCategory;
    return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, ' ');
  }, [initialCategory, categoriasServicios, categoriasProductos]);
  const [searchTerm, setSearchTerm] = useState(initialQuery || categoryName);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [activeDropdownLocal, setActiveDropdownLocal] = useState<'autocomplete' | 'filter' | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hoveredCategory, setHoveredCategory] = useState<SearchResult | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<SearchResult[]>([]);
  const [loadingCategoryProducts, setLoadingCategoryProducts] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const isInitialCategoryBrowse = useRef(!!initialCategory && !initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLFormElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { activeDropdown: globalDropdown, setActiveDropdown: setGlobalDropdown } = useUIStore();

  const showAutocomplete = activeDropdownLocal === 'autocomplete';
  const filterOpen = activeDropdownLocal === 'filter';
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [selectedOffer, setSelectedOffer] = useState<string>(initialOffer);
  const [filterError, setFilterError] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const newTerm = initialQuery || categoryName;
    setSearchTerm(newTerm);
    setSelectedCategory(initialCategory);
  }, [initialQuery, initialCategory, categoryName]);

  useEffect(() => {
    if (isInitialCategoryBrowse.current) {
      isInitialCategoryBrowse.current = false;
      return;
    }
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
      const target = event.target as Node;

      const clickedInsideInput =
        searchContainerRef.current?.contains(target);

      const clickedInsideDropdown =
        dropdownRef.current?.contains(target);

      if (!clickedInsideInput && !clickedInsideDropdown) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
    if (!searchTerm.trim()) {
      setFilterError('Ingresa un término de búsqueda para continuar.');
      return;
    }

    setFilterError('');
    const params = new URLSearchParams();
    if (searchTerm.trim()) {
      params.append('q', searchTerm);
    }

    if (selectedCategory) {
      params.append('category', selectedCategory);
    }

    if (minPrice) {
      params.append('min_price', minPrice);
    }

    if (maxPrice) {
      params.append('max_price', maxPrice);
    }
    if (selectedOffer === 'on_sale') {
    params.append('on_sale', 'true');
    } else if (selectedOffer === 'promotion') {
      params.append('on_sale', 'true');
      params.append('sticker', 'promotion');
    } else if (selectedOffer === 'offer') {
      params.append('on_sale', 'true');
      params.append('sticker', 'offer');
    }

    router.push(`/buscar?${params.toString()}`);

    setActiveDropdown(null);
  };

  const handleKeyboardChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleVoiceSearch = useCallback(() => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      console.warn('SpeechRecognition no soportado en este navegador');
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.lang = 'es-PE';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setSearchTerm(transcript);

      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        recognition.stop();
      }, 1500);
    };

    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  }, [isListening]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    };
  }, []);

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
    } else if (result.type === 'service' && result.slug) {
      window.location.href = `/servicios/${result.slug}`;
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
        <form ref={searchContainerRef} onSubmit={handleSearch} className="w-full relative">
          <input type="hidden" name="category" value={selectedCategory} />

          <div className="relative w-full">
            {/* Input Principal */}
            <input
              ref={inputRef}
              type="text"
              name="q"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (filterError) setFilterError(''); 
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => searchTerm.length >= 2 && setActiveDropdown('autocomplete')}
              placeholder="¿Qué buscas para tu salud?"
              aria-label="Buscar productos o servicios"
              aria-expanded={showAutocomplete}
              aria-controls="search-results"
              autoComplete="off"
              className="w-full h-12 md:h-14 pl-4 pr-24 md:pl-6 md:pr-56 rounded-full border border-gray-200 dark:border-[var(--border-subtle)] text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-[var(--text-primary)] focus:border-sky-400 dark:focus:border-[var(--text-primary)] transition-all shadow-inner bg-gray-50/50 dark:bg-[var(--bg-muted)]/50 text-gray-800 dark:text-[var(--text-primary)] placeholder:text-gray-400 dark:placeholder:text-[var(--text-placeholder)]"
            />

            {/* Botones de Acción */}
            <div className="absolute right-1 top-1 bottom-1 flex items-center gap-1 md:gap-2">
              <button
                type="button"
                onClick={handleVoiceSearch}
                aria-label={isListening ? 'Detener grabación por voz' : 'Buscar por voz'}
                className={`h-full w-10 md:w-14 rounded-full font-semibold flex items-center justify-center transition-all duration-200 border ${
                  isListening
                    ? 'bg-[var(--brand-teal)] hover:bg-teal-600 text-white border-teal-300 animate-pulse shadow-[0_0_12px_rgba(13,148,136,0.5)]'
                    : 'bg-sky-500 hover:bg-sky-600 dark:bg-[var(--brand-green)] dark:hover:bg-[var(--brand-green-hover)] text-white border-sky-200 dark:border-[var(--border-subtle)]'
                }`}
              >
                <Mic className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setShowKeyboard((prev) => !prev)}
                aria-label={showKeyboard ? 'Ocultar teclado virtual' : 'Abrir teclado virtual'}
                className={`h-full w-10 md:w-14 rounded-full font-semibold flex items-center justify-center transition-all duration-200 border ${
                  showKeyboard
                    ? 'bg-gray-200 dark:bg-[var(--bg-muted)] text-gray-700 dark:text-[var(--text-primary)] border-gray-300 dark:border-[var(--border-subtle)] shadow-inner'
                    : 'bg-sky-500 hover:bg-sky-600 dark:bg-[var(--brand-green)] dark:hover:bg-[var(--brand-green-hover)] text-white border-sky-200 dark:border-[var(--border-subtle)]'
                }`}
              >
                <Keyboard className="w-5 h-5" />
              </button>

              <button
                type="button"
                aria-label={filterOpen ? "Cerrar filtros" : "Abrir filtros"}
                aria-expanded={filterOpen}
                onMouseDown={() => setActiveDropdown(filterOpen ? null : 'filter')}
                className="hidden md:flex h-full md:w-auto md:px-7 rounded-full bg-sky-500 dark:bg-[var(--brand-green)] text-white hover:bg-sky-600 dark:hover:bg-[var(--brand-green-hover)] font-bold items-center justify-center gap-2 transition-all border border-sky-200 dark:border-[var(--border-subtle)]"
              >
                <Filter className="w-5 h-5" />
                <span className="hidden md:inline">Filtros</span>
              </button>

              <button
                type="submit"
                aria-label="Ejecutar búsqueda"
                className="h-full w-10 md:w-auto md:px-7 rounded-full bg-sky-500 hover:bg-sky-600 dark:bg-[var(--brand-green)] dark:hover:bg-[var(--brand-green-hover)] text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md border border-sky-200 dark:border-[var(--border-subtle)]"
              >
                <Search className="w-5 h-5" />
                <span className="hidden md:inline">Buscar</span>
              </button>
            </div>
          </div>
          {filterError && (
            <p className="absolute left-4 -bottom-5 text-xs text-red-500 animate-fade-in">
              {filterError}
            </p>
          )}

          {/* AUTOCOMPLETE DROPDOWN */}
          {showAutocomplete && isMounted && createPortal(
            <div
              ref={dropdownRef}
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
              onMouseDown={(e) => e.stopPropagation()}
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
                              onMouseDown={() => handleSelectResult(result)}
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
                                  onMouseDown={() => handleSelectResult(product)}
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
                          {productResults.map((result) => (
                            <li key={`${result.type}-${result.id}`}>
                              <button
                                type="button"
                                onMouseDown={() => handleSelectResult(result)}
                                className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-[#182420] transition-colors rounded-lg"
                              >
                                <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-[var(--bg-muted)]">
                                  <img
                                    src={typeof result.imagen === 'string' && result.imagen.startsWith('http') ? result.imagen : '/img/no-image.png'}
                                    alt={result.titulo}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                  <div className="flex items-center gap-2">
                                    {result.type === 'service' ? (
                                      <Package className="w-4 h-4 text-purple-500 flex-shrink-0" />
                                    ) : (
                                      <Package className="w-4 h-4 text-sky-500 flex-shrink-0" />
                                    )}
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
              className="fixed bg-white/95 dark:bg-[var(--bg-card)]/95 backdrop-blur-2xl border border-gray-200 dark:border-[var(--border-subtle)] rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.15)] dark:shadow-[0_30px_70px_rgba(0,0,0,0.4)] p-6 overflow-y-auto overscroll-contain max-h-[90vh] z-[99998]"
              style={(() => {
                const rect = searchContainerRef.current?.getBoundingClientRect();
                if (!rect) return {};
                const spaceBelow = window.innerHeight - rect.bottom - 8;
                return {
                  top: rect.bottom + 8,
                  left: rect.left,
                  width: rect.width,
                  maxHeight: Math.min(spaceBelow, 480),
                };
              })()}
              onMouseDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 dark:text-[var(--text-primary)]">Filtros de búsqueda</h3>
                <button
                  type="button"
                  onMouseDown={() => setActiveDropdown(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)] rounded-full transition-colors"
                >
                  <X className="w-5 h-5 dark:text-[var(--text-secondary)]" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Categorías */}
                <div className="p-4 bg-gray-50/50 dark:bg-[var(--bg-muted)]/50 rounded-2xl md:col-span-1 overflow-y-auto max-h-64">
                  <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-[var(--text-secondary)] font-bold inline-flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 bg-sky-500 rounded-full"></span>
                    Categorías
                  </p>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    
                    {/* Servicios */}
                    {categoriasServicios.length > 0 && (
                      <div className="col-span-2 mb-1">
                        <p className="text-xs text-gray-400 dark:text-[var(--text-placeholder)] font-semibold mb-1 pl-1">
                          Servicios
                        </p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                          {categoriasServicios.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onMouseDown={() =>
                                setSelectedCategory(selectedCategory === cat.slug ? '' : cat.slug || '')
                              }
                              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-left transition-all group ${
                                selectedCategory === cat.slug
                                  ? 'text-sky-500 dark:text-sky-400'
                                  : 'text-gray-600 dark:text-[var(--text-secondary)] hover:text-sky-500 dark:hover:text-sky-400'
                              }`}
                            >
                              {/* Checkmark / indicador */}
                              <span className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 flex items-center justify-center transition-all ${
                                selectedCategory === cat.slug
                                  ? 'bg-sky-500 border-sky-500'
                                  : 'border-gray-300 dark:border-[var(--border-subtle)] group-hover:border-sky-400'
                              }`}>
                                {selectedCategory === cat.slug && (
                                  <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </span>
                              <span className="truncate capitalize">{cat.nombre.toLowerCase()}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Divisor */}
                    {categoriasServicios.length > 0 && categoriasProductos.length > 0 && (
                      <div className="col-span-2 border-t border-gray-100 dark:border-[var(--border-subtle)] my-2" />
                    )}

                    {/* Productos */}
                    {categoriasProductos.length > 0 && (
                      <div className="col-span-2">
                        <p className="text-xs text-gray-400 dark:text-[var(--text-placeholder)] font-semibold mb-1 pl-1">
                          Productos
                        </p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                          {categoriasProductos.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onMouseDown={() =>
                                setSelectedCategory(selectedCategory === cat.slug ? '' : cat.slug || '')
                              }
                              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-left transition-all group ${
                                selectedCategory === cat.slug
                                  ? 'text-sky-500 dark:text-sky-400'
                                  : 'text-gray-600 dark:text-[var(--text-secondary)] hover:text-sky-500 dark:hover:text-sky-400'
                              }`}
                            >
                              <span className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 flex items-center justify-center transition-all ${
                                selectedCategory === cat.slug
                                  ? 'bg-sky-500 border-sky-500'
                                  : 'border-gray-300 dark:border-[var(--border-subtle)] group-hover:border-sky-400'
                              }`}>
                                {selectedCategory === cat.slug && (
                                  <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </span>
                              <span className="truncate capitalize">{cat.nombre.toLowerCase()}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* Ofertas */}
                <div className="p-4 bg-gray-50/50 dark:bg-[var(--bg-muted)]/50 rounded-2xl">
                  <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-[var(--text-secondary)] font-bold inline-flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Ofertas Especiales
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Descuentos', value: 'on_sale' },
                      { label: 'Promociones', value: 'promotion' },
                      { label: 'Ofertas', value: 'offer' },
                    ].map(({ label, value }) => (
                      <button
                        key={value}
                        type="button"
                        onMouseDown={() =>
                          setSelectedOffer(selectedOffer === value ? '' : value)
                        }
                        className={`px-3.5 py-2.5 rounded-full border text-xs font-bold transition-all ${
                          selectedOffer === value
                            ? 'bg-red-500 text-white border-red-500 shadow-md'
                            : 'bg-white dark:bg-[var(--bg-card)] border-gray-200 dark:border-[var(--border-subtle)] text-gray-600 dark:text-[var(--text-secondary)] hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/10 dark:hover:border-red-400'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Precio */}
                <div className="p-4 bg-gray-50/50 dark:bg-[var(--bg-muted)]/50 rounded-2xl">
                  <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-[var(--text-secondary)] font-bold inline-flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Rango de Precio
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-[var(--text-secondary)] mb-1">
                        Desde
                      </label>

                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="0"
                        min="0"
                        className="
                          w-full
                          px-3
                          py-2.5
                          rounded-xl
                          border
                          border-gray-200
                          dark:border-[var(--border-subtle)]
                          bg-white
                          dark:bg-[var(--bg-card)]
                          text-sm
                          text-gray-700
                          dark:text-[var(--text-primary)]
                          focus:outline-none
                          focus:ring-2
                          focus:ring-sky-500
                        "
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 dark:text-[var(--text-secondary)] mb-1">
                        Hasta
                      </label>

                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="1000"
                        min="0"
                        className="
                          w-full
                          px-3
                          py-2.5
                          rounded-xl
                          border
                          border-gray-200
                          dark:border-[var(--border-subtle)]
                          bg-white
                          dark:bg-[var(--bg-card)]
                          text-sm
                          text-gray-700
                          dark:text-[var(--text-primary)]
                          focus:outline-none
                          focus:ring-2
                          focus:ring-sky-500
                        "
                      />
                    </div>

                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-[var(--border-subtle)]">
                <button
                  type="button"
                  onMouseDown={() => {
                    setSelectedCategory('');
                    setSelectedOffer('');
                    setMinPrice('');
                    setMaxPrice('');
                    setSearchTerm('');
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-[var(--text-secondary)] font-medium hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)] rounded-full transition-colors"
                >
                  Limpiar
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (autoSearch) {
                      handleSearch(e as unknown as React.FormEvent); // navega y cierra
                    } else {
                      setActiveDropdown(null); // solo cierra
                    }
                  }}
                  className="px-6 py-2 bg-sky-500 dark:bg-[var(--brand-green)] text-white font-bold rounded-full hover:bg-sky-600 dark:hover:bg-[var(--brand-green-hover)] transition-colors"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>,
            document.body
          )}
        </form>

        <VirtualKeyboard
          value={searchTerm}
          onChange={handleKeyboardChange}
          onClose={() => setShowKeyboard(false)}
          visible={showKeyboard}
        />
      </div>
    </div>
  );
}