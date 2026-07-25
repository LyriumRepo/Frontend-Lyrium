import { Suspense } from 'react';
import { BioForoApprovalClient } from '@/features/admin/bioforo/BioForoApprovalClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default function BioForoApprovalPage() {
    return (
        <Suspense fallback={<BaseLoading message="Cargando panel de aprobación..." />}>
            <BioForoApprovalClient />
        </Suspense>
    );
}
