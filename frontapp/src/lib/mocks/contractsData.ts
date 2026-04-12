import { Contract } from '@/lib/types/admin/contracts';

export const MOCK_CONTRACTS_DATA: Contract[] = [
    {
        id: "CTR-2024-845",
        company: "TechStore SAC",
        ruc: "20123456781",
        rep: "Carlos Mendoza",
        type: "Comisión Mercantil V2",
        modality: "VIRTUAL",
        status: "ACTIVE",
        start: "2024-01-15",
        end: "2025-01-15",
        storage_path: "TechStore/2024/VIRTUAL",
        auditTrail: [
            { timestamp: "2024-01-15T10:00:00Z", action: "Firma Digital Validada", user: "Admin (System)" }
        ],
        expiryUrgency: "normal"
    },
    {
        id: "CTR-2024-102",
        company: "Comercializadora del Sur EIRL",
        ruc: "10456123451",
        rep: "Ana López",
        type: "Distribución Exclusiva",
        modality: "PHYSICAL",
        status: "PENDING",
        start: "2024-02-10",
        end: "2025-02-10",
        storage_path: "Pendiente de Carga",
        auditTrail: [
            { timestamp: "2024-02-10T14:30:00Z", action: "Contrato Emitido - Esperando Firma", user: "Admin (System)" }
        ],
        expiryUrgency: "normal"
    },
    {
        id: "CTR-2023-933",
        company: "Inversiones ABC SAC",
        ruc: "20888877791",
        rep: "Juan Pérez",
        type: "Comisión Mercantil V1",
        modality: "PHYSICAL",
        status: "EXPIRED",
        start: "2023-01-05",
        end: "2024-01-05",
        storage_path: "Inversiones_ABC/2023/PHYSICAL",
        auditTrail: [
            { timestamp: "2024-01-05T23:59:59Z", action: "Contrato Expirado Automáticamente", user: "Admin (System)" }
        ],
        expiryUrgency: "critical"
    },
    {
        id: "CTR-2024-055",
        company: "Moda y Estilo SAC",
        ruc: "20444555661",
        rep: "Lucía Valverde",
        type: "Acuerdo de Dropshipping",
        modality: "VIRTUAL",
        status: "ACTIVE",
        start: "2024-01-20",
        end: "2024-03-20", // Pronto a expirar
        storage_path: "Moda_Estilo/2024/VIRTUAL",
        auditTrail: [
            { timestamp: "2024-01-20T09:15:00Z", action: "Firma Digital Validada", user: "Admin (System)" }
        ],
        expiryUrgency: "warning"
    }
];
