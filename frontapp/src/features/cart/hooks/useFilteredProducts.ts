import { useMemo } from 'react';
import { useCartDataStore } from '../stores/cartDataStore';
import { useCartFilterStore } from '../stores/cartFilterStore';
import type { SortOption } from '../types/cart';
import type { ApiProduct } from '@/modules/cart/utils';

function getPrice(p: ApiProduct): number {
    return Number(p.precio_final ?? p.precio_oferta ?? p.precio ?? 0);
}

function normalize(s?: string | null): string {
    return String(s ?? '').toLowerCase().trim();
}

function applySort(list: ApiProduct[], sortBy: SortOption): ApiProduct[] {
    const arr = [...list];
    switch (sortBy) {
        case 'priceAsc': return arr.sort((a, b) => getPrice(a) - getPrice(b));
        case 'priceDesc': return arr.sort((a, b) => getPrice(b) - getPrice(a));
        case 'nameAsc': return arr.sort((a, b) => normalize(a.nombre).localeCompare(normalize(b.nombre), 'es'));
        case 'ratingDesc': return arr.sort((a, b) => Number(b.rating_promedio ?? 0) - Number(a.rating_promedio ?? 0));
        default: return arr;
    }
}

export function useFilteredProducts(): ApiProduct[] {
    const products = useCartDataStore(state => state.products);
    const { searchQuery, sortBy, priceMin, priceMax } = useCartFilterStore();

    return useMemo(() => {
        const q = normalize(searchQuery);

        let list = q
            ? products.filter((p) => {
                return (
                    normalize(p.nombre).includes(q) ||
                    normalize(p.sku).includes(q) ||
                    normalize(p.categoria_nombre).includes(q) ||
                    normalize(p.descripcion_corta).includes(q)
                );
            })
            : [...products];

        list = list.filter((p) => { 
            const pr = getPrice(p); 
            return pr >= priceMin && pr <= priceMax; 
        });

        return applySort(list, sortBy);
    }, [products, searchQuery, sortBy, priceMin, priceMax]);
}

export function usePriceBounds(): { min: number; max: number } {
    const products = useCartDataStore(state => state.products);

    return useMemo(() => {
        const prices = products.map(getPrice).filter((n) => n > 0);
        const min = prices.length ? Math.floor(Math.min(...prices)) : 0;
        const max = prices.length ? Math.ceil(Math.max(...prices)) : 0;
        return { min, max };
    }, [products]);
}
