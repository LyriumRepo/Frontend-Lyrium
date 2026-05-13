'use server';

import { revalidateTag } from 'next/cache';
import { parseWPProduct, parseWPProducts, Product } from '../adapters/wp-product.adapter';

/**
 * Server Action: Obtener productos del catálogo
 * Usa el adapter Zod para limpiar datos de WooCommerce
 */
export async function getProducts(vendorId?: string): Promise<Product[]> {
  try {
    const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';
    
    let token = '';
    let cookieHeader = '';
    try {
      const cookieStore = await import('next/headers');
      const cookies = await cookieStore.cookies();
      token = cookies.get('laravel_token')?.value || '';
      cookieHeader = cookies.toString();
    } catch (e) {
      console.error('Error getting cookies in getProducts:', e);
    }
    
    console.log('getProducts - Token present:', !!token, 'Cookie header:', cookieHeader ? 'present' : 'missing');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }
    
    const response = await fetch(`${LARAVEL_API_URL}/products?per_page=100`, {
      headers,
      cache: 'no-store',
    });
    
    console.log('getProducts - Response status:', response.status);

    if (!response.ok) {
      console.error('Error fetching products:', response.status);
      return [];
    }

    const data = await response.json();
    console.log('getProducts - Response data:', JSON.stringify(data).substring(0, 500));
    const products = data.data?.data || data.data || [];
    
    return products.map((p: any) => ({
      id: p.id.toString(),
      name: p.name || '',
      slug: p.slug || '',
      description: p.description || '',
      price: parseFloat(p.price || '0'),
      regularPrice: parseFloat(p.regular_price || p.price || '0'),
      salePrice: p.sale_price ? parseFloat(p.sale_price) : undefined,
      stock: p.stock ?? 0,
      status: p.status || 'draft',
      image: p.images?.[0]?.src || '',
      category: p.categories?.[0]?.slug || p.categories?.[0]?.name || '',
      categories: p.categories || [],
      type: p.type || 'physical',
      weight: p.weight,
      dimensions: p.dimensions,
      sticker: p.sticker || null,
      mainAttributes: p.mainAttributes || [],
      additionalAttributes: p.additionalAttributes || [],
    }));
  } catch (error) {
    console.error('Error fetching products from Laravel:', error);
    return [];
  }
}

/**
 * Server Action: Buscar productos con filtros
 */
export async function searchProducts(
  query: string,
  category?: string
): Promise<Product[]> {
  const products = await getProducts();

  let filtered = products;

  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }

  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }

  return filtered;
}

/**
 * Server Action: Eliminar producto
 */
export async function deleteProduct(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';
    
    const cookieStore = await import('next/headers');
    const token = (await cookieStore.cookies()).get('laravel_token')?.value;
    
    const response = await fetch(`${LARAVEL_API_URL}/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || 'No se pudo eliminar el producto'
      };
    }

    revalidateTag('seller-catalog', 'max');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: 'No se pudo eliminar el producto. Intenta de nuevo.'
    };
  }
}

/**
 * Server Action: Actualizar precio de producto (para Optimistic UI)
 */
export async function updateProductPrice(
  productId: string,
  newPrice: number
): Promise<{ success: boolean; data?: { id: string; price: number }; error?: string }> {
  try {
    // Validar
    if (!productId) {
      return { success: false, error: 'ID de producto requerido' };
    }

    if (newPrice < 0) {
      return { success: false, error: 'El precio debe ser positivo' };
    }

    // Simular llamada a WC API
    await new Promise(resolve => setTimeout(resolve, 300));

    // Revalidar cache
    revalidateTag('seller-catalog', 'max');

    return {
      success: true,
      data: { id: productId, price: newPrice }
    };
  } catch (error) {
    return {
      success: false,
      error: 'No se pudo actualizar el precio. Intenta de nuevo.'
    };
  }
}

/**
 * Server Action: Crear/Actualizar producto
 */
export async function saveProduct(
  product: Partial<Product>
): Promise<{ success: boolean; data?: Product; error?: string }> {
  try {
    if (!product.name || product.name.trim() === '') {
      return { success: false, error: 'El nombre del producto es requerido' };
    }

    const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';
    
    let token = '';
    try {
      const cookieStore = await import('next/headers');
      token = (await cookieStore.cookies()).get('laravel_token')?.value || '';
    } catch (e) {
      console.error('Error getting cookies:', e);
    }
    
    console.log('Token:', token ? 'present' : 'MISSING');

    const isUpdate = !!product.id;
    const endpoint = isUpdate 
      ? `${LARAVEL_API_URL}/products/${product.id}`
      : `${LARAVEL_API_URL}/products`;
    
    const method = isUpdate ? 'PUT' : 'POST';

    const payload: any = {
      type: 'physical',
      name: product.name,
      price: product.price || 0,
      stock: product.stock || 0,
      description: product.description || '',
      category: product.category || null,
      image: product.image || null,
      discountPercentage: product.discountPercentage || null,
      weight: product.weight || null,
      dimensions: product.dimensions || null,
    };

    console.log('Saving product payload:', payload);

    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Save product error:', response.status, errorData);
      return { 
        success: false, 
        error: errorData.message || errorData.errors ? JSON.stringify(errorData.errors) : `Error ${response.status}: Error al guardar el producto` 
      };
    }

    const data = await response.json();
    
    const savedProduct: Product = {
      id: data.id?.toString() || product.id || Date.now().toString(),
      name: data.name || product.name,
      category: data.categories?.[0]?.name || product.category || 'Sin categoría',
      price: parseFloat(data.price || product.price || '0'),
      stock: data.stock ?? product.stock ?? 0,
      description: data.description || product.description || '',
      image: data.images?.[0]?.src || product.image || '',
      sticker: data.sticker || product.sticker || null,
      mainAttributes: product.mainAttributes || [],
      additionalAttributes: product.additionalAttributes || [],
      createdAt: data.created_at || new Date().toISOString(),
    };

    revalidateTag('seller-catalog', 'max');

    return { success: true, data: savedProduct };
  } catch (error) {
    console.error('Error saving product:', error);
    return {
      success: false,
      error: 'Error al guardar el producto'
    };
  }
}
