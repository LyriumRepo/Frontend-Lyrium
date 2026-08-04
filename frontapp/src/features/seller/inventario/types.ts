export type StockStatus = 'ok' | 'low' | 'critical' | 'out';

export type ApprovalStatus = 'approved' | 'inactive' | 'pending_review' | 'rejected' | 'draft';

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
  approvalStatus: string;
}

export interface InventoryFilters {
  search: string;
  status: StockStatus | 'all';
  category: string;
  approvalStatus: ApprovalStatus | 'all';
}

export interface InventoryStats {
  total: number;
  ok: number;
  low: number;
  critical: number;
  out: number;
}