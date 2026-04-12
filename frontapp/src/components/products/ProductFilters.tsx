'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { SlidersHorizontal, Tag, Package } from 'lucide-react';

interface ProductFiltersProps {
  onFilterChange: (filters: ProductFilters) => void;
  initialFilters?: ProductFilters;
}

export interface ProductFilters {
  priceMin?: number;
  priceMax?: number;
  stockStatus?: 'all' | 'in_stock' | 'out_of_stock' | 'on_sale';
}

interface PriceRange {
  min: number;
  max: number;
}

const MIN_PRICE = 0;
const MAX_PRICE = 1000;

const DEFAULT_RANGE: PriceRange = { min: MIN_PRICE, max: MAX_PRICE };

export default function ProductFilters({ onFilterChange, initialFilters }: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<PriceRange>(
    initialFilters?.priceMin !== undefined || initialFilters?.priceMax !== undefined
      ? { min: initialFilters.priceMin || MIN_PRICE, max: initialFilters.priceMax || MAX_PRICE }
      : DEFAULT_RANGE
  );
  const [stockStatus, setStockStatus] = useState<'all' | 'in_stock' | 'out_of_stock' | 'on_sale'>(initialFilters?.stockStatus || 'all');
  
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);

  const hasActiveFilters = (priceRange.min > MIN_PRICE || priceRange.max < MAX_PRICE || stockStatus !== 'all');

  const applyFilters = useCallback(() => {
    onFilterChange({
      priceMin: priceRange.min > MIN_PRICE ? priceRange.min : undefined,
      priceMax: priceRange.max < MAX_PRICE ? priceRange.max : undefined,
      stockStatus,
    });
  }, [priceRange, stockStatus, onFilterChange]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const clearFilters = () => {
    setPriceRange(DEFAULT_RANGE);
    setStockStatus('all');
    onFilterChange({});
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    
    const rect = trackRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const value = Math.round(percent * MAX_PRICE);
    
    const midPoint = (priceRange.min + priceRange.max) / 2;
    
    if (value < midPoint) {
      setPriceRange({ ...priceRange, min: Math.min(value, priceRange.max - 10) });
    } else {
      setPriceRange({ ...priceRange, max: Math.max(value, priceRange.min + 10) });
    }
  };

  const handleMouseDown = (thumb: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(thumb);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!trackRef.current) return;
      
      const rect = trackRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const value = Math.round(percent * MAX_PRICE);

      setPriceRange(prev => {
        if (isDragging === 'min') {
          return { ...prev, min: Math.min(value, prev.max - 10) };
        } else {
          return { ...prev, max: Math.max(value, prev.min + 10) };
        }
      });
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const minPercent = (priceRange.min / MAX_PRICE) * 100;
  const maxPercent = (priceRange.max / MAX_PRICE) * 100;

  const stockOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'in_stock', label: 'En stock' },
    { value: 'on_sale', label: 'En oferta' },
    { value: 'out_of_stock', label: 'Agotados' },
  ];

  return (
    <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden">
      {/* Header clickeable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-[var(--bg-secondary)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-sky-500" />
          <span className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">
            Filtros
          </span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-sky-100 text-sky-600 text-xs font-bold rounded-full">
              Activos
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFilters();
              }}
              className="text-xs text-rose-500 hover:text-rose-600 font-medium"
            >
              Limpiar
            </button>
          )}
          <svg 
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Panel de filtros */}
      {isOpen && (
        <div className="px-4 pb-4 space-y-4 border-t border-[var(--border-subtle)]">
          {/* Filtro de precio con slider de rango */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              <Tag className="w-3 h-3" />
              Rango de precio (S/)
            </label>
            
            {/* Visual del rango con thumbs */}
            <div 
              ref={trackRef}
              className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-6 cursor-pointer"
              onClick={handleTrackClick}
            >
              {/* Barra activa */}
              <div 
                className="absolute h-full bg-gradient-to-r from-sky-400 to-sky-500 rounded-full"
                style={{
                  left: `${minPercent}%`,
                  width: `${maxPercent - minPercent}%`
                }}
              />
              
              {/* Thumb mínimo */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-sky-500 rounded-full shadow-md cursor-ew-resize hover:scale-110 transition-transform z-10"
                style={{ left: `calc(${minPercent}% - 10px)` }}
                onMouseDown={handleMouseDown('min')}
              />
              
              {/* Thumb máximo */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-sky-500 rounded-full shadow-md cursor-ew-resize hover:scale-110 transition-transform z-10"
                style={{ left: `calc(${maxPercent}% - 10px)` }}
                onMouseDown={handleMouseDown('max')}
              />
            </div>

            {/* Valores mínimos y máximos */}
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">S/ {priceRange.min}</span>
              <span className="text-xs text-gray-400">arrastra los puntos</span>
              <span className="font-medium">S/ {priceRange.max}</span>
            </div>
          </div>

          {/* Filtro de stock */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              <Package className="w-3 h-3" />
              Estado de stock
            </label>
            <div className="grid grid-cols-2 gap-2">
              {stockOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStockStatus(option.value as typeof stockStatus)}
                  className={`
                    px-3 py-2 rounded-xl text-xs font-medium transition-all
                    ${stockStatus === option.value 
                      ? 'bg-sky-500 text-white' 
                      : 'bg-[var(--bg-secondary)] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
