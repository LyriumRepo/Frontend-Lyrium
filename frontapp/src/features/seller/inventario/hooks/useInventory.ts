'use client';

import { useState, useMemo, useCallback } from 'react';
import { InventoryItem, InventoryFilters, InventoryStats, StockStatus } from '../types';

// Mock data — replace with real API call
const MOCK_ITEMS: InventoryItem[] = [
  { id: '1', sku: 'CAM-001', name: 'Cámara Mirrorless Sony A7 IV', category: 'Electrónica', stock: 0,  reserved: 0, price: 2499.00, updatedAt: new Date('2024-06-10') },
  { id: '2', sku: 'AUD-012', name: 'Audífonos Sony WH-1000XM5',   category: 'Electrónica', stock: 2,  reserved: 1,  price: 349.99,  updatedAt: new Date('2024-06-11') },
  { id: '3', sku: 'MOC-034', name: 'Mochila Osprey Farpoint 40',  category: 'Viaje',       stock: 3,  reserved: 0,  price: 129.00,  updatedAt: new Date('2024-06-09') },
  { id: '4', sku: 'ZAP-078', name: 'Zapatillas Salomon XT-6',     category: 'Calzado',     stock: 14, reserved: 2,  price: 180.00,  updatedAt: new Date('2024-06-12') },
  { id: '5', sku: 'LEN-002', name: 'Lente Canon RF 50mm f/1.2',   category: 'Fotografía',  stock: 1,  reserved: 1,  price: 2199.00, updatedAt: new Date('2024-06-08') },
  { id: '6', sku: 'TAB-019', name: 'iPad Pro 12.9" M4',           category: 'Electrónica', stock: 7,  reserved: 3,  price: 1099.00, updatedAt: new Date('2024-06-13') },
  { id: '7', sku: 'CHA-055', name: 'Chaqueta The North Face',     category: 'Ropa',        stock: 4,  reserved: 0,  price: 249.00,  updatedAt: new Date('2024-06-07') },
  { id: '8', sku: 'TRI-003', name: 'Trípode Joby GorillaPod 3K',  category: 'Fotografía',  stock: 22, reserved: 1,  price: 79.99,   updatedAt: new Date('2024-06-14') },
  { id: '9', sku: 'REL-041', name: 'Reloj Garmin Fenix 8',        category: 'Wearables',   stock: 0,  reserved: 0,  price: 899.00,  updatedAt: new Date('2024-06-06') },
  { id: '10',sku: 'MAT-007', name: 'Matero Stanley Adventure',    category: 'Hogar',       stock: 45, reserved: 5,  price: 39.99,   updatedAt: new Date('2024-06-14') },
];

export function getStockStatus(item: InventoryItem): StockStatus {
  const available = item.stock - item.reserved;
  if (available <= 0)  return 'out';
  if (available <= 5)  return 'critical';
  if (available <= 9)  return 'low';
  return 'ok';
}

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>(MOCK_ITEMS);
  const [filters, setFilters] = useState<InventoryFilters>({
    search: '',
    status: 'all',
    category: 'all',
  });

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return ['all', ...Array.from(set)];
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

  const alerts = useMemo(
    () => items.filter((i) => ['low', 'critical', 'out'].includes(getStockStatus(i))),
    [items]
  );

  const updateStock = useCallback((id: string, newStock: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stock: newStock, updatedAt: new Date() } : item))
    );
  }, []);

  const setFilter = useCallback(<K extends keyof InventoryFilters>(key: K, value: InventoryFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  return { filtered, alerts, stats, filters, categories, setFilter, updateStock };
}