import { Producto } from '@/types/public';

const API = process.env.NEXT_PUBLIC_LARAVEL_API_URL;
interface SearchProductsParams {
  query?: string;
  perPage?: number;
  minPrice?: string;
  maxPrice?: string;
  onSale?: boolean;
  sticker?: string;
  category?: string;
}

export async function getCategories() {
  const res = await fetch(`${API}/categories`, {
    next: { revalidate: 300 }
  });

  if (!res.ok) {
    console.error('Failed to fetch categories', res.status);
    return [];
  }

  return await res.json();
}

export async function getCategoryBySlug(categoryParam: string) {
  const isNumeric = /^\d+$/.test(categoryParam);

  const url = isNumeric
    ? `${API}/categories/${categoryParam}`
    : `${API}/categories/slug/${categoryParam}`;

  const res = await fetch(url, {
    next: { revalidate: 300 }
  });

  if (!res.ok) {
    console.error('Failed to fetch category:', categoryParam, res.status);
    return null;
  }

  const json = await res.json();

  return json.data || null;
}

export async function getProductsByCategorySlug(
  categorySlug: string,
  perPage = 20
) {
  const res = await fetch(
    `${API}/products?category=${categorySlug}&per_page=${perPage}`,
    {
      next: { revalidate: 300 } 
    }
  );

  if (!res.ok) {
    console.error('Failed to fetch products:', categorySlug, res.status);
    return [];
  }

  const json = await res.json();

  return Array.isArray(json.data)
    ? json.data
    : [];
}

export async function searchProducts({
  query = '',
  perPage = 10,
  minPrice,
  maxPrice,
  onSale,
  sticker,
  category,
}: SearchProductsParams = {}) {
  try {
    const params = new URLSearchParams();
    
    if (query)    params.set('search', query);
    if (perPage)  params.set('per_page', String(perPage));
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);
    if (onSale)   params.set('on_sale', 'true');
    if (sticker)  params.set('sticker', sticker);
    if (category) params.set('category', category);

    const res = await fetch(`${API}/products?${params.toString()}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

export async function searchCategories(query: string, perPage = 10) {
  try {
    const res = await fetch(
      `${API}/categories?search=${encodeURIComponent(query)}&per_page=${perPage}`,
      {
        next: { revalidate: 60 }
      }
    );

    if (!res.ok) return [];

    const json = await res.json();

    return Array.isArray(json.data)
      ? json.data
      : [];
  } catch {
    return [];
  }
}

export async function searchServices(params: {
  query?: string;
  perPage?: number;
  category?: string;
} = {}) {
  try {
    const { query = '', perPage = 10, category } = params;
    const urlParams = new URLSearchParams();

    if (query) urlParams.set('search', query);
    if (perPage) urlParams.set('per_page', String(perPage));
    if (category) urlParams.set('category_slug', category);

    const res = await fetch(`${API}/services?${urlParams.toString()}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return [];

    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

export function mapServiceToLocal(service: any): Producto | null {
  if (!service) return null;

  const price = Number(service.price || 0);

  return {
    id: Number(service.id),
    titulo: service.name,
    precio: price,
    imagen: service.image || '',
    tag: service.sticker,
    categoria: service.category || '',
    slug: service.slug,
    descripcion: service.description,
    enlace: `/servicio/${service.slug}`,
    vendedor: service.store_name
      ? { slug: service.store?.slug ?? '', nombre: service.store_name }
      : undefined,
    store_logo_marketplace: service.store_logo_marketplace ?? undefined,
    tipo: 'service',
    duration_minutes: service.duration_minutes,
  };
}


export function mapCatalogProductToLocal(product: any): Producto {
  const price = Number(product.price || 0);
  const regularPrice = Number(product.regular_price || price);

  const discount =
    regularPrice > price
      ? Math.round(((regularPrice - price) / regularPrice) * 100)
      : undefined;

  return {
    id: Number(product.id),
    titulo: product.name,
    precio: price,
    precioAnterior: regularPrice,
    descuento: discount,
    tag: product.sticker,
    imagen: product.images?.[0]?.src || '/img/no-image.png',
    categoria: product.categories?.[0]?.name || '',
    categorias: product.categories?.map((c: any) => c.name) || [],
    slug: product.slug,
    descripcion: product.description,
    enlace: `/producto/${product.slug}`,
    stock: product.stock,
    reviews: product.rating?.count || 0,
    estrellas: String(product.rating?.average || 0),
    vendedor: product.store
      ? {
          slug: product.store.slug,
          nombre: product.store.name,
        }
      : undefined,
    store_logo_marketplace: product.store?.logo_marketplace ?? undefined,
    tipo: 'product',
  };
}