'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InventoryItem, ItemType, ItemStatus } from '@/lib/types/admin/inventory';
import { getProducts, updateProduct } from '@/shared/lib/api';
import { Product } from '@/lib/types/wp/wp-types';
import { useNotifications } from '@/shared/lib/context/NotificationContext';
import { USE_MOCKS } from '@/shared/lib/config/flags';
import { MOCK_INVENTORY_DATA } from '@/lib/mocks/inventoryData';
import { getErrorMessage } from '@/shared/lib/utils/error-utils';

export const useInventory = () => {
    const queryClient = useQueryClient();
    const { addNotification } = useNotifications();

    const [filters, setFilters] = useState({
        search: '',
        seller: 'ALL',
        type: 'ALL' as ItemType | 'ALL',
        status: 'ALL' as ItemStatus | 'ALL'
    });

    // --- Query: Fetch Products ---
    const { data: items = [], isLoading, error, refetch } = useQuery({
        queryKey: ['admin', 'inventory'],
        queryFn: async () => {
            if (USE_MOCKS) {
                return MOCK_INVENTORY_DATA as InventoryItem[];
            }

            const wcProducts = await getProducts();

            return wcProducts.map((p: Product) => {
                const isService = p.categories.some(c =>
                    c.name.toLowerCase().includes('servicio') ||
                    c.name.toLowerCase().includes('asesoría')
                );

                let status: ItemStatus = 'IN_STOCK';
                if (p.stock_status === 'outofstock' || (p.manage_stock && p.stock_quantity === 0)) {
                    status = 'OUT_OF_STOCK';
                } else if (p.manage_stock && (p.stock_quantity ?? 0) < 5) {
                    status = 'LOW_STOCK';
                }

                return {
                    id: p.id.toString(),
                    name: p.name,
                    type: isService ? 'SERVICE' : 'PRODUCT',
                    sku: p.sku || `SKU-${p.id}`,
                    seller: {
                        id: p.store?.id?.toString() || '0',
                        name: p.store?.shop_name || 'Tienda Principal'
                    },
                    category: p.categories[0]?.name || 'Sin Categoría',
                    price: parseFloat(p.price) || 0,
                    stock: p.stock_quantity || 0,
                    status: isService ? 'ACTIVE' : status,
                    lastUpdate: new Date().toLocaleDateString()
                } as InventoryItem;
            });
        },
        staleTime: 5 * 60 * 1000,
    });

    // --- Mutation: Update Stock/Price ---
    const updateInventoryMutation = useMutation({
        mutationFn: async ({ id, newStock, newPrice }: { id: string, newStock?: number, newPrice?: number }) => {
            return await updateProduct(Number(id), {
                stock_quantity: newStock,
                price: newPrice?.toString(),
                manage_stock: newStock !== undefined
            });
        },
        onSuccess: (updatedProduct, variables) => {
            queryClient.setQueryData(['admin', 'inventory'], (old: InventoryItem[] | undefined) => {
                if (!old) return old;
                return old.map(item => {
                    if (item.id === variables.id) {
                        const newStock = variables.newStock ?? item.stock;
                        const isService = item.type === 'SERVICE';
                        let newStatus: ItemStatus = item.status;

                        if (!isService) {
                            if (newStock === 0) newStatus = 'OUT_OF_STOCK';
                            else if (newStock < 5) newStatus = 'LOW_STOCK';
                            else newStatus = 'IN_STOCK';
                        }

                        return {
                            ...item,
                            stock: newStock,
                            price: variables.newPrice ?? item.price,
                            status: newStatus,
                            lastUpdate: new Date().toLocaleDateString()
                        };
                    }
                    return item;
                });
            });

            if (variables.newStock === 0) {
                const item = items.find(i => i.id === variables.id);
                addNotification({
                    level: 'CRITICAL',
                    title: 'Stock Agotado',
                    message: `El producto "${item?.name}" se ha agotado en WooCommerce.`
                });
            }
        }
    });

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                item.sku?.toLowerCase().includes(filters.search.toLowerCase());
            const matchesSeller = filters.seller === 'ALL' || item.seller.id === filters.seller || item.seller.name === filters.seller;
            const matchesType = filters.type === 'ALL' || item.type === filters.type;
            const matchesStatus = filters.status === 'ALL' || item.status === filters.status;

            return matchesSearch && matchesSeller && matchesType && matchesStatus;
        });
    }, [items, filters]);

    const stats = useMemo(() => {
        return {
            totalItems: items.length,
            lowStockCount: items.filter(i => i.status === 'LOW_STOCK').length,
            outOfStockCount: items.filter(i => i.status === 'OUT_OF_STOCK').length,
            activeServices: items.filter(i => i.type === 'SERVICE').length
        };
    }, [items]);

    const sellersList = useMemo(() => {
        const uniqueSellersMap = new Map();
        items.forEach(i => {
            if (!uniqueSellersMap.has(i.seller.id)) {
                uniqueSellersMap.set(i.seller.id, i.seller);
            }
        });
        return Array.from(uniqueSellersMap.values());
    }, [items]);

    return {
        items: filteredItems,
        loading: isLoading || updateInventoryMutation.isPending,
        error: getErrorMessage(error),
        stats,
        sellers: sellersList,
        filters,
        setFilters,
        updateStock: (id: string, newStock: number) => updateInventoryMutation.mutateAsync({ id, newStock }),
        updateProductDetails: (id: string, newStock: number, newPrice: number) =>
            updateInventoryMutation.mutateAsync({ id, newStock, newPrice }),
        refresh: refetch
    };
};
