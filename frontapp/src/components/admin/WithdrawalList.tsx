'use client';

import { useEffect, useState } from 'react';
import { getWithdrawals } from '@/shared/lib/api';
import { Withdrawal } from '@/lib/types/wp/wp-types';
import Icon from '@/components/ui/Icon';
import DataTable, { Column } from '@/components/ui/DataTable';
import { formatCurrency } from '@/shared/lib/utils/formatters';

const getStatusStyles = (status: number) => {
    switch (status) {
        case 1: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        case 0: return 'bg-amber-50 text-amber-600 border-amber-100';
        case 2: return 'bg-rose-50 text-rose-600 border-rose-100';
        default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
};

const getStatusLabel = (status: number) => {
    switch (status) {
        case 1: return 'Completado';
        case 0: return 'Pendiente';
        case 2: return 'Cancelado';
        default: return 'Desconocido';
    }
};

const columns: Column<Withdrawal>[] = [
    {
        key: 'id',
        header: 'ID / Fecha',
        render: (w) => (
            <div className="flex flex-col">
                <span className="text-sm font-black text-gray-900 leading-none">#{w.id}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                    {new Date(w.created).toLocaleDateString()}
                </span>
            </div>
        )
    },
    {
        key: 'store',
        header: 'Tienda',
        render: (w) => (
            <div className="flex flex-col">
                <span className="text-sm font-black text-gray-900 uppercase tracking-tight">
                    {w.user_data?.store_name || `Vendedor #${w.user_id}`}
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase">ID Usuario: {w.user_id}</span>
            </div>
        )
    },
    {
        key: 'amount',
        header: 'Monto',
        render: (w) => <span className="text-sm font-black text-gray-900 uppercase">{formatCurrency(Number(w.amount) || 0)}</span>
    },
    {
        key: 'method',
        header: 'Método',
        render: (w) => (
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded">
                {w.method}
            </span>
        )
    },
    {
        key: 'status',
        header: 'Estado',
        render: (w) => (
            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusStyles(w.status)}`}>
                {getStatusLabel(w.status)}
            </span>
        )
    },
    {
        key: 'actions',
        header: '',
        align: 'right',
        render: (w) => (
            <div className="flex items-center justify-end gap-2 text-gray-400">
                {w.status === 0 ? (
                    <>
                        <button 
                            className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all active:scale-90"
                            aria-label={`Aprobar retiro #${w.id}`}
                        >
                            <Icon name="Check" className="w-5 h-5" />
                        </button>
                        <button 
                            className="p-2 rounded-xl bg-gray-50 hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-90"
                            aria-label={`Rechazar retiro #${w.id}`}
                        >
                            <Icon name="X" className="w-5 h-5" />
                        </button>
                    </>
                ) : (
                    <button 
                        className="p-2 rounded-xl bg-gray-50 hover:bg-brand-sky/10 hover:text-brand-sky transition-all active:scale-90"
                        aria-label={`Ver detalles del retiro #${w.id}`}
                    >
                        <Icon name="FileText" className="w-5 h-5" />
                    </button>
                )}
            </div>
        )
    }
];

export default function WithdrawalList() {
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWithdrawals = async () => {
            try {
                setLoading(true);
                const data = await getWithdrawals();
                setWithdrawals(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching withdrawals:', err);
                setError('No se pudieron cargar las solicitudes de retiro.');
            } finally {
                setLoading(false);
            }
        };

        fetchWithdrawals();
    }, []);

    return (
        <DataTable
            data={withdrawals}
            columns={columns}
            loading={loading}
            error={error}
            loadingMessage="Cargando Solicitudes..."
            errorTitle="Error de Retiros"
            emptyTitle="Sin retiros"
            emptyDescription="No hay solicitudes de retiro"
            emptyIcon="Banknote"
            onRetry={() => window.location.reload()}
            keyField="id"
        />
    );
}
