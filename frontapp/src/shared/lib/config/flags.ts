// Forzar uso de API real (desactivar mocks para probar endpoints Laravel)
export const USE_MOCKS = false;

export const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';

export type ApiBackend = 'wp' | 'laravel';
export const API_BACKEND: ApiBackend = (process.env.NEXT_PUBLIC_API_BACKEND as ApiBackend) || 'laravel';

export const IS_DEV_MODE = process.env.NODE_ENV === 'development';
