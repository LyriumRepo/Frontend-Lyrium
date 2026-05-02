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
    
    console.log('[getProducts] Token present:', !!token, 'Cookie header:', cookieHeader ? 'present' : 'missing');
    
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
      credentials: 'include',
    });
    
    console.log('[getProducts] Response status:', response.status);

    if (!response.ok) {
      console.error('[getProducts] Error response status:', response.status);
      return [];
    }

    const data = await response.json();
    console.log('[getProducts] Response data keys:', Object.keys(data));
    
    // Handle both response formats: { data: { data: [...], meta: {...} } } and { data: [...] }
    let products = [];
    if (data.data?.data && Array.isArray(data.data.data)) {
      // Paginated response format
      products = data.data.data;
    } else if (Array.isArray(data.data)) {
      // Direct array response
      products = data.data;
    } else if (Array.isArray(data)) {
      // Raw array
      products = data;
    }
    
    console.log('[getProducts] Found products count:', products.length);
    
    return products.map((p: any) => ({
      id: p.id?.toString() || '',
      name: p.name || '',
      slug: p.slug || '',
      description: p.description || '',
      price: parseFloat(p.price || '0'),
      regularPrice: parseFloat(p.regular_price || p.price || '0'),
      salePrice: p.sale_price ? parseFloat(p.sale_price) : undefined,
      stock: p.stock ?? 0,
      status: p.status || 'draft',
      // Image handling: Spatie MediaLibrary returns images array
      image: p.images?.[0]?.src || p.image || '',
      category: p.categories?.[0]?.slug || p.categories?.[0]?.name || '',
      categories: p.categories || [],
      type: p.type || 'physical',
      weight: p.weight,
      dimensions: p.dimensions,
      sticker: p.sticker || null,
      mainAttributes: p.mainAttributes || [],
      additionalAttributes: p.additionalAttributes || [],
      createdAt: p.created_at || new Date().toISOString(),
      discountPercentage: p.discount_percentage,
    }));
  } catch (error) {
    console.error('[getProducts] Exception:', error);
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
 * Server Action: Crear producto con imagen
 * - SEGURO: Usa httpOnly cookies del servidor
 * - NO envía token al cliente
 * - Maneja base64 image en servidor
 */
export async function createProduct(
  product: any
): Promise<{ success: boolean; data?: Product; error?: string }> {
  try {
    // Validaciones
    if (!product.name || product.name.trim().length < 3) {
      return { success: false, error: 'El nombre debe tener al menos 3 caracteres' };
    }

    if (!product.mainAttributes || product.mainAttributes.length === 0) {
      return { success: false, error: 'Agrega al menos una característica' };
    }

    const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';
    
    // Obtener token desde httpOnly cookie (seguro, solo servidor)
    let token = '';
    try {
      const cookieStore = await import('next/headers');
      token = (await cookieStore.cookies()).get('laravel_token')?.value || '';
    } catch (e) {
      console.error('[createProduct] Error getting cookies:', e);
    }
    
    if (!token) {
      return { success: false, error: 'No estás autenticado' };
    }

    // Preparar payload
    const payload = {
      type: 'physical',
      name: product.name,
      description: product.description || '',
      price: Number(product.price) || 0,
      stock: Number(product.stock) || 0,
      category: product.category || null,
      image: null, // No enviar base64, se sube después
      weight: product.weight ? Number(product.weight) : null,
      dimensions: product.dimensions || null,
      mainAttributes: product.mainAttributes || [],
      additionalAttributes: product.additionalAttributes || [],
    };

    console.log('[createProduct] Creating with payload:', { ...payload, image: 'base64 omitted' });

    // 1. Crear producto
    const response = await fetch(`${LARAVEL_API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[createProduct] API error:', response.status, errorData);
      return {
        success: false,
        error: errorData.message || JSON.stringify(errorData.errors) || 'Error al crear producto'
      };
    }

    const responseData = await response.json();
    const productData = responseData.data || responseData;

    if (!productData || !productData.id) {
      return { success: false, error: 'Backend no retornó ID' };
    }

    const productId = productData.id.toString();
    console.log('[createProduct] Product created with ID:', productId);

    // 2. Subir imagen si existe (base64)
    if (product.image && product.image.startsWith('data:')) {
      try {
        console.log('[createProduct] Uploading image...');
        
        const response = await fetch(product.image);
        const blob = await response.blob();
        const fileName = `product-${Date.now()}.webp`;
        const file = new File([blob], fileName, { type: blob.type });

        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await fetch(`${LARAVEL_API_URL}/products/${productId}/media`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
          body: formData,
        });

        if (!uploadResponse.ok) {
          console.error('[createProduct] Image upload failed:', uploadResponse.status);
          // No es crítico, el producto se creó
        } else {
          console.log('[createProduct] Image uploaded successfully');
        }
      } catch (uploadErr) {
        console.error('[createProduct] Image upload error:', uploadErr);
        // No es crítico, el producto se creó
      }
    }

    // 3. Obtener producto actualizado
    const finalResponse = await fetch(`${LARAVEL_API_URL}/products/${productId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    const finalData = finalResponse.ok ? await finalResponse.json() : productData;
    const finalProductData = finalData.data || finalData;

    const savedProduct: Product = {
      id: finalProductData.id?.toString() || productId,
      name: finalProductData.name || product.name,
      category: finalProductData.categories?.[0]?.name || product.category || '',
      price: parseFloat(finalProductData.price || product.price || '0'),
      stock: finalProductData.stock ?? product.stock ?? 0,
      weight: finalProductData.weight,
      dimensions: finalProductData.dimensions,
      description: finalProductData.description || product.description || '',
      image: finalProductData.images?.[0]?.src || '',
      sticker: finalProductData.sticker || null,
      mainAttributes: product.mainAttributes || [],
      additionalAttributes: product.additionalAttributes || [],
      createdAt: finalProductData.created_at || new Date().toISOString(),
    };

    revalidateTag('seller-catalog');

    return { success: true, data: savedProduct };
  } catch (error) {
    console.error('[createProduct] Exception:', error);
    return {
      success: false,
      error: 'Error al crear el producto'
    };
  }
}

/**
 * Server Action: Actualizar producto
 */
export async function updateProduct(
  productId: string,
  product: any
): Promise<{ success: boolean; data?: Product; error?: string }> {
  try {
    if (!product.name || product.name.trim().length < 3) {
      return { success: false, error: 'El nombre debe tener al menos 3 caracteres' };
    }

    const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';
    
    let token = '';
    try {
      const cookieStore = await import('next/headers');
      token = (await cookieStore.cookies()).get('laravel_token')?.value || '';
    } catch (e) {
      console.error('[updateProduct] Error getting cookies:', e);
    }
    
    if (!token) {
      return { success: false, error: 'No estás autenticado' };
    }

    const payload = {
      type: 'physical',
      name: product.name,
      description: product.description || '',
      price: Number(product.price) || 0,
      stock: Number(product.stock) || 0,
      category: product.category || null,
      weight: product.weight ? Number(product.weight) : null,
      dimensions: product.dimensions || null,
      mainAttributes: product.mainAttributes || [],
      additionalAttributes: product.additionalAttributes || [],
    };

    // No enviar imagen si es base64 (se sube después con media endpoint)
    if (product.image && !product.image.startsWith('data:')) {
      payload.image = product.image;
    }

    const response = await fetch(`${LARAVEL_API_URL}/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || JSON.stringify(errorData.errors) || 'Error al actualizar'
      };
    }

    // Subir imagen si es base64
    if (product.image && product.image.startsWith('data:')) {
      try {
        const imageResponse = await fetch(product.image);
        const blob = await imageResponse.blob();
        const fileName = `product-${Date.now()}.webp`;
        const file = new File([blob], fileName, { type: blob.type });

        const formData = new FormData();
        formData.append('file', file);

        await fetch(`${LARAVEL_API_URL}/products/${productId}/media`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
          body: formData,
        });
      } catch (uploadErr) {
        console.error('[updateProduct] Image upload error:', uploadErr);
      }
    }

    const responseData = await response.json();
    const productData = responseData.data || responseData;

    const updatedProduct: Product = {
      id: productData.id?.toString() || productId,
      name: productData.name || product.name,
      category: productData.categories?.[0]?.name || product.category || '',
      price: parseFloat(productData.price || product.price || '0'),
      stock: productData.stock ?? product.stock ?? 0,
      weight: productData.weight,
      dimensions: productData.dimensions,
      description: productData.description || product.description || '',
      image: productData.images?.[0]?.src || '',
      sticker: productData.sticker || null,
      mainAttributes: product.mainAttributes || [],
      additionalAttributes: product.additionalAttributes || [],
      createdAt: productData.created_at || new Date().toISOString(),
    };

    revalidateTag('seller-catalog');

    return { success: true, data: updatedProduct };
  } catch (error) {
    console.error('[updateProduct] Exception:', error);
    return {
      success: false,
      error: 'Error al actualizar el producto'
    };
  }
}

/**
 * Server Action: Crear/Actualizar producto (legacy)
 */
export async function saveProduct(
  product: Partial<Product>
): Promise<{ success: boolean; data?: Product; error?: string }> {
  if (product.id) {
    return updateProduct(product.id, product);
  } else {
    return createProduct(product);
  }
}
