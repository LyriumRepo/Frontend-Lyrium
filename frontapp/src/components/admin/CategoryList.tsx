'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getCategories } from '@/shared/lib/api';
import { ProductCategory } from '@/lib/types/wp/wp-types';
import Icon from '@/components/ui/Icon';
import DataTable, { Column } from '@/components/ui/DataTable';

const columns: Column<ProductCategory>[] = [
    {
        key: 'name',
        header: 'Nombre',
        render: (category) => (
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden border border-gray-200 group-hover:border-brand-sky/30 transition-all">
                    {category.image?.src ? (
                        <Image src={category.image.src || '/img/no-image.png'} alt={category.name} width={40} height={40} className="w-full h-full object-cover" />
                    ) : (
                        <Icon name="FolderTree" className="w-5 h-5 opacity-30" />
                    )}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-black text-gray-900 uppercase tracking-tight">{category.name}</span>
                    {category.description && (
                        <span className="text-[10px] text-gray-400 font-bold uppercase truncate max-w-[200px]">
                            {category.description.replace(/<[^>]*>?/gm, '')}
                        </span>
                    )}
                </div>
            </div>
        )
    },
    {
        key: 'slug',
        header: 'Slug',
        render: (category) => (
            <span className="px-2 py-0.5 bg-gray-100 rounded text-[9px] uppercase tracking-tighter">/{category.slug}</span>
        )
    },
    {
        key: 'count',
        header: 'Productos',
        render: (category) => (
            <span className="px-3 py-1 bg-brand-sky/5 text-brand-sky rounded-lg text-[10px] font-black uppercase tracking-widest border border-brand-sky/10">
                {category.count} Items
            </span>
        )
    },
    {
        key: 'actions',
        header: 'Acciones',
        align: 'right',
        render: (category) => (
            <div className="flex items-center justify-end gap-2">
                <button 
                    className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-brand-sky/10 hover:text-brand-sky transition-all active:scale-90"
                    aria-label={`Editar categoría ${category.name}`}
                >
                    <Icon name="Pencil" className="w-5 h-5" />
                </button>
                <button 
                    className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-90"
                    aria-label={`Eliminar categoría ${category.name}`}
                >
                    <Icon name="Trash2" className="w-5 h-5" />
                </button>
            </div>
        )
    }
];

export default function CategoryList() {
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const data = await getCategories();
                setCategories(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching categories:', err);
                setError('No se pudieron cargar las categorías. Verifique la conexión con WordPress.');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return (
        <DataTable
            data={categories}
            columns={columns}
            loading={loading}
            error={error}
            loadingMessage="Sincronizando Taxonomía..."
            errorTitle="Error de Categorías"
            emptyTitle="Sin categorías"
            emptyDescription="No hay categorías configuradas en el sistema"
            emptyIcon="FolderTree"
            emptySuggestion="Crea tu primera categoría en WooCommerce"
            onRetry={() => window.location.reload()}
            keyField="id"
            countLabel="Categorías"
        />
    );
}
