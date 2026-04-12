'use client';

import { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Producto } from '@/types/public';
import SidebarProducts from './SidebarProducts';

interface StoreSidebarProps {
  productos: Producto[];
  titulo?: string;
}

export default function StoreSidebar({ productos, titulo }: StoreSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    categorias: true,
    precio: true,
    disponibilidad: true,
    marca: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Obtener categorías únicas de los productos
  const categorias = [...new Set(productos.map(p => p.categoria).filter(Boolean))];
  
  // Obtener productos en oferta
  const productosOferta = productos.filter(p => p.descuento || p.precioOferta || p.tag === 'oferta');

  return (
    <aside className="w-full lg:w-72 flex-shrink-0">
      <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] p-4 sticky top-4 space-y-4 shadow-md">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[var(--border-subtle)]">
          <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)] flex items-center gap-2">
            {titulo ? (
              titulo
            ) : (
              <>
                <Filter className="w-5 h-5" />
                Filtros
              </>
            )}
          </h3>
          <button className="text-sm text-sky-600 dark:text-[var(--brand-sky)] hover:underline">
            Limpiar todo
          </button>
        </div>

        {/* Productos en Oferta */}
        <div>
          <button 
            onClick={() => toggleSection('ofertas')}
            className="w-full flex items-center justify-between py-2 text-left"
          >
            <span className="font-medium text-gray-800 dark:text-[var(--text-primary)]">
              Ofertas
            </span>
            {expandedSections.ofertas ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          {expandedSections.ofertas && (
            <div className="py-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300 text-sky-500 focus:ring-sky-500"
                />
                <span className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                  Solo ofertas ({productosOferta.length})
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Categorías */}
        <div className="border-t border-gray-100 dark:border-[var(--border-subtle)] pt-3">
          <button 
            onClick={() => toggleSection('categorias')}
            className="w-full flex items-center justify-between py-2 text-left"
          >
            <span className="font-medium text-gray-800 dark:text-[var(--text-primary)]">
              Categorías
            </span>
            {expandedSections.categorias ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          {expandedSections.categorias && (
            <div className="py-2 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {categorias.map((cat, idx) => (
                <label key={idx} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300 text-sky-500 focus:ring-sky-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                    {cat}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Precio */}
        <div className="border-t border-gray-100 dark:border-[var(--border-subtle)] pt-3">
          <button 
            onClick={() => toggleSection('precio')}
            className="w-full flex items-center justify-between py-2 text-left"
          >
            <span className="font-medium text-gray-800 dark:text-[var(--text-primary)]">
              Precio
            </span>
            {expandedSections.precio ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          {expandedSections.precio && (
            <div className="py-2 space-y-3">
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  placeholder="Min" 
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[var(--bg-muted)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-lg text-sm"
                />
                <span className="text-gray-400">-</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[var(--bg-muted)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-lg text-sm"
                />
              </div>
              <button className="w-full py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors">
                Aplicar
              </button>
            </div>
          )}
        </div>

        {/* Disponibilidad */}
        <div className="border-t border-gray-100 dark:border-[var(--border-subtle)] pt-3">
          <button 
            onClick={() => toggleSection('disponibilidad')}
            className="w-full flex items-center justify-between py-2 text-left"
          >
            <span className="font-medium text-gray-800 dark:text-[var(--text-primary)]">
              Disponibilidad
            </span>
            {expandedSections.disponibilidad ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          {expandedSections.disponibilidad && (
            <div className="py-2 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300 text-sky-500 focus:ring-sky-500"
                  defaultChecked
                />
                <span className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                  En stock
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300 text-sky-500 focus:ring-sky-500"
                />
                <span className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                  Pré-venta
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Productos en Sidebar */}
        {productosOferta.length > 0 && (
          <div className="border-t border-gray-100 dark:border-[var(--border-subtle)] pt-3">
            <SidebarProducts 
              productos={productosOferta} 
              titulo="En oferta" 
            />
          </div>
        )}
      </div>
    </aside>
  );
}
