import { Suspense } from 'react';
import { HelpdeskPageClient } from '@/features/admin/helpdesk/HelpdeskPageClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function HelpdeskPage() {
    return (<Suspense fallback={<BaseLoading message="Cargando helpdesk..." />}><HelpdeskPageClient /></Suspense>);
}
