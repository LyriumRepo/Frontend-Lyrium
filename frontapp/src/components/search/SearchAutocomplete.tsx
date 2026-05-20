'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Loader2, Package, FolderOpen, Mic, Filter, X } from 'lucide-react';
import { useSearch } from '@/shared/hooks/useSearch';
import { SearchResult } from '@/types/public';
import { createPortal } from 'react-dom';

interface SearchAutocompleteProps {
  onSelectProduct?: (slug: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
}

async function fetchFilterCategories(): Promise<{ id: number; nombre: string; slug: string }[]> {
  try {
    const res = await fetch('/api/categories');
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data?.data ?? [];
  } catch {
    return [];
  }
}

export default function SearchAutocomplete({
  onSelectProduct,
  onSearch,
  placeholder = '¿Qué buscas para tu salud?',
}: SearchAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [filterCategories, setFilterCategories] = useState<{ id: number; nombre: string; slug: string }[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { results, isLoading, error, search, clearResults } = useSearch({
    debounceMs: 300,
    minChars: 2,
    maxResults: 5,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      search(query);
      setShowDropdown(true);
    } else {
      clearResults();
      setShowDropdown(false);
    }
    setSelectedIndex(-1);
  }, [query, search, clearResults]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || results.length === 0) return;

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
          handleSelect(results[selectedIndex]);
        } else if (onSearch) {
          onSearch(query);
          setShowDropdown(false);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setFilterOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelect = (result: SearchResult) => {
    if (result.type === 'product' && result.slug) {
      if (onSelectProduct) {
        onSelectProduct(result.slug);
      } else {
        window.location.href = `/producto/${result.slug}`;
      }
    } else if (result.type === 'category' && result.slug) {
      window.location.href = `/productos/${result.slug}`;
    }
    setShowDropdown(false);
    setQuery('');
    clearResults();
  };

  const handleSubmit = () => {
    if (query.trim()) {
      const params = new URLSearchParams();
      params.set('q', query);
      if (selectedCategory) params.set('category', selectedCategory);
      if (priceMin) params.set('minPrice', priceMin);
      if (priceMax) params.set('maxPrice', priceMax);
      const url = `/buscar?${params.toString()}`;
      if (onSearch) {
        onSearch(query);
      } else {
        window.location.href = url;
      }
      setShowDropdown(false);
      setFilterOpen(false);
    }
  };

  const toggleFilters = async () => {
    const next = !filterOpen;
    setFilterOpen(next);
    if (next && filterCategories.length === 0) {
      const cats = await fetchFilterCategories();
      setFilterCategories(cats);
    }
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setPriceMin('');
    setPriceMax('');
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <label htmlFor="search-input" className="sr-only">Buscar productos</label>
        <input
          id="search-input"
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowDropdown(true)}
          placeholder={placeholder}
          aria-label="Buscar productos"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          className="w-full h-12 md:h-14 pl-4 pr-36 rounded-full border border-gray-200 dark:border-[var(--border-subtle)] text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all shadow-inner bg-gray-50/50 dark:bg-[var(--bg-muted)]/50 text-gray-800 dark:text-[var(--text-primary)] placeholder:text-gray-400 dark:placeholder:text-[var(--text-placeholder)]"
          autoComplete="off"
        />
        <div className="absolute right-1 top-1 bottom-1 flex items-center gap-1">
          <button
            type="button"
            aria-label="Buscar por voz"
            className="h-full w-10 rounded-full bg-sky-500 hover:bg-sky-600 dark:bg-[var(--brand-green)] dark:hover:bg-[var(--brand-green-hover)] text-white flex items-center justify-center transition-all border border-sky-200 dark:border-[var(--border-subtle)]"
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label={filterOpen ? 'Cerrar filtros' : 'Abrir filtros'}
            onClick={toggleFilters}
            className={`h-full w-10 rounded-full flex items-center justify-center transition-all border ${
              filterOpen
                ? 'bg-sky-600 text-white border-sky-400'
                : 'bg-sky-500 hover:bg-sky-600 dark:bg-[var(--brand-green)] dark:hover:bg-[var(--brand-green-hover)] text-white border-sky-200 dark:border-[var(--border-subtle)]'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Ejecutar búsqueda"
            onClick={handleSubmit}
            className="h-full w-10 rounded-full bg-sky-500 hover:bg-sky-600 dark:bg-[var(--brand-green)] dark:hover:bg-[var(--brand-green-hover)] text-white flex items-center justify-center transition-all shadow-md border border-sky-200 dark:border-[var(--border-subtle)]"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[var(--bg-secondary)] rounded-2xl shadow-lg border border-gray-100 dark:border-[var(--border-subtle)] overflow-hidden z-50">
          {error && (
            <div className="p-4 text-center text-red-500 text-sm">
              {error}
            </div>
          )}

          {!error && results.length === 0 && query.length >= 2 && !isLoading && (
            <div className="p-4 text-center text-gray-500 text-sm">
              No se encontraron resultados para &quot;{query}&quot;
            </div>
          )}

          {results.length > 0 && (
            <ul className="max-h-80 overflow-y-auto">
              {results.map((result, index) => (
                <li key={`${result.type}-${result.id}`}>
                  <button
                    onClick={() => handleSelect(result)}
                    className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-[var(--bg-muted)] transition-colors ${
                      selectedIndex === index ? 'bg-gray-50 dark:bg-[var(--bg-muted)]' : ''
                    }`}
                  >
                    <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-[var(--bg-muted)]">
                      <Image
                        src={result.imagen || '/img/no-image.png'}
                        alt={result.titulo}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        {result.type === 'product' ? (
                          <Package className="w-4 h-4 text-sky-500 flex-shrink-0" />
                        ) : (
                          <FolderOpen className="w-4 h-4 text-green-500 flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)] truncate">
                          {result.titulo}
                        </span>
                      </div>
                      {result.type === 'product' && result.precio !== undefined && (
                        <span className="text-sm font-bold text-sky-600 dark:text-[var(--color-success)]">
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

              {query.length >= 2 && (
                <li className="border-t border-gray-100 dark:border-[var(--border-subtle)]">
                  <button
                    onClick={() => {
                      if (onSearch) {
                        onSearch(query);
                      } else {
                        window.location.href = `/buscar?q=${encodeURIComponent(query)}`;
                      }
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-3 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-[var(--bg-muted)] transition-colors text-sky-500 font-medium text-sm"
                  >
                    <Search className="w-4 h-4" />
                    Ver todos los resultados para &quot;{query}&quot;
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>
      )}

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
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 dark:text-[var(--text-primary)]">Filtros de búsqueda</h3>
            <button
              type="button"
              onClick={() => setFilterOpen(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)] rounded-full transition-colors"
            >
              <X className="w-5 h-5 dark:text-[var(--text-secondary)]" />
            </button>
          </div>

          <div className="space-y-4">
            {filterCategories.length > 0 && (
              <div className="p-4 bg-gray-50/50 dark:bg-[var(--bg-muted)]/50 rounded-2xl">
                <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-[var(--text-secondary)] font-bold inline-flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 bg-sky-500 rounded-full" />
                  Categorías
                </p>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {filterCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(selectedCategory === cat.nombre ? '' : cat.nombre)}
                      className={`px-3.5 py-2 rounded-full border text-xs font-bold transition-all ${
                        selectedCategory === cat.nombre
                          ? 'bg-sky-500 text-white border-sky-500 shadow-md'
                          : 'bg-white dark:bg-[var(--bg-card)] border-gray-100 dark:border-[var(--border-subtle)] text-gray-600 dark:text-[var(--text-secondary)] hover:border-sky-300'
                      }`}
                    >
                      {cat.nombre}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 bg-gray-50/50 dark:bg-[var(--bg-muted)]/50 rounded-2xl">
              <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-[var(--text-secondary)] font-bold inline-flex items-center gap-2 mb-3">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Rango de Precio
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-[var(--text-placeholder)] mb-1">Mínimo (S/)</label>
                  <input
                    type="number"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-card)] text-gray-900 dark:text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-[var(--text-placeholder)] mb-1">Máximo (S/)</label>
                  <input
                    type="number"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    placeholder="1000"
                    min="0"
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-card)] text-gray-900 dark:text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => { clearFilters(); setFilterOpen(false); }}
              className="px-4 py-2 text-gray-600 dark:text-[var(--text-secondary)] font-medium hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)] rounded-full transition-colors"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={() => { handleSubmit(); setFilterOpen(false); }}
              className="px-6 py-2 bg-sky-500 dark:bg-[var(--brand-green)] text-white font-bold rounded-full hover:bg-sky-600 dark:hover:bg-[var(--brand-green-hover)] transition-colors"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
