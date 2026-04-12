'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { sellerApi, UpdateStorePayload } from '@/shared/lib/api/sellerRepository';
import { categoryApi } from '@/shared/lib/api/categoryRepository';
import { ShopConfig, Branch } from '../types';
import { USE_MOCKS } from '@/shared/lib/config/flags';

export function useSellerStore() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['seller', 'store', user?.id],
        queryFn: async () => {
            if (!user?.id) {
                throw new Error("No authenticated user");
            }
            
            const storeData = await sellerApi.getStore();
            
            // Fallback: si no encuentra tienda, usar datos del usuario
            if (!storeData) {
                console.warn('[useSellerStore] No store found, using fallback');
                const config: ShopConfig = {
                    name: user.display_name || user.username || "Mi Tienda",
                    category: "Bienestar emocional y medicina natural",
                    activity: "Comercio en línea",
                    description: "Tienda en línea",
                    email: user.email || "",
                    phone: "+51 987 654 321",
                    address: "Av. Principal 123",
                    social: { instagram: "", facebook: "", tiktok: "", youtube: "", website: "", whatsapp: "", twitter: "", linkedin: "" },
                    policies: { 
                        shippingPdf: '', 
                        returnPdf: '', 
                        privacyPdf: '' 
                    },
                    visual: { logo: '', banner1: '', banner2: '', gallery: [] },
                    layout: '1',
                    medals: []
                };
                const branches: Branch[] = [
                    {
                        id: '1',
                        name: 'Sede Principal',
                        address: 'Av. Principal 123',
                        city: 'Lima, Peru',
                        phone: '+51 987 654 321',
                        hours: '08:00 - 20:00',
                        isPrincipal: true,
                        mapsUrl: '#'
                    }
                ];
                return { config, branches };
            }

            const config: ShopConfig = {
                name: storeData.store_name || "Mi Tienda",
                category: storeData.category?.name || "Bienestar emocional y medicina natural",
                activity: (storeData as any).activity || "Comercio en línea",
                description: (storeData as any).description || "Sin descripción",
                email: (storeData as any).corporate_email || storeData.email || "",
                phone: storeData.phone || "",
                address: (storeData as any).address || "",
                social: {
                    instagram: (storeData as any).instagram || "",
                    facebook: (storeData as any).facebook || "",
                    tiktok: (storeData as any).tiktok || "",
                    whatsapp: (storeData as any).whatsapp || "",
                    youtube: (storeData as any).youtube || "",
                    twitter: (storeData as any).twitter || "",
                    linkedin: (storeData as any).linkedin || "",
                    website: (storeData as any).website || ""
                },
                policies: { 
                    shippingPdf: (storeData as any).policyFiles?.shipping || '', 
                    returnPdf: (storeData as any).policyFiles?.return || '', 
                    privacyPdf: (storeData as any).policyFiles?.privacy || '' 
                },
                visual: { 
                    logo: (storeData as any).logo || '', 
                    banner1: (storeData as any).banner || '', 
                    banner2: (storeData as any).banner2 || '',
                    gallery: Array.isArray((storeData as any).gallery) ? (storeData as any).gallery : [] 
                },
                layout: ((storeData as any).layout as '1' | '2' | '3') || '1',
                medals: [],
                subscription: (storeData as any).subscription,
                rating: (storeData as any).rating,
                totalSales: (storeData as any).totalSales,
                totalOrders: (storeData as any).totalOrders,
                verifiedAt: (storeData as any).verifiedAt,
                status: (storeData as any).status
            };

            const branches: Branch[] = storeData.branches?.map((b: any) => ({
                id: String(b.id),
                name: b.name,
                address: b.address,
                city: b.city,
                phone: b.phone,
                hours: b.hours || '',
                isPrincipal: b.is_principal,
                mapsUrl: b.maps_url || ''
            })) || [
                {
                    id: '1',
                    name: 'Sede Principal',
                    address: (storeData as any).address || 'Av. Principal 123',
                    city: 'Lima, Peru',
                    phone: storeData.phone || '+51 987 654 321',
                    hours: '08:00 - 20:00',
                    isPrincipal: true,
                    mapsUrl: '#'
                }
            ];

            return { config, branches, storeId: storeData.id };
        },
        enabled: !!user?.id,
        staleTime: 5 * 60 * 1000,
    });

    const storeId = data?.storeId as number | null;

    const uploadPolicyMutation = useMutation({
        mutationFn: async ({ type, file }: { type: 'shipping' | 'return' | 'privacy'; file: File }) => {
            if (!storeId) throw new Error('No store ID');
            
            if (USE_MOCKS) {
                return { url: URL.createObjectURL(file) };
            }

            return sellerApi.uploadPolicy(storeId, file, type);
        },
        onSuccess: (_data, variables) => {
            queryClient.setQueryData(['seller', 'store', user?.id], (old: any) => {
                if (!old) return old;
                const policyKey = `${variables.type}Pdf` as keyof typeof old.config.policies;
                return {
                    ...old,
                    config: {
                        ...old.config,
                        policies: {
                            ...old.config.policies,
                            [policyKey]: _data.url
                        }
                    }
                };
            });
        }
    });

    const deletePolicyMutation = useMutation({
        mutationFn: async (type: 'shipping' | 'return' | 'privacy') => {
            if (!storeId) throw new Error('No store ID');
            
            if (USE_MOCKS) {
                return;
            }

            return sellerApi.deletePolicy(storeId, type);
        },
        onSuccess: (_data, type) => {
            queryClient.setQueryData(['seller', 'store', user?.id], (old: any) => {
                if (!old) return old;
                const policyKey = `${type}Pdf` as keyof typeof old.config.policies;
                return {
                    ...old,
                    config: {
                        ...old.config,
                        policies: {
                            ...old.config.policies,
                            [policyKey]: ''
                        }
                    }
                };
            });
        }
    });

    const uploadLogoMutation = useMutation({
        mutationFn: async (file: File) => {
            if (!storeId) throw new Error('No store ID');
            
            if (USE_MOCKS) {
                return { url: URL.createObjectURL(file) };
            }

            return sellerApi.uploadLogo(storeId, file);
        },
    });

    const uploadBannerMutation = useMutation({
        mutationFn: async ({ file, bannerNumber }: { file: File; bannerNumber: 1 | 2 }) => {
            if (!storeId) throw new Error('No store ID');
            
            if (USE_MOCKS) {
                return { url: URL.createObjectURL(file) };
            }

            return sellerApi.uploadBanner(storeId, file, bannerNumber);
        },
    });

    const uploadGalleryMutation = useMutation({
        mutationFn: async (file: File) => {
            if (!storeId) throw new Error('No store ID');
            
            if (USE_MOCKS) {
                return { url: URL.createObjectURL(file) };
            }

            return sellerApi.uploadGallery(storeId, file);
        },
    });

    const deleteGalleryMutation = useMutation({
        mutationFn: async ({ index, mediaId }: { index: number; mediaId: number }) => {
            if (!storeId) throw new Error('No store ID');
            
            if (USE_MOCKS) {
                return { index };
            }

            await sellerApi.deleteGalleryItem(storeId, mediaId);
            return { index };
        },
        onSuccess: () => {
            // El componente maneja la actualización local
        }
    });

    const updateVisualMutation = useMutation({
        mutationFn: async (payload: {
            layout?: string;
            logo?: string;
            banner?: string;
            banner_secondary?: string;
            gallery?: string[];
        }) => {
            if (!storeId) throw new Error('No store ID');
            
            if (USE_MOCKS) {
                return payload;
            }

            return sellerApi.updateVisual(storeId, payload);
        },
        onSuccess: (_data, variables) => {
            queryClient.setQueryData(['seller', 'store', user?.id], (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    config: {
                        ...old.config,
                        layout: (variables.layout as '1' | '2' | '3') || old.config.layout,
                        visual: {
                            ...old.config.visual,
                            logo: variables.logo || old.config.visual.logo,
                            banner1: variables.banner || old.config.visual.banner1,
                            banner2: variables.banner_secondary || old.config.visual.banner2,
                            gallery: variables.gallery || old.config.visual.gallery,
                        }
                    }
                };
            });
        }
    });

    const updateStoreMutation = useMutation({
        mutationFn: async ({ updates, branches, storeIdOverride }: { updates: Partial<ShopConfig>, branches?: Branch[], storeIdOverride?: number }) => {
            const currentStoreId = storeIdOverride || storeId;
            
            if (USE_MOCKS) {
                return { updates, branches };
            }

            if (currentStoreId && updates && Object.keys(updates).length > 0) {
                const categories = await categoryApi.list();
                
                const normalizeText = (text: string) => text.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                const categoryNameToId = (name: string): number | undefined => {
                    if (!name) return undefined;
                    const normalizedName = normalizeText(name);
                    const found = categories.find(c => normalizeText(c.name) === normalizedName || normalizeText(c.name).includes(normalizedName) || normalizedName.includes(normalizeText(c.name)));
                    return found?.id;
                };

                const categoryId = categoryNameToId(updates.category || '');

                const payload: UpdateStorePayload = {
                    store_name: updates.name,
                    description: updates.description,
                    category_id: categoryId,
                    activity: updates.activity,
                    corporate_email: updates.email,
                    phone: updates.phone,
                    address: updates.address,
                    instagram: updates.social?.instagram,
                    facebook: updates.social?.facebook,
                    tiktok: updates.social?.tiktok,
                    whatsapp: updates.social?.whatsapp,
                    youtube: updates.social?.youtube,
                    twitter: updates.social?.twitter,
                    linkedin: updates.social?.linkedin,
                    website: updates.social?.website,
                };

                await sellerApi.updateStore(currentStoreId!, payload);
            }

            if (branches && currentStoreId) {
                const branchesPayload = branches.map(b => ({
                    id: b.id !== 'new' ? parseInt(b.id) : undefined,
                    name: b.name,
                    address: b.address,
                    city: b.city,
                    phone: b.phone,
                    hours: b.hours,
                    is_principal: b.isPrincipal,
                    maps_url: b.mapsUrl,
                }));
                await sellerApi.updateBranches(currentStoreId!, branchesPayload);
            }

            return { updates, branches };
        },
        onSuccess: (variables) => {
            queryClient.setQueryData(['seller', 'store', user?.id], (old: any) => {
                if (!old) return old;
                return {
                    config: { ...old.config, ...variables.updates },
                    branches: variables.branches || old.branches,
                    storeId: old.storeId
                };
            });
        }
    });

    const pendingLayoutUpdate = React.useRef<string | null>(null);
    const pendingUpdates = React.useRef<Partial<ShopConfig>>({});

    const handleUpdateConfig = (updates: Partial<ShopConfig>) => {
        if (updates.layout) {
            pendingLayoutUpdate.current = updates.layout;
        }
        pendingUpdates.current = { ...pendingUpdates.current, ...updates };
        queryClient.setQueryData(['seller', 'store', user?.id], (old: any) => {
            if (!old) return old;
            return {
                config: { ...old.config, ...updates },
                branches: old.branches,
                storeId: old.storeId
            };
        });
    };

    const handleSave = (callback?: () => void) => {
        const cachedData = queryClient.getQueryData(['seller', 'store', user?.id]) as any;
        const currentStoreId = cachedData?.storeId;
        
        const updates = pendingUpdates.current;
        const layoutUpdate = pendingLayoutUpdate.current;

        const saveLayout = () => {
            if (layoutUpdate && currentStoreId) {
                updateVisualMutation.mutate({ layout: layoutUpdate }, {
                    onSuccess: () => {
                        pendingLayoutUpdate.current = null;
                        if (callback) callback();
                    },
                    onError: () => {
                        pendingLayoutUpdate.current = null;
                        if (callback) callback();
                    }
                });
            } else {
                if (callback) callback();
            }
        };

        if (Object.keys(updates).length > 0) {
            updateStoreMutation.mutate({ 
                updates, 
                branches: undefined,
                storeIdOverride: currentStoreId 
            }, {
                onSuccess: () => {
                    pendingUpdates.current = {};
                    saveLayout();
                }
            });
        } else {
            saveLayout();
        }
    };

    return {
        config: data?.config || null,
        branches: data?.branches || [],
        loading: isLoading,
        saving: updateStoreMutation.isPending,
        uploadingPolicy: uploadPolicyMutation.isPending,
        uploadingImage: uploadLogoMutation.isPending || uploadBannerMutation.isPending || uploadGalleryMutation.isPending,
        error,
        storeId,
        handleUpdateConfig,
        handleSave,
        updateBranches: (branches: Branch[]) => updateStoreMutation.mutate({ updates: {}, branches }),
        uploadPolicy: (type: 'shipping' | 'return' | 'privacy', file: File) => 
            uploadPolicyMutation.mutateAsync({ type, file }),
        deletePolicy: (type: 'shipping' | 'return' | 'privacy') => 
            deletePolicyMutation.mutateAsync(type),
        uploadLogo: (file: File) => {
            if (!storeId) throw new Error('Tienda no cargada. Por favor espera.');
            return uploadLogoMutation.mutateAsync(file);
        },
        uploadBanner: (file: File, bannerNumber: 1 | 2) => {
            if (!storeId) throw new Error('Tienda no cargada. Por favor espera.');
            return uploadBannerMutation.mutateAsync({ file, bannerNumber });
        },
        uploadGallery: (file: File) => {
            if (!storeId) throw new Error('Tienda no cargada. Por favor espera.');
            return uploadGalleryMutation.mutateAsync(file);
        },
        deleteGalleryItem: (index: number, mediaId: number) => {
            if (!storeId) throw new Error('Tienda no cargada. Por favor espera.');
            return deleteGalleryMutation.mutateAsync({ index, mediaId });
        },
        updateVisual: (payload: {
            layout?: '1' | '2' | '3';
            logo?: string;
            banner?: string;
            banner_secondary?: string;
            gallery?: string[];
        }) => {
            if (!storeId) throw new Error('Tienda no cargada. Por favor espera.');
            return updateVisualMutation.mutateAsync(payload);
        },
        refresh: refetch
    };
}
