import { notFound } from 'next/navigation';
import ServicesCategoryPageClient from './ServicesCategoryPageClient';

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';

interface PageProps {
    params: Promise<{ categoria: string }>;
}

async function getCategoryBySlug(slug: string) {
    const res = await fetch(`${LARAVEL_API_URL}/categories?type=service&search=${slug}&per_page=50`, {
        next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const items: any[] = data.data ?? [];
    return items.find((c: any) => c.slug === slug) ?? null;
}

async function getServicesByCategory(categorySlug: string) {
    const res = await fetch(
        `${LARAVEL_API_URL}/services?category_slug=${categorySlug}&per_page=50`,
        { next: { revalidate: 30 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
}

async function getServiceCategories() {
    const res = await fetch(`${LARAVEL_API_URL}/categories?type=service&per_page=100`, {
        next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
}

export default async function ServicesCategoryPage({ params }: PageProps) {
    const { categoria } = await params;

    const [category, services, allCategories] = await Promise.all([
        getCategoryBySlug(categoria),
        getServicesByCategory(categoria),
        getServiceCategories(),
    ]);

    if (!category) {
        notFound();
    }

    return (
        <ServicesCategoryPageClient
            category={category}
            services={services}
            allCategories={allCategories}
        />
    );
}