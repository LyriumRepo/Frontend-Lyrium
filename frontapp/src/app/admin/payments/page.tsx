import { Suspense } from 'react';
import { PaymentsPageClient } from '@/features/admin/payments/PaymentsPageClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function TreasuryPage() {
    return (<Suspense fallback={<BaseLoading message="Cargando pagos..." />}><PaymentsPageClient /></Suspense>);
}
