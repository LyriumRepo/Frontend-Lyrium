'use client';

import { useState, useMemo, useCallback } from 'react';

export type Ordenamiento = 'recientes' | 'precio-asc' | 'precio-desc' | 'nombre' | 'popular';
export type FiltroRapido = 'todos' | 'oferta' | 'destacado' | 'bio';

export interface FiltrosState {
  busqueda: string;
  ordenamiento: Ordenamiento;
  filtroRapido: FiltroRapido;
  precioMin: number;
  precioMax: number;
  enStock?: boolean;
  enOferta?: boolean;
}

interface UseTiendaFiltrosOptions {
  productos: Record<string, unknown>[];
  initialFilters?: Partial<FiltrosState>;
}

export function useTiendaFiltros({ productos, initialFilters }: UseTiendaFiltrosOptions) {
  const [filtros, setFiltros] = useState<FiltrosState>({
    busqueda: '',
    ordenamiento: 'recientes',
    filtroRapido: 'todos',
    precioMin: 0,
    precioMax: 10000,
    enStock: false,
    enOferta: false,
    ...initialFilters,
  });

  const setBusqueda = useCallback((busqueda: string) => {
    setFiltros(prev => ({ ...prev, busqueda }));
  }, []);

  const setOrdenamiento = useCallback((ordenamiento: Ordenamiento) => {
    setFiltros(prev => ({ ...prev, ordenamiento }));
  }, []);

  const setFiltroRapido = useCallback((filtroRapido: FiltroRapido) => {
    setFiltros(prev => ({ ...prev, filtroRapido }));
  }, []);

  const setPrecioRange = useCallback((precioMin: number, precioMax: number) => {
    setFiltros(prev => ({ ...prev, precioMin, precioMax }));
  }, []);

  const resetFiltros = useCallback(() => {
    setFiltros({
      busqueda: '',
      ordenamiento: 'recientes',
      filtroRapido: 'todos',
      precioMin: 0,
      precioMax: 10000,
      enStock: false,
      enOferta: false,
    });
  }, []);

  const productosFiltrados = useMemo(() => {
    let result = [...productos];

    if (filtros.busqueda) {
      const b = filtros.busqueda.toLowerCase();
      result = result.filter((p: Record<string, unknown>) => 
        String(p.titulo || p.nombre || '').toLowerCase().includes(b) ||
        String(p.categoria || '').toLowerCase().includes(b)
      );
    }

    if (filtros.filtroRapido === 'oferta') {
      result = result.filter((p: Record<string, unknown>) => 
        p.descuento || p.precioOferta || p.tag === 'oferta'
      );
    }
    if (filtros.filtroRapido === 'bio') {
      result = result.filter((p: Record<string, unknown>) => 
        String(p.categoria || '').toLowerCase().includes('bio') ||
        String(p.categoria || '').toLowerCase().includes('orgánico') ||
        String(p.categoria || '').toLowerCase().includes('natural')
      );
    }

    result = result.filter((p: Record<string, unknown>) => {
      const precio = Number(p.precio) || 0;
      return precio >= filtros.precioMin && precio <= filtros.precioMax;
    });

    if (filtros.enStock) {
      result = result.filter((p: Record<string, unknown>) => (p.stock as number || 0) > 0);
    }

    if (filtros.enOferta) {
      result = result.filter((p: Record<string, unknown>) => 
        p.descuento || p.precioOferta || p.tag === 'oferta'
      );
    }

    switch (filtros.ordenamiento) {
      case 'precio-asc':
        result.sort((a: Record<string, unknown>, b: Record<string, unknown>) => (Number(a.precio) || 0) - (Number(b.precio) || 0));
        break;
      case 'precio-desc':
        result.sort((a: Record<string, unknown>, b: Record<string, unknown>) => (Number(b.precio) || 0) - (Number(a.precio) || 0));
        break;
      case 'nombre':
        result.sort((a: Record<string, unknown>, b: Record<string, unknown>) => String(a.titulo || '').localeCompare(String(b.titulo || '')));
        break;
      case 'popular':
        result.sort((a: Record<string, unknown>, b: Record<string, unknown>) => (Number(b.reviews || b.ventas || 0) - Number(a.reviews || a.ventas || 0)));
        break;
    }

    return result;
  }, [productos, filtros]);

  const tieneFiltrosActivos = filtros.busqueda !== '' || 
    filtros.filtroRapido !== 'todos' || 
    filtros.precioMin > 0 || 
    filtros.precioMax < 10000 ||
    filtros.enStock ||
    filtros.enOferta;

  return {
    filtros,
    productosFiltrados,
    tieneFiltrosActivos,
    setBusqueda,
    setOrdenamiento,
    setFiltroRapido,
    setPrecioRange,
    resetFiltros,
  };
}
