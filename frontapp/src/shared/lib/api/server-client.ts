/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BASE FETCH CLIENT (SERVER-SIDE ONLY)
 * 
 * Cliente para comunicación con APIs externas desde el servidor.
 * ⚠️ USA VARIABLES DE SERVIDOR (sin NEXT_PUBLIC_ prefix)
 * ⚠️ NO IMPORTAR EN COMPONENTES CLIENTE
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { API_CONFIG } from '../config/api';

const WC_BASE_URL = API_CONFIG.wcApiUrl;
const DOKAN_BASE_URL = API_CONFIG.dokanApiUrl;

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface FetchOptions extends RequestInit {
  timeout?: number;
  retryCount?: number;
  skipAuth?: boolean;
  tags?: string[];
  fallbackToCache?: boolean;
  params?: Record<string, string | number | boolean | undefined>;
}

export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  status: number;
  cached?: boolean;
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
 * Construir headers con credenciales de SERVIDOR (no NEXT_PUBLIC_*)
 */
function buildServerHeaders(includeAuth = true): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (includeAuth) {
    // ✅ USAR VARIABLES DE SERVIDOR (sin NEXT_PUBLIC_)
    const key = process.env.WC_CS_KEY;
    const secret = process.env.WC_CS_SECRET;

    if (key && secret) {
      const auth = Buffer.from(`${key}:${secret}`).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
    } else {
      console.warn('[ServerClient] ⚠️ WC_CS_KEY o WC_CS_SECRET no configurados');
    }
  }

  return headers;
}

/**
 * Cache en memoria para fallback por timeout
 */
const responseCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCacheKey(url: string, method: string, body?: unknown): string {
  const bodyStr = body ? JSON.stringify(body) : '';
  return `${method}:${url}:${bodyStr}`;
}

function getFromMemoryCache(key: string): unknown | null {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }
  responseCache.delete(key);
  return null;
}

function setToMemoryCache(key: string, data: unknown): void {
  responseCache.set(key, { data, timestamp: Date.now() });
  if (responseCache.size > 100) {
    const oldest = responseCache.keys().next().value;
    if (oldest) responseCache.delete(oldest);
  }
}

async function fetchWithRetry<T>(
  url: string,
  options: FetchOptions = {}
): Promise<ApiResult<T>> {
  const {
    timeout = 10000,
    retryCount = 0,
    skipAuth = false,
    tags,
    fallbackToCache = true,
    params,
    ...fetchOptions
  } = options;

  // Construir URL con parámetros
  const urlWithParams = new URL(url);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        urlWithParams.searchParams.set(key, String(value));
      }
    });
  }

  const cacheKey = getCacheKey(urlWithParams.toString(), fetchOptions.method || 'GET', fetchOptions.body);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const requestOptions: RequestInit = {
      ...fetchOptions,
      headers: {
        ...buildServerHeaders(!skipAuth),
        ...fetchOptions.headers,
      },
      signal: controller.signal,
    };

    if (process.env.NODE_ENV === 'development') {
      console.log(`[ServerAPI] ${requestOptions.method || 'GET'} ${url}`);
    }

    const response = await fetch(url, requestOptions);
    clearTimeout(timeoutId);

    if (response.status === 401 || response.status === 403) {
      throw new AuthError(
        'No autorizado',
        response.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
        response.status
      );
    }

    if (!response.ok) {
      if (response.status >= 500 && retryCount < 3) {
        await new Promise(r => setTimeout(r, 1000 * (retryCount + 1)));
        return fetchWithRetry<T>(url, { ...options, retryCount: retryCount + 1 });
      }
      return {
        success: false,
        error: response.statusText,
        code: 'SERVER_ERROR',
        status: response.status,
      };
    }

    const data = await response.json();
    setToMemoryCache(cacheKey, data);

    return {
      success: true,
      data,
      status: response.status,
    };

  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof TypeError && error.message.includes('aborted')) {
      if (fallbackToCache) {
        const cachedData = getFromMemoryCache(cacheKey);
        if (cachedData !== null) {
          return { success: true, data: cachedData as T, status: 200, cached: true };
        }
      }
      return { success: false, error: 'Timeout', code: 'TIMEOUT', status: 408 };
    }

    if (error instanceof AuthError) throw error;

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de red',
      code: 'NETWORK_ERROR',
      status: 0,
    };
  }
}

/**
 * Cliente WooCommerce (server-side)
 */
export const wcServerClient = {
  async get<T>(endpoint: string, options?: FetchOptions): Promise<ApiResult<T>> {
    return fetchWithRetry<T>(`${WC_BASE_URL}${endpoint}`, { method: 'GET', ...options });
  },
  async post<T>(endpoint: string, body?: unknown, options?: FetchOptions): Promise<ApiResult<T>> {
    return fetchWithRetry<T>(`${WC_BASE_URL}${endpoint}`, { method: 'POST', body: JSON.stringify(body), ...options });
  },
  async put<T>(endpoint: string, body?: unknown, options?: FetchOptions): Promise<ApiResult<T>> {
    return fetchWithRetry<T>(`${WC_BASE_URL}${endpoint}`, { method: 'PUT', body: JSON.stringify(body), ...options });
  },
  async patch<T>(endpoint: string, body?: unknown, options?: FetchOptions): Promise<ApiResult<T>> {
    return fetchWithRetry<T>(`${WC_BASE_URL}${endpoint}`, { method: 'PATCH', body: JSON.stringify(body), ...options });
  },
  async delete<T>(endpoint: string, options?: FetchOptions): Promise<ApiResult<T>> {
    return fetchWithRetry<T>(`${WC_BASE_URL}${endpoint}`, { method: 'DELETE', ...options });
  },
};

/**
 * Cliente Dokan (server-side)
 */
export const dokanServerClient = {
  async get<T>(endpoint: string, options?: FetchOptions): Promise<ApiResult<T>> {
    return fetchWithRetry<T>(`${DOKAN_BASE_URL}${endpoint}`, { method: 'GET', ...options });
  },
  async post<T>(endpoint: string, body?: unknown, options?: FetchOptions): Promise<ApiResult<T>> {
    return fetchWithRetry<T>(`${DOKAN_BASE_URL}${endpoint}`, { method: 'POST', body: JSON.stringify(body), ...options });
  },
  async put<T>(endpoint: string, body?: unknown, options?: FetchOptions): Promise<ApiResult<T>> {
    return fetchWithRetry<T>(`${DOKAN_BASE_URL}${endpoint}`, { method: 'PUT', body: JSON.stringify(body), ...options });
  },
};
