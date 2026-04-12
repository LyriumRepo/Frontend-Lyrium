import { Suspense } from 'react';
import { StorePageClient } from '@/features/seller/store/StorePageClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function StorePage() {
    // TODO Tarea 3: Cuando se implemente la API real, obtener datos aquí
    
    return (
        <Suspense fallback={<BaseLoading message="Cargando tienda..." />}>
            <StorePageClient />
        </Suspense>
    );
}
