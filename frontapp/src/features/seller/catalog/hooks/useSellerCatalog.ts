'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Product } from '../types';
import { MOCK_CATALOG_DATA } from '../mock';
import { productRepository } from '@/shared/lib/api/factory';
import { USE_MOCKS } from '@/shared/lib/config/flags';
import { CreateProductInput } from '@/shared/lib/api/contracts';
import { getErrorMessage } from '@/shared/lib/utils/error-utils';

export function useSellerCatalog() {
    const queryClient = useQueryClient();
    const [searchText, setSearchText] = useState('');
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const { data: products = [], isLoading, error, refetch } = useQuery({
        queryKey: ['seller', 'catalog'],
        queryFn: async () => {
            if (USE_MOCKS) {
                return MOCK_CATALOG_DATA as Product[];
            }

            try {
                return await productRepository.getProducts();
            } catch (e) {
                console.warn('FALLBACK: productRepository.getProducts() error', e);
                return MOCK_CATALOG_DATA as Product[];
            }
        },
        staleTime: 5 * 60 * 1000,
    });

    const upsertProductMutation = useMutation({
        mutationFn: async (product: Partial<Product>) => {
            if (!USE_MOCKS) {
                if (product.id) {
                    return await productRepository.updateProduct(product.id, product);
                }
                return await productRepository.createProduct(product as CreateProductInput);
            }
            return product;
        },
        onSuccess: (data, variables) => {
            queryClient.setQueryData(['seller', 'catalog'], (old: Product[] | undefined) => {
                if (!old) return [data as Product];
                const exists = old.find((p: Product) => p.id === variables.id);
                if (exists) {
                    return old.map(p => p.id === variables.id ? { ...p, ...data } : p);
                }
                return [{ ...data, id: Date.now().toString() } as Product, ...old];
            });
            setIsEditModalOpen(false);
            setSelectedProductId(null);
        }
    });

    const deleteProductMutation = useMutation({
        mutationFn: async (productId: string) => {
            if (!USE_MOCKS) {
                await productRepository.deleteProduct(productId);
            }
            return productId;
        },
        onSuccess: (deletedId) => {
            queryClient.setQueryData(['seller', 'catalog'], (old: Product[] | undefined) => {
                return old ? old.filter(p => p.id !== deletedId) : [];
            });
        }
    });

    const filteredProducts = useMemo(() => {
        return products.filter((p: Product) =>
            p.name.toLowerCase().includes(searchText.toLowerCase()) ||
            p.category.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [products, searchText]);

    const selectedProduct = useMemo(() => {
        return products.find(p => p.id === selectedProductId) || null;
    }, [products, selectedProductId]);

    return {
        products: filteredProducts,
        searchText,
        setSearchText,
        loading: isLoading || upsertProductMutation.isPending || deleteProductMutation.isPending,
        error: getErrorMessage(error),
        selectedProduct,
        isModalOpen: isEditModalOpen,
        isDetailModalOpen,
        handleSaveProduct: (product: Partial<Product>) => upsertProductMutation.mutateAsync(product),
        handleDeleteProduct: (productId: string) => deleteProductMutation.mutateAsync(productId),
        openEditModal: (product: Product) => {
            setSelectedProductId(product.id);
            setIsEditModalOpen(true);
        },
        handleCreateProduct: () => {
            setSelectedProductId(null);
            setIsEditModalOpen(true);
        },
        openDetailModal: (product: Product) => {
            setSelectedProductId(product.id);
            setIsDetailModalOpen(true);
        },
        closeDetailModal: () => {
            setSelectedProductId(null);
            setIsDetailModalOpen(false);
        },
        closeModal: () => {
            setSelectedProductId(null);
            setIsEditModalOpen(false);
        },
        refresh: refetch
    };
}
