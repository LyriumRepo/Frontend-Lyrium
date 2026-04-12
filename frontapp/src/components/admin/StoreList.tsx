'use client';

import { useEffect, useState } from 'react';
import { getStores } from '@/shared/lib/api';
import { Store } from '@/lib/types/stores/store';
import Icon from '@/components/ui/Icon';
import DataTable, { Column } from '@/components/ui/DataTable';

const columns: Column<Store>[] = [
    {
        key: 'id',
        header: 'ID',
        render: (s) => <span className="text-xs font-black text-gray-400">#{s.id}</span>
    },
    {
        key: 'store_name',
        header: 'Tienda',
        render: (store) => (
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-sky/10 flex items-center justify-center text-brand-sky group-hover:bg-brand-sky group-hover:text-white transition-all font-black text-xs uppercase">
                    {store.store_name?.charAt(0) || 'T'}
                </div>
                <span className="text-sm font-black text-gray-900 uppercase tracking-tight">{store.store_name}</span>
            </div>
        )
    },
    {
        key: 'first_name',
        header: 'Propietario',
        render: (s) => <span className="text-xs font-bold text-gray-600">{s.first_name || 'Sin nombre'}</span>
    },
    {
        key: 'phone',
        header: 'Teléfono',
        render: (s) => <span className="text-xs font-mono text-gray-500">{s.phone || 'N/A'}</span>
    },
    {
        key: 'actions',
        header: 'Acciones',
        align: 'right',
        render: () => (
            <button 
                className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:bg-brand-sky/10 hover:text-brand-sky transition-all active:scale-90"
                aria-label="Ver detalles de la tienda"
            >
                <Icon name="Eye" className="w-5 h-5" />
            </button>
        )
    }
];

export default function StoreList() {
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStores = async () => {
            try {
                setLoading(true);
                const data = await getStores();
                setStores(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching stores:', err);
                setError('No se pudieron cargar las tiendas. Verifique la conexión con WordPress.');
            } finally {
                setLoading(false);
            }
        };

        fetchStores();
    }, []);

    return (
        <DataTable
            data={stores}
            columns={columns}
            loading={loading}
            error={error}
            loadingMessage="Sincronizando con WordPress..."
            errorTitle="Error de Conexión"
            emptyTitle="Sin tiendas"
            emptyDescription="No hay tiendas registradas en el sistema"
            emptyIcon="Store"
            onRetry={() => window.location.reload()}
            keyField="id"
        />
    );
}
