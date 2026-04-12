'use client';

import { useEffect, useState } from 'react';
import { getOrders } from '@/shared/lib/api';
import { Order } from '@/lib/types/wp/wp-types';
import Icon from '@/components/ui/Icon';
import DataTable, { Column } from '@/components/ui/DataTable';
import { getStatusColor, getStatusLabel, OrderStatus } from '@/shared/lib/utils/order-utils';
import { formatCurrency } from '@/shared/lib/utils/formatters';

const columns: Column<Order>[] = [
    {
        key: 'id',
        header: 'Orden',
        render: (order) => (
            <div className="flex flex-col">
                <span className="text-sm font-black text-gray-900 leading-none">#{order.id}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                    {new Date(order.date_created).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
            </div>
        )
    },
    {
        key: 'billing',
        header: 'Cliente',
        render: (order) => (
            <div className="flex flex-col">
                <span className="text-sm font-black text-gray-900 uppercase tracking-tight">
                    {order.billing.first_name} {order.billing.last_name}
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase">{order.billing.email}</span>
            </div>
        )
    },
    {
        key: 'total',
        header: 'Total',
        render: (order) => (
            <div className="flex flex-col">
                <span className="text-sm font-black text-gray-900">{formatCurrency(Number(order.total) || 0)}</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                    {order.line_items.length} {order.line_items.length === 1 ? 'Producto' : 'Productos'}
                </span>
            </div>
        )
    },
    {
        key: 'status',
        header: 'Estado',
        render: (order) => (
            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusColor(order.status as OrderStatus)}`}>
                {getStatusLabel(order.status as OrderStatus)}
            </span>
        )
    },
    {
        key: 'actions',
        header: 'Acciones',
        align: 'right',
        render: () => (
            <div className="flex items-center justify-end gap-2">
                <button 
                    className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-brand-sky/10 hover:text-brand-sky transition-all active:scale-90"
                    aria-label="Ver detalles del pedido"
                >
                    <Icon name="Eye" className="w-5 h-5" />
                </button>
                <button 
                    className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-brand-sky/10 hover:text-brand-sky transition-all active:scale-90"
                    aria-label="Imprimir pedido"
                >
                    <Icon name="Printer" className="w-5 h-5" />
                </button>
            </div>
        )
    }
];

export default function OrderList() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const data = await getOrders();
                setOrders(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('No se pudieron cargar los pedidos. Verifique la conexión con WordPress.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    return (
        <DataTable
            data={orders}
            columns={columns}
            loading={loading}
            error={error}
            loadingMessage="Sincronizando Pedidos..."
            errorTitle="Error de Pedidos"
            emptyTitle="Sin pedidos"
            emptyDescription="No hay pedidos registrados en el sistema"
            emptyIcon="ShoppingCart"
            onRetry={() => window.location.reload()}
            keyField="id"
        />
    );
}
