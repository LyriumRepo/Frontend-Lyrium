import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { SortOption } from '../types/cart';

interface CartFilterState {
    searchQuery: string;
    sortBy: SortOption;
    priceMin: number;
    priceMax: number;
    priceBoundMin: number;
    priceBoundMax: number;
    
    setSearchQuery: (q: string) => void;
    setSortBy: (s: SortOption) => void;
    setPriceRange: (min: number, max: number) => void;
    setPriceBounds: (min: number, max: number) => void;
    resetPriceFilter: () => void;
    resetFilters: () => void;
}

export const useCartFilterStore = create<CartFilterState>()(
    devtools(
        (set, get) => ({
            searchQuery: '',
            sortBy: 'recent',
            priceMin: 0,
            priceMax: 0,
            priceBoundMin: 0,
            priceBoundMax: 0,

            setSearchQuery: (searchQuery) => set({ searchQuery }),
            
            setSortBy: (sortBy) => set({ sortBy }),
            
            setPriceRange: (priceMin, priceMax) => set({ priceMin, priceMax }),
            
            setPriceBounds: (priceBoundMin, priceBoundMax) => set({ 
                priceBoundMin, 
                priceBoundMax,
                priceMin: priceBoundMin,
                priceMax: priceBoundMax 
            }),
            
            resetPriceFilter: () => {
                const { priceBoundMin, priceBoundMax } = get();
                set({ priceMin: priceBoundMin, priceMax: priceBoundMax });
            },
            
            resetFilters: () => {
                const { priceBoundMin, priceBoundMax } = get();
                set({
                    searchQuery: '',
                    sortBy: 'recent',
                    priceMin: priceBoundMin,
                    priceMax: priceBoundMax,
                });
            },
        }),
        { name: 'cart-filter-store' }
    )
);
