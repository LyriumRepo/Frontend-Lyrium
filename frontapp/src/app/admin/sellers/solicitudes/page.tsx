import { Suspense } from 'react';
import SellersSolicitudes from '@/features/admin/sellers/SellersSolicitudes';
import BaseLoading from '@/components/ui/BaseLoading';

export default function SellersSolicitudesPage() {
    return (
        <Suspense fallback={<BaseLoading message="Cargando solicitudes..." />}>
            <SellersSolicitudes />
        </Suspense>
    );
}
