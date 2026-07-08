import { Suspense } from 'react';
import { BioBlogApprovalClient } from '@/features/admin/bioblog/BioBlogApprovalClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default function BioBlogApprovalPage() {
    return (
        <Suspense fallback={<BaseLoading message="Cargando panel de aprobación..." />}>
            <BioBlogApprovalClient />
        </Suspense>
    );
}
