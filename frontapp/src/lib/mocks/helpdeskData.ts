import { MesaAyudaData } from "@/features/admin/helpdesk/types";

export const MOCK_HELPDESK_DATA: MesaAyudaData = {
    tickets: [
        {
            id: 1,
            id_display: "TKT-2024-001",
            numero: "TKT-2024-001",
            titulo: "Error en liquidación de comisión",
            descripcion: "El vendedor reporta que la comisión aplicada es del 15% en lugar del 10% acordado.",
            vendedor: { id: 101, nombre: "Juan Pérez", empresa: "BioMarket Solutions" },
            admin_asignado: { id: 1, nombre: "Carlos López" },
            categoria: "payments",
            prioridad: "alta",
            estado: "abierto",
            fecha_creacion: "2024-02-18",
            fecha_actualizacion: "Hace 2 horas",
            total_mensajes: 3,
            mensajes_sin_leer: 1,
            mensajes: [
                {
                    id: 1001,
                    usuario: "Juan Pérez",
                    contenido: "Hola, he notado un error en mi última liquidación.",
                    timestamp: "10:30 AM",
                    leido: true
                },
                {
                    id: 1002,
                    usuario: "Carlos López (Admin)",
                    contenido: "Estamos revisando su caso con el departamento de finanzas.",
                    timestamp: "11:15 AM",
                    leido: true
                },
                {
                    id: 1003,
                    usuario: "Juan Pérez",
                    contenido: "Gracias, espero su pronta respuesta.",
                    timestamp: "11:45 AM",
                    leido: false
                }
            ]
        },
        {
            id: 2,
            id_display: "TKT-2024-002",
            numero: "TKT-2024-002",
            titulo: "Producto rechazado injustamente",
            descripcion: "El producto 'Aceite de Neem' fue rechazado por supuesta falta de registro sanitario.",
            vendedor: { id: 102, nombre: "María Garcia", empresa: "EcoDistribuidora S.A." },
            admin_asignado: { id: 2, nombre: "Ana Martínez" },
            categoria: "tech",
            prioridad: "media",
            estado: "proceso",
            fecha_creacion: "2024-02-19",
            fecha_actualizacion: "Hace 10 min",
            total_mensajes: 2,
            mensajes_sin_leer: 0,
            mensajes: [
                {
                    id: 2001,
                    usuario: "María Garcia",
                    contenido: "Adjunto el registro sanitario actualizado para el producto.",
                    timestamp: "02:15 PM",
                    leido: true
                },
                {
                    id: 2002,
                    usuario: "Ana Martínez (Admin)",
                    contenido: "Recibido. Lo escalo a moderación senior para re-evaluación.",
                    timestamp: "02:20 PM",
                    leido: true
                }
            ]
        }
    ],
    faq: [
        {
            id: 1,
            titulo: "¿Cómo configurar mi pasarela de pagos?",
            categoria: "Pagos & Cobros",
            contenido: "Para configurar su pasarela, diríjase al módulo 'Mis Datos' > 'Finanzas' y complete el formulario de vinculación con Rapifac.",
            visitas: 1240,
            util_si: 450,
            util_no: 12,
            palabras_clave: ["pagos", "configuración", "rapifac"]
        },
        {
            id: 2,
            titulo: "Políticas de envío para productos orgánicos",
            categoria: "Logística",
            contenido: "Todos los productos deben contar con embalaje hermético y etiqueta de 'Frágil'. El tiempo máximo de despacho es de 48 horas.",
            visitas: 890,
            util_si: 320,
            util_no: 5,
            palabras_clave: ["envío", "logística", "empaque"]
        }
    ],
    vendedores: [
        { id: 101, nombre: "Juan Pérez", empresa: "BioMarket Solutions" },
        { id: 102, nombre: "María Garcia", empresa: "EcoDistribuidora S.A." }
    ],
    admins: [
        { id: 1, nombre: "Carlos López", rol: "Soporte Senior" },
        { id: 2, nombre: "Ana Martínez", rol: "Moderador" },
        { id: 3, nombre: "Sistema Lyrium", rol: "Bot" }
    ],
    auditoria: [
        {
            id: 5001,
            tienda: "EcoDistribuidora S.A.",
            accion: "Escalamiento",
            timestamp: "2024-02-19 14:22:00",
            responsable: "Ana Martínez",
            detalles: "Escalado a soporte técnico por bug en carga de archivos."
        },
        {
            id: 5002,
            tienda: "BioMarket Solutions",
            accion: "Respuesta",
            timestamp: "2024-02-19 11:15:00",
            responsable: "Carlos López",
            detalles: "Enviada respuesta informativa sobre tiempos de liquidación."
        }
    ]
};
