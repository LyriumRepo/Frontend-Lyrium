'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productRepository } from '@/shared/lib/api/factory';
import { useToast } from '@/shared/lib/context/ToastContext';
import { Product } from '@/features/seller/catalog/types';
import { InventoryItem, InventoryFilters, InventoryStats, StockStatus } from '../types';

const PER_PAGE = 10;

function productToInventoryItem(product: Product): InventoryItem {
  return {
    id: product.id,
    sku: product.sku ?? product.id,
    name: product.name,
    category: product.categories?.[0]?.name ?? product.category,
    stock: product.stock,
    reserved: 0,
    price: product.price,
    imageUrl: product.image || undefined,
    updatedAt: product.updatedAt ? new Date(product.updatedAt) : new Date(),
  };
}

export function getStockStatus(item: InventoryItem): StockStatus {
  const available = item.stock - (item.reserved ?? 0);
  if (available <= 0)  return 'out';
  if (available <= 5)  return 'critical';
  if (available <= 9)  return 'low';
  return 'ok';
}

export function useInventory() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<InventoryFilters>({
    search: '',
    status: 'all',
    category: 'all',
  });

  const { data: products = [], isLoading, error, refetch } = useQuery<Product[]>({
    queryKey: ['seller', 'inventory'],
    queryFn: async () => {
      const result = await productRepository.getProducts();
      return result ?? [];
    },
    staleTime: 10 * 60 * 1000,
  });

  const items = useMemo(() => products.map(productToInventoryItem), [products]);

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return ['all', ...Array.from(set).sort()];
  }, [items]);

  const stats: InventoryStats = useMemo(() => {
    const counts = { total: items.length, ok: 0, low: 0, critical: 0, out: 0 };
    for (const item of items) counts[getStockStatus(item)]++;
    return counts;
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        filters.search === '' ||
        item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.sku.toLowerCase().includes(filters.search.toLowerCase());
      const matchStatus =
        filters.status === 'all' || getStockStatus(item) === filters.status;
      const matchCategory =
        filters.category === 'all' || item.category === filters.category;
      return matchSearch && matchStatus && matchCategory;
    });
  }, [items, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const pagedItems = useMemo(
    () => filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE),
    [filtered, safePage]
  );

  const alerts = useMemo(
    () => items.filter((i) => ['low', 'critical', 'out'].includes(getStockStatus(i))),
    [items]
  );

  const updateStockMutation = useMutation({
    mutationFn: async ({ id, stock }: { id: string; stock: number }) => {
      await productRepository.updateStock(id, stock);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller', 'inventory'] });
      showToast('Stock actualizado correctamente', 'success');
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['seller', 'inventory'] });
      showToast('Error al actualizar stock. Los datos se han restaurado.', 'error');
    },
  });

  const updateStock = useCallback(
    (id: string, newStock: number) => {
      queryClient.setQueryData<Product[]>(['seller', 'inventory'], (old) =>
        old?.map((p) => (p.id === id ? { ...p, stock: newStock } : p)) ?? []
      );
      updateStockMutation.mutate({ id, stock: newStock });
    },
    [queryClient, updateStockMutation]
  );

  const setFilter = useCallback(<K extends keyof InventoryFilters>(key: K, value: InventoryFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    setCurrentPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((p) => Math.max(1, p - 1));
  }, []);

  return {
    items,
    filtered,
    pagedItems,
    currentPage: safePage,
    totalPages,
    totalItems: filtered.length,
    alerts,
    stats,
    filters,
    categories,
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'Error al cargar inventario') : null,
    setFilter,
    updateStock,
    goToPage,
    nextPage,
    prevPage,
    refetch,
  };
}
