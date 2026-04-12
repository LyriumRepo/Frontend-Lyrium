import { Suspense } from 'react';
import { AgendaPageClient } from '@/features/seller/agenda/AgendaPageClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function AgendaPage() {
    // TODO Tarea 3: Cuando se implemente la API real, obtener datos aquí
    
    return (
        <Suspense fallback={<BaseLoading message="Cargando agenda..." />}>
            <AgendaPageClient />
        </Suspense>
    );
}
