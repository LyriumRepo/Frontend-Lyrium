import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AUTENTICACIÓN Y AUTORIZACIÓN
 * 
 * Funciones helper para validar sesión y roles en Server Components
 * y Server Actions
 * ═══════════════════════════════════════════════════════════════════════════
 */

export type UserRole = 'admin' | 'operador' | 'seller' | 'guest';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  vendorId?: number; // ID del vendedor en Dokan (para seller)
}

/**
 * Obtener el usuario actual desde los headers del middleware
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const headersList = await headers();
  
  const userId = headersList.get('x-user-id');
  const userEmail = headersList.get('x-user-email');
  const userRole = headersList.get('x-user-role') as UserRole;

  if (!userId || !userEmail) {
    return null;
  }

  // Determinar rol por email si no viene del middleware
  let role: UserRole = userRole || 'seller';
  
  if (userEmail.includes('admin')) {
    role = 'admin';
  } else if (userEmail.includes('operador')) {
    role = 'operador';
  }

  return {
    id: userId,
    email: userEmail,
    role,
    name: userEmail.split('@')[0],
  };
}

/**
 * Verificar que el usuario está autenticado
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return user;
}

/**
 * Verificar que el usuario tiene un rol específico
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<AuthUser> {
  const user = await requireAuth();
  
  if (!allowedRoles.includes(user.role)) {
    redirect('/unauthorized');
  }
  
  return user;
}

/**
 * Verificar que el usuario es admin
 */
export async function requireAdmin(): Promise<AuthUser> {
  return requireRole(['admin']);
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VALIDACIÓN DE PROPIEDAD (OWNERSHIP)
 * 
 * Asegura que el vendedor solo pueda acceder a sus propios datos
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface OwnershipCheck {
  isOwner: boolean;
  isAdmin: boolean;
  userId: string;
  resourceOwnerId?: string;
}

/**
 * Verificar si el usuario es owner del recurso
 * - Admin siempre es owner
 * - Seller debe coincidir el vendor_id
 */
export function checkOwnership(
  user: AuthUser,
  resourceOwnerId?: string | number
): OwnershipCheck {
  const ownerId = resourceOwnerId ? String(resourceOwnerId) : undefined;
  
  return {
    isOwner: user.role === 'admin' || user.id === ownerId,
    isAdmin: user.role === 'admin',
    userId: user.id,
    resourceOwnerId: ownerId,
  };
}

/**
 * Validar que el usuario tiene acceso al recurso
 * Lanza error si no tiene acceso
 */
export function validateOwnership(
  user: AuthUser,
  resourceOwnerId?: string | number
): void {
  const ownership = checkOwnership(user, resourceOwnerId);
  
  if (!ownership.isOwner) {
    throw new Error('No tienes permiso para acceder a este recurso');
  }
}

/**
 * Obtener el vendorId del usuario actual para filtrar queries
 */
export function getVendorFilter(user: AuthUser): number | undefined {
  // Admin y operador ven todos los vendedores
  if (user.role === 'admin' || user.role === 'operador') {
    return undefined;
  }
  
  // Seller solo ve sus propios datos
  // El vendorId debería venir de la sesión o base de datos
  return user.vendorId;
}
