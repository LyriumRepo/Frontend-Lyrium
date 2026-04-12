'use client';

import { useState, useEffect, useCallback } from 'react';

interface TiendaWindow extends Window {
  tiendaInfo?: Record<string, unknown>;
  tiendaProductos?: Record<string, unknown>[];
}

interface UseTiendaOptions {
  tienda?: Record<string, unknown>;
  productos?: Record<string, unknown>[];
}

export function useTienda({ tienda, productos = [] }: UseTiendaOptions = {}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const win = window as TiendaWindow;
      win.tiendaInfo = tienda;
      win.tiendaProductos = productos;
      setIsLoaded(true);
    }
  }, [tienda, productos]);

  const openQuickView = useCallback((productId: number) => {
    const product = productos.find(p => p.id === productId);
    if (product) {
      setCurrentProduct(product);
      return product;
    }
    return null;
  }, [productos]);

  const closeQuickView = useCallback(() => {
    setCurrentProduct(null);
  }, []);

  return {
    isLoaded,
    currentProduct,
    openQuickView,
    closeQuickView,
  };
}
