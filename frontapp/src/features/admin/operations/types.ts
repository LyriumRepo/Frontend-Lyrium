export type ProviderType = 'Economista' | 'Contador' | 'Ingeniero';
export type ProviderStatus = 'Activo' | 'Suspendido' | 'Finalizado';

export interface Provider {
    id: number;
    nombre: string;
    ruc: string;
    tipo: ProviderType;
    especialidad: string;
    estado: ProviderStatus;
    fecha_renovacion: string;
    proyectos?: string[];
    certificaciones?: string[];
    total_recibos: number;
    total_gastado: number;
}

export interface ProviderFilters {
    query: string;
    type: ProviderType | 'ALL';
    status: ProviderStatus | 'ALL';
}

export type ExpenseStatus = 'Pagado' | 'Pendiente';

export interface Expense {
    id: string;
    proveedor_id: number;
    proveedor_nombre: string;
    categoria: ProviderType;
    concepto: string;
    monto: number;
    fecha: string;
    estado: ExpenseStatus;
}

export interface ExpenseFilters {
    category: ProviderType | 'ALL';
    provider: number | 'ALL';
    amount: 'ALL' | 'LOW' | 'MID' | 'HIGH';
    time: 'ALL' | 'FEBRUARY' | 'Q1';
}

export interface Credential {
    id: number;
    rol: string;
    modulos: string[];
    usuarios_asignados: number;
    estado: string;
}

export interface AuditLog {
    action: string;
    entity: string;
    user: string;
    reason: string;
    timestamp: string;
}

export interface OperationalData {
    proveedores: Provider[];
    gastos: Expense[];
    credenciales: Credential[];
    auditLogs: AuditLog[];
}

export type OperationalTab = 'proveedores' | 'gastos' | 'credenciales' | 'auditoria';

export interface OperationalKPI {
    label: string;
    val: string | number;
    icon: string;
    color: string;
}
