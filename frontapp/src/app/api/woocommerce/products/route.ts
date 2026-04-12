/**
 * GET /api/woocommerce/products
 * ---------------------------------------------------------------
 * Proxy para obtener productos de WooCommerce.
 * Las credenciales se ocultan en el servidor.
 * ---------------------------------------------------------------
 */

import { NextResponse } from 'next/server';
import { rateLimiters } from '@/shared/lib/middleware/rate-limit';
import { validateWithLaravel } from '@/shared/lib/server/auth';

function canAccessProducts(role: string): boolean {
  return ['administrator', 'seller', 'customer', 'logistics_operator'].includes(role);
}

export async function GET(request: Request) {
  // ========================================
  // RATE LIMITING
  // ========================================
  const rateLimit = await rateLimiters.standard(request);
  if (!rateLimit.success && rateLimit.response) {
    return rateLimit.response;
  }

  // 1. Validar autenticación contra Laravel
  const auth = await validateWithLaravel();

  if (!auth) {
    return NextResponse.json(
      { success: false, error: 'No autenticado', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  // 2. Verificar permisos
  if (!canAccessProducts(auth.role)) {
    return NextResponse.json(
      { success: false, error: 'No tienes permiso para acceder a productos', code: 'FORBIDDEN' },
      { status: 403 }
    );
  }

  // 3. Extraer parámetros de query
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const perPage = searchParams.get('per_page') || '20';
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const slug = searchParams.get('slug');

  // 4. Construir query para WooCommerce
  const wcUrl = new URL('https://lyriumbiomarketplace.com/wp-json/wc/v3/products');
  wcUrl.searchParams.set('page', page);
  wcUrl.searchParams.set('per_page', perPage);

  if (category) wcUrl.searchParams.set('category', category);
  if (search) wcUrl.searchParams.set('search', search);
  if (slug) wcUrl.searchParams.set('slug', slug);

  try {
    // 5. Llamar a WooCommerce con credenciales del servidor
    const wcKey = process.env.WC_CS_KEY;
    const wcSecret = process.env.WC_CS_SECRET;

    if (!wcKey || !wcSecret) {
      console.error('[WooCommerce Proxy] Credenciales no configuradas');
      return NextResponse.json(
        { success: false, error: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }

    const response = await fetch(wcUrl.toString(), {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${wcKey}:${wcSecret}`).toString('base64'),
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[WooCommerce Proxy] Error ${response.status}:`, errorText);
      return NextResponse.json(
        { success: false, error: 'Error al obtener productos de WooCommerce' },
        { status: response.status }
      );
    }

    const products = await response.json();

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        perPage: parseInt(perPage),
      }
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error(`[${new Date().toISOString()}] ❌ WooCommerce products error:`, message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 502 }
    );
  }
}
