export { useCartDataStore } from './stores/cartDataStore';
export { useCartFilterStore } from './stores/cartFilterStore';
export { useCartUIStore } from './stores/cartUIStore';
export { useFilteredProducts, usePriceBounds } from './hooks/useFilteredProducts';
export { useCartSync } from './hooks/useCartSync';

export type { SortOption, Producto, ApiCartItem } from './types/cart';
export type { ApiProduct } from '@/modules/cart/utils';
