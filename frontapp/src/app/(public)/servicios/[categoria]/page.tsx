import { notFound } from 'next/navigation';
import ServicesCategoryPageClient from './ServicesCategoryPageClient';

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';

interface PageProps {
    params: Promise<{ categoria: string }>;
    searchParams: Promise<{ sub?: string }>;
}

async function getCategoryBySlug(slug: string) {
    const res = await fetch(
        `${LARAVEL_API_URL}/categories/slug/${slug}`,
        {
            next: { revalidate: 60 },
        }
    );

    if (!res.ok) return null;

    const json = await res.json();

    return json.data;
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

export default async function ServicesCategoryPage({ params, searchParams }: PageProps) {
    const { categoria } = await params;
    const { sub } = await searchParams;
    const activeSlug = sub || categoria;

    const [category, services, allCategories] = await Promise.all([
        getCategoryBySlug(activeSlug),
        getServicesByCategory(activeSlug),
        getServiceCategories(),
    ]);
    console.log("activeSlug:", activeSlug);
    console.log("services:", services);

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