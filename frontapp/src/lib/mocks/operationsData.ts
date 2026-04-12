import { OperationalData } from '@/lib/types/admin/operations';

export const MOCK_OPERATIONS_DATA: OperationalData = {
    proveedores: [
        {
            id: 1,
            nombre: "Juan Pérez",
            ruc: "10456789123",
            tipo: "Economista",
            especialidad: "Análisis Financiero",
            estado: "Activo",
            fecha_renovacion: "2024-12-31",
            proyectos: ["Auditoría Anual", "Planificación 2024"],
            certificaciones: ["CFA", "CPA"],
            total_recibos: 15,
            total_gastado: 45000
        },
        {
            id: 2,
            nombre: "Mariana Gómez Silva",
            ruc: "20456789124",
            tipo: "Contador",
            especialidad: "Tributación",
            estado: "Suspendido",
            fecha_renovacion: "2023-11-15",
            proyectos: ["Declaración Anual 2023"],
            certificaciones: ["Especialista Tributario"],
            total_recibos: 8,
            total_gastado: 24000
        },
        {
            id: 3,
            nombre: "Consultora Intech S.A.C.",
            ruc: "20556789125",
            tipo: "Ingeniero",
            especialidad: "Desarrollo de Software",
            estado: "Activo",
            fecha_renovacion: "2025-06-30",
            proyectos: ["Marketplace V4", "App Móvil"],
            certificaciones: ["ISO 27001", "AWS Certified"],
            total_recibos: 24,
            total_gastado: 125000
        }
    ],
    gastos: [
        {
            id: "EXP-2024-001",
            proveedor_id: 1,
            proveedor_nombre: "Juan Pérez",
            categoria: "Economista",
            concepto: "Análisis presupuestal (Enero)",
            monto: 3000,
            fecha: "2024-02-15",
            estado: "Pagado"
        },
        {
            id: "EXP-2024-002",
            proveedor_id: 3,
            proveedor_nombre: "Consultora Intech S.A.C.",
            categoria: "Ingeniero",
            concepto: "Servicio Cloud AWS (Febrero)",
            monto: 7500,
            fecha: "2024-02-28",
            estado: "Pendiente"
        },
        {
            id: "EXP-2024-003",
            proveedor_id: 2,
            proveedor_nombre: "Mariana Gómez Silva",
            categoria: "Contador",
            concepto: "Regularización Tributaria",
            monto: 4500,
            fecha: "2024-01-20",
            estado: "Pagado"
        }
    ],
    credenciales: [
        {
            id: 101,
            rol: "Administrador Global",
            modulos: ["Todos"],
            usuarios_asignados: 3,
            estado: "Activo"
        },
        {
            id: 102,
            rol: "Auditor Financiero",
            modulos: ["Finanzas", "Gestión Operativa"],
            usuarios_asignados: 5,
            estado: "Activo"
        },
        {
            id: 103,
            rol: "Moderador de Catálogo",
            modulos: ["Vendedores", "Catálogo"],
            usuarios_asignados: 12,
            estado: "Activo"
        }
    ],
    auditLogs: [
        {
            action: "PROV_CREATE_SUCCESS",
            entity: "NEW_PROVIDER",
            user: "Admin-Auth",
            reason: "Nuevo proveedor registrado",
            timestamp: "2024-02-19 14:30"
        },
        {
            action: "2FA_VERIFICATION",
            entity: "AUTH_SYSTEM",
            user: "Admin-Auth",
            reason: "Validación de identidad exitosa",
            timestamp: "2024-02-19 14:28"
        },
        {
            action: "EXPENSE_PAID",
            entity: "EXP-2024-001",
            user: "Finance-Bot",
            reason: "Pago procesado vía pasarela",
            timestamp: "2024-02-15 09:12"
        }
    ]
};
