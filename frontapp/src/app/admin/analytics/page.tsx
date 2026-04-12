import { Suspense } from 'react';
import { AnalyticsPageClient } from '@/features/admin/analytics/AnalyticsPageClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function AnalyticsPage() {
    return (<Suspense fallback={<BaseLoading message="Cargando analítica..." />}><AnalyticsPageClient /></Suspense>);
}
