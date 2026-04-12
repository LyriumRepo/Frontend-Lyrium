'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Loader2, Package, FolderOpen } from 'lucide-react';
import { useSearch } from '@/shared/hooks/useSearch';
import { SearchResult } from '@/types/public';

interface SearchAutocompleteProps {
  onSelectProduct?: (slug: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export default function SearchAutocomplete({
  onSelectProduct,
  onSearch,
  placeholder = '¿Qué buscas para tu salud?',
}: SearchAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { results, isLoading, error, search, clearResults } = useSearch({
    debounceMs: 300,
    minChars: 2,
    maxResults: 5,
  });

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
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
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

  return (
    <div className="relative w-full" ref={dropdownRef}>
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
          className="w-full h-12 md:h-14 pl-4 pr-12 rounded-full border border-gray-200 dark:border-[var(--border-subtle)] text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all shadow-inner bg-gray-50/50 dark:bg-[var(--bg-muted)]/50 text-gray-800 dark:text-[var(--text-primary)] placeholder:text-gray-400 dark:placeholder:text-[var(--text-placeholder)]"
          autoComplete="off"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-gray-400" />
          )}
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
    </div>
  );
}
