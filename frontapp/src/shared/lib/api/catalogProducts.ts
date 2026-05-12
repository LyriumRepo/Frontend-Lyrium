import { Producto } from '@/types/public';

const API = process.env.NEXT_PUBLIC_LARAVEL_API_URL;

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
  };
}