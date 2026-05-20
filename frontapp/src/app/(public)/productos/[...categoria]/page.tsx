import { notFound } from 'next/navigation';

import type { Metadata } from 'next';
import {
    getCategoryBySlug,
    getAllCategories,
    flattenCategories,
} from '@/shared/lib/api/laravelCategoryRepository';
import { getProductsByCategory } from '@/shared/lib/api/laravelProductRepository';
import CategoryPageClient from './CategoryPageClient';

// ─── IMPORTANTE: catch-all route ─────────────────────────────────────────────
// La carpeta se llama [...categoria] (con los tres puntos)
// para que Next.js capture rutas anidadas como:
//   /productos/bebes-recien-nacidos          → categoria = ['bebes-recien-nacidos']
//   /productos/bebes-recien-nacidos/bebes-alimentacion → categoria = ['bebes-recien-nacidos','bebes-alimentacion']
// Siempre usamos el ÚLTIMO segmento como slug real de la categoría.
// ─────────────────────────────────────────────────────────────────────────────

interface PageProps {
    params: Promise<{ categoria: string[] }>;
}

// ─── Metadata dinámica ────────────────────────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { categoria } = await params;
    const slug = categoria[categoria.length - 1]; // último segmento
    const category = await getCategoryBySlug(slug);

    if (!category) return { title: 'Categoría | Lyrium' };

    return {
        title: `${category.name} | Lyrium Biomarketplace`,
        description: category.description || `Explora nuestra selección de ${category.name} en Lyrium.`,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE — Server Component
// Resuelve el slug real (siempre el último segmento de la URL),
// carga los productos de esa categoría desde Laravel y renderiza el Client.
// ─────────────────────────────────────────────────────────────────────────────
export default async function CategoryPage({ params }: PageProps) {
    const { categoria } = await params;

    // Siempre el último segmento es el slug real de la categoría
    // Ej: ['bebes-recien-nacidos', 'bebes-alimentacion'] → 'bebes-alimentacion'
    const slug = categoria[categoria.length - 1];

    // Cargar en paralelo: categoría actual + productos + todas las categorías
    const [category, products, allCategories] = await Promise.all([
        getCategoryBySlug(slug),
        getProductsByCategory(slug, 50),
        getAllCategories(),
    ]);

    if (!category) {
        notFound();
    }

    // Categorías hermanas: mismas que tienen el mismo parent_id
    // Si la categoría no tiene padre → son las categorías raíz
    const flat = flattenCategories(allCategories);
    const siblingCategories = flat.filter(
        (c) => c.parent === (category.parent ?? null) && c.id !== category.id
    );

    // Incluir la categoría actual al inicio de los hermanos para la nav
    const navCategories = [category, ...siblingCategories];

    return (
        <CategoryPageClient
            category={category}
            products={products}
            siblingCategories={navCategories}
        />
    );
}