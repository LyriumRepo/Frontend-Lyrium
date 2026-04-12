'use server';

import { revalidateTag, revalidatePath } from 'next/cache';
import { ProductFormSchema } from '../schemas/product.schema';
import { API_CONFIG } from '../config/api';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESULTADO DE LA ACCIÓN
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type ProductActionResult =
  | { success: true; productId: string; message: string }
  | {
    success: false;
    error: string;
    fieldErrors?: Record<string, string[]>;
  };

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SUBIR IMAGEN A WORDPRESS MEDIA LIBRARY
 * 
 * Flujo:
 * 1. Recibir FormData con el archivo
 * 2. Subir a WP via /wp-json/wp/v2/media
 * 3. Retornar el ID de la imagen subida
 * ═══════════════════════════════════════════════════════════════════════════
 */
export async function uploadImageToWordPress(
  formData: FormData
): Promise<{ success: boolean; imageId?: string; imageUrl?: string; error?: string }> {
  const file = formData.get('file') as File | null;

  if (!file) {
    return { success: false, error: 'No se selected ningún archivo' };
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: 'Tipo de archivo no permitido. Usa JPEG, PNG, WebP o GIF' };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: 'La imagen es muy grande. Máximo 5MB' };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const key = process.env.NEXT_PUBLIC_WP_CS_KEY;
    const secret = process.env.NEXT_PUBLIC_WP_CS_SECRET;

    if (!key || !secret) {
      return { success: false, error: 'Credenciales no configuradas' };
    }

    const auth = Buffer.from(`${key}:${secret}`).toString('base64');
    const wpUrl = API_CONFIG.baseUrl;

    const response = await fetch(`${wpUrl}/wp-json/wp/v2/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': file.type,
        'Content-Disposition': `attachment; filename="${file.name}"`,
      },
      body: buffer,
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Error al subir la imagen a WordPress'
      };
    }

    const mediaData = await response.json();

    return {
      success: true,
      imageId: String(mediaData.id),
      imageUrl: mediaData.source_url,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: 'Error de conexión al subir la imagen'
    };
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CREAR PRODUCTO EN WOOCOMMERCE
 * 
 * Flujo:
 * 1. Validar datos con Zod
 * 2. Verificar nonce
 * 3. Enviar a WC API con los IDs de imágenes
 * 4. Revalidar cache del catálogo
 * ═══════════════════════════════════════════════════════════════════════════
 */
export async function createProduct(
  prevState: ProductActionResult,
  formData: FormData
): Promise<ProductActionResult> {
  const data = {
    name: formData.get('name'),
    description: formData.get('description') || '',
    price: formData.get('price'),
    regularPrice: formData.get('regularPrice'),
    stock: formData.get('stock') || 0,
    category: formData.get('category') || '',
    sku: formData.get('sku') || '',
    images: formData.get('images') ? JSON.parse(String(formData.get('images'))) : [],
    featuredImage: formData.get('featuredImage') || '',
    nonce: formData.get('nonce'),
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

  const { name, description, price, regularPrice, stock, category, sku, images, featuredImage, nonce } = validation.data;

  const isValidNonce = await verifyWordPressNonce(nonce, 'create_product');
  if (!isValidNonce) {
    return {
      success: false,
      error: 'Tu sesión ha expirado. Por favor, recarga la página.',
    };
  }

  try {
    const key = process.env.NEXT_PUBLIC_WP_CS_KEY;
    const secret = process.env.NEXT_PUBLIC_WP_CS_SECRET;

    if (!key || !secret) {
      return { success: false, error: 'Credenciales no configuradas' };
    }

    const auth = Buffer.from(`${key}:${secret}`).toString('base64');
    const wcUrl = API_CONFIG.wcApiUrl;

    const productPayload: Record<string, unknown> = {
      name,
      description,
      regular_price: String(regularPrice ?? price),
      price: String(price),
      stock_quantity: stock,
      status: 'publish',
      manage_stock: true,
    };

    if (sku) {
      productPayload.sku = sku;
    }

    if (category) {
      productPayload.categories = [{ id: Number(category) }];
    }

    if (featuredImage) {
      productPayload.images = [{ id: Number(featuredImage) }];
    }

    if (images.length > 0) {
      const existingImages = productPayload.images
        ? [...(productPayload.images as { id: number }[])]
        : [];

      images.forEach((imgId) => {
        if (!existingImages.find(img => img.id === Number(imgId))) {
          existingImages.push({ id: Number(imgId) });
        }
      });

      productPayload.images = existingImages;
    }

    const response = await fetch(`${wcUrl}/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productPayload),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Error al crear el producto en WooCommerce',
      };
    }

    const product = await response.json();

    revalidateTag('seller-catalog', 'max');
    revalidatePath('/seller/catalog');

    return {
      success: true,
      productId: String(product.id),
      message: 'Producto creado exitosamente',
    };
  } catch (error) {
    console.error('Create product error:', error);
    return {
      success: false,
      error: 'Error de conexión. Intenta de nuevo.',
    };
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ACTUALIZAR PRODUCTO EXISTENTE
 * ═══════════════════════════════════════════════════════════════════════════
 */
export async function updateProduct(
  productId: string,
  formData: FormData
): Promise<ProductActionResult> {
  const data = {
    name: formData.get('name'),
    description: formData.get('description') || '',
    price: formData.get('price'),
    regularPrice: formData.get('regularPrice'),
    stock: formData.get('stock') || 0,
    category: formData.get('category') || '',
    sku: formData.get('sku') || '',
    images: formData.get('images') ? JSON.parse(String(formData.get('images'))) : [],
    featuredImage: formData.get('featuredImage') || '',
    nonce: formData.get('nonce'),
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

  const { name, description, price, regularPrice, stock, category, sku, images, featuredImage, nonce } = validation.data;

  const isValidNonce = await verifyWordPressNonce(nonce, `update_product_${productId}`);
  if (!isValidNonce) {
    return { success: false, error: 'Sesión expirada' };
  }

  try {
    const key = process.env.NEXT_PUBLIC_WP_CS_KEY;
    const secret = process.env.NEXT_PUBLIC_WP_CS_SECRET;
    const auth = Buffer.from(`${key}:${secret}`).toString('base64');
    const wcUrl = API_CONFIG.wcApiUrl;

    const productPayload: Record<string, unknown> = {
      name,
      description,
      regular_price: String(regularPrice ?? price),
      price: String(price),
      stock_quantity: stock,
    };

    if (sku) productPayload.sku = sku;
    if (category) productPayload.categories = [{ id: Number(category) }];
    if (featuredImage) productPayload.images = [{ id: Number(featuredImage) }];

    const response = await fetch(`${wcUrl}/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productPayload),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Error al actualizar' };
    }

    revalidateTag('seller-catalog', 'max');
    revalidatePath('/seller/catalog');

    return { success: true, productId, message: 'Producto actualizado' };
  } catch {
    return { success: false, error: 'Error de conexión' };
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VERIFICAR NONCE DE WORDPRESS
 * ═══════════════════════════════════════════════════════════════════════════
 */
async function verifyWordPressNonce(nonce: string, action: string): Promise<boolean> {
  if (process.env.NODE_ENV === 'development') {
    return nonce.length > 5;
  }

  try {
    const wpUrl = API_CONFIG.baseUrl;
    const response = await fetch(`${wpUrl}/wp-json/custom/v1/verify-nonce`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nonce, action }),
    });

    if (!response.ok) return false;
    const data = await response.json();
    return data.valid === true;
  } catch {
    return false;
  }
}
