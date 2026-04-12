import { Suspense } from 'react';
import { FinancePageClient } from '@/features/seller/finance/FinancePageClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function FinancePage() {
    // TODO Tarea 3: Cuando se implemente la API real, obtener datos aquí
    
    return (
        <Suspense fallback={<BaseLoading message="Cargando finanzas..." />}>
            <FinancePageClient />
        </Suspense>
    );
}
