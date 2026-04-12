'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getProducts } from '@/shared/lib/api';
import { Product } from '@/lib/types/wp/wp-types';
import Icon from '@/components/ui/Icon';
import DataTable, { Column } from '@/components/ui/DataTable';
import { formatCurrency } from '@/shared/lib/utils/formatters';

const columns: Column<Product>[] = [
    {
        key: 'id',
        header: 'ID',
        render: (p) => <span className="text-xs font-black text-gray-400">#{p.id}</span>
    },
    {
        key: 'name',
        header: 'Producto',
        render: (product) => (
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden border border-gray-200 group-hover:border-brand-sky/30 transition-all">
                    {product.images?.[0]?.src ? (
                        <Image src={product.images[0].src || '/img/no-image.png'} alt={product.name} width={48} height={48} className="w-full h-full object-cover" />
                    ) : (
                        <Icon name="Image" className="w-6 h-6 opacity-30" />
                    )}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-black text-gray-900 uppercase tracking-tight">{product.name}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] text-brand-sky font-black uppercase tracking-widest bg-brand-sky/10 px-2 py-0.5 rounded-md">
                            {product.categories?.[0]?.name || 'Sin Categoría'}
                        </span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase">
                            en {product.store?.shop_name || 'Tienda Oficial'}
                        </span>
                    </div>
                </div>
            </div>
        )
    },
    {
        key: 'price',
        header: 'Precio',
        render: (p) => (
            <div className="flex flex-col">
                <span className="text-sm font-black text-gray-900">{formatCurrency(Number(p.price) || 0)}</span>
                {p.regular_price !== p.price && (
                    <span className="text-[10px] text-gray-400 line-through font-bold">{formatCurrency(Number(p.regular_price) || 0)}</span>
                )}
            </div>
        )
    },
    {
        key: 'status',
        header: 'Estado',
        render: (p) => (
            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${p.status === 'publish' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                {p.status === 'publish' ? 'Publicado' : 'Borrador'}
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
                    aria-label="Editar producto"
                >
                    <Icon name="Pencil" className="w-5 h-5" />
                </button>
                <button 
                    className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-90"
                    aria-label="Eliminar producto"
                >
                    <Icon name="Trash2" className="w-5 h-5" />
                </button>
            </div>
        )
    }
];

export default function ProductList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const data = await getProducts();
                setProducts(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('No se pudieron cargar los productos. Verifique la conexión con WordPress.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <DataTable
            data={products}
            columns={columns}
            loading={loading}
            error={error}
            loadingMessage="Sincronizando Catálogo..."
            errorTitle="Error de Catálogo"
            emptyTitle="Sin productos"
            emptyDescription="No hay productos registrados en el sistema"
            emptyIcon="Package"
            emptySuggestion="Sincroniza tu catálogo desde WooCommerce"
            onRetry={() => window.location.reload()}
            keyField="id"
        />
    );
}
