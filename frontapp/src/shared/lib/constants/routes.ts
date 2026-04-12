/**
 * Constantes de rutas de la aplicación
 * Centraliza todas las URLs para evitar strings sueltos
 */
export const ROUTES = {
    // Públicas
    HOME: '/',
    NOSOTROS: '/nosotros',
    CONTACTO: '/contacto',
    BIOBLOG: '/bioblog',
    BIOFORO: '/bioforo',
    BLOG: '/blog',
    TIENDAS: '/tiendasregistradas',
    PRODUCTOS: '/productos',
    PRODUCTO_DETALLE: (id: string | number) => `/productos/${id}`,
    SERVICIOS: '/servicios',
    BUSCAR: '/buscar',
    CARRITO: '/carrito',
    LOGIN_TIENDA: '/login-tienda',

    // Auth
    LOGIN: '/login',
    REGISTRO: '/registro',

    // Admin (existente)
    ADMIN: '/admin',
    SELLER: '/seller',
} as const;
