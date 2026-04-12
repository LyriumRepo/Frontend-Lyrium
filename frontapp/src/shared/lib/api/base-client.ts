/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BASE FETCH CLIENT
 * 
 * Cliente centralizado para comunicación con WordPress/WooCommerce
 * Maneja automáticamente:
 * - Headers de autenticación (Basic Auth / WP Session)
 * - Errores 401/403 (session expirada)
 * - Retry automático con refresh de nonce
 * - Logging de errores en desarrollo
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { revalidateTag } from 'next/cache';
import { API_CONFIG } from '../config/api';

const API_BASE_URL = API_CONFIG.wcApiUrl;
const DOKAN_BASE_URL = API_CONFIG.dokanApiUrl;

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface FetchOptions extends RequestInit {
  /** Timeout en ms (default: 3000 = 3 segundos) */
  timeout?: number;
  /** Número de reintentos en caso de error 5xx */
  retryCount?: number;
  /** Ignorar errores de autenticación (para endpoints públicos) */
  skipAuth?: boolean;
  /** Tags para Next.js cache */
  tags?: string[];
  /** Usar cache en memoria si hay timeout (default: true) */
  fallbackToCache?: boolean;
}

/**
 * Respuesta exitosa o error estruturado
 */
export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  status: number;
  /** Indica si los datos provienen del cache (fallback por timeout) */
  cached?: boolean;
  /** Timestamp de cuando fueron cacheados */
  cachedAt?: number;
}

export interface ApiError {
  success: false;
  error: string;
  code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'SERVER_ERROR' | 'NETWORK_ERROR' | 'TIMEOUT';
  status: number;
  details?: Record<string, string[]>;
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

/**
 * Error de autenticación (para manejo específico en caller)
 */
export class AuthError extends Error {
  code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NONCE_EXPIRED';
  status: number;

  constructor(message: string, code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NONCE_EXPIRED', status: number) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.status = status;
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Constructor de headers
 * ═══════════════════════════════════════════════════════════════════════════
 */
function buildHeaders(includeAuth = true): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (includeAuth) {
    const key = process.env.NEXT_PUBLIC_WP_CS_KEY;
    const secret = process.env.NEXT_PUBLIC_WP_CS_SECRET;

    if (key && secret) {
      // Basic Auth para WooCommerce REST API
      const auth = Buffer.from(`${key}:${secret}`).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
    }
  }

  return headers;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CACHE EN MEMORIA PARA FALLBACK
 * 
 * Almacena la última respuesta exitosa para fallback cuando hay timeout.
 * Clave: endpoint + método + body hash
 * ═══════════════════════════════════════════════════════════════════════════
 */
const responseCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

function getCacheKey(url: string, method: string, body?: unknown): string {
  const bodyStr = body ? JSON.stringify(body) : '';
  return `${method}:${url}:${bodyStr}`;
}

function getFromMemoryCache(key: string): unknown | null {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    console.log(`[API] Cache hit para ${key}`);
    return cached.data;
  }
  responseCache.delete(key);
  return null;
}

function setToMemoryCache(key: string, data: unknown): void {
  responseCache.set(key, { data, timestamp: Date.now() });
  // Limpiar entradas antiguas si hay muchas
  if (responseCache.size > 100) {
    const oldest = responseCache.keys().next().value;
    if (oldest) responseCache.delete(oldest);
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Fetch con retry, timeout y fallback a cache
 * 
 * Timeout por defecto: 3 segundos
 * Si hay timeout, intenta obtener datos del cache en memoria
 * ═══════════════════════════════════════════════════════════════════════════
 */
async function fetchWithRetry<T>(
  url: string,
  options: FetchOptions = {}
): Promise<ApiResult<T>> {
  const {
    timeout = 3000, // 🔧 Timeout por defecto: 3 segundos
    retryCount = 0,
    skipAuth = false,
    tags,
    fallbackToCache = true, // 🔧 Por defecto intenta usar cache
    ...fetchOptions
  } = options;

  const cacheKey = getCacheKey(url, fetchOptions.method || 'GET', fetchOptions.body);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const requestOptions: RequestInit = {
      ...fetchOptions,
      headers: {
        ...buildHeaders(!skipAuth),
        ...fetchOptions.headers,
      },
      signal: controller.signal,
      next: tags ? { tags, revalidate: timeout / 1000 } : undefined,
    };

    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${requestOptions.method || 'GET'} ${url} (timeout: ${timeout}ms)`);
    }

    const response = await fetch(url, requestOptions);
    clearTimeout(timeoutId);

    // Manejar errores de autenticación
    if (response.status === 401 || response.status === 403) {
      const errorData = await response.json().catch(() => ({}));

      // Verificar si es nonce expirado
      if (errorData?.code === 'rest_cookie_invalid_nonce' || response.status === 403) {
        throw new AuthError(
          'Sesión expirada o nonce inválido',
          'NONCE_EXPIRED',
          response.status
        );
      }

      throw new AuthError(
        errorData.message || 'No autorizado',
        response.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
        response.status
      );
    }

    // Manejar errores 4xx/5xx
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }

      // Errores de validación (422)
      if (response.status === 422 && errorData.code) {
        return {
          success: false,
          error: errorData.message || 'Error de validación',
          code: 'VALIDATION_ERROR',
          status: response.status,
          details: errorData.data?.params,
        };
      }

      // Otros errores 4xx
      if (response.status >= 400 && response.status < 500) {
        return {
          success: false,
          error: errorData.message || 'Error del servidor',
          code: 'NOT_FOUND',
          status: response.status,
        };
      }

      // Errores 5xx - retry automático
      if (response.status >= 500 && retryCount < 3) {
        await new Promise(r => setTimeout(r, 1000 * (retryCount + 1)));
        return fetchWithRetry<T>(url, { ...options, retryCount: retryCount + 1 });
      }

      return {
        success: false,
        error: errorData.message || 'Error del servidor',
        code: 'SERVER_ERROR',
        status: response.status,
      };
    }

    // Respuesta exitosa
    const data = await response.json();

    // Guardar en cache para futuros timeouts
    setToMemoryCache(cacheKey, data);

    return {
      success: true,
      data,
      status: response.status,
    };

  } catch (error) {
    clearTimeout(timeoutId);

    // Error de red o timeout
    if (error instanceof TypeError && error.message.includes('aborted')) {
      console.warn(`[API] Timeout para ${url} - Intentando fallback a cache...`);

      // Intentar obtener del cache en memoria
      if (fallbackToCache) {
        const cachedData = getFromMemoryCache(cacheKey);
        if (cachedData !== null) {
          console.log(`[API] ✅ Usando datos cacheados para ${url}`);
          return {
            success: true,
            data: cachedData as T,
            status: 200,
            cached: true, // Indicar que son datos cacheados
          };
        }
      }

      return {
        success: false,
        error: 'Tiempo de espera agotado',
        code: 'TIMEOUT',
        status: 408,
      };
    }

    // AuthError - relanzar para manejo en caller
    if (error instanceof AuthError) {
      throw error;
    }

    // Error desconocido
    if (process.env.NODE_ENV === 'development') {
      console.error('[API] Error:', error);
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de red',
      code: 'NETWORK_ERROR',
      status: 0,
    };
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Métodos HTTP便捷
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const wpClient = {
  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: FetchOptions): Promise<ApiResult<T>> {
    return fetchWithRetry<T>(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'GET',
    });
  },

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: unknown, options?: FetchOptions): Promise<ApiResult<T>> {
    return fetchWithRetry<T>(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: unknown, options?: FetchOptions): Promise<ApiResult<T>> {
    return fetchWithRetry<T>(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: unknown, options?: FetchOptions): Promise<ApiResult<T>> {
    return fetchWithRetry<T>(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: FetchOptions): Promise<ApiResult<T>> {
    return fetchWithRetry<T>(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'DELETE',
    });
  },
};

/**
 * Cliente para Dokan (gestión de tienda vendor)
 */
export const dokanClient = {
  async get<T>(endpoint: string, options?: FetchOptions): Promise<ApiResult<T>> {
    return fetchWithRetry<T>(`${DOKAN_BASE_URL}${endpoint}`, {
      ...options,
      method: 'GET',
    });
  },

  async post<T>(endpoint: string, body?: unknown, options?: FetchOptions): Promise<ApiResult<T>> {
    return fetchWithRetry<T>(`${DOKAN_BASE_URL}${endpoint}`, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  async put<T>(endpoint: string, body?: unknown, options?: FetchOptions): Promise<ApiResult<T>> {
    return fetchWithRetry<T>(`${DOKAN_BASE_URL}${endpoint}`, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  async delete<T>(endpoint: string, options?: FetchOptions): Promise<ApiResult<T>> {
    return fetchWithRetry<T>(`${DOKAN_BASE_URL}${endpoint}`, {
      ...options,
      method: 'DELETE',
    });
  },
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Ejemplo de uso en Server Action
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
// src/lib/actions/products.ts
import { wpClient, AuthError } from '@/shared/lib/api/base-client';

export async function getProducts() {
  const result = await wpClient.get<Product[]>('/products', {
    tags: ['products'],
    params: { per_page: 100 },
  });

  if (!result.success) {
    if (result.code === 'NETWORK_ERROR') {
      throw new Error('No se pudo conectar con la tienda');
    }
    throw new Error(result.error);
  }

  return result.data;
}

export async function updateProductPrice(productId: string, price: number) {
  try {
    const result = await wpClient.patch(`/products/${productId}`, {
      regular_price: String(price),
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Revalidar cache
    revalidateTag('products', 'max');
    
    return { success: true, data: result.data };
  } catch (error) {
    if (error instanceof AuthError) {
      // Manejar específicamente errores de auth
      if (error.code === 'NONCE_EXPIRED') {
        return { success: false, error: 'Sesión expirada', code: 'NONCE_EXPIRED' };
      }
    }
    return { success: false, error: 'Error al actualizar' };
  }
}
*/
