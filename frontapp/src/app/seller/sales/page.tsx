import { Suspense } from 'react';
import { SalesPageClient } from '@/features/seller/sales/SalesPageClient';
import { getRecentOrders, getSalesKPIs } from '@/shared/lib/actions/dashboard';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function SalesPage() {
    // TODO Tarea 3: Cuando USE_MOCKS=false, estos Server Actions llamarán a la API real
    // Por ahora usan datos mock pero el patrón Server→Client está listo
    const [orders, kpis] = await Promise.all([
        getRecentOrders(10),
        getSalesKPIs()
    ]);

    return (
        <Suspense fallback={<BaseLoading message="Cargando Centro de Ventas..." />}>
            <SalesPageClient initialOrders={orders} initialKPIs={kpis} />
        </Suspense>
    );
}
