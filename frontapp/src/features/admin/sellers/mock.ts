import { ControlVendedoresData } from "./types";

export const MOCK_CONTROL_DATA: ControlVendedoresData = {
    sellers: [
        {
            id: 1,
            name: "Juan Pérez",
            company: "BioMarket Solutions",
            email: "juan@biomarket.com",
            status: "activa",
            productsTotal: 145,
            productsPending: 3,
            regDate: "2023-10-15",
            credenciales: {
                vulnerable: false,
                fallidos: 0,
                proximo_vencimiento: "2024-12-31"
            },
            contractStatus: 'VIGENTE'
        },
        {
            id: 2,
            name: "María Garcia",
            company: "EcoDistribuidora S.A.",
            email: "mgarcia@ecodist.com",
            status: "suspendida",
            productsTotal: 89,
            productsPending: 0,
            regDate: "2023-11-20",
            credenciales: {
                vulnerable: true,
                fallidos: 5,
                proximo_vencimiento: "2024-03-15"
            },
            contractStatus: 'VENCIDO'
        }
    ],
    products: [
        {
            id: 101,
            name: "Aceite de Moringa Premium",
            seller: "BioMarket Solutions",
            sellerId: 1,
            category: "Aceites Esenciales",
            price: 25.99,
            status: "en_espera",
            date: "2024-02-18",
            imageUrl: "https://images.unsplash.com/photo-1617814076367-b757c98907b4?w=500&auto=format"
        },
        {
            id: 102,
            name: "Set de Semillas Orgánicas",
            seller: "EcoDistribuidora S.A.",
            sellerId: 2,
            category: "Agricultura",
            price: 15.50,
            status: "en_espera",
            date: "2024-02-19",
            imageUrl: "https://images.unsplash.com/photo-1592150621344-82d67ede0bd9?w=500&auto=format"
        }
    ],
    notifications: [
        {
            id: 501,
            tipo: "critico",
            modulo_origen: "Seguridad",
            entidad_relacionada: "EcoDistribuidora S.A.",
            mensaje: "Detección de múltiples intentos fallidos de acceso. Cuenta suspendida preventivamente.",
            timestamp: "Hace 5 minutos",
            estado_revision: "nueva"
        },
        {
            id: 502,
            tipo: "operativo",
            modulo_origen: "Moderación",
            entidad_relacionada: "BioMarket Solutions",
            mensaje: "Se ha cargado un nuevo lote de productos (12) pendientes de aprobación por el administrador.",
            timestamp: "Hace 2 horas",
            estado_revision: "nueva"
        }
    ],
    auditoria: [
        {
            id: 1001,
            usuario: "Admin_Principal",
            accion: "CAMBIO ESTADO",
            entidad: "EcoDistribuidora S.A.",
            fecha: "2024-02-19 14:30:15",
            metadata: { motivo: "Suspensión de seguridad por intentos fallidos de login (RF-04)" }
        },
        {
            id: 1002,
            usuario: "System_Bot",
            accion: "SISTEMA",
            entidad: "Global",
            fecha: "2024-02-19 12:00:00",
            metadata: { motivo: "Mantenimiento programado de base de datos finalizado con éxito." }
        }
    ]
};
