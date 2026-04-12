import { Suspense } from 'react';
import { LogisticsPageClient } from '@/features/seller/logistics/LogisticsPageClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function LogisticsPage() {
    // TODO Tarea 3: Cuando se implemente la API real, obtener datos aquí
    
    return (
        <Suspense fallback={<BaseLoading message="Cargando logística..." />}>
            <LogisticsPageClient />
        </Suspense>
    );
}
