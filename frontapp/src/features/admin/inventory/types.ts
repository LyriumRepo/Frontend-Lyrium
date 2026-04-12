export type ItemType = 'PRODUCT' | 'SERVICE';
export type ItemStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'ACTIVE' | 'INACTIVE';

export interface InventoryItem {
    id: string;
    name: string;
    type: ItemType;
    sku?: string;
    seller: {
        id: string;
        name: string;
    };
    category: string;
    price: number;
    stock: number;
    status: ItemStatus;
    lastUpdate: string;
}

export interface InventoryStats {
    totalItems: number;
    lowStockCount: number;
    outOfStockCount: number;
    activeServices: number;
}
