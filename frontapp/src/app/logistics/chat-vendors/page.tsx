import { Suspense } from 'react';
import { LogisticsChatVendorsPageClient } from './LogisticsChatVendorsPageClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function LogisticsChatVendorsPage() {
    return (<Suspense fallback={<BaseLoading message="Cargando chat..." />}><LogisticsChatVendorsPageClient /></Suspense>);
}
