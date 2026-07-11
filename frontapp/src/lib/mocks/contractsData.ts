import { Contract } from '@/lib/types/admin/contracts';

export const MOCK_CONTRACTS_DATA: Contract[] = [
    {
        id: "CTR-2024-845",
        dbId: 1,
        company: "TechStore SAC",
        ruc: "20123456781",
        rep: "Carlos Mendoza",
        dni: "44123456",
        direccion: "Av. Industrial 123, Lima",
        admin_name: "María García",
        admin_phone: "999888777",
        admin_email: "maria@techstore.pe",
        plan: "Crece",
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
        dbId: 2,
        company: "Comercializadora del Sur EIRL",
        ruc: "10456123451",
        rep: "Ana López",
        dni: "42111222",
        direccion: "Jr. Las Flores 456, Arequipa",
        admin_name: "Pedro Sánchez",
        admin_phone: "958444333",
        admin_email: "pedro@comercializadora.pe",
        plan: "Emprende",
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
        dbId: 3,
        company: "Inversiones ABC SAC",
        ruc: "20888877791",
        rep: "Juan Pérez",
        dni: "40123456",
        direccion: "Av. Principal 789, Cusco",
        admin_name: "Lucía Ramos",
        admin_phone: "965111222",
        admin_email: "lucia@inversionesabc.pe",
        plan: "Especial",
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
        dbId: 4,
        company: "Moda y Estilo SAC",
        ruc: "20444555661",
        rep: "Lucía Valverde",
        dni: "43123123",
        direccion: "Calle La Moda 321, Miraflores",
        admin_name: "Ricardo Torres",
        admin_phone: "987654321",
        admin_email: "ricardo@modaestilo.pe",
        plan: "Crece",
        type: "Acuerdo de Dropshipping",
        modality: "VIRTUAL",
        status: "ACTIVE",
        start: "2024-01-20",
        end: "2024-03-20",
        storage_path: "Moda_Estilo/2024/VIRTUAL",
        auditTrail: [
            { timestamp: "2024-01-20T09:15:00Z", action: "Firma Digital Validada", user: "Admin (System)" }
        ],
        expiryUrgency: "warning"
    }
];
