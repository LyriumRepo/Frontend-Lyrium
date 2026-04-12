/**
 * GET /api/woocommerce/orders
 * ---------------------------------------------------------------
 * Proxy para obtener pedidos de WooCommerce.
 * Requiere autenticación y verifica permisos por rol.
 * ---------------------------------------------------------------
 */

import { NextResponse } from 'next/server';
import { rateLimiters } from '@/shared/lib/middleware/rate-limit';
import { validateWithLaravel } from '@/shared/lib/server/auth';

function canAccessOrders(role: string): boolean {
  return ['administrator', 'seller', 'logistics_operator'].includes(role);
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
  if (!canAccessOrders(auth.role)) {
    return NextResponse.json(
      { success: false, error: 'No tienes permiso para acceder a pedidos', code: 'FORBIDDEN' },
      { status: 403 }
    );
  }

  // 3. Extraer parámetros
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const perPage = searchParams.get('per_page') || '20';
  const status = searchParams.get('status');
  const customer = searchParams.get('customer');

  // 4. Construir query
  const wcUrl = new URL('https://lyriumbiomarketplace.com/wp-json/wc/v3/orders');
  wcUrl.searchParams.set('page', page);
  wcUrl.searchParams.set('per_page', perPage);

  if (status) wcUrl.searchParams.set('status', status);
  if (customer) wcUrl.searchParams.set('customer', customer);

  try {
    // 5. Llamar a WooCommerce
    const wcKey = process.env.WC_CS_KEY;
    const wcSecret = process.env.WC_CS_SECRET;

    if (!wcKey || !wcSecret) {
      console.error('[WooCommerce Orders Proxy] Credenciales no configuradas');
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
      console.error(`[WooCommerce Orders Proxy] Error ${response.status}:`, errorText);
      return NextResponse.json(
        { success: false, error: 'Error al obtener pedidos' },
        { status: response.status }
      );
    }

    const orders = await response.json();

    return NextResponse.json({
      success: true,
      data: orders,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error(`[${new Date().toISOString()}] ❌ WooCommerce orders error:`, message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 502 }
    );
  }
}
