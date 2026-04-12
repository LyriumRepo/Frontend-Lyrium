import { Ticket } from './types';

export const MOCK_TICKETS: Ticket[] = [
    {
        id: 1,
        id_display: "2026-001",
        titulo: "Error en carga de RUC",
        descripcion: "No puedo actualizar el RUC en Mis Datos...",
        status: "proceso",
        tiempo: "Hace 2 horas",
        type: "tech",
        critical: false,
        mensajes_count: 1,
        tienda: { razon_social: "Agro Industrias del Norte S.A.C.", nombre_comercial: "AgroMarket Lyrium" },
        contacto_adm: { nombre: "Ricardo", apellido: "Sánchez", numeros: "988-776-554 / 01-445-667", correo: "rsanchez@agricola.pe" },
        mensajes: [
            { id: 101, user: "Ricardo Sánchez", role: "Vendedor", timestamp: "14:20", texto: "Hola, estoy intentando actualizar mi RUC pero sale un error de red al guardar.", isUser: true, hora: "14:20" }
        ]
    },
    {
        id: 2,
        id_display: "2026-002",
        titulo: "Validación de Especialista",
        descripcion: "Ya subí el título de Juan Pérez...",
        status: "resuelto",
        tiempo: "Ayer",
        type: "documentation",
        critical: false,
        mensajes_count: 1,
        tienda: { razon_social: "Servicios Bio-Médicos EIRL", nombre_comercial: "BioHealth Shop" },
        contacto_adm: { nombre: "Elena", apellido: "Torres", numeros: "912-334-455", correo: "etorres@gmail.com" },
        mensajes: [
            { id: 102, user: "Elena Torres", role: "Vendedor", timestamp: "09:00", texto: "Ya subí los documentos requeridos.", isUser: true, hora: "09:00" }
        ]
    },
    {
        id: 3,
        id_display: "2026-003",
        titulo: "Fallo Crítico en Pasarela",
        descripcion: "No se procesan pagos con tarjeta VISA",
        status: "proceso",
        tiempo: "Hace 10 min",
        type: "tech",
        critical: true,
        mensajes_count: 1,
        tienda: { razon_social: "Distribuidora de Insumos Médicos Lima", nombre_comercial: "MedInsumos" },
        contacto_adm: { nombre: "Marcos", apellido: "Ruiz", numeros: "999-000-111", correo: "mruiz@outlook.com" },
        mensajes: [
            { id: 103, user: "Marcos Ruiz", role: "Vendedor", timestamp: "22:50", texto: "Urgente: Todos los clientes están reportando error al pagar. Adjunto log.", isUser: true, hora: "22:50" }
        ]
    }
];
