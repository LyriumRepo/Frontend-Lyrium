import { Suspense } from 'react';
import { ContractsPageClient } from '@/features/admin/contracts/ContractsPageClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function ContractsPage() {
    return (<Suspense fallback={<BaseLoading message="Cargando contratos..." />}><ContractsPageClient /></Suspense>);
}
