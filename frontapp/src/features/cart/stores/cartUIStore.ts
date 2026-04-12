import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface CartUIState {
    cartOpen: boolean;
    detailModalOpen: boolean;
    detailProductId: number | string | null;
    
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;
    
    openDetailModal: (productId: number | string) => void;
    closeDetailModal: () => void;
}

export const useCartUIStore = create<CartUIState>()(
    devtools(
        (set) => ({
            cartOpen: false,
            detailModalOpen: false,
            detailProductId: null,

            openCart: () => set((s) => ({ cartOpen: true })),
            closeCart: () => set((s) => ({ cartOpen: false })),
            toggleCart: () => set((s) => ({ cartOpen: !s.cartOpen })),

            openDetailModal: (productId) => set((s) => ({ 
                detailModalOpen: true, 
                detailProductId: productId 
            })),
            
            closeDetailModal: () => set({ 
                detailModalOpen: false, 
                detailProductId: null 
            }),
        }),
        { name: 'cart-ui-store' }
    )
);
