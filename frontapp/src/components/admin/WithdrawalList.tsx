'use client';

import { useEffect, useState } from 'react';
import { getWithdrawals } from '@/shared/lib/api';
import { Withdrawal } from '@/lib/types/wp/wp-types';
import Icon from '@/components/ui/Icon';
import DataTable, { Column } from '@/components/ui/DataTable';
import { formatCurrency } from '@/shared/lib/utils/formatters';

const getStatusStyles = (status: number) => {
    switch (status) {
        case 1: return 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20';
        case 0: return 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20';
        case 2: return 'bg-[var(--color-error)]/10 text-[var(--color-error)] border-[var(--color-error)]/20';
        default: return 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)]';
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
                <span className="text-sm font-black text-[var(--text-primary)] leading-none">#{w.id}</span>
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase mt-1">
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
                <span className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">
                    {w.user_data?.store_name || `Vendedor #${w.user_id}`}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">ID Usuario: {w.user_id}</span>
            </div>
        )
    },
    {
        key: 'amount',
        header: 'Monto',
        render: (w) => <span className="text-sm font-black text-[var(--text-primary)] uppercase">{formatCurrency(Number(w.amount) || 0)}</span>
    },
    {
        key: 'method',
        header: 'Método',
        render: (w) => (
            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest bg-[var(--bg-muted)] px-2 py-1 rounded">
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
            <div className="flex items-center justify-end gap-2 text-[var(--text-muted)]">
                {w.status === 0 ? (
                    <>
                        <button 
                            className="p-2 rounded-xl bg-[var(--color-success)]/10 text-[var(--color-success)] hover:bg-[var(--color-success)]/20 transition-all active:scale-90"
                            aria-label={`Aprobar retiro #${w.id}`}
                        >
                            <Icon name="Check" className="w-5 h-5" />
                        </button>
                        <button 
                            className="p-2 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)] transition-all active:scale-90"
                            aria-label={`Rechazar retiro #${w.id}`}
                        >
                            <Icon name="X" className="w-5 h-5" />
                        </button>
                    </>
                ) : (
                    <button 
                        className="p-2 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--icons-green)]/10 hover:text-[var(--icons-green)] transition-all active:scale-90"
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
