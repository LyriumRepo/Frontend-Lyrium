import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import type {
    LaravelProduct,
    LaravelProductsResponse,
    LaravelProductFilters,
} from '@/features/public/product/types';

const LARAVEL_BASE_URL = LARAVEL_API_URL.replace(/\/api\/?$/, '');

function resolveImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `${LARAVEL_BASE_URL}${url}`;
  return url;
}

type TransformedProduct = LaravelProduct & { image: string | null };

function transformProduct(product: LaravelProduct): TransformedProduct {
  return {
    ...product,
    image: resolveImageUrl(product.images?.[0]?.src) ?? null,
    images: product.images?.map((img) => ({
      ...img,
      src: resolveImageUrl(img.src) ?? img.src,
      thumb: img.thumb ? resolveImageUrl(img.thumb) ?? img.thumb : undefined,
      medium: img.medium ? resolveImageUrl(img.medium) ?? img.medium : undefined,
      large: img.large ? resolveImageUrl(img.large) ?? img.large : undefined,
    })),
  };
}

function transformProductsResponse(res: LaravelProductsResponse): LaravelProductsResponse {
  return {
    ...res,
    data: res.data.map(transformProduct),
  };
}

// ─── Helper de fetch con manejo de error tipado ───────────────────────────────
// Sigue el mismo patrón de request() de todos los repositories del proyecto
async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${LARAVEL_API_URL}${endpoint}`;
    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...options.headers,
        },
        next: { revalidate: 60 }, // cache de 60s — se revalida automáticamente
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message ?? error.error ?? `HTTP ${res.status}`);
    }

    return res.json() as Promise<T>;
}

// ─── Construir query string desde filtros ─────────────────────────────────────
function buildQuery(filters: LaravelProductFilters): string {
    const params = new URLSearchParams();
    if (filters.search)      params.set('search', filters.search);
    if (filters.category)    params.set('category', filters.category);
    if (filters.category_id) params.set('category_id', String(filters.category_id));
    if (filters.on_sale)     params.set('on_sale', 'true');
    if (filters.new)         params.set('new', 'true');
    if (filters.sticker)     params.set('sticker', filters.sticker);
    if (filters.inStock)     params.set('inStock', 'true');
    if (filters.status)      params.set('status', filters.status);
    if (filters.type)        params.set('type', filters.type);
    if (filters.slug)        params.set('slug', filters.slug);
    if (filters.per_page)    params.set('per_page', String(filters.per_page));
    if (filters.page)        params.set('page', String(filters.page));
    const qs = params.toString();
    return qs ? `?${qs}` : '';
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/products → lista paginada de productos aprobados
// ─────────────────────────────────────────────────────────────────────────────
export async function getPublicProducts(
    filters: LaravelProductFilters = {}
): Promise<LaravelProductsResponse> {
    return request<LaravelProductsResponse>(`/products${buildQuery(filters)}`).then(transformProductsResponse);
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/products/{id} → detalle de un producto por ID
// ─────────────────────────────────────────────────────────────────────────────
export async function getPublicProductById(
    id: string
): Promise<LaravelProduct> {
    return request<LaravelProduct>(`/products/${id}`).then(transformProduct);
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/products?slug={slug} → busca producto por slug
// El backend acepta slug como query param en el endpoint index
// ─────────────────────────────────────────────────────────────────────────────
export async function getPublicProductBySlug(
    slug: string
): Promise<LaravelProduct | null> {
    const res = await getPublicProducts({ slug, per_page: 1 });
    return res.data[0] ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/products?category={slug}&per_page=N → productos de una categoría
// ─────────────────────────────────────────────────────────────────────────────
export async function getProductsByCategory(
    categorySlug: string,
    perPage = 15
): Promise<LaravelProduct[]> {
    const res = await getPublicProducts({ category: categorySlug, per_page: perPage });
    return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/products?on_sale=true → productos en oferta
// ─────────────────────────────────────────────────────────────────────────────
export async function getOnSaleProducts(perPage = 8): Promise<LaravelProduct[]> {
    const res = await getPublicProducts({ on_sale: true, per_page: perPage });
    return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/products?new=true → productos nuevos (últimos 30 días)
// ─────────────────────────────────────────────────────────────────────────────
export async function getNewProducts(perPage = 8): Promise<LaravelProduct[]> {
    const res = await getPublicProducts({ new: true, per_page: perPage });
    return res.data;
}