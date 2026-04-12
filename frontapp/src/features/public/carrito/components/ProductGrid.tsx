'use client';

import { SearchX } from 'lucide-react';
import ProductCard from './ProductCard';
import { useCarritoStore } from '@/store/carritoStore';

interface Props {
    onAdd: (id: number | string) => void;
    onView: (id: number | string) => void;
}

export default function ProductGrid({ onAdd, onView }: Props) {
    const products = useCarritoStore((s) => s.filteredProducts);

    if (products.length === 0) {
        return (
            <div className="mt-8 bg-white dark:bg-[var(--bg-card)] border border-sky-50 dark:border-[var(--border-subtle)] rounded-3xl p-10 text-center shadow-sm">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 grid place-items-center mb-4">
                    <SearchX className="w-7 h-7" />
                </div>
                <p className="text-slate-700 dark:text-[var(--text-primary)] text-lg font-medium">No encontramos productos</p>
                <p className="text-sm text-slate-400 dark:text-[var(--text-muted)] mt-1">Prueba con otro término o ajusta el precio.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
                <ProductCard key={p.id} product={p} onAdd={onAdd} onView={onView} />
            ))}
        </div>
    );
}
