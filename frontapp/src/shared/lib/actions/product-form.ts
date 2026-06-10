'use server';

import { revalidateTag, revalidatePath } from 'next/cache';
import { ProductFormSchema } from '../schemas/product.schema';

const LARAVEL_API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';

async function getAuthToken(): Promise<string> {
  try {
    const { cookies } = await import('next/headers');
    return (await cookies()).get('laravel_token')?.value ?? '';
  } catch {
    return '';
  }
}

function authHeaders(token: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export type ProductActionResult =
  | { success: true; productId: string; message: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createProduct(
  prevState: ProductActionResult,
  formData: FormData
): Promise<ProductActionResult> {
  const data = {
    name: formData.get('name'),
    description: formData.get('description') || '',
    price: formData.get('price'),
    stock: formData.get('stock') || 0,
    category: formData.get('category') || '',
    sku: formData.get('sku') || '',
  };

  const validation = ProductFormSchema.safeParse(data);

  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;
    return {
      success: false,
      error: 'Por favor, corrige los errores en el formulario',
      fieldErrors: {
        name: errors.name || [],
        price: errors.price || [],
        stock: errors.stock || [],
        category: errors.category || [],
      },
    };
  }

  const { name, description, price, stock, category, sku } = validation.data;

  try {
    const token = await getAuthToken();

    const payload: Record<string, unknown> = {
      name,
      description,
      price,
      stock,
      type: 'physical',
      category: category || null,
      sticker: 'nuevo',
    };

    if (sku) payload.sku = sku;

    const res = await fetch(`${LARAVEL_API_URL}/products`, {
      method: 'POST',
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

    const responseData = await res.json();
    const product = responseData.data ?? responseData;

    revalidateTag('seller-catalog', {});
    revalidatePath('/seller/catalog', 'page');

    return {
      success: true,
      productId: String(product.id),
      message: 'Producto creado exitosamente',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message ?? 'Error de conexión. Intenta de nuevo.',
    };
  }
}

export async function updateProduct(
  productId: string,
  formData: FormData
): Promise<ProductActionResult> {
  const data = {
    name: formData.get('name'),
    description: formData.get('description') || '',
    price: formData.get('price'),
    stock: formData.get('stock') || 0,
    category: formData.get('category') || '',
    sku: formData.get('sku') || '',
  };

  const validation = ProductFormSchema.safeParse(data);

  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;
    return {
      success: false,
      error: 'Por favor, corrige los errores',
      fieldErrors: {
        name: errors.name || [],
        price: errors.price || [],
        stock: errors.stock || [],
        category: errors.category || [],
      },
    };
  }

  const { name, description, price, stock, category, sku } = validation.data;

  try {
    const token = await getAuthToken();

    const payload: Record<string, unknown> = {
      name,
      description,
      price,
      stock,
      category: category || null,
    };

    if (sku) payload.sku = sku;

    const res = await fetch(`${LARAVEL_API_URL}/products/${productId}`, {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return {
        success: false,
        error: err.message || 'Error al actualizar el producto',
      };
    }

    revalidateTag('seller-catalog', {});
    revalidatePath('/seller/catalog', 'page');

    return {
      success: true,
      productId,
      message: 'Producto actualizado exitosamente',
    };
  } catch {
    return { success: false, error: 'Error de conexión' };
  }
}
