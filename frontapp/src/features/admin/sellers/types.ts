export type SellerStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'REJECTED' | 'activa' | 'suspendida' | 'baja_logica';
export type ProductStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'en_espera';
export type NotificationType = 'critico' | 'seguridad' | 'operativo';
export type auditAction = 'CAMBIO ESTADO' | 'MODERACIÓN' | 'SEGURIDAD: DESAFÍO FORZADO' | 'SISTEMA';

export interface Credentials {
    vulnerable: boolean;
    fallidos: number;
    proximo_vencimiento: string;
}

export interface Seller {
    id: number;
    name: string;
    company: string;
    email: string;
    status: SellerStatus | string;
    productsTotal: number;
    productsPending: number;
    regDate: string;
    credenciales?: Credentials;
    contractStatus?: 'VIGENTE' | 'PENDIENTE' | 'VENCIDO';
}

export interface Product {
    id: number;
    name: string;
    seller: string;
    sellerId: number;
    category: string;
    price: number;
    status: ProductStatus | string;
    date?: string;
    imageUrl?: string;
}

export interface Notification {
    id: number;
    tipo: NotificationType;
    modulo_origen: string;
    entidad_relacionada: string;
    mensaje: string;
    timestamp: string;
    estado_revision: 'nueva' | 'leida';
}

export interface AuditEntry {
    id: number;
    usuario: string;
    accion: auditAction | string;
    entidad: string;
    fecha: string;
    metadata: {
        motivo: string;
    };
}

export interface ControlVendedoresData {
    sellers: Seller[];
    products: Product[];
    notifications: Notification[];
    auditoria: AuditEntry[];
}

export interface Stats {
    totalSellers: number;
    activeSellers: number;
    pendingProducts: number;
    alerts: number;
}
