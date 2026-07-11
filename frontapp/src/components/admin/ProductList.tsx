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
        render: (p) => <span className="text-xs font-black text-[var(--text-muted)]">#{p.id}</span>
    },
    {
        key: 'name',
        header: 'Producto',
        render: (product) => (
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--bg-muted)] flex items-center justify-center text-[var(--text-muted)] overflow-hidden border border-[var(--border-subtle)] group-hover:border-[var(--icons-green)]/30 transition-all">
                    {product.images?.[0]?.src ? (
                        <Image src={product.images[0].src || '/img/no-image.png'} alt={product.name} width={48} height={48} className="w-full h-full object-cover" />
                    ) : (
                        <Icon name="Image" className="w-6 h-6 opacity-30" />
                    )}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">{product.name}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] text-[var(--icons-green)] font-black uppercase tracking-widest bg-[var(--icons-green)]/10 px-2 py-0.5 rounded-md">
                            {product.categories?.[0]?.name || 'Sin Categoría'}
                        </span>
                        <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase">
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
                <span className="text-sm font-black text-[var(--text-primary)]">{formatCurrency(Number(p.price) || 0)}</span>
                {p.regular_price !== p.price && (
                    <span className="text-[10px] text-[var(--text-muted)] line-through font-bold">{formatCurrency(Number(p.regular_price) || 0)}</span>
                )}
            </div>
        )
    },
    {
        key: 'status',
        header: 'Estado',
        render: (p) => (
            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${p.status === 'publish' ? 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20' : 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20'}`}>
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
                    className="p-2 rounded-xl bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--icons-green)]/10 hover:text-[var(--icons-green)] transition-all active:scale-90"
                    aria-label="Editar producto"
                >
                    <Icon name="Pencil" className="w-5 h-5" />
                </button>
                <button 
                    className="p-2 rounded-xl bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)] transition-all active:scale-90"
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
