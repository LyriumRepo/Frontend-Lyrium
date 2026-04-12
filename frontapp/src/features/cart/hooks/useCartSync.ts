'use client';

import { useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCartDataStore } from '@/features/cart';
import { cartApi, type CartResource, type CartItem as ApiCartItemResponse } from '@/shared/lib/api/cartRepository';
import type { Producto } from '@/features/cart';
import type { ApiCartItem } from '@/modules/cart/utils';

interface UseCartSyncReturn {
    cart: CartResource | null;
    items: ApiCartItem[];
    itemCount: number;
    subtotal: number;
    total: number;
    isLoading: boolean;
    error: Error | null;
    addToCart: (product: Producto, cantidad?: number) => Promise<void>;
    removeFromCart: (productId: number | string) => Promise<void>;
    updateQuantity: (itemId: number, cantidad: number) => Promise<void>;
    clearCart: () => Promise<void>;
    refresh: () => void;
}

function mapServerItemToLocal(item: ApiCartItemResponse): ApiCartItem {
    return {
        id: String(item.id),
        producto_id: String(item.productId),
        producto_nombre: item.product?.name || '',
        imagen_url: item.product?.image || '',
        precio_unitario: item.unitPrice,
        cantidad: item.quantity,
    };
}

function mapServerCartToLocal(serverCart: CartResource | null): ApiCartItem[] {
    if (!serverCart || !serverCart.items) return [];
    return serverCart.items.map(mapServerItemToLocal);
}

export function useCartSync(): UseCartSyncReturn {
    const queryClient = useQueryClient();
    const localItems = useCartDataStore((s) => s.cartItems);
    const addLocalItem = useCartDataStore((s) => s.addToCart);
    const removeLocalItem = useCartDataStore((s) => s.removeFromCart);
    const updateLocalQuantity = useCartDataStore((s) => s.updateQuantity);
    const clearLocalCart = useCartDataStore((s) => s.clearCart);
    const setCartItems = useCartDataStore((s) => s.setCartItems);

    const hasToken = typeof window !== 'undefined' ? !!document.cookie.match(/laravel_token=/) : false;

    const { data: serverCart, isLoading, error, refetch } = useQuery<CartResource | null>({
        queryKey: ['cart'],
        queryFn: async () => {
            if (!hasToken) return null;
            try {
                return await cartApi.get();
            } catch {
                return null;
            }
        },
        enabled: hasToken as boolean,
        staleTime: 30 * 1000,
        retry: 1,
    });

    useEffect(() => {
        if (serverCart && serverCart.items.length > 0) {
            const mappedItems = mapServerCartToLocal(serverCart);
            
            if (JSON.stringify(mappedItems) !== JSON.stringify(localItems)) {
                if (localItems.length === 0) {
                    setCartItems(mappedItems);
                }
            }
        }
    }, [serverCart]);

    const syncFromServer = useCallback(() => {
        if (serverCart) {
            setCartItems(mapServerCartToLocal(serverCart));
        }
    }, [serverCart, setCartItems]);

    const addMutation = useMutation({
        mutationFn: async ({ product, cantidad }: { product: Producto; cantidad: number }) => {
            return cartApi.addItem(Number(product.id), cantidad);
        },
        onMutate: async ({ product, cantidad }) => {
            addLocalItem(product, cantidad);
        },
        onSuccess: (data) => {
            if (data && data.items) {
                setCartItems(mapServerCartToLocal(data));
            }
        },
        onError: () => {
            syncFromServer();
        }
    });

    const removeMutation = useMutation({
        mutationFn: async ({ itemId, productId }: { itemId: number; productId: number | string }) => {
            return cartApi.removeItem(itemId);
        },
        onMutate: async ({ productId }) => {
            removeLocalItem(productId);
        },
        onSuccess: (data) => {
            if (data && data.items) {
                setCartItems(mapServerCartToLocal(data));
            }
        },
        onError: () => {
            syncFromServer();
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ itemId, cantidad }: { itemId: number; cantidad: number }) => {
            if (cantidad <= 0) {
                return cartApi.removeItem(itemId);
            }
            return cartApi.updateItem(itemId, cantidad);
        },
        onMutate: async ({ itemId, cantidad }) => {
            const localItem = localItems.find(i => String(i.id) === String(itemId));
            if (localItem) {
                updateLocalQuantity(localItem.producto_id, cantidad);
            }
        },
        onSuccess: (data) => {
            if (data && data.items) {
                setCartItems(mapServerCartToLocal(data));
            }
        },
        onError: () => {
            syncFromServer();
        }
    });

    const clearMutation = useMutation({
        mutationFn: async () => {
            return cartApi.clear();
        },
        onMutate: async () => {
            clearLocalCart();
        },
        onError: () => {
            syncFromServer();
        }
    });

    const addToCart = useCallback(async (product: Producto, cantidad = 1) => {
        await addMutation.mutateAsync({ product, cantidad });
    }, [addMutation]);

    const removeFromCart = useCallback(async (productId: number | string) => {
        const localItem = localItems.find(i => String(i.producto_id) === String(productId));
        if (localItem) {
            await removeMutation.mutateAsync({ 
                itemId: Number(localItem.id), 
                productId 
            });
        }
    }, [removeMutation, localItems]);

    const updateQuantity = useCallback(async (itemId: number, cantidad: number) => {
        await updateMutation.mutateAsync({ itemId, cantidad });
    }, [updateMutation]);

    const clearCart = useCallback(async () => {
        await clearMutation.mutateAsync();
    }, [clearMutation]);

    const itemCount = localItems.reduce((sum, item) => sum + Number(item.cantidad ?? 0), 0);
    const subtotal = localItems.reduce((sum, item) => sum + (Number(item.precio_unitario) * Number(item.cantidad ?? 0)), 0);
    const total = subtotal;

    return {
        cart: serverCart ?? null,
        items: localItems,
        itemCount,
        subtotal,
        total,
        isLoading,
        error: error as Error | null,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refresh: refetch,
    };
}
