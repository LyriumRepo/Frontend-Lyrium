'use server';

import { revalidateTag } from 'next/cache';
import type { Product, ProductPayload } from '@/features/seller/catalog/types';

const LARAVEL_API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';

// ─── Helper: obtener token desde cookies ─────────────────────────────────────
async function getAuthToken(): Promise<string> {
  try {
    const { cookies } = await import('next/headers');
    return (await cookies()).get('laravel_token')?.value ?? '';
  } catch {
    return '';
  }
}

// ─── Helper: headers autenticados ────────────────────────────────────────────
function authHeaders(token: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function toRelativeStorageUrl(url: string | null | undefined): string {
  if (!url) return '';
  const idx = url.indexOf('/storage/');
  if (idx >= 0) return url.substring(idx);
  return url.startsWith('/') ? url : url;
}

const VALID_STICKERS = new Set([
  'liquidacion', 'oferta', 'descuento', 'nuevo', 'bestseller', 'envio_gratis',
  'organic', 'natural', 'eco', 'premium', 'vegan',
]);

function sanitizeSticker(val: unknown): Product['sticker'] {
  if (val && typeof val === 'string' && VALID_STICKERS.has(val)) return val as Product['sticker'];
  return null;
}

// ─── Helper: mapear respuesta Laravel → Product ───────────────────────────────
function mapLaravelProduct(p: any): Product {
  return {
    id: String(p.id),
    name: p.name ?? '',
    slug: p.slug ?? '',
    type: p.type ?? 'physical',
    description: p.description ?? '',
    short_description: p.short_description ?? null,
    price: parseFloat(p.price ?? '0'),
    regularPrice: parseFloat(p.regular_price ?? p.price ?? '0'),
    stock: p.stock ?? 0,
    status: p.status ?? 'draft',
    sticker: sanitizeSticker(p.sticker),
    discountPercentage: p.discount_percentage
      ? parseFloat(p.discount_percentage)
      : null,

    // Imagen principal — prioriza MediaLibrary, fallback al campo image; normaliza a /storage/...
    image: toRelativeStorageUrl(p.images?.[0]?.src ?? p.image),
    images: (p.images ?? []).map((img: any) => ({
        ...img,
        src:    toRelativeStorageUrl(img.src),
        thumb:  toRelativeStorageUrl(img.thumb),
        medium: toRelativeStorageUrl(img.medium),
        large:  toRelativeStorageUrl(img.large),
    })),

    // Categorías
    category: p.categories?.[0]?.slug ?? '',
    categories: p.categories ?? [],

    // Physical
    weight: p.weight ?? null,
    dimensions: p.dimensions ?? null,
    expirationDate: p.expirationDate ?? null,

    // Digital
    downloadUrl: p.downloadUrl ?? null,
    downloadLimit: p.downloadLimit ?? null,
    fileType: p.fileType ?? null,
    fileSize: p.fileSize ?? null,

    // Service
    serviceDuration: p.serviceDuration ?? null,
    serviceModality: p.serviceModality ?? null,
    serviceLocation: p.serviceLocation ?? null,

    // Atributos — convertir de { label, value } a string[] para el form
    mainAttributes: (p.characteristics ?? []).map((c: any) => ({
        values: [c.label ?? '', c.value ?? ''],
    })),
    additionalAttributes: (p.additional_info ?? []).map((c: any) => ({
        values: [c.label ?? '', c.value ?? ''],
    })),
    nutritionalAttributes: (p.nutritional_info?.rows ?? []).map((r: any) => ({
      values: {
        label: r.label ?? '',
        value: r.value ?? '',
        daily_value: r.daily_value ?? null,
      },
    })),
    servingNote: p.nutritional_info?.serving_note ?? null,

    createdAt: p.created_at ?? new Date().toISOString(),
    updatedAt: p.updated_at ?? new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/products  (productos del vendedor autenticado)
// ─────────────────────────────────────────────────────────────────────────────
export async function getProducts(): Promise<Product[]> {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${LARAVEL_API_URL}/products?per_page=100`, {
      headers: authHeaders(token),
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('getProducts error:', res.status);
      return [];
    }

    const data = await res.json();
    const raw: any[] = data.data ?? [];
    return raw.map(mapLaravelProduct);
  } catch (err) {
    console.error('getProducts exception:', err);
    return [];
  }
}

// ─── Server action para obtener el token de auth desde cookies ─────────────
export async function getServerToken(): Promise<string> {
  return getAuthToken();
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/products  |  PUT /api/products/{id}
// ─────────────────────────────────────────────────────────────────────────────
export async function saveProduct(
  product: Partial<Product>,
): Promise<{ success: boolean; data?: Product; error?: string }> {
  try {
    if (!product.name?.trim()) {
      return { success: false, error: 'El nombre del producto es requerido' };
    }

    const token = await getAuthToken();
    const isUpdate = !!product.id;
    const endpoint = isUpdate
      ? `${LARAVEL_API_URL}/products/${product.id}`
      : `${LARAVEL_API_URL}/products`;

    // ── Construir payload exacto que espera Laravel ──────────────────────────
    const payload: ProductPayload = {
      type: product.type ?? 'physical',
      name: product.name,
      description: product.description ?? '',
      short_description: product.short_description ?? null,
      price: product.price ?? 0,
      stock: product.stock ?? 0,
      category: product.category || null,
      image: product.image || null,
      sticker: sanitizeSticker(product.sticker),
      discountPercentage: product.discountPercentage ?? null,

      // Atributos — formato { values: { label, value } }
      mainAttributes: product.mainAttributes ?? [],
      additionalAttributes: product.additionalAttributes ?? [],

      // Nutricional
      ...(product.nutritionalAttributes?.length
        ? {
            nutritionalAttributes: product.nutritionalAttributes,
            servingNote: product.servingNote ?? null,
          }
        : {}),
    };

    // Campos específicos por tipo
    if (payload.type === 'physical') {
      payload.weight = product.weight ?? null;
      payload.dimensions = product.dimensions ?? null;
      payload.expirationDate = product.expirationDate ?? null;
    }

    if (payload.type === 'digital') {
      payload.downloadUrl = product.downloadUrl ?? null;
      payload.downloadLimit = product.downloadLimit ?? null;
      payload.fileType = product.fileType ?? null;
      payload.fileSize = product.fileSize ?? null;
    }

    if (payload.type === 'service') {
      payload.serviceDuration = product.serviceDuration ?? null;
      payload.serviceModality = product.serviceModality ?? null;
      payload.serviceLocation = product.serviceLocation ?? null;
    }

    const res = await fetch(endpoint, {
      method: isUpdate ? 'PUT' : 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg =
        err.message ??
        (err.errors ? Object.values(err.errors).flat().join(', ') : null) ??
        `Error ${res.status}`;
      return { success: false, error: msg };
    }

    const data = await res.json();
    revalidateTag('seller-catalog', 'max');

    const raw = data.data ?? data;
    return { success: true, data: mapLaravelProduct(raw) };
  } catch (err: any) {
    console.error('saveProduct exception:', err);
    return {
      success: false,
      error: err.message ?? 'Error al guardar el producto',
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/products/{id}
// ─────────────────────────────────────────────────────────────────────────────
export async function deleteProduct(
  productId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${LARAVEL_API_URL}/products/${productId}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return {
        success: false,
        error: err.message ?? 'No se pudo eliminar el producto',
      };
    }

    revalidateTag('seller-catalog', 'max');
    return { success: true };
  } catch {
    return { success: false, error: 'Error de conexión al eliminar' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/products/{id}/media  — subir imagen comprimida (server-to-server)
// ─────────────────────────────────────────────────────────────────────────────
export async function uploadProductImageAction(
  productId: number,
  imageBase64: string,
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'Sesión expirada. Recarga la página.' };
    }

    const matches = imageBase64.match(/^data:(image\/(\w+));base64,(.+)$/);
    if (!matches) {
      return { success: false, error: 'Formato de imagen inválido.' };
    }

    const mimeType = matches[1];
    const ext = matches[2];
    const base64Data = matches[3];
    const buffer = Buffer.from(base64Data, 'base64');
    const blob = new Blob([buffer], { type: mimeType });

    const formData = new FormData();
    formData.append('file', blob, `product-${Date.now()}.${ext}`);

    const res = await fetch(`${LARAVEL_API_URL}/products/${productId}/media`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      const msg =
        err?.message ??
        (err?.errors ? Object.values(err.errors).flat().join(', ') : null) ??
        `Error ${res.status}`;
      console.error('Media upload failed:', res.status, msg);
      return { success: false, error: msg };
    }

    const data = await res.json();
    const url = data.data?.url ?? '';

    if (!url) {
      return { success: false, error: 'La imagen se subió pero no se obtuvo la URL.' };
    }

    return { success: true, url };
  } catch (err: any) {
    console.error('uploadProductImageAction exception:', err);
    return { success: false, error: err.message ?? 'Error de conexión al subir imagen.' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/products/{id}  — actualización rápida de precio (Optimistic UI)
// ─────────────────────────────────────────────────────────────────────────────
export async function updateProductPrice(
  productId: string,
  newPrice: number,
): Promise<{
  success: boolean;
  data?: { id: string; price: number };
  error?: string;
}> {
  try {
    if (!productId) return { success: false, error: 'ID requerido' };
    if (newPrice < 0)
      return { success: false, error: 'El precio debe ser positivo' };

    const token = await getAuthToken();
    const res = await fetch(`${LARAVEL_API_URL}/products/${productId}`, {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ price: newPrice }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return {
        success: false,
        error: err.message ?? 'Error al actualizar precio',
      };
    }

    revalidateTag('seller-catalog', 'max');
    return { success: true, data: { id: productId, price: newPrice } };
  } catch {
    return { success: false, error: 'Error de conexión' };
  }
}
