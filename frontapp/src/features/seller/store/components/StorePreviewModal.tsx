'use client';

import React, { useEffect, useState } from 'react';
import BaseModal from '@/components/ui/BaseModal';
import Icon from '@/components/ui/Icon';
import { Layout1, Layout2, Layout3, LayoutEmprende } from '@/components/store/layouts';
import { Tienda, Producto } from '@/types/public';
import { ShopConfig } from '@/features/seller/store/types';
import { LARAVEL_API_URL } from '@/shared/lib/config/flags';

interface StorePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    layoutId: string;
    config: ShopConfig | null;
    storeId: number | null;
}

const LAYOUT_MAP: Record<string, React.ComponentType<any>> = {
    '1': Layout1,
    '2': Layout2,
    '3': Layout3,
    'emprende': LayoutEmprende,
};

export default function StorePreviewModal({ isOpen, onClose, layoutId, config, storeId }: StorePreviewModalProps) {
    const [products, setProducts] = useState<Producto[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    useEffect(() => {
        if (!isOpen || !storeId) return;
        setLoadingProducts(true);
        fetch(`${LARAVEL_API_URL}/products?store_id=${storeId}&per_page=20&status=approved`)
            .then(r => r.json())
            .then(json => {
                if (json.success) {
                    setProducts(json.data.map((p: any) => ({
                        id: parseInt(p.id),
                        titulo: p.name,
                        precio: p.price,
                        imagen: p.images?.[0]?.src || '/img/product-placeholder.webp',
                        categoria: p.categories?.[0]?.name || undefined,
                        tag: p.sticker || undefined,
                        slug: p.slug,
                        descripcion: p.description,
                        precioAnterior: p.regular_price !== p.price ? p.regular_price : undefined,
                        reviews: p.rating?.count || 0,
                        stock: p.stock,
                    })));
                }
            })
            .catch(() => {})
            .finally(() => setLoadingProducts(false));
    }, [isOpen, storeId]);

    const store: Tienda & { layout?: string } = {
        id: storeId || 0,
        nombre: config?.name || 'Mi Tienda',
        slug: '',
        descripcion: config?.description || undefined,
        logo: config?.visual?.logo || undefined,
        banner: config?.visual?.banner1 || undefined,
        categoria: config?.category || undefined,
        direccion: config?.address || undefined,
        telefono: config?.phone || undefined,
        correo: config?.email || undefined,
        valoracion: config?.rating || 0,
        plan: config?.subscription?.plan?.name === 'Premium' ? 'premium' : 'basico',
        layout: layoutId,
        instagram: config?.social?.instagram || undefined,
        facebook: config?.social?.facebook || undefined,
        tiktok: config?.social?.tiktok || undefined,
        gallery: config?.visual?.gallery || undefined,
    };

    const LayoutComponent = LAYOUT_MAP[layoutId] || Layout1;

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Vista Previa de Tienda"
            subtitle={`Plantilla ${layoutId} • Vista previa en tiempo real`}
            size="full"
            accentColor="from-sky-500 via-sky-600 to-sky-700 dark:from-[var(--brand-green)] dark:via-[var(--icons-green)] dark:to-[var(--brand-green)]"
        >
            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0A0F0D] min-h-[600px]">
                {loadingProducts ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-gray-400 text-lg">Cargando productos...</div>
                    </div>
                ) : (
                    <div className="max-w-[1600px] mx-auto px-4 py-6">
                        <LayoutComponent
                            store={store}
                            products={products}
                            plan={store.plan || 'basico'}
                        />
                    </div>
                )}
            </div>
        </BaseModal>
    );
}
