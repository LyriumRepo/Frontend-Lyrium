import { create } from 'zustand';
import type { ApiProduct, ApiCartItem } from '@/modules/cart/utils';
import type { Producto } from '@/types/public';

export type SortOption = 'recent' | 'priceAsc' | 'priceDesc' | 'nameAsc' | 'ratingDesc';

interface CarritoUI {
    cartOpen: boolean;
    detailModalOpen: boolean;
    detailProductId: number | string | null;
}

interface CarritoState {
    products: ApiProduct[];
    filteredProducts: ApiProduct[];
    cartItems: ApiCartItem[];

    searchQuery: string;
    sortBy: SortOption;
    priceMin: number;
    priceMax: number;
    priceBoundMin: number;
    priceBoundMax: number;

    ui: CarritoUI;
    clienteId: number;

    setProducts: (products: ApiProduct[]) => void;
    setCartItems: (items: ApiCartItem[]) => void;

    setSearchQuery: (q: string) => void;
    setSortBy: (s: SortOption) => void;
    setPriceRange: (min: number, max: number) => void;
    setPriceBounds: (min: number, max: number) => void;
    resetPriceFilter: () => void;

    addToCart: (product: Producto, cantidad?: number) => void;
    removeFromCart: (productId: number | string) => void;
    updateQuantity: (productId: number | string, cantidad: number) => void;

    openCart: () => void;
    closeCart: () => void;
    openDetailModal: (productId: number | string) => void;
    closeDetailModal: () => void;

    applyFilters: () => void;
}

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

export const useCarritoStore = create<CarritoState>((set, get) => ({
    products: [],
    filteredProducts: [],
    cartItems: [],

    searchQuery: '',
    sortBy: 'recent',
    priceMin: 0,
    priceMax: 0,
    priceBoundMin: 0,
    priceBoundMax: 0,

    ui: {
        cartOpen: false,
        detailModalOpen: false,
        detailProductId: null,
    },
    clienteId: 1,

    setProducts: (products) => {
        const prices = products.map(getPrice).filter((n) => n > 0);
        const boundMin = prices.length ? Math.floor(Math.min(...prices)) : 0;
        const boundMax = prices.length ? Math.ceil(Math.max(...prices)) : 0;
        set({ products, priceBoundMin: boundMin, priceBoundMax: boundMax, priceMin: boundMin, priceMax: boundMax });
        get().applyFilters();
    },
    setCartItems: (items) => set({ cartItems: items }),

    setSearchQuery: (searchQuery) => { set({ searchQuery }); get().applyFilters(); },
    setSortBy: (sortBy) => { set({ sortBy }); get().applyFilters(); },
    setPriceRange: (priceMin, priceMax) => { set({ priceMin, priceMax }); get().applyFilters(); },
    setPriceBounds: (priceBoundMin, priceBoundMax) => set({ priceBoundMin, priceBoundMax }),
    resetPriceFilter: () => {
        const { priceBoundMin, priceBoundMax } = get();
        set({ priceMin: priceBoundMin, priceMax: priceBoundMax });
        get().applyFilters();
    },

    applyFilters: () => {
        const { products, searchQuery, sortBy, priceMin, priceMax } = get();
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

        list = list.filter((p) => { const pr = getPrice(p); return pr >= priceMin && pr <= priceMax; });
        set({ filteredProducts: applySort(list, sortBy) });
    },

    openCart: () => set((s) => ({ ui: { ...s.ui, cartOpen: true } })),
    closeCart: () => set((s) => ({ ui: { ...s.ui, cartOpen: false } })),
    openDetailModal: (id) => set((s) => ({ ui: { ...s.ui, detailModalOpen: true, detailProductId: id } })),
    closeDetailModal: () => set((s) => ({ ui: { ...s.ui, detailModalOpen: false, detailProductId: null } })),

    addToCart: (product, cantidad = 1) => {
        const { cartItems } = get();
        const productId = String(product.id);
        
        const existingItem = cartItems.find(item => String(item.producto_id) === productId);
        
        if (existingItem) {
            const updatedItems = cartItems.map(item => 
                String(item.producto_id) === productId
                    ? { ...item, cantidad: Number(item.cantidad) + cantidad }
                    : item
            );
            set({ cartItems: updatedItems });
        } else {
            const newItem: ApiCartItem = {
                id: `${productId}-${Date.now()}`,
                producto_id: productId,
                producto_nombre: product.titulo,
                imagen_url: product.imagen,
                precio_unitario: product.precioOferta || product.precio,
                cantidad: cantidad,
                vendedor_slug: product.vendedor?.slug,
                vendedor_nombre: product.vendedor?.nombre,
                categorias: product.categorias
            };
            set({ cartItems: [...cartItems, newItem] });
        }
    },

    removeFromCart: (productId) => {
        const { cartItems } = get();
        set({ cartItems: cartItems.filter(item => String(item.producto_id) !== String(productId)) });
    },

    updateQuantity: (productId, cantidad) => {
        const { cartItems } = get();
        if (cantidad <= 0) {
            set({ cartItems: cartItems.filter(item => String(item.producto_id) !== String(productId)) });
        } else {
            set({
                cartItems: cartItems.map(item =>
                    String(item.producto_id) === String(productId)
                        ? { ...item, cantidad }
                        : item
                )
            });
        }
    },
}));
