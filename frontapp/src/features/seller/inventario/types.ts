export type StockStatus = 'ok' | 'low' | 'critical' | 'out';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  reserved?: number;
  price: number;
  imageUrl?: string;
  updatedAt: Date;
}

export interface InventoryFilters {
  search: string;
  status: StockStatus | 'all';
  category: string;
}

export interface InventoryStats {
  total: number;
  ok: number;
  low: number;
  critical: number;
  out: number;
}