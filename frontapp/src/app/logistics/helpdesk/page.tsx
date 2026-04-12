import { Suspense } from 'react';
import { LogisticsHelpdeskPageClient } from './LogisticsHelpdeskPageClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function LogisticsHelpdeskPage() {
    return (<Suspense fallback={<BaseLoading message="Cargando helpdesk..." />}><LogisticsHelpdeskPageClient /></Suspense>);
}
