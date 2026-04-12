'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/shared/lib/context/ToastContext';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import Icon from '@/components/ui/Icon';
import BaseButton from '@/components/ui/BaseButton';
import BaseLoading from '@/components/ui/BaseLoading';

// Components
import BranchManagement from './components/BranchManagement';
import StoreIdentity from './components/StoreIdentity';
import ContactSocial from './components/ContactSocial';
import Policies from './components/Policies';
import VisualIdentity from './components/VisualIdentity';
import StoreAwards from './components/StoreAwards';
import LayoutSelector from './components/LayoutSelector';
import { useSellerStore } from '@/features/seller/store/hooks/useSellerStore';
import { categoryApi } from '@/shared/lib/api/categoryRepository';

interface StorePageClientProps {
    // TODO Tarea 3: Recibir datos iniciales del Server Component
}

export function StorePageClient(_props: StorePageClientProps) {
    const {
        config,
        branches,
        updateBranches,
        loading,
        saving,
        uploadingPolicy,
        uploadingImage,
        handleUpdateConfig,
        handleSave: saveAction,
        uploadPolicy,
        deletePolicy,
        uploadLogo,
        uploadBanner,
        uploadGallery,
        deleteGalleryItem,
        error,
        storeId
    } = useSellerStore();

    const { data: categories = [] } = useQuery({
        queryKey: ['categories', 'for-dropdown'],
        queryFn: () => categoryApi.list(),
        staleTime: Infinity,
    });

    const { showToast } = useToast();

    const handleSave = () => {
        saveAction(() => {
            showToast('Cambios guardados exitosamente', 'success');
        });
    };

    if (loading) {
        return <BaseLoading message="Cargando Gestor de Tienda..." />;
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-2xl p-6 max-w-md mx-auto">
                    <p className="text-red-600 dark:text-red-400 font-bold mb-2">Error al cargar tienda</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{error.message}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    if (!config) return <BaseLoading message="Cargando datos de la tienda..." />;

    return (
        <div className="space-y-8 pb-20">
            <ModuleHeader
                title="Configuración de Mi Tienda"
                subtitle="Gestión integral de identidad, sucursales y experiencia visual"
                actions={
                    <BaseButton
                        variant="action"
                        onClick={handleSave}
                        isLoading={saving}
                        leftIcon="Save"
                    >
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </BaseButton>
                }
            />

            <div className="animate-fadeIn">
                <BranchManagement branches={branches} setBranches={updateBranches} />
                <StoreIdentity config={config!} updateConfig={handleUpdateConfig} categories={categories} />
                <ContactSocial config={config!} updateConfig={handleUpdateConfig} />
                <Policies 
                    config={config!} 
                    updateConfig={handleUpdateConfig}
                    uploadPolicy={uploadPolicy}
                    deletePolicy={deletePolicy}
                    isUploading={uploadingPolicy}
                />
                <VisualIdentity 
                    config={config!} 
                    updateConfig={handleUpdateConfig}
                    uploadLogo={uploadLogo}
                    uploadBanner={uploadBanner}
                    uploadGallery={uploadGallery}
                    deleteGalleryItem={deleteGalleryItem}
                    isUploading={uploadingImage}
                    storeId={storeId}
                />
                <StoreAwards config={config!} />
                <LayoutSelector config={config!} updateConfig={handleUpdateConfig} />
            </div>
        </div>
    );
}
