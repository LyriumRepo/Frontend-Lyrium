import { Suspense } from 'react';
import { NubefactPageClient } from '@/features/admin/invoices/NubefactPageClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function AdminNubefactInvoicesPage() {
    return (<Suspense fallback={<BaseLoading message="Cargando comprobantes..." />}><NubefactPageClient /></Suspense>);
}
