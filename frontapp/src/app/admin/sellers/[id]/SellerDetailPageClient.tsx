'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { getDetailStore } from '@/shared/lib/api';
import { Store } from '@/lib/types/stores/store';
import { ArrowLeft } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface SellerDetailPageClientProps { }
export function SellerDetailPageClient(_props: SellerDetailPageClientProps) {
    const params = useParams();
    const router = useRouter();
    const [store, setStore] = useState<Store | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const id = params?.id as string;

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true);
                const data = await getDetailStore(id);
                setStore(data);
                setError(null);
            } catch (err) {
                setError('No se pudo cargar la información.');
            } finally { setLoading(false); }
        };
        if (id) fetchDetail();
    }, [id]);

    return (
        <div className="space-y-8 animate-fadeIn font-industrial pb-20">
            <ModuleHeader title="Detalle del Vendedor" subtitle={`ID: ${id}`} icon="User" actions={<button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-700"><ArrowLeft className="w-4 h-4" />Volver</button>} />
            {loading ? <div className="p-20 text-center text-gray-400">Cargando...</div> : error ? <div className="p-6 bg-rose-50 rounded-[2rem] text-rose-600">{error}</div> : store ? (
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-black text-gray-900">Detalles del vendedor</h3>
                    <p className="text-gray-400 text-sm mt-2">ID: {store.id}</p>
                </div>
            ) : null}
        </div>
    );
}
