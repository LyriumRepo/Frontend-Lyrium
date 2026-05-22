import {
  Service,
  Specialist,
  Appointment,
  AttendanceDay,
  WeekDay,
} from '../types';

// ─── Interfaces de Datos de Laravel (Backend Contracts) ──────────────────────

export interface LaravelSchedule {
  id?: number;
  day_of_week: number; // 0 para lunes, 2 para miércoles, etc.
  start_time: string;
  end_time: string;
  is_available?: boolean;
  max_appointments?: number;
}

export interface LaravelSpecialist {
  id: number;
  nombres: string;
  apellidos: string;
  document_type: string;
  document_number: string;
  especialidad: string;
  availability: string;
  foto: string | null;
  google_calendar_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LaravelService {
  id: number;
  store_id?: number;
  store_name?: string;
  name: string;
  slug?: string;
  description?: string;
  duration_minutes: number;
  buffer_minutes: number;
  price: number | string;
  currency?: string;
  category?: string;
  image?: string | null;
  status: 'active' | 'inactive';
  is_home_service: boolean;
  booking_advance_hours: number;
  max_capacity: number;
  schedule?: LaravelSchedule[];
  specialists?: LaravelSpecialist[];
  created_at?: string;
  updated_at?: string;
}

export interface LaravelBooking {
  id: number;
  service_id: number;
  specialist_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  num_spots?: number;
  status: string;
  notes?: string | null;
}

// ─── Diccionarios de Traducción ──────────────────────────────────────────────

const BACKEND_DAY_MAP: Record<number, WeekDay> = {
  0: 'Lunes',
  1: 'Martes',
  2: 'Miércoles',
  3: 'Jueves',
  4: 'Viernes',
  5: 'Sábado',
  6: 'Domingo',
};

const FRONTEND_DAY_MAP: Record<WeekDay, string> = {
  Lunes: 'monday',
  Martes: 'tuesday',
  Miércoles: 'wednesday',
  Jueves: 'thursday',
  Viernes: 'friday',
  Sábado: 'saturday',
  Domingo: 'sunday',
};

// Validadores auxiliares de tipo seguro para TypeScript
function isValidDocumentType(
  type: string,
): type is 'dni' | 'carnet_extranjeria' | 'pasaporte' | 'ruc' {
  return ['dni', 'carnet_extranjeria', 'pasaporte', 'ruc'].includes(type);
}

function isValidAvailability(
  status: string,
): status is 'Disponible' | 'Indispuesto' | 'Ocupado' {
  return ['Disponible', 'Indispuesto', 'Ocupado'].includes(status);
}

// ─── Funciones Adaptadoras de Servicios ──────────────────────────────────────

/**
 * Convierte un servicio real de Laravel al modelo tipado estricto de la UI
 */
export function adaptServiceToFrontend(beService: LaravelService): Service {
  // Traducir el arreglo plano de Laravel al árbol jerárquico de AttendanceDay
  const diasAtencion: AttendanceDay[] = (beService.schedule || []).map(
    (sch) => ({
      dia: BACKEND_DAY_MAP[sch.day_of_week] || 'Lunes',
      bloques: [
        {
          inicio: sch.start_time ? sch.start_time.substring(0, 5) : '08:00',
          fin: sch.end_time ? sch.end_time.substring(0, 5) : '17:00',
        },
      ],
    }),
  );

  // Extraer únicamente los IDs de los especialistas asignados
  const especialistasAsignados = (beService.specialists || []).map(
    (sp) => sp.id,
  );

  // Asegurar valor válido de anticipación de reserva
  const hours = beService.booking_advance_hours;
  const anticipacion: 24 | 48 | 72 =
    hours === 24 || hours === 48 || hours === 72 ? hours : 24;

  return {
    id: beService.id,
    denominacion: beService.name || '',
    categoria: beService.category || 'Salud y bienestar',
    duracion: beService.duration_minutes || 30,
    diasAtencion,
    especialistasAsignados,
    cupos: beService.max_capacity || 1,
    precio:
      typeof beService.price === 'string'
        ? parseFloat(beService.price)
        : beService.price || 0,
    estado: beService.status === 'active' ? 'publicado' : 'borrador',
    domicilio: !!beService.is_home_service,
    anticipacionReserva: anticipacion,
  };
}

/**
 * Traduce los cambios u objeto completo de la UI a la estructura JSON que Laravel requiere
 */
export function adaptServiceToBackend(
  feService: Partial<Service>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (feService.denominacion !== undefined)
    payload.name = feService.denominacion;
  if (feService.duracion !== undefined)
    payload.duration_minutes = feService.duracion;
  if (feService.precio !== undefined) payload.price = feService.precio;

  if (feService.cupos !== undefined) {
    payload.max_capacity = feService.cupos;
    payload.max_bookings_per_slot = feService.cupos;
  }

  if (feService.estado !== undefined) {
    payload.status = feService.estado === 'publicado' ? 'active' : 'inactive';
  }

  if (feService.domicilio !== undefined)
    payload.is_home_service = feService.domicilio;
  if (feService.anticipacionReserva !== undefined) {
    payload.booking_advance_hours = feService.anticipacionReserva;
  }

  if (feService.especialistasAsignados !== undefined) {
    payload.specialist_ids = feService.especialistasAsignados;
  }

  // Convertir horarios del componente interactivo de vuelta al array plano de Laravel
  if (feService.diasAtencion) {
    payload.schedules = feService.diasAtencion.flatMap((day) =>
      day.bloques.map((b) => ({
        day_of_week: Object.keys(FRONTEND_DAY_MAP).indexOf(day.dia), // 0, 1, 2, etc.
        start_time: b.inicio,
        end_time: b.fin,
        max_appointments: feService.cupos || 1,
        is_active: true,
      })),
    );
  }

  return payload;
}

// ─── Funciones Adaptadoras de Especialistas ──────────────────────────────────

/**
 * Traduce un especialista de la base de datos de Laravel a la interfaz UI
 */
export function adaptSpecialistToFrontend(
  beSpec: LaravelSpecialist,
): Specialist {
  const rawDoc = (beSpec.document_type || 'dni').toLowerCase();
  const docType = isValidDocumentType(rawDoc) ? rawDoc : 'dni';

  const availability = isValidAvailability(beSpec.availability)
    ? beSpec.availability
    : 'Disponible';

  return {
    id: beSpec.id,
    nombres: beSpec.nombres || '',
    apellidos: beSpec.apellidos || '',
    tipoDocumento: docType,
    numeroDocumento: beSpec.document_number || '',
    especialidad: beSpec.especialidad || '',
    foto: beSpec.foto || undefined,
    availability: availability,
  };
}

/**
 * Traduce los datos locales de un especialista al formato JSON requerido por Laravel
 */
export function adaptSpecialistToBackend(
  feSpec: Partial<Specialist>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (feSpec.nombres !== undefined) payload.nombres = feSpec.nombres;
  if (feSpec.apellidos !== undefined) payload.apellidos = feSpec.apellidos;
  if (feSpec.tipoDocumento !== undefined)
    payload.document_type = feSpec.tipoDocumento.toUpperCase();
  if (feSpec.numeroDocumento !== undefined)
    payload.document_number = feSpec.numeroDocumento;
  if (feSpec.especialidad !== undefined)
    payload.especialidad = feSpec.especialidad;
  if (feSpec.availability !== undefined)
    payload.availability = feSpec.availability;
  if (feSpec.foto !== undefined) payload.foto = feSpec.foto;

  return payload;
}

// ─── Funciones Adaptadoras de Reservas/Citas ─────────────────────────────────

/**
 * Traduce un Booking crudo de Laravel a la interfaz estructurada del Frontend
 */
export function adaptAppointmentToFrontend(
  beBooking: LaravelBooking,
): Appointment {
  const inicio = beBooking.start_time
    ? beBooking.start_time.substring(0, 5)
    : '08:00';
  const fin = beBooking.end_time ? beBooking.end_time.substring(0, 5) : '08:30';

  let estado: Appointment['estado'] = 'pendiente';
  if (beBooking.status === 'confirmed' || beBooking.status === 'confirmada')
    estado = 'confirmada';
  if (beBooking.status === 'cancelled' || beBooking.status === 'cancelada')
    estado = 'cancelada';

  return {
    id: beBooking.id,
    serviceId: beBooking.service_id,
    specialistId: beBooking.specialist_id,
    fecha: beBooking.booking_date || '',
    sesion: { inicio, fin },
    cuposOcupados: beBooking.num_spots || 1,
    estado,
  };
}
