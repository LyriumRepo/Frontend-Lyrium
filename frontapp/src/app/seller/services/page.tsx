import { Suspense } from 'react';
import { ServicesPageClient } from '@/features/seller/services/ServicesPageClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function ServicesPage() {
    // TODO Tarea 3: Cuando se implemente la API real, obtener datos aquí
    
    return (
        <Suspense fallback={<BaseLoading message="Cargando servicios..." />}>
            <ServicesPageClient />
        </Suspense>
    );
}
