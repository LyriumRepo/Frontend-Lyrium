import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ApiCartItem, Producto } from '../types/cart';
import type { ApiProduct } from '@/modules/cart/utils';

interface CartDataState {
    products: ApiProduct[];
    cartItems: ApiCartItem[];
    
    setProducts: (products: ApiProduct[]) => void;
    setCartItems: (items: ApiCartItem[]) => void;
    
    addToCart: (product: Producto, cantidad?: number) => void;
    removeFromCart: (productId: number | string) => void;
    updateQuantity: (productId: number | string, cantidad: number) => void;
    clearCart: () => void;
}

export const useCartDataStore = create<CartDataState>()(
    devtools(
        (set, get) => ({
            products: [],
            cartItems: [],

            setProducts: (products) => set({ products }),
            
            setCartItems: (items) => set({ cartItems: items }),

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
                        imagen_url: product.imagen || '',
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

            clearCart: () => set({ cartItems: [] }),
        }),
        { name: 'cart-data-store' }
    )
);
