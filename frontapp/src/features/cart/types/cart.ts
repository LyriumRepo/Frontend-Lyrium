import type { ApiProduct, ApiCartItem } from '@/modules/cart/utils';

export { ApiProduct, ApiCartItem };

export type SortOption = 'recent' | 'priceAsc' | 'priceDesc' | 'nameAsc' | 'ratingDesc';

export interface Producto {
    id: number | string;
    titulo: string;
    precio: number;
    precioOferta?: number;
    imagen?: string;
    vendedor?: {
        slug: string;
        nombre: string;
    };
    categorias?: string[];
}
