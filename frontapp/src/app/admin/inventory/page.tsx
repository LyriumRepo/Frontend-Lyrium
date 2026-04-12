import { Suspense } from 'react';
import { InventoryPageClient } from '@/features/admin/inventory/InventoryPageClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function InventoryPage() {
    return (
        <Suspense fallback={<BaseLoading message="Cargando inventario..." />}>
            <InventoryPageClient />
        </Suspense>
    );
}
