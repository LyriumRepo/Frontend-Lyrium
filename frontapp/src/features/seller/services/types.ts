export type DocumentType = 'dni' | 'carnet_extranjeria' | 'pasaporte' | 'ruc';
export type AvailabilityStatus = 'Disponible' | 'Indispuesto' | 'Ocupado';

export interface CalendarStatus {
  connected: boolean;
  calendar_id: string | null;
}

export interface AuthUrlResponse {
  url: string;
}

export interface Specialist {
  id: number;
  nombres: string;
  apellidos: string;
  dni: string;
  email: string;
  tipoDocumento?: string;
  numeroDocumento?: string;
  especialidad: string;
  subEspecialidad?: string;
  aniosExperiencia?: number;
  categoria: string;
  numeroColegiatura?: string;
  foto?: string;
  availability: AvailabilityStatus;
}

export type WeekDay =
  | 'Lunes'
  | 'Martes'
  | 'Miércoles'
  | 'Jueves'
  | 'Viernes'
  | 'Sábado'
  | 'Domingo';

export interface TimeBlock {
  inicio: string;
  fin: string;
}

export interface AttendanceDay {
  dia: WeekDay;
  bloques: TimeBlock[];
}

export interface Session {
  inicio: string;
  fin: string;
}

export type ServiceEstado = 'borrador' | 'publicado';

export type AnticipacionReserva = 24 | 48 | 72;

/** Asignación de días y bloques (por índice) de un especialista dentro de un servicio */
export interface SpecialistHorario {
  id: number;
  dias: { dia: WeekDay; bloques: number[] }[];
}

export interface Service {
  id: number;
  denominacion: string;
  descripcion?: string;
  beneficios?: string;
  imagen?: string;
  categoria: string;
  duracion: number;
  diasAtencion: AttendanceDay[];
  especialistasAsignados: number[];
  /** Asignación granular por especialista. Si está presente, el modal lo usa en lugar de pre-poblar todos los días. */
  especialistaHorarios?: SpecialistHorario[];
  cupos: number;
  precio: number;
  estado: ServiceEstado;
  domicilio: boolean;
  anticipacionReserva: AnticipacionReserva;
  sticker?: 'nuevo' | 'descuento' | 'oferta' | 'liquidacion' | 'bestseller' | 'envio_gratis' | null;
  discountPercentage?: number | null;
  etiquetas?: EtiquetaConfig;
}

export type AppointmentEstado = 'pendiente' | 'confirmada' | 'cancelada';

export interface Appointment {
  id: number;
  serviceId: number;
  specialistId: number;
  fecha: string;
  sesion: Session;
  cuposOcupados: number;
  estado?: AppointmentEstado;
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  dni: 'DNI',
  carnet_extranjeria: 'Carnet de Extranjería',
  pasaporte: 'Pasaporte',
  ruc: 'RUC',
};

export const SPECIALIST_CATEGORIES = [
  'Salud y Bienestar',
  'Educación y Coaching',
  'Belleza y Estética',
] as const;

export type SpecialistCategory = (typeof SPECIALIST_CATEGORIES)[number];

export const WEEK_DAYS: WeekDay[] = [
  'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo',
];

export const WEEK_DAY_SHORT: Record<WeekDay, string> = {
  Lunes: 'Lun',
  Martes: 'Mar',
  Miércoles: 'Mié',
  Jueves: 'Jue',
  Viernes: 'Vie',
  Sábado: 'Sáb',
  Domingo: 'Dom',
};

export const ANTICIPACION_LABELS: Record<AnticipacionReserva, string> = {
  24: '24 horas',
  48: '48 horas',
  72: '72 horas',
};

export const APPOINTMENT_BUFFER_MINUTES = 10;

export function calculateSessions(
  block: TimeBlock,
  duracion: number,
  buffer: number = APPOINTMENT_BUFFER_MINUTES,
): Session[] {
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const toTime = (min: number) => {
    const h = Math.floor(min / 60).toString().padStart(2, '0');
    const m = (min % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const sessions: Session[] = [];
  let cursor = toMin(block.inicio);
  const end = toMin(block.fin);

  while (cursor + duracion <= end) {
    sessions.push({ inicio: toTime(cursor), fin: toTime(cursor + duracion) });
    cursor += duracion + buffer;
  }

  return sessions;
}

export function countTotalSessions(
  diasAtencion: AttendanceDay[],
  duracion: number,
): number {
  return diasAtencion.reduce(
    (total, day) =>
      total +
      day.bloques.reduce(
        (t, bloque) => t + calculateSessions(bloque, duracion).length,
        0,
      ),
    0,
  );
}

export function canPublish(service: Service): boolean {
  return service.especialistasAsignados.length >= 1;
}

// ─── Etiquetas / Stickers ──────────────────────────────────────────────────────

export interface EtiquetaDescuentoData { valor: number; inicio: string; fin: string | null; }
export interface EtiquetaOfertaData    { valor: number; inicio: string; fin: string; }
export interface EtiquetaEdicionData   { inicio: string; fin: string; }
export interface EtiquetaPromocionData { productosIds: string[]; }
export interface EtiquetaConfig {
  nuevo: boolean;
  descuento?:      EtiquetaDescuentoData;
  oferta?:         EtiquetaOfertaData;
  edicionLimitada?: EtiquetaEdicionData;
  promocion?:      EtiquetaPromocionData;
}

export function serviceEtiquetasFromService(service: Service): EtiquetaConfig {
  const stored = (service as any).etiquetas;
  if (stored) return stored;

  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(); nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nextMonthStr = nextMonth.toISOString().split('T')[0];

  switch (service.sticker) {
    case 'nuevo':
      return { nuevo: true };
    case 'descuento':
      return { nuevo: false, descuento: { valor: service.discountPercentage ?? 20, inicio: today, fin: null } };
    case 'oferta':
      return { nuevo: false, oferta: { valor: service.discountPercentage ?? 30, inicio: today, fin: nextMonthStr } };
    case 'liquidacion':
      return { nuevo: false, edicionLimitada: { inicio: today, fin: nextMonthStr } };
    default:
      return { nuevo: false };
  }
}
