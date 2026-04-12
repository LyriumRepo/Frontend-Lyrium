/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RATE LIMITING
 * 
 * Implementación de rate limiting para APIs de Next.js.
 * Usa Map en memoria (para desarrollo) o Upstash Redis (producción).
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { NextResponse } from 'next/server';

export type RateLimitType = 'window' | 'sliding' | 'fixed';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  type?: RateLimitType;
  keyGenerator?: (request: Request) => string;
}

export interface RateLimitInfo {
  limit: number;
  current: number;
  remaining: number;
  reset: number;
}

const inMemoryStore = new Map<string, { count: number; resetTime: number }>();

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000,
  maxRequests: 100,
  type: 'fixed',
};

function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 
             request.headers.get('x-real-ip') || 
             'unknown';
  return ip;
}

function cleanupExpiredKeys(): void {
  const now = Date.now();
  for (const [key, value] of inMemoryStore.entries()) {
    if (value.resetTime <= now) {
      inMemoryStore.delete(key);
    }
  }
}

export function createRateLimiter(config: Partial<RateLimitConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  return async function rateLimitMiddleware(
    request: Request,
    options?: { skip?: boolean }
  ): Promise<{ success: boolean; info?: RateLimitInfo; response?: NextResponse }> {
    if (options?.skip) {
      return { success: true };
    }

    cleanupExpiredKeys();

    const key = finalConfig.keyGenerator 
      ? finalConfig.keyGenerator(request)
      : getClientIP(request);
    
    const storeKey = `${key}:${Math.floor(Date.now() / finalConfig.windowMs)}`;
    const now = Date.now();
    const windowStart = Math.floor(now / finalConfig.windowMs) * finalConfig.windowMs;
    const windowEnd = windowStart + finalConfig.windowMs;

    let record = inMemoryStore.get(storeKey);
    
    if (!record || record.resetTime <= now) {
      record = { count: 0, resetTime: windowEnd };
    }

    record.count++;
    inMemoryStore.set(storeKey, record);

    const info: RateLimitInfo = {
      limit: finalConfig.maxRequests,
      current: record.count,
      remaining: Math.max(0, finalConfig.maxRequests - record.count),
      reset: Math.ceil((record.resetTime - now) / 1000),
    };

    const headers = {
      'X-RateLimit-Limit': String(info.limit),
      'X-RateLimit-Remaining': String(info.remaining),
      'X-RateLimit-Reset': String(info.reset),
      'Retry-After': info.remaining === 0 ? String(info.reset) : '0',
    };

    if (record.count > finalConfig.maxRequests) {
      return {
        success: false,
        info,
        response: NextResponse.json(
          { 
            error: 'Demasiadas solicitudes', 
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: info.reset 
          },
          { status: 429, headers }
        ),
      };
    }

    return { success: true, info };
  };
}

export function addRateLimitHeaders(
  response: NextResponse,
  info?: RateLimitInfo
): NextResponse {
  if (info) {
    response.headers.set('X-RateLimit-Limit', String(info.limit));
    response.headers.set('X-RateLimit-Remaining', String(info.remaining));
    response.headers.set('X-RateLimit-Reset', String(info.reset));
  }
  return response;
}

export const rateLimiters = {
  strict: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 10,
  }),
  
  standard: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 60,
  }),
  
  relaxed: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 120,
  }),
  
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
  }),
  
  write: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 30,
  }),
  
  rapifac: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 10,
  }),
};
