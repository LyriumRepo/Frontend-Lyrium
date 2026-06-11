import { Suspense } from 'react';
import { AgendaPageClient } from '@/features/seller/agenda/AgendaPageClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function AgendaPage() {
    return (
        <Suspense fallback={<BaseLoading message="Cargando agenda..." />}>
            <AgendaPageClient />
        </Suspense>
    );
}
