// ─── Specialist ──────────────────────────────────────────────────────────────
 
export type DocumentType = 'dni' | 'carnet_extranjeria' | 'pasaporte' | 'ruc';
export type AvailabilityStatus = 'Disponible' | 'Indispuesto' | 'Ocupado';
 
export interface Specialist {
  id: number;
  nombres: string;
  apellidos: string;
  tipoDocumento: DocumentType;
  numeroDocumento: string;
  especialidad: string;
  foto?: string; // base64 o URL
  availability: AvailabilityStatus;
}
 
// ─── Service ──────────────────────────────────────────────────────────────────
 
export type WeekDay =
  | 'Lunes'
  | 'Martes'
  | 'Miércoles'
  | 'Jueves'
  | 'Viernes'
  | 'Sábado'
  | 'Domingo';
 
/** Bloque horario dentro de un día: ej. 08:00 → 10:00 */
export interface TimeBlock {
  inicio: string; // "HH:mm"
  fin: string;    // "HH:mm"
}
 
/** Día con uno o más bloques horarios */
export interface AttendanceDay {
  dia: WeekDay;
  bloques: TimeBlock[];
}
 
/** Sesión calculada automáticamente */
export interface Session {
  inicio: string; // "HH:mm"
  fin: string;    // "HH:mm"
}
 
/**
 * Estado de publicación del servicio.
 * - 'borrador': registrado pero no visible para clientes.
 * - 'publicado': visible en tienda.
 */
export type ServiceEstado = 'borrador' | 'publicado';
 
/**
 * Anticipación mínima requerida para reservar una cita (en horas).
 * Evita que un cliente reserve un horario que ya pasó o está por pasar.
 */
export type AnticipacionReserva = 24 | 48 | 72;
 
export interface Service {
  id: number;
  denominacion: string;
  categoria: string;
  /** Duración de cada sesión en minutos */
  duracion: number;
  diasAtencion: AttendanceDay[];
  especialistasAsignados: number[]; // IDs de Specialist
  /** Cupos por sesión: mín 1, máx 100, default 1 */
  cupos: number;
  precio: number;
 
  // ── Nuevos campos ──────────────────────────────────────────────────────────
 
  /**
   * Estado de publicación. Default: 'borrador'.
   * Solo puede publicarse si tiene al menos 1 especialista asignado.
   */
  estado: ServiceEstado;
 
  /** Si el servicio puede prestarse en el domicilio del cliente. Default: false */
  domicilio: boolean;
 
  /**
   * Tiempo mínimo de anticipación para reservar (horas). Default: 24.
   * Impide que un cliente reserve horarios ya pasados o inminentes.
   */
  anticipacionReserva: AnticipacionReserva;
}
 
// ─── Appointment ──────────────────────────────────────────────────────────────
 
export interface Appointment {
  id: number;
  serviceId: number;
  specialistId: number;
  fecha: string;           // "YYYY-MM-DD"
  sesion: Session;
  cuposOcupados: number;
  estado: 'pendiente' | 'confirmada' | 'cancelada';
}
 
// ─── Lookup maps ──────────────────────────────────────────────────────────────
 
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  dni:               'DNI',
  carnet_extranjeria:'Carnet de Extranjería',
  pasaporte:         'Pasaporte',
  ruc:               'RUC',
};
 
export const WEEK_DAYS: WeekDay[] = [
  'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo',
];
 
export const WEEK_DAY_SHORT: Record<WeekDay, string> = {
  Lunes:    'Lun',
  Martes:   'Mar',
  Miércoles:'Mié',
  Jueves:   'Jue',
  Viernes:  'Vie',
  Sábado:   'Sáb',
  Domingo:  'Dom',
};
 
export const ANTICIPACION_LABELS: Record<AnticipacionReserva, string> = {
  24: '24 horas',
  48: '48 horas',
  72: '72 horas',
};
 
/** Buffer en minutos entre sesiones */
export const APPOINTMENT_BUFFER_MINUTES = 10;
 
// ─── Pure functions ───────────────────────────────────────────────────────────
 
/**
 * Calcula todas las sesiones automáticas de un bloque horario.
 * Cada sesión dura `duracion` minutos, con `buffer` minutos entre ellas.
 */
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
 
/** Cuenta el total de sesiones de un servicio dado su horario y duración */
export function countTotalSessions(diasAtencion: AttendanceDay[], duracion: number): number {
  return diasAtencion.reduce((total, day) =>
    total + day.bloques.reduce((t, bloque) =>
      t + calculateSessions(bloque, duracion).length, 0), 0);
}
 
/**
 * Valida si un servicio puede ser publicado.
 * Condición mínima: al menos 1 especialista asignado.
 */
export function canPublish(service: Service): boolean {
  return service.especialistasAsignados.length >= 1;
}