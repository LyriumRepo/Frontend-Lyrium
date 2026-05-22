import { LARAVEL_API_URL } from '@/shared/lib/config/flags';

// ─── Tipos que coinciden con la respuesta real del backend Laravel ─────────────
// GET /api/categories y GET /api/categories/mega-menu
export interface LaravelCategory {
    id: number;
    name: string;
    slug: string;
    description?: string;
    parent?: number | null;
    image?: string | null;
    children?: LaravelCategory[];
    products_count: number;
}

export interface LaravelCategoriesResponse {
    data: LaravelCategory[];
}

// ─── Helper de fetch ──────────────────────────────────────────────────────────
async function request<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${LARAVEL_API_URL}${endpoint}`, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 300 }, // categorías cambian poco — cache 5 min
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} al obtener ${endpoint}`);
    return res.json() as Promise<T>;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/categories → todas las categorías (con hijos anidados)
// ─────────────────────────────────────────────────────────────────────────────
export async function getAllCategories(): Promise<LaravelCategory[]> {
    const res = await request<LaravelCategoriesResponse | LaravelCategory[]>('/categories?per_page=250');
    // El backend puede devolver { data: [...] } o directamente [...]
    return Array.isArray(res) ? res : (res as LaravelCategoriesResponse).data ?? [];
}

// ─────────────────────────────────────────────────────────────────────────────
// Busca una categoría por slug en la lista plana (incluyendo hijos)
// ─────────────────────────────────────────────────────────────────────────────
export function flattenCategories(cats: LaravelCategory[]): LaravelCategory[] {
    const result: LaravelCategory[] = [];
    for (const cat of cats) {
        result.push(cat);
        if (cat.children?.length) result.push(...flattenCategories(cat.children));
    }
    return result;
}

export async function getCategoryBySlug(slug: string): Promise<LaravelCategory | null> {
    const all = await getAllCategories();
    const flat = flattenCategories(all);
    return flat.find((c) => c.slug === slug) ?? null;
}


// ─────────────────────────────────────────────────────────────────────────────
// Categorías raíz (sin padre) — para la navegación entre categorías
// ─────────────────────────────────────────────────────────────────────────────
export async function getRootCategories(): Promise<LaravelCategory[]> {
    const all = await getAllCategories();
    return all.filter((c) => !c.parent);
}