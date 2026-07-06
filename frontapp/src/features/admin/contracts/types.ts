export type ContractStatus = 'ACTIVE' | 'PENDING' | 'EXPIRED';
export type ContractModality = 'VIRTUAL' | 'PHYSICAL';
export type ExpiryUrgency = 'normal' | 'warning' | 'critical';

export interface AuditEvent {
    timestamp: string;
    action: string;
    user: string;
}

export interface Contract {
    id: string;
    dbId: number;
    company: string;
    ruc: string;
    rep: string;
    dni: string;
    direccion: string;
    admin_name: string;
    admin_phone: string;
    admin_email: string;
    plan: string;
    type: string;
    modality: ContractModality;
    status: ContractStatus;
    start: string;
    end: string;
    storage_path: string;
    auditTrail?: AuditEvent[];
    expiryUrgency?: ExpiryUrgency;
}

export interface ContractFilters {
    query: string;
    modality: ContractModality | 'ALL';
    status: ContractStatus | 'ALL';
    dateType: 'SIGNATURE' | 'EXPIRY';
    dateLimit: string;
}

export interface ContractKPI {
    label: string;
    val: number | string;
    color: string;
    icon: string;
}
