'use client';

import { useEffect, useState } from 'react';
import { getReviews } from '@/shared/lib/api';
import { ProductReview } from '@/lib/types/wp/wp-types';
import Icon from '@/components/ui/Icon';
import DataTable, { Column } from '@/components/ui/DataTable';

const renderStars = (rating: number) => (
    <div className="flex gap-0.5" role="img" aria-label={`${rating} de 5 estrellas`}>
        {[...Array(5)].map((_, i) => (
            <Icon key={`star-${i}`} name="Star" className={`w-3 h-3 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} aria-hidden="true" />
        ))}
    </div>
);

const columns: Column<ProductReview>[] = [
    {
        key: 'reviewer',
        header: 'Usuario',
        render: (r) => (
            <div className="flex flex-col">
                <span className="text-sm font-black text-gray-900">{r.reviewer}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase">{r.reviewer_email}</span>
            </div>
        )
    },
    {
        key: 'rating',
        header: 'Calificación',
        render: (r) => renderStars(r.rating)
    },
    {
        key: 'review',
        header: 'Comentario',
        render: (r) => <span className="text-xs text-gray-500 line-clamp-2 max-w-[300px]">{r.review}</span>
    },
    {
        key: 'date_created',
        header: 'Fecha',
        render: (r) => (
            <span className="text-xs font-bold text-gray-400">
                {new Date(r.date_created).toLocaleDateString('es-ES')}
            </span>
        )
    },
    {
        key: 'actions',
        header: '',
        align: 'right',
        render: () => (
            <div className="flex items-center justify-end gap-2">
                <button 
                    className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-brand-sky/10 hover:text-brand-sky transition-all active:scale-90"
                    aria-label="Ver detalles de la reseña"
                >
                    <Icon name="Star" className="w-5 h-5" />
                </button>
                <button 
                    className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-90"
                    aria-label="Eliminar reseña"
                >
                    <Icon name="Trash2" className="w-5 h-5" />
                </button>
            </div>
        )
    }
];

export default function ReviewList() {
    const [reviews, setReviews] = useState<ProductReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoading(true);
                const data = await getReviews();
                setReviews(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching reviews:', err);
                setError('No se pudieron cargar las revisiones. Verifique la conexión con WordPress.');
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    return (
        <DataTable
            data={reviews}
            columns={columns}
            loading={loading}
            error={error}
            loadingMessage="Cargando Reseñas..."
            errorTitle="Error de Reseñas"
            emptyTitle="Sin reseñas"
            emptyDescription="No hay reseñas de clientes"
            emptyIcon="Star"
            onRetry={() => window.location.reload()}
            keyField="id"
        />
    );
}
