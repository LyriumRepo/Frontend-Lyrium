import {
  Service,
  Specialist,
  Appointment,
  AttendanceDay,
  TimeBlock,
  WeekDay,
  SpecialistHorario,
} from '../types';

// ─── Interfaces de Datos de Laravel (Backend Contracts) ──────────────────────

export interface LaravelSchedule {
  id?: number;
  specialist_id: number;
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
  email?: string;
  especialidad: string;
  sub_especialidad?: string | null;
  anios_experiencia?: number | null;
  numero_colegiatura?: string | null;
  availability: string;
  foto: string | null;
  category_id?: number | null;
  category_name?: string;
  parent_category_name?: string;
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
  benefits?: string;
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
  sticker?: string | null;
  discount_percentage?: number | null;
  settings?: Record<string, unknown> | null;
  schedule?: LaravelSchedule[];
  specialists?: LaravelSpecialist[];
  created_at?: string;
  updated_at?: string;
}

export interface LaravelBooking {
  id: number;
  service_id: number;
  specialist?: { id: number; name?: string };
  specialist_id?: number;
  customer_id?: number;
  customer_name?: string;
  date?: string;
  appointment_date?: string;
  start_time: string;
  end_time: string;
  num_spots?: number;
  status: string;
  notes?: string | null;
}

// ─── Diccionarios de Traducción ──────────────────────────────────────────────

const BACKEND_DAY_MAP: Record<number | string, WeekDay> = {
  0: 'Lunes',
  1: 'Martes',
  2: 'Miércoles',
  3: 'Jueves',
  4: 'Viernes',
  5: 'Sábado',
  6: 'Domingo',
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
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

// ─── Mapeo de categorías (nombre → ID) ──────────────────────────────────────
// Datos obtenidos de la tabla `categories` con type='service'
const CATEGORY_NAME_TO_ID: Record<string, number> = {
  'Medicina general': 198,
  'Pediatría': 201,
  'Gastroenterología': 204,
  'Geriatría': 205,
  'Laboratorio clínico': 206,
  'Nutriología': 207,
  'Psicología': 208,
  'Cardiología': 230,
  'Radiología': 231,
  'Dermatología': 232,
  'Endocrinología': 233,
  'Enfermería': 234,
  'Ginecología': 235,
  'Medicina física y rehabilitación': 236,
  'Neumología': 237,
  'Neurología': 238,
  'Odontología': 239,
  'Oftalmología': 240,
  'Oncología': 241,
  'Psiquiatría': 242,
  'Reumatología': 243,
  'Tratamientos faciales': 210,
  'Tratamientos corporales': 214,
  'Peluquerías': 244,
  'Spas': 245,
  'Otros belleza': 246,
  'Entrenamiento personal': 219,
  'Fisioterapia deportiva': 222,
  'Nutrición deportiva': 225,
  'Gimnasios': 247,
};

function extractCategoryId(categoria: string): number | undefined {
  if (!categoria) return undefined;
  const parts = categoria.split(' > ');
  for (let i = parts.length - 1; i >= 0; i--) {
    const name = parts[i].trim();
    if (CATEGORY_NAME_TO_ID[name]) return CATEGORY_NAME_TO_ID[name];
  }
  return undefined;
}

// ─── Funciones Adaptadoras de Servicios ──────────────────────────────────────

/**
 * Convierte un servicio real de Laravel al modelo tipado estricto de la UI
 */
export function adaptServiceToFrontend(beService: LaravelService): Service {
  // Merge: días únicos con bloques combinados, deduplicando por hora
  const dayMap = new Map<WeekDay, TimeBlock[]>();
  for (const sch of beService.schedule || []) {
    const dia = BACKEND_DAY_MAP[sch.day_of_week] || 'Lunes';
    if (!dayMap.has(dia)) dayMap.set(dia, []);
    const block: TimeBlock = {
      inicio: sch.start_time ? sch.start_time.substring(0, 5) : '08:00',
      fin: sch.end_time ? sch.end_time.substring(0, 5) : '17:00',
    };
    // Solo agregar si no existe ya un bloque con el mismo horario
    const exists = dayMap.get(dia)!.some((b) => b.inicio === block.inicio && b.fin === block.fin);
    if (!exists) dayMap.get(dia)!.push(block);
  }
  const diasAtencion: AttendanceDay[] = Array.from(dayMap.entries()).map(
    ([dia, bloques]) => ({ dia, bloques }),
  );


  // Extraer IDs de especialistas (desde specialists[] o fallback desde schedule[].specialist_id)
  const especialistasAsignados: number[] =
    (beService.specialists || []).length > 0
      ? (beService.specialists || []).map((sp) => sp.id)
      : [...new Set((beService.schedule || []).map((sch) => sch.specialist_id).filter(Boolean))];

  // Construir especialistaHorarios: lookup de bloque por (día + hora) en el merge
  const blockLookup = new Map<string, number>();
  diasAtencion.forEach((day, di) => {
    day.bloques.forEach((block, bi) => {
      blockLookup.set(`${day.dia}-${block.inicio}-${block.fin}`, bi);
    });
  });
  const specHorarios = new Map<number, Map<WeekDay, number[]>>();
  for (const sch of beService.schedule || []) {
    const dia = BACKEND_DAY_MAP[sch.day_of_week] || 'Lunes';
    const key = `${dia}-${sch.start_time?.substring(0, 5)}-${sch.end_time?.substring(0, 5)}`;
    const bi = blockLookup.get(key);
    if (bi === undefined) continue;
    if (!specHorarios.has(sch.specialist_id)) specHorarios.set(sch.specialist_id, new Map());
    const dayMap = specHorarios.get(sch.specialist_id)!;
    if (!dayMap.has(dia)) dayMap.set(dia, []);
    if (!dayMap.get(dia)!.includes(bi)) dayMap.get(dia)!.push(bi);
  }
  const especialistaHorarios: SpecialistHorario[] = Array.from(specHorarios.entries()).map(
    ([id, dayMap]) => ({
      id,
      dias: Array.from(dayMap.entries()).map(([dia, bloques]) => ({ dia, bloques })),
    }),
  );

  // Asegurar valor válido de anticipación de reserva
  const hours = beService.booking_advance_hours;
  const anticipacion: 24 | 48 | 72 =
    hours === 24 || hours === 48 || hours === 72 ? hours : 24;

  const validStickers = ['nuevo', 'descuento', 'oferta', 'liquidacion', 'bestseller', 'envio_gratis'] as const;
  const sticker = beService.sticker && validStickers.includes(beService.sticker as any)
    ? (beService.sticker as 'nuevo' | 'descuento' | 'oferta' | 'liquidacion' | 'bestseller' | 'envio_gratis')
    : null;

  return {
    id: beService.id,
    denominacion: beService.name || '',
    descripcion: beService.description || '',
    beneficios: beService.benefits || '',
    imagen: beService.image || '',
    categoria: beService.category || 'Salud y bienestar',
    duracion: beService.duration_minutes || 30,
    diasAtencion,
    especialistasAsignados,
    especialistaHorarios,
    cupos: beService.max_capacity || 1,
    precio:
      typeof beService.price === 'string'
        ? parseFloat(beService.price)
        : beService.price || 0,
    estado: beService.status === 'active' ? 'publicado' : 'borrador',
    domicilio: !!beService.is_home_service,
    anticipacionReserva: anticipacion,
    sticker,
    discountPercentage: beService.discount_percentage
      ? parseFloat(String(beService.discount_percentage))
      : null,
    etiquetas: (beService.settings?.etiquetas as any) ?? undefined,
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
  if (feService.descripcion !== undefined)
    payload.description = feService.descripcion;
  if (feService.beneficios !== undefined)
    payload.benefits = feService.beneficios;
  if (feService.imagen !== undefined)
    payload.image = feService.imagen;
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
  if (feService.sticker !== undefined) payload.sticker = feService.sticker;
  if (feService.discountPercentage !== undefined) payload.discount_percentage = feService.discountPercentage;
  if (feService.etiquetas !== undefined) {
    const etiquetas = feService.etiquetas;
    payload.settings = { ...(payload.settings as Record<string, unknown> ?? {}), etiquetas };
  }

  if (feService.categoria) {
    const catId = extractCategoryId(feService.categoria);
    if (catId) payload.category_id = catId;
  }

  if (feService.diasAtencion) {
    if (feService.especialistaHorarios && feService.especialistaHorarios.length > 0) {
      payload.schedules = feService.especialistaHorarios.flatMap((spec) => {
        const dias = spec.dias.length > 0 ? spec.dias : feService.diasAtencion!.map((d) => ({
          dia: d.dia,
          bloques: d.bloques.map((_, i) => i),
        }));
        return dias.flatMap((day) => {
          const dayEntry = feService.diasAtencion!.find((d) => d.dia === day.dia);
          if (!dayEntry) return [];
          return day.bloques.map((blockIndex) => {
            const block = dayEntry.bloques[blockIndex];
            if (!block) return [];
            return {
              day_of_week: FRONTEND_DAY_MAP[day.dia],
              start_time: block.inicio,
              end_time: block.fin,
              specialist_id: spec.id,
              max_appointments: feService.cupos || 1,
              is_active: true,
              orden_bloque: blockIndex + 1,
            };
          }).filter(Boolean);
        });
      });
    } else {
      payload.schedules = feService.diasAtencion.flatMap((day) =>
        day.bloques.map((b) => ({
          day_of_week: FRONTEND_DAY_MAP[day.dia],
          start_time: b.inicio,
          end_time: b.fin,
          max_appointments: feService.cupos || 1,
          is_active: true,
        })),
      );
    }
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
  const availability = isValidAvailability(beSpec.availability)
    ? beSpec.availability
    : 'Disponible';

  return {
    id: beSpec.id,
    nombres: beSpec.nombres || '',
    apellidos: beSpec.apellidos || '',
    dni: beSpec.document_number || '',
    email: beSpec.email || '',
    especialidad: beSpec.especialidad || '',
    subEspecialidad: beSpec.sub_especialidad || undefined,
    aniosExperiencia: beSpec.anios_experiencia ?? undefined,
    categoria: beSpec.parent_category_name
      ? `${beSpec.parent_category_name} > ${beSpec.category_name || ''}`
      : beSpec.category_name || '',
    numeroColegiatura: beSpec.numero_colegiatura || undefined,
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
  if (feSpec.dni !== undefined) {
    payload.document_number = feSpec.dni;
    payload.document_type = 'DNI';
  }
  if (feSpec.email !== undefined) payload.email = feSpec.email;
  if (feSpec.especialidad !== undefined)
    payload.especialidad = feSpec.especialidad;
  if (feSpec.subEspecialidad !== undefined)
    payload.sub_especialidad = feSpec.subEspecialidad;
  if (feSpec.aniosExperiencia !== undefined)
    payload.anios_experiencia = feSpec.aniosExperiencia;
  if (feSpec.numeroColegiatura !== undefined)
    payload.numero_colegiatura = feSpec.numeroColegiatura;
  if (feSpec.availability !== undefined)
    payload.availability = feSpec.availability;
  if (feSpec.foto !== undefined) payload.foto = feSpec.foto;
  if (feSpec.categoria) {
    const catId = extractCategoryId(feSpec.categoria);
    if (catId) payload.category_id = catId;
  }

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

  // Extraer YYYY-MM-DD directamente del string, sin pasar por new Date()
  // para evitar desfase por zona horaria (UTC vs PET).
  let fecha = beBooking.date || beBooking.appointment_date || '';
  if (fecha) {
    // Si ya viene como YYYY-MM-DD (formato backend), usarla directamente
    if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      // ok, mantener tal cual
    } else {
      // Intentar extraer de ISO string como "2026-06-01T08:00:00.000000Z"
      const m = fecha.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (m) fecha = `${m[1]}-${m[2]}-${m[3]}`;
    }
  }

  return {
    id: beBooking.id,
    serviceId: beBooking.service_id,
    specialistId: beBooking.specialist?.id ?? beBooking.specialist_id ?? 0,
    clientId: beBooking.customer_id,
    customerName: beBooking.customer_name,
    fecha,
    sesion: { inicio, fin },
    cuposOcupados: beBooking.num_spots || 1,
  } as Appointment & { clientId?: number; customerName?: string };
}
