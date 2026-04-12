/**
 * WooCommerce API Client (Server-Side)
 * =====================================
 * Este cliente se usa SOLO en API routes del servidor.
 * Las credenciales se obtienen de variables de entorno del servidor.
 * 
 * ⚠️ NO usar este archivo directamente desde componentes cliente
 * ⚠️ Usar los API routes en /api/woocommerce/* en su lugar
 */

const WOOCOMMERCE_BASE_URL = 'https://lyriumbiomarketplace.com/wp-json/wc/v3';

interface WooCommerceRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: Record<string, unknown>;
  params?: Record<string, string | number>;
}

/**
 * Hacer request a WooCommerce API con credenciales del servidor
 */
async function wooCommerceRequest<T = unknown>(
  endpoint: string,
  options: WooCommerceRequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, params } = options;

  // Obtener credenciales del servidor (NO de window.env)
  const wcKey = process.env.WC_CS_KEY;
  const wcSecret = process.env.WC_CS_SECRET;

  if (!wcKey || !wcSecret) {
    throw new Error('Credenciales WooCommerce no configuradas');
  }

  // Construir URL con parámetros
  const url = new URL(`${WOOCOMMERCE_BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }

  const response = await fetch(url.toString(), {
    method,
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${wcKey}:${wcSecret}`).toString('base64'),
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WooCommerce API error ${response.status}: ${errorText}`);
  }

  return response.json();
}

// ============================================
// MÉTODOS DE PRODUCTOS
// ============================================

export async function getProducts(params?: {
  page?: number;
  per_page?: number;
  category?: number | string;
  search?: string;
  slug?: string;
}) {
  return wooCommerceRequest('/products', { params });
}

export async function getProduct(id: number) {
  return wooCommerceRequest<Record<string, unknown>>(`/products/${id}`);
}

export async function createProduct(data: Record<string, unknown>) {
  return wooCommerceRequest('/products', { method: 'POST', body: data });
}

export async function updateProduct(id: number, data: Record<string, unknown>) {
  return wooCommerceRequest(`/products/${id}`, { method: 'PUT', body: data });
}

export async function deleteProduct(id: number) {
  return wooCommerceRequest(`/products/${id}`, { method: 'DELETE' });
}

// ============================================
// MÉTODOS DE ÓRDENES
// ============================================

export async function getOrders(params?: {
  page?: number;
  per_page?: number;
  status?: string;
  customer?: number;
}) {
  return wooCommerceRequest('/orders', { params });
}

export async function getOrder(id: number) {
  return wooCommerceRequest<Record<string, unknown>>(`/orders/${id}`);
}

export async function updateOrder(id: number, data: Record<string, unknown>) {
  return wooCommerceRequest(`/orders/${id}`, { method: 'PUT', body: data });
}

// ============================================
// MÉTODOS DE CATEGORÍAS
// ============================================

export async function getCategories(params?: {
  page?: number;
  per_page?: number;
  parent?: number;
  slug?: string;
}) {
  return wooCommerceRequest('/products/categories', { params });
}

export async function getCategory(id: number) {
  return wooCommerceRequest<Record<string, unknown>>(`/products/categories/${id}`);
}

export async function createCategory(data: Record<string, unknown>) {
  return wooCommerceRequest('/products/categories', { method: 'POST', body: data });
}

export async function updateCategory(id: number, data: Record<string, unknown>) {
  return wooCommerceRequest(`/products/categories/${id}`, { method: 'PUT', body: data });
}

export async function deleteCategory(id: number) {
  return wooCommerceRequest(`/products/categories/${id}`, { method: 'DELETE' });
}

// ============================================
// MÉTODOS DE REPORTES
// ============================================

export async function getSalesReport(params?: {
  period?: string;
}) {
  return wooCommerceRequest('/reports/sales', { params });
}
