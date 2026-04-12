'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getProducts } from '@/shared/lib/api';
import { Product } from '@/lib/types/wp/wp-types';
import Icon from '@/components/ui/Icon';
import DataTable, { Column } from '@/components/ui/DataTable';
import BaseLoading from '@/components/ui/BaseLoading';
import BaseErrorState from '@/components/ui/BaseErrorState';
import BaseEmptyState from '@/components/ui/BaseEmptyState';

const columns: Column<Product>[] = [
    {
        key: 'sku',
        header: 'SKU / ID',
        render: (p) => (
            <div className="flex flex-col">
                <span className="text-xs font-black text-gray-900 uppercase">{p.sku || 'SIN-SKU'}</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase">ID: #{p.id}</span>
            </div>
        )
    },
    {
        key: 'name',
        header: 'Producto',
        render: (product) => (
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden border border-gray-200">
                    {product.images?.[0]?.src ? (
                        <Image src={product.images[0].src || '/img/no-image.png'} alt={product.name} width={40} height={40} className="w-full h-full object-cover" />
                    ) : (
                        <Icon name="Image" className="w-6 h-6 opacity-30" />
                    )}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-black text-gray-900 uppercase tracking-tight">{product.name}</span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase">en {product.store?.shop_name || 'Tienda Oficial'}</span>
                </div>
            </div>
        )
    },
    {
        key: 'stock',
        header: 'Existencias',
        render: (p) => (
            <div className="flex items-center gap-2">
                <span className={`text-sm font-black ${p.stock_status === 'outofstock' ? 'text-rose-500' :
                    (p.manage_stock && p.stock_quantity !== null && p.stock_quantity <= 5) ? 'text-amber-500' : 'text-emerald-500'
                    }`}>
                    {p.manage_stock ? (p.stock_quantity ?? 0) : 'Stock Simple'}
                </span>
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${p.stock_status === 'instock' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {p.stock_status === 'instock' ? 'Disponible' : 'Agotado'}
                </span>
            </div>
        )
    },
    {
        key: 'actions',
        header: '',
        align: 'right',
        render: () => (
            <button 
                className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-brand-sky/10 hover:text-brand-sky transition-all active:scale-90"
                aria-label="Actualizar inventario"
            >
                <Icon name="RotateCcw" className="w-5 h-5" />
            </button>
        )
    }
];

export default function InventoryList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const data = await getProducts();
                setProducts(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching inventory:', err);
                setError('No se pudo cargar el inventario. Verifique la conexión.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const filteredProducts = products.filter(p => {
        if (filter === 'low') return p.manage_stock && p.stock_quantity !== null && p.stock_quantity > 0 && p.stock_quantity <= 5;
        if (filter === 'out') return p.stock_status === 'outofstock' || (p.manage_stock && p.stock_quantity === 0);
        return true;
    });

    if (loading) {
        return <BaseLoading message="Analizando Existencias..." variant="card" />;
    }

    if (error) {
        return (
            <BaseErrorState
                title="Error de Inventario"
                message={error}
                icon="Package"
                onRetry={() => window.location.reload()}
            />
        );
    }

    if (products.length === 0) {
        return (
            <BaseEmptyState
                title="Sin productos"
                description="No hay productos en el inventario"
                icon="Package"
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="group" aria-label="Filtros de inventario">
                <button
                    onClick={() => setFilter('all')}
                    aria-pressed={filter === 'all'}
                    className={`p-6 rounded-3xl border transition-all text-left ${filter === 'all' ? 'bg-brand-sky border-brand-sky text-white shadow-lg shadow-brand-sky/20' : 'bg-white border-gray-100 text-gray-500 hover:border-brand-sky/30'}`}
                >
                    <div className="flex items-center justify-between">
                        <Icon name="Package" className="w-8 h-8" aria-hidden="true" />
                        <span className="text-2xl font-black">{products.length}</span>
                    </div>
                    <p className="mt-4 font-black uppercase tracking-widest text-[10px]">Total Productos</p>
                </button>

                <button
                    onClick={() => setFilter('low')}
                    aria-pressed={filter === 'low'}
                    className={`p-6 rounded-3xl border transition-all text-left ${filter === 'low' ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-white border-gray-100 text-gray-500 hover:border-amber-500/30'}`}
                >
                    <div className="flex items-center justify-between">
                        <Icon name="AlertCircle" className="w-8 h-8" aria-hidden="true" />
                        <span className="text-2xl font-black">{products.filter(p => p.manage_stock && p.stock_quantity !== null && p.stock_quantity > 0 && p.stock_quantity <= 5).length}</span>
                    </div>
                    <p className="mt-4 font-black uppercase tracking-widest text-[10px]">Stock Bajo ( &lt; 5 )</p>
                </button>

                <button
                    onClick={() => setFilter('out')}
                    aria-pressed={filter === 'out'}
                    className={`p-6 rounded-3xl border transition-all text-left ${filter === 'out' ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-white border-gray-100 text-gray-500 hover:border-rose-500/30'}`}
                >
                    <div className="flex items-center justify-between">
                        <Icon name="XCircle" className="w-8 h-8" aria-hidden="true" />
                        <span className="text-2xl font-black">{products.filter(p => p.stock_status === 'outofstock' || (p.manage_stock && p.stock_quantity === 0)).length}</span>
                    </div>
                    <p className="mt-4 font-black uppercase tracking-widest text-[10px]">Agotados</p>
                </button>
            </div>

            <DataTable
                data={filteredProducts}
                columns={columns}
                loading={false}
                error={null}
                emptyTitle="Sin productos"
                emptyDescription={`No hay productos con stock ${filter === 'low' ? 'bajo' : filter === 'out' ? 'agotado' : ''}`}
                emptyIcon="Package"
                keyField="id"
            />
        </div>
    );
}
