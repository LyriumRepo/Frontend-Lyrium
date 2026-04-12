import { Suspense } from 'react';
import { SellersPageClient } from '@/features/admin/sellers/SellersPageClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function SellersPage() {
    // TODO Tarea 3: Cuando se implemente la API real, obtener datos aquí
    return (
        <Suspense fallback={<BaseLoading message="Cargando vendedores..." />}>
            <SellersPageClient />
        </Suspense>
    );
}
