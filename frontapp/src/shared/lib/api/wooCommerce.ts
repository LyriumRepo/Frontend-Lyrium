import { Producto } from '@/types/public';

const WC_KEY = process.env.NEXT_PUBLIC_WP_CS_KEY || '';
const WC_SECRET = process.env.NEXT_PUBLIC_WP_CS_SECRET || '';

function buildAuthParams(): string {
  return `consumer_key=${WC_KEY}&consumer_secret=${WC_SECRET}`;
}

export async function searchProducts(query: string, perPage = 10) {
  const auth = buildAuthParams();
  const searchParam = encodeURIComponent(query);
  const url = `https://lyriumbiomarketplace.com/wp-json/wc/v3/products?${auth}&search=${searchParam}&per_page=${perPage}`;
  
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }
  return res.json();
}

export async function searchCategories(query: string, perPage = 10) {
  const auth = buildAuthParams();
  const searchParam = encodeURIComponent(query);
  const url = `https://lyriumbiomarketplace.com/wp-json/wc/v3/products/categories?${auth}&search=${searchParam}&per_page=${perPage}`;
  
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch categories');
  }
  return res.json();
}

export async function getProductsByCategory(categoryId: number, perPage = 10) {
  const auth = buildAuthParams();
  const url = `https://lyriumbiomarketplace.com/wp-json/wc/v3/products?${auth}&category=${categoryId}&per_page=${perPage}`;
  
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }
  return res.json();
}

export async function getProductBySlug(slug: string) {
  const auth = buildAuthParams();
  const url = `https://lyriumbiomarketplace.com/wp-json/wc/v3/products?${auth}&slug=${encodeURIComponent(slug)}`;
  
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch product');
  }
  const products = await res.json();
  return products[0] || null;
}

export interface WooProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  price: string;
  regular_price: string;
  sale_price: string;
  description: string;
  short_description: string;
  images: { id: number; src: string }[];
  categories: { id: number; name: string; slug: string }[];
  store?: {
    name: string;
    url: string;
  };
}

export interface WooCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  parent: number;
  image?: { src: string };
}

const HOME_PRODUCT_CATEGORY_IDS = [
  53,  // Suplementos vitamínicos
  50,  // Digestión saludable
  55,  // Equipos y dispositivos médicos
  57,  // Protección limpieza y desinfección
  58,  // Belleza
  52,  // Bienestar físico y deportes
  56,  // Mascotas
];

const HOME_CATEGORY_SLUGS = [
  'bienestar_fisico_y_deportes',
  'mascotas',
  'suplementos_vitaminicos',
  'digestion_saludable',
  'equipos_y_dispositivos_medicos',
  'proteccion_limpieza_y_desinfeccion',
];

const HOME_SERVICE_CATEGORY_IDS = [
  308,
  309,
  310,
  311,
  312,
  313,
];

const HOME_SERVICE_CATEGORY_SLUGS = [
  'servicios-medicos',
  'belleza-servicios',
  'deportes-servicios',
  'servicio-de-medicina-natural',
  'servicios-para-animales',
  'servicios-sociales',
];

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  bienestar_fisico_y_deportes: '/img/Inicio/2/1.png',
  mascotas: '/img/Inicio/2/2.png',
  suplementos_vitaminicos: '/img/Inicio/2/3.png',
  digestion_saludable: '/img/Inicio/2/4.png',
  equipos_y_dispositivos_medicos: '/img/Inicio/2/5.png',
  proteccion_limpieza_y_desinfeccion: '/img/Inicio/2/6.png',
};

const SERVICE_CATEGORY_IMAGE_MAP: Record<string, string> = {
  'servicios-medicos': '/img/Inicio/1/1.png',
  'belleza-servicios': '/img/Inicio/1/2.png',
  'deportes-servicios': '/img/Inicio/1/3.png',
  'servicio-de-medicina-natural': '/img/Inicio/1/4.png',
  'servicios-para-animales': '/img/Inicio/1/1.png',
  'servicios-sociales': '/img/Inicio/1/2.png',
};

export async function getHomeCategories(): Promise<WooCategory[]> {
  const auth = buildAuthParams();
  const ids = HOME_PRODUCT_CATEGORY_IDS.join(',');
  const url = `https://lyriumbiomarketplace.com/wp-json/wc/v3/products/categories?${auth}&include=${ids}&per_page=100`;
  
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) {
    throw new Error('Failed to fetch categories');
  }
  
  const categories: WooCategory[] = await res.json();
  return categories;
}

export function mapWooCategoryToLocal(categories: WooCategory[]) {
  return categories.map(cat => ({
    id: cat.id,
    nombre: cat.name.toUpperCase(),
    imagen: CATEGORY_IMAGE_MAP[cat.slug] || '/img/Inicio/2/1.png',
    descripcion: cat.description || '',
    slug: cat.slug,
  }));
}

export async function getHomeServiceCategories(): Promise<WooCategory[]> {
  const auth = buildAuthParams();
  const ids = HOME_SERVICE_CATEGORY_IDS.join(',');
  const url = `https://lyriumbiomarketplace.com/wp-json/wc/v3/products/categories?${auth}&include=${ids}&per_page=100`;
  
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) {
    throw new Error('Failed to fetch service categories');
  }
  
  const categories: WooCategory[] = await res.json();
  return categories;
}

export function mapWooServiceCategoryToLocal(categories: WooCategory[]) {
  return categories.map(cat => ({
    id: cat.id,
    nombre: cat.name.toUpperCase(),
    imagen: SERVICE_CATEGORY_IMAGE_MAP[cat.slug] || '/img/Inicio/1/1.png',
    descripcion: cat.description || '',
    slug: cat.slug,
  }));
}

export async function getProductsByCategorySlug(categoryParam: string, perPage = 20): Promise<WooProduct[]> {
  const auth = buildAuthParams();
  
  let categoryId: number | null = null;
  
  if (/^\d+$/.test(categoryParam)) {
    categoryId = parseInt(categoryParam, 10);
  } else {
    const category = await getCategoryBySlug(categoryParam);
    categoryId = category?.id || null;
  }
  
  if (!categoryId) {
    return [];
  }
  
  const url = `https://lyriumbiomarketplace.com/wp-json/wc/v3/products?${auth}&category=${categoryId}&per_page=${perPage}`;
  
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) {
    console.error('Failed to fetch products:', categoryParam, res.status);
    return [];
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function getCategoryBySlug(categoryParam: string): Promise<WooCategory | null> {
  const auth = buildAuthParams();
  const isNumeric = /^\d+$/.test(categoryParam);
  
  let url: string;
  if (isNumeric) {
    url = `https://lyriumbiomarketplace.com/wp-json/wc/v3/products/categories/${categoryParam}?${auth}`;
  } else {
    url = `https://lyriumbiomarketplace.com/wp-json/wc/v3/products/categories?${auth}&slug=${encodeURIComponent(categoryParam)}`;
  }
  
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) {
    console.error('Failed to fetch category:', categoryParam, res.status);
    return null;
  }
  
  const data = await res.json();
  
  if (isNumeric && data.id) {
    return data as WooCategory;
  }
  
  const categories: WooCategory[] = Array.isArray(data) ? data : [];
  return categories[0] || null;
}

export function mapWooProductToLocal(product: WooProduct): Producto {
  const price = parseFloat(product.price || product.regular_price || '0');
  const regularPrice = parseFloat(product.regular_price || '0');
  const discount = regularPrice > price && regularPrice > 0 
    ? Math.round(((regularPrice - price) / regularPrice) * 100) 
    : undefined;

  return {
    id: product.id,
    titulo: product.name,
    precio: price,
    imagen: product.images?.[0]?.src || '/img/no-image.png',
    categoria: product.categories?.[0]?.name || '',
    slug: product.slug,
    descripcion: product.short_description || product.description,
    enlace: `/producto/${product.slug}`,
  };
}
