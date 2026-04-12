/**
 * Configuración centralizada de autenticación
 * Sincronizado con Backend Laravel
 */

export const AUTH_CONFIG = {
  /**
   * Roles válidos (sincronizados con Laravel)
   */
  roles: {
    ADMIN: 'administrator',
    SELLER: 'seller',
    CUSTOMER: 'customer',
    LOGISTICS: 'logistics_operator'
  } as const,

  /**
   * Rutas por rol
   */
  routes: {
    administrator: '/admin',
    seller: '/seller',
    customer: '/customer',
    logistics_operator: '/logistics',
    login: '/login',
    error: '/error/unauthorized'
  } as const,

  /**
   * Nombres de cookies/storage
   */
  storage: {
    token: 'laravel_token',
    user: 'user'
  } as const
} as const;

export type ValidUserRole = keyof typeof AUTH_CONFIG.routes;

/**
 * Obtiene la ruta de dashboard según el rol
 */
export function getRoleBasedRoute(role: string | undefined | null): string {
  if (!role) {
    console.error('[Auth] ⚠️ Usuario sin rol - Limpiando sesión');
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_CONFIG.storage.token);
      localStorage.removeItem(AUTH_CONFIG.storage.user);
    }
    return AUTH_CONFIG.routes.login;
  }

  const route = AUTH_CONFIG.routes[role as ValidUserRole];
  if (route) {
    console.log(`[Auth] ✓ Redirigiendo "${role}" → ${route}`);
    return route;
  }

  console.error(`[Auth] ⚠️ Rol no reconocido: "${role}"`);
  return AUTH_CONFIG.routes.error;
}

/**
 * Verifica si un rol es válido
 */
export function isValidRole(role: string | undefined | null): role is ValidUserRole {
  if (!role) return false;
  return role in AUTH_CONFIG.routes;
}
