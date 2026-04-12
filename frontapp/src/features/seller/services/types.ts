export type ServiceStatus = 'disponible' | 'agotado';
export type ServiceSticker = 'liquidacion' | 'oferta' | 'nuevo' | 'bestseller' | '';

export interface Specialist {
    id: number;
    nombres: string;
    apellidos: string;
    especialidad: string;
    subespecialidad?: string;
    dni?: string;
    avatar_chars: string;
    color: string;
    foto?: string | null;
}

export interface Service {
    id: number;
    nombre: string;
    horario: string;
    estado: ServiceStatus;
    sticker: ServiceSticker;
    especialistas_ids: number[];
    category_id?: number | null;
    config?: {
        hora_inicio: string;
        hora_fin: string;
        duracion: number;
        max_citas: number;
        dias: string[];
    };
}

export interface Appointment {
    id: number;
    fecha: string;
    hora: string;
    duracionMinutos: number;
    especialistaId: number;
    cliente: string;
    servicio: string;
}
