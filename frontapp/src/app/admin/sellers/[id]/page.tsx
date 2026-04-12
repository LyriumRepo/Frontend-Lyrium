import { Suspense } from 'react';
import { SellerDetailPageClient } from './SellerDetailPageClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function SellerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (<Suspense fallback={<BaseLoading message="Cargando vendedor..." />}><SellerDetailPageClient /></Suspense>);
}
