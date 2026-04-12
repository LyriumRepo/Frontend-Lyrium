'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { MenuItem, MegaCategoryData } from '@/data/menuData';

interface ApiCategory {
    id: number;
    name: string;
    slug: string;
    type: string;
    image: string | null;
    children: {
        id: number;
        name: string;
        slug: string;
        image: string | null;
        href: string;
        children: {
            id: number;
            name: string;
            slug: string;
            href: string;
        }[];
    }[];
}

function apiToMegaMenuFormat(categories: ApiCategory[]): {
    menuItems: MenuItem[];
    megaMenuData: Record<string, MegaCategoryData>;
} {
    const productCats = categories.filter(c => c.type !== 'service');
    const serviceCats = categories.filter(c => c.type === 'service');

    const buildMegaData = (cats: ApiCategory[]): Record<string, MegaCategoryData> => {
        const data: Record<string, MegaCategoryData> = {};
        cats.forEach(cat => {
            data[cat.name] = {
                icons: cat.children.map(sub => ({
                    title: sub.name,
                    img: sub.image || '/img/placeholder-category.webp',
                    href: sub.href,
                })),
                cols: cat.children
                    .filter(sub => sub.children.length > 0)
                    .map(sub => ({
                        h: sub.name.toUpperCase(),
                        items: sub.children.map(subsub => subsub.name),
                    })),
            };
        });
        return data;
    };

    const productMenuChildren = productCats.map(cat => ({
        label: cat.name,
        href: `/productos/${cat.slug}`,
        children: cat.children.map(sub => ({
            label: sub.name,
            href: sub.href,
            children: sub.children.map(subsub => ({
                label: subsub.name,
                href: subsub.href,
            })),
        })),
    }));

    const serviceMenuChildren = serviceCats.map(cat => ({
        label: cat.name,
        href: `/servicios/${cat.slug}`,
        children: cat.children.map(sub => ({
            label: sub.name,
            href: sub.href,
            children: sub.children.map(subsub => ({
                label: subsub.name,
                href: subsub.href,
            })),
        })),
    }));

    const menuItems: MenuItem[] = [];

    if (productMenuChildren.length > 0) {
        menuItems.push({
            label: 'PRODUCTOS',
            href: '/productos',
            icon: 'shopping-bag',
            children: productMenuChildren,
        });
    }

    if (serviceMenuChildren.length > 0) {
        menuItems.push({
            label: 'SERVICIOS',
            href: '/servicios',
            icon: 'headset',
            children: serviceMenuChildren,
        });
    }

    const megaMenuData = {
        ...buildMegaData(productCats),
        ...buildMegaData(serviceCats),
    };

    return { menuItems, megaMenuData };
}

export function useMegaMenu() {
    const { data: apiCategories, isLoading } = useQuery<ApiCategory[]>({
        queryKey: ['mega-menu'],
        queryFn: async () => {
            const LARAVEL_API = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://127.0.0.1:8000/api';
            const res = await fetch(`${LARAVEL_API}/categories/mega-menu`, {
                headers: { 'Accept': 'application/json' },
            });
            if (!res.ok) return [];
            const json = await res.json();
            return json.data ?? [];
        },
        staleTime: 2 * 60 * 1000, // 2 min cache
    });

    const result = useMemo(
        () => apiToMegaMenuFormat(apiCategories || []),
        [apiCategories]
    );

    return {
        ...result,
        isLoading,
        hasData: (apiCategories?.length ?? 0) > 0,
    };
}
