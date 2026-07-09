'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import BaseButton from '@/components/ui/BaseButton';
import Icon from '@/components/ui/Icon';
import {
  Service,
  Specialist,
  WeekDay,
  TimeBlock,
  AttendanceDay,
  AnticipacionReserva,
  SpecialistHorario,
  WEEK_DAYS,
  WEEK_DAY_SHORT,
  ANTICIPACION_LABELS,
  calculateSessions,
  serviceEtiquetasFromService,
} from '@/features/seller/services/types';

interface ServiceConfigModalProps {
  isOpen: boolean;
  service: Service | null;
  specialists: Specialist[];
  onClose: () => void;
  onSave: (data: Omit<Service, 'id'> & { id?: number }) => void;
}

/** Bloques (por índice) que un especialista cubre en un día concreto */
type SpecialistDayEntry = { dia: WeekDay; bloques: number[] };
/** Asignación de un especialista: qué días y qué bloques dentro de cada día */
type SpecialistAssignment = { id: number; dias: SpecialistDayEntry[] };

// ── Etiquetas ─────────────────────────────────────────────────────────────────
interface EtiquetaDescuentoData {
  valor: number;
  inicio: string;      // YYYY-MM-DD
  fin: string | null;  // null = ilimitado
}
interface EtiquetaOfertaData {
  valor: number;
  inicio: string;
  fin: string;         // siempre requerido, máx. 3 meses
}
interface EtiquetaEdicionData {
  inicio: string;
  fin: string;
}
interface EtiquetaConfig {
  nuevo: boolean;
  descuento?: EtiquetaDescuentoData;
  oferta?: EtiquetaOfertaData;
  edicionLimitada?: EtiquetaEdicionData;
}

type FormData = Omit<Service, 'id' | 'especialistasAsignados' | 'categoria'> & {
  categoriaL1: string;
  categoriaL2: string;
  categoriaL3: string;
  imagen?: string;
  descripcion: string;
  caracteristicas: string[];
  especialistasAsignados: SpecialistAssignment[];
  etiquetas: EtiquetaConfig;
};

// ── Árbol de categorías del marketplace ──────────────────────────────────────
type CatL2 = { label: string; children: string[] };
type CatL1 = { label: string; children: CatL2[] };

const CATEGORY_TREE: CatL1[] = [
  {
    label: 'Servicios médicos',
    children: [
      'Cardiología', 'Radiología', 'Dermatología', 'Medicina general',
      'Endocrinología', 'Enfermería', 'Gastroenterología', 'Geriatría',
      'Ginecología', 'Laboratorio clínico', 'Medicina física y rehabilitación',
      'Neumología', 'Neurología', 'Nutriología', 'Odontología', 'Oftalmología',
      'Oncología', 'Pediatría', 'Psicología', 'Psiquiatría', 'Reumatología',
    ].map((l) => ({ label: l, children: ['Otro'] })),
  },
  {
    label: 'Belleza',
    children: ['Peluquerías', 'Spas', 'Otros'].map((l) => ({ label: l, children: ['Otro'] })),
  },
  {
    label: 'Deportes',
    children: [{ label: 'Gimnasios', children: ['Otro'] }],
  },
  {
    label: 'Servicios sociales',
    children: [{ label: 'Otro', children: ['Otro'] }],
  },
  {
    label: 'Servicios para animales',
    children: [{ label: 'Otro', children: ['Otro'] }],
  },
  {
    label: 'Servicio de medicina natural',
    children: [{ label: 'Otro', children: ['Otro'] }],
  },
  {
    label: 'Alojamiento ecológico',
    children: [{ label: 'Otro', children: ['Otro'] }],
  },
];

const ANTICIPACION_OPTIONS: AnticipacionReserva[] = [24, 48, 72];

const DEFAULT_FORM: FormData = {
  denominacion: '',
  categoriaL1: '',
  categoriaL2: '',
  categoriaL3: '',
  imagen: undefined,
  descripcion: '',
  caracteristicas: [],
  duracion: 30,
  diasAtencion: [],
  especialistasAsignados: [] as SpecialistAssignment[],
  cupos: 1,
  precio: 0,
  estado: 'borrador',
  domicilio: false,
  anticipacionReserva: 24,
  etiquetas: { nuevo: true },
};

const EMPTY_BLOCK: TimeBlock = { inicio: '08:00', fin: '10:00' };

const SvgCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}
    strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const SvgTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const SvgPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
    strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const SvgUserSilhouette = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const SvgClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const SvgImage = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
    strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <rect x="3" y="3" width="18" height="18" rx="3" ry="3" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);
const SvgXSmall = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}
    strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const SvgEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const formatMin = (min: number) =>
  min < 60 ? `${min} min` : `${Math.floor(min / 60)}h${min % 60 ? ` ${min % 60}min` : ''}`;

const isAssignable = (s: Specialist) => s.availability === 'Disponible';

const inputCls = (hasError: boolean) =>
  `w-full bg-[var(--bg-secondary)] border rounded-xl px-3 py-2.5 text-sm
   text-[var(--text-primary)] focus:outline-none transition-colors
   ${hasError
    ? 'border-rose-500/50 focus:border-rose-500'
    : 'border-[var(--border-subtle)] focus:border-sky-500/50 dark:focus:border-[#8FC3A1]/70'
  }`;

function DurationPicker({
  value,
  onChange,
  min = 0,
}: {
  value: number;
  onChange: (minutes: number) => void;
  min?: number;
}) {
  const [hStr, setHStr] = useState(String(Math.floor(value / 60)));
  const [mStr, setMStr] = useState(String(value % 60));

  const computedH = Math.floor(value / 60);
  const computedM = value % 60;
  useEffect(() => { setHStr(String(computedH)); }, [computedH]);
  useEffect(() => { setMStr(String(computedM)); }, [computedM]);

  const commit = (h: string | number, m: string | number) => {
    const hours = Math.max(0, Number(h) || 0);
    const mins = Math.max(0, Math.min(59, Number(m) || 0));
    onChange(Math.max(min, hours * 60 + mins));
  };

  const h = Number(hStr) || 0;
  const m = Number(mStr) || 0;

  const btnCls =
    'w-9 h-9 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] ' +
    'flex items-center justify-center font-black text-lg text-[var(--text-primary)] ' +
    'hover:border-sky-500/40 transition-colors select-none flex-shrink-0 ' +
    'disabled:opacity-30 disabled:cursor-not-allowed';

  return (
    <div className="grid grid-cols-2 gap-3">

      {/* ── Horas ── */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-3 py-3 flex items-center gap-2">
        {/* − */}
        <button
          type="button"
          disabled={h === 0}
          onClick={() => {
            const newH = Math.max(0, h - 1);
            if (newH * 60 + m < min) return;
            setHStr(String(newH));
            commit(newH, mStr);
          }}
          className={btnCls}
        >
          −
        </button>

        {/* number + label */}
        <div className="flex-1 flex items-center justify-center gap-1.5 min-w-0">
          <input
            type="text"
            inputMode="numeric"
            value={hStr}
            onFocus={(e) => e.target.select()}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, '');
              setHStr(raw);
              if (raw !== '') commit(parseInt(raw, 10), mStr);
            }}
            onBlur={() => {
              const normalized = String(h);
              setHStr(normalized);
              commit(normalized, mStr);
            }}
            className="w-8 text-center bg-transparent text-xl font-black text-[var(--text-primary)] focus:outline-none"
          />
          <span className="text-xs font-bold text-[var(--text-secondary)] flex-shrink-0">hrs</span>
        </div>

        {/* + */}
        <button
          type="button"
          onClick={() => {
            const newH = h + 1;
            setHStr(String(newH));
            commit(newH, mStr);
          }}
          className={btnCls}
        >
          +
        </button>
      </div>

      {/* ── Minutos ── */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-3 py-3 flex items-center gap-2">
        {/* − */}
        <button
          type="button"
          disabled={h * 60 + m <= min}
          onClick={() => {
            if (m > 0) {
              const newM = m - 1;
              if (h * 60 + newM < min) return;
              setMStr(String(newM));
              commit(hStr, newM);
            } else if (h > 0) {
              const newH = h - 1;
              if (newH * 60 + 59 < min) return;
              setHStr(String(newH));
              setMStr('59');
              commit(newH, 59);
            }
          }}
          className={btnCls}
        >
          −
        </button>

        {/* number + label */}
        <div className="flex-1 flex items-center justify-center gap-1.5 min-w-0">
          <input
            type="text"
            inputMode="numeric"
            value={mStr}
            onFocus={(e) => e.target.select()}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, '');
              if (raw === '' || parseInt(raw, 10) <= 59) {
                setMStr(raw);
                if (raw !== '') commit(hStr, Math.min(59, parseInt(raw, 10)));
              }
            }}
            onBlur={() => {
              const normalized = String(Math.min(59, m));
              setMStr(normalized);
              commit(hStr, normalized);
            }}
            className="w-8 text-center bg-transparent text-xl font-black text-[var(--text-primary)] focus:outline-none"
          />
          <span className="text-xs font-bold text-[var(--text-secondary)] flex-shrink-0">min</span>
        </div>

        {/* + */}
        <button
          type="button"
          onClick={() => {
            const newM = m + 1;
            if (newM >= 60) {
              const newH = h + 1;
              setHStr(String(newH));
              setMStr('0');
              commit(newH, 0);
            } else {
              setMStr(String(newM));
              commit(hStr, newM);
            }
          }}
          className={btnCls}
        >
          +
        </button>
      </div>

    </div>
  );
}

export default function ServiceConfigModal({
  isOpen, service, specialists, onClose, onSave,
}: ServiceConfigModalProps) {
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [bufferMinutos, setBufferMinutos] = useState(10);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [showTagPreview, setShowTagPreview] = useState(false);
  const [mounted, setMounted] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentlyAssignedIds = service?.especialistasAsignados ?? [];
  const serviceCatPrefix = [form.categoriaL1, form.categoriaL2].filter(Boolean).join(' > ');
  const assignableSpecialists = specialists.filter((s) => {
    const alreadyAssigned = currentlyAssignedIds.includes(s.id);
    const categoryMatch = !serviceCatPrefix || s.categoria.startsWith(serviceCatPrefix);
    return alreadyAssigned || (categoryMatch && isAssignable(s));
  });

  // ── Sincronizar form ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    if (service) {
      const catParts = (service.categoria ?? '').split(' > ');
      setForm({
        denominacion: service.denominacion,
        categoriaL1: catParts[0] ?? '',
        categoriaL2: catParts[1] ?? '',
        categoriaL3: catParts[2] ?? '',
        imagen: (service as any).imagen,
        descripcion: (service as any).descripcion ?? '',
        caracteristicas: (service as any).caracteristicas ?? ((service as any).beneficios ? (service as any).beneficios.split('\n').filter((s: string) => s.trim()) : []),
        duracion: service.duracion,
        diasAtencion: service.diasAtencion,
        especialistasAsignados: service.especialistasAsignados.map((id) => {
          const saved = service.especialistaHorarios?.find((h) => h.id === id);
          if (saved) return saved;
          return {
            id,
            dias: service.diasAtencion.map((d) => ({
              dia: d.dia,
              bloques: d.bloques.map((_, i) => i),
            })),
          };
        }),
        cupos: service.cupos,
        precio: service.precio,
        estado: service.estado,
        domicilio: service.domicilio,
        anticipacionReserva: service.anticipacionReserva,
        etiquetas: serviceEtiquetasFromService(service),
      });
      setImagenPreview((service as any).imagen ?? null);
    } else {
      setForm(DEFAULT_FORM);
      setImagenPreview(null);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
    setStep(1);
    setErrors({});
    setBufferMinutos(10);
  }, [service, isOpen]);

  const set = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  }, []);

  const toggleDay = (day: WeekDay) => {
    const exists = form.diasAtencion.find((d) => d.dia === day);
    if (exists) {
      // Al quitar el día, eliminarlo también de las asignaciones de especialistas
      setForm((p) => ({
        ...p,
        diasAtencion: p.diasAtencion.filter((d) => d.dia !== day),
        especialistasAsignados: p.especialistasAsignados.map((a) => ({
          ...a,
          dias: a.dias.filter((d) => d.dia !== day),
        })),
      }));
      setErrors((p) => ({ ...p, diasAtencion: undefined }));
    } else {
      const updated = [
        ...form.diasAtencion,
        { dia: day, bloques: [{ ...EMPTY_BLOCK }] } as AttendanceDay,
      ].sort((a, b) => WEEK_DAYS.indexOf(a.dia) - WEEK_DAYS.indexOf(b.dia));
      set('diasAtencion', updated);
    }
  };

  const addBlock = (day: WeekDay) =>
    set('diasAtencion', form.diasAtencion.map((d) =>
      d.dia === day ? { ...d, bloques: [...d.bloques, { ...EMPTY_BLOCK }] } : d));

  const removeBlock = (day: WeekDay, bi: number) => {
    // Eliminar el bloque del día y reajustar índices en asignaciones de especialistas
    setForm((p) => ({
      ...p,
      diasAtencion: p.diasAtencion.map((d) =>
        d.dia === day ? { ...d, bloques: d.bloques.filter((_, i) => i !== bi) } : d),
      especialistasAsignados: p.especialistasAsignados.map((a) => ({
        ...a,
        dias: a.dias.map((de) => {
          if (de.dia !== day) return de;
          return {
            ...de,
            bloques: de.bloques
              .filter((b) => b !== bi)          // quitar el índice eliminado
              .map((b) => (b > bi ? b - 1 : b)), // reajustar índices superiores
          };
        }),
      })),
    }));
  };

  const updateBlock = (day: WeekDay, bi: number, field: keyof TimeBlock, val: string) =>
    set('diasAtencion', form.diasAtencion.map((d) =>
      d.dia === day
        ? { ...d, bloques: d.bloques.map((b, i) => (i === bi ? { ...b, [field]: val } : b)) }
        : d));

  const toggleSpecialist = (id: number) => {
    const cur = form.especialistasAsignados;
    const exists = cur.find((a) => a.id === id);
    set('especialistasAsignados', exists ? cur.filter((a) => a.id !== id) : [...cur, { id, dias: [] }]);
  };

  /** Agrega o quita un día entero; al añadir selecciona todos sus bloques por defecto */
  const toggleSpecialistDay = (specialistId: number, day: WeekDay) => {
    setForm((p) => ({
      ...p,
      especialistasAsignados: p.especialistasAsignados.map((a) => {
        if (a.id !== specialistId) return a;
        const hasDay = a.dias.some((d) => d.dia === day);
        if (hasDay) return { ...a, dias: a.dias.filter((d) => d.dia !== day) };
        const dayEntry = p.diasAtencion.find((d) => d.dia === day);
        const allBlockIndices = dayEntry ? dayEntry.bloques.map((_, i) => i) : [];
        return { ...a, dias: [...a.dias, { dia: day, bloques: allBlockIndices }] };
      }),
    }));
  };

  /** Agrega o quita un bloque específico dentro de un día para un especialista */
  const toggleSpecialistBlock = (specialistId: number, day: WeekDay, blockIndex: number) => {
    setForm((p) => ({
      ...p,
      especialistasAsignados: p.especialistasAsignados.map((a) => {
        if (a.id !== specialistId) return a;
        return {
          ...a,
          dias: a.dias.map((d) => {
            if (d.dia !== day) return d;
            const has = d.bloques.includes(blockIndex);
            return { ...d, bloques: has ? d.bloques.filter((b) => b !== blockIndex) : [...d.bloques, blockIndex] };
          }),
        };
      }),
    }));
  };

  /** Selecciona todos los días+bloques, o los limpia todos */
  const toggleAllDaysForSpecialist = (specialistId: number) => {
    setForm((p) => {
      const allDayEntries = p.diasAtencion.map((d) => ({ dia: d.dia, bloques: d.bloques.map((_, i) => i) }));
      return {
        ...p,
        especialistasAsignados: p.especialistasAsignados.map((a) => {
          if (a.id !== specialistId) return a;
          const allSelected = p.diasAtencion.every((d) =>
            a.dias.some((ad) => ad.dia === d.dia && d.bloques.every((_, i) => ad.bloques.includes(i))));
          return { ...a, dias: allSelected ? [] : allDayEntries };
        }),
      };
    });
  };

  const totalSessions = form.diasAtencion.reduce((acc, d) =>
    acc + d.bloques.reduce((a, b) => a + calculateSessions(b, form.duracion).length, 0), 0);

  // ── Etiquetas helpers ────────────────────────────────────────────────────────
  const todayStr = () => new Date().toISOString().split('T')[0];
  const addMonthsStr = (months: number) => {
    const d = new Date(); d.setMonth(d.getMonth() + months);
    return d.toISOString().split('T')[0];
  };
  const addMonthsFrom = (from: string, months: number) => {
    const d = new Date(from + 'T00:00:00');
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split('T')[0];
  };

  const toggleTag = (tag: 'nuevo' | 'descuento' | 'oferta' | 'edicionLimitada') => {
    const e = form.etiquetas;
    switch (tag) {
      case 'nuevo': {
        const nowActive = !e.nuevo;
        set('etiquetas', {
          ...e,
          nuevo: nowActive,
          // Nuevo ✗ Edición Limitada
          edicionLimitada: nowActive ? undefined : e.edicionLimitada,
        });
        break;
      }
      case 'descuento': {
        if (e.descuento) {
          set('etiquetas', { ...e, descuento: undefined });
        } else {
          set('etiquetas', {
            ...e,
            descuento: { valor: 20, inicio: todayStr(), fin: null },
            oferta: undefined, // Desc% ✗ Oferta
          });
        }
        break;
      }
      case 'oferta': {
        if (e.oferta) {
          set('etiquetas', { ...e, oferta: undefined });
        } else {
          set('etiquetas', {
            ...e,
            oferta: { valor: 30, inicio: todayStr(), fin: addMonthsStr(1) },
            descuento: undefined, // Oferta ✗ Desc%
          });
        }
        break;
      }
      case 'edicionLimitada': {
        if (e.edicionLimitada) {
          set('etiquetas', { ...e, edicionLimitada: undefined });
        } else {
          set('etiquetas', {
            ...e,
            edicionLimitada: { inicio: todayStr(), fin: addMonthsStr(1) },
            nuevo: false, // Ed. Limitada ✗ Nuevo
          });
        }
        break;
      }
    }
  };

  const validateStep = (s: 1 | 2 | 3): boolean => {
    const e: typeof errors = {};
    if (s === 1) {
      if (!form.imagen) e.imagen = 'Sube una imagen para el servicio';
      if (!form.denominacion.trim()) e.denominacion = 'Requerido';
      if (!form.categoriaL1) e.categoriaL1 = 'Selecciona una categoría';
      if (!form.categoriaL2) e.categoriaL2 = 'Selecciona una subcategoría';
    }
    if (s === 2) {
      if (form.diasAtencion.length === 0) e.diasAtencion = 'Selecciona al menos un día';
      if (form.diasAtencion.some((d) => d.bloques.some((b) => b.inicio >= b.fin)))
        e.bloques = 'Revisa los horarios: el inicio debe ser anterior al fin';
    }
    if (s === 3) {
      if (form.precio <= 0) e.precio = 'Ingresa un precio válido mayor a 0';
      if (form.cupos < 1 || form.cupos > 100) e.cupos = 'Los cupos deben estar entre 1 y 100';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const [nuevaCaracteristica, setNuevaCaracteristica] = useState('');

  const guardarCaracteristica = () => {
    const valor = nuevaCaracteristica.trim();
    if (!valor) return;
    if (form.caracteristicas.length >= 4) return;

    set('caracteristicas', [...form.caracteristicas, valor]);
    setNuevaCaracteristica('');
  };

  const eliminarCaracteristica = (idx: number) => {
    set('caracteristicas', form.caracteristicas.filter((_, i) => i !== idx));
  };

  const nextStep = () => {
    const valid = validateStep(step);
    if (valid) setStep((s) => Math.min(s + 1, 3) as 1 | 2 | 3);
  };
  const prevStep = () => setStep((s) => Math.max(s - 1, 1) as 1 | 2 | 3);

  const handleSubmit = () => {
    if (!validateStep(3)) return;
    const categoria = [form.categoriaL1, form.categoriaL2, form.categoriaL3]
      .filter(Boolean).join(' > ');

    let sticker: Service['sticker'] = null;
    let discountPercentage: number | null = null;
    if (form.etiquetas.descuento) {
      sticker = 'descuento';
      discountPercentage = form.etiquetas.descuento.valor;
    } else if (form.etiquetas.oferta) {
      sticker = 'oferta';
      discountPercentage = form.etiquetas.oferta.valor;
    } else if (form.etiquetas.nuevo) {
      sticker = 'nuevo';
    } else if (form.etiquetas.edicionLimitada) {
      sticker = 'liquidacion';
    }

    // Serializar SpecialistAssignment[] → number[] + persistir granularidad en especialistaHorarios
    const { ...restForm } = form;
    const saveData = {
      ...restForm,
      categoria,
      imagen: form.imagen,
      sticker,
      discountPercentage,
      etiquetas: form.etiquetas,    // ← persistir el objeto completo con dates + múltiples labels
      beneficios: form.caracteristicas.join('\n'),
      especialistasAsignados: form.especialistasAsignados.map((a) => a.id),
      especialistaHorarios: form.especialistasAsignados.map<SpecialistHorario>((a) => ({
        id: a.id,
        dias: a.dias,
      })),
    };
    onSave(service ? { ...saveData, id: service.id } : saveData);
    onClose();
  };

  if (!isOpen || !mounted) return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  const STEP_LABELS = ['Información', 'Horarios', 'Precio y cupos'];

  return createPortal(
    <>
      <TagPreviewModal
        isOpen={showTagPreview}
        onClose={() => setShowTagPreview(false)}
        imagenPreview={imagenPreview}
        etiquetas={form.etiquetas}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        <div className="relative w-full max-w-2xl bg-[var(--bg-primary)] rounded-[2rem] border border-[var(--border-subtle)] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fadeIn">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-subtle)] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-500/10 dark:bg-[#8FC3A1]/10 rounded-2xl flex items-center justify-center border border-sky-500/20 dark:border-[#8FC3A1]/20 text-sky-500 dark:text-[#8FC3A1]">
                <Icon name="Briefcase" className="w-5 h-5 stroke-[2.5px]" />
              </div>
              <div>
                <h2 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">
                  {service ? 'Editar Servicio' : 'Nuevo Servicio'}
                </h2>
                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">
                  {STEP_LABELS[step - 1]}
                </p>
              </div>
            </div>
            <button type="button" onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors">
              <Icon name="X" className="w-4 h-4" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex px-6 pt-4 gap-2 flex-shrink-0">
            {STEP_LABELS.map((label, i) => {
              const idx = (i + 1) as 1 | 2 | 3;
              const done = step > idx;
              const active = step === idx;
              return (
                <div key={label} className="flex-1 space-y-1.5">
                  <div className={`h-1 rounded-full transition-all ${done ? 'bg-sky-500 dark:bg-[#8FC3A1]' : active ? 'bg-sky-500/50 dark:bg-[#8FC3A1]/50' : 'bg-[var(--border-subtle)]'}`} />
                  <p className={`text-[9px] font-black uppercase tracking-widest transition-colors
                  ${active ? 'text-sky-500 dark:text-[#8FC3A1]' : done ? 'text-[var(--text-secondary)]' : 'text-[var(--border-subtle)]'}`}>
                    {i + 1}. {label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* ════════════════ PASO 1: Información ════════════════ */}
            {step === 1 && (
              <div className="space-y-5 animate-fadeIn">

                {/* ════ Imagen del servicio + Etiquetas ════ */}
                <div className="grid gap-5 md:grid-cols-[auto_1px_minmax(0,1fr)] md:w-fit">

                  {/* ── Left: Imagen ─────────────────────────────────────── */}
                  <div className="flex flex-col gap-3 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                      Imagen del servicio
                    </p>

                    <div className="relative group self-start">
                      <div
                        onClick={() => imageInputRef.current?.click()}
                        className={`w-28 h-28 md:w-32 md:h-32 rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-1.5
                        ${imagenPreview
                            ? 'border-transparent'
                            : errors.imagen
                              ? 'border-rose-500/50 hover:border-rose-500 bg-[var(--bg-secondary)] text-rose-400'
                              : 'border-[var(--border-subtle)] hover:border-sky-500/50 dark:hover:border-[#8FC3A1]/50 bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                          }`}
                      >
                        {imagenPreview
                          ? <img src={imagenPreview} alt="Imagen del servicio" className="w-full h-full object-cover" />
                          : <SvgImage />
                        }
                      </div>

                      {imagenPreview && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImagenPreview(null);
                            set('imagen', undefined);
                            if (imageInputRef.current) imageInputRef.current.value = '';
                          }}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                          <SvgXSmall />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-start">
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-sky-500/40 dark:hover:border-[#8FC3A1]/40 text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                      >
                        {imagenPreview ? 'Cambiar imagen' : 'Subir imagen'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowTagPreview(true)}
                        title="Vista previa de etiquetas"
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-sky-500/40 dark:hover:border-[#8FC3A1]/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex-shrink-0"
                      >
                        <SvgEye />
                      </button>
                    </div>

                    {errors.imagen && (
                      <p className="text-[10px] text-rose-500 font-semibold">{errors.imagen}</p>
                    )}
                  </div>

                  {/* ── Separator ─────────────────────────────────────────── */}
                  <div className="hidden md:block h-full w-px bg-gradient-to-b from-transparent via-[var(--border-subtle)] " />

                  {/* ── Right: Etiquetas ─────────────────────────────────── */}
                  <div className="flex flex-col gap-3 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                      Etiquetas del servicio
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      {/* NUEVO */}
                      <TagTooltip text="Se aplica automáticamente a todos los servicios nuevos y desaparece después de 7 días.">
                        <button
                          type="button"
                          onClick={() => toggleTag('nuevo')}
                          className={`relative flex items-center gap-1.5 w-full px-3 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all
                          ${form.etiquetas.nuevo
                              ? 'bg-sky-500/15 dark:bg-[var(--icons-green)]/15 border-sky-500/40 dark:border-[var(--icons-green)]/40 text-sky-600 dark:text-[var(--icons-green)]'
                              : form.etiquetas.edicionLimitada
                                ? 'bg-[var(--bg-secondary)] border-dashed border-[var(--border-subtle)] text-[var(--text-secondary)]/40 hover:border-sky-500/30 dark:hover:border-[var(--icons-green)]/30 hover:text-sky-500/60 dark:hover:text-[var(--icons-green)]/60'
                                : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-sky-500/30 dark:hover:border-[var(--icons-green)]/40'
                            }`}
                        >
                          <span className="truncate">Nuevo</span>
                          {form.etiquetas.nuevo && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-[var(--icons-green)] flex-shrink-0" />
                          )}
                        </button>
                      </TagTooltip>

                      {/* DESC% */}
                      <button
                        type="button"
                        onClick={() => toggleTag('descuento')}
                        className={`flex items-center gap-1.5 w-full px-3 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all
                        ${form.etiquetas.descuento
                            ? 'bg-sky-500/15 dark:bg-[var(--icons-green)]/15 border-sky-500/40 dark:border-[var(--icons-green)]/40 text-sky-600 dark:text-[var(--icons-green)]'
                            : form.etiquetas.oferta
                              ? 'bg-[var(--bg-secondary)] border-dashed border-[var(--border-subtle)] text-[var(--text-secondary)]/40 hover:border-sky-500/30 dark:hover:border-[var(--icons-green)]/30 hover:text-sky-500/60 dark:hover:text-[var(--icons-green)]/60'
                              : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-sky-500/30 dark:hover:border-[var(--icons-green)]/40'
                          }`}
                      >
                        <span className="truncate">Desc%</span>
                        {form.etiquetas.descuento && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-[var(--icons-green)] flex-shrink-0" />
                        )}
                      </button>

                      {/* OFERTA */}
                      <button
                        type="button"
                        onClick={() => toggleTag('oferta')}
                        className={`flex items-center gap-1.5 w-full px-3 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all
                        ${form.etiquetas.oferta
                            ? 'bg-sky-500/15 dark:bg-[var(--icons-green)]/15 border-sky-500/40 dark:border-[var(--icons-green)]/40 text-sky-600 dark:text-[var(--icons-green)]'
                            : form.etiquetas.descuento
                              ? 'bg-[var(--bg-secondary)] border-dashed border-[var(--border-subtle)] text-[var(--text-secondary)]/40 hover:border-sky-500/30 dark:hover:border-[var(--icons-green)]/30 hover:text-sky-500/60 dark:hover:text-[var(--icons-green)]/60'
                              : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-sky-500/30 dark:hover:border-[var(--icons-green)]/40'
                          }`}
                      >
                        <span className="truncate">Oferta</span>
                        {form.etiquetas.oferta && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-[var(--icons-green)] flex-shrink-0" />
                        )}
                      </button>

                      {/* EDICIÓN LIMITADA */}
                      <TagTooltip text="El servicio se marcará como edición limitada durante el período que asignes. No puede coexistir con la etiqueta Nuevo.">
                        <button
                          type="button"
                          onClick={() => toggleTag('edicionLimitada')}
                          className={`flex items-center gap-1.5 w-full px-3 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all
                          ${form.etiquetas.edicionLimitada
                              ? 'bg-sky-500/15 dark:bg-[var(--icons-green)]/15 border-sky-500/40 dark:border-[var(--icons-green)]/40 text-sky-600 dark:text-[var(--icons-green)]'
                              : form.etiquetas.nuevo
                                ? 'bg-[var(--bg-secondary)] border-dashed border-[var(--border-subtle)] text-[var(--text-secondary)]/40 hover:border-sky-500/30 dark:hover:border-[var(--icons-green)]/30 hover:text-sky-500/60 dark:hover:text-[var(--icons-green)]/60'
                                : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-sky-500/30 dark:hover:border-[var(--icons-green)]/40'
                            }`}
                        >
                          <span className="truncate">Ed. Limitada</span>
                          {form.etiquetas.edicionLimitada && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-[var(--icons-green)] flex-shrink-0" />
                          )}
                        </button>
                      </TagTooltip>
                    </div>

                    <p className="text-[9px] text-[var(--text-secondary)]/50 leading-relaxed">
                      Máx. 2 etiquetas
                    </p>
                  </div>
                </div>

                {/* ── Paneles de configuración expandidos ────────────────── */}

                {/* DESC% config */}
                {form.etiquetas.descuento && (() => {
                  const d = form.etiquetas.descuento!;
                  const setD = (patch: Partial<EtiquetaDescuentoData>) =>
                    set('etiquetas', { ...form.etiquetas, descuento: { ...d, ...patch } });
                  return (
                    <div className="rounded-2xl border border-sky-500/20 dark:border-[var(--icons-green)]/20 bg-sky-500/5 dark:bg-[var(--icons-green)]/5 p-4 space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-[var(--icons-green)]">
                        Configuración del descuento
                      </p>

                      {/* Valor */}
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                          Descuento · mín 10% · máx 70%
                        </p>
                        <div className="flex items-center gap-2">
                          <input type="number" min={10} max={70} step={1} value={d.valor}
                            onChange={(e) => {
                              const raw = parseInt(e.target.value) || 10;
                              setD({ valor: Math.max(10, Math.min(70, raw)) });
                            }}
                            className="w-20 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-sky-500/50 rounded-xl px-3 py-2 text-sm font-black text-[var(--text-primary)] focus:outline-none transition-colors"
                          />
                          <span className="text-sm font-black text-sky-500 dark:text-[var(--icons-green)]">%</span>
                          <input type="range" min={10} max={70} value={d.valor}
                            onChange={(e) => setD({ valor: parseInt(e.target.value) })}
                            className="flex-1 accent-sky-500 dark:accent-[var(--icons-green)]" />
                        </div>
                      </div>

                      {/* Fechas */}
                      <div className="grid grid-cols-2 gap-2 items-start">
                        <div className="space-y-1">
                          <div className="h-6 flex items-center">
                            <p className="text-[9px] font-black uppercase tracking-widest leading-none text-[var(--text-secondary)]">
                              Inicio
                            </p>
                          </div>

                          <input
                            type="date"
                            value={d.inicio}
                            onChange={(e) => setD({ inicio: e.target.value })}
                            className={`${inputCls(false)} w-full`}
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="h-6 flex items-center justify-between gap-2">
                            <p className="text-[9px] font-black uppercase tracking-widest leading-none text-[var(--text-secondary)]">
                              Fin
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                setD({ fin: d.fin === null ? addMonthsFrom(d.inicio, 1) : null })
                              }
                              className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-lg border transition-all
                                  ${d.fin === null
                                  ? 'bg-sky-500/10 dark:bg-[var(--icons-green)]/10 border-sky-500/20 dark:border-[var(--icons-green)]/20 text-sky-500 dark:text-[var(--icons-green)]'
                                  : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-sky-500/20 dark:hover:border-[var(--icons-green)]/20'
                                }`}
                            >
                              {d.fin === null ? '∞ Ilimitado' : 'Ilimitado'}
                            </button>
                          </div>

                          {d.fin !== null ? (
                            <input
                              type="date"
                              value={d.fin}
                              min={d.inicio}
                              onChange={(e) => setD({ fin: e.target.value })}
                              className={`${inputCls(false)} w-full`}
                            />
                          ) : (
                            <div
                              className={`${inputCls(false)} w-full flex items-center text-[var(--text-secondary)]/40 text-xs italic`}
                            >
                              Sin fecha límite
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* OFERTA config */}
                {form.etiquetas.oferta && (() => {
                  const o = form.etiquetas.oferta!;
                  const setO = (patch: Partial<EtiquetaOfertaData>) =>
                    set('etiquetas', { ...form.etiquetas, oferta: { ...o, ...patch } });
                  const maxFin = addMonthsFrom(o.inicio, 3);
                  return (
                    <div className="rounded-2xl border border-sky-500/20 dark:border-[var(--icons-green)]/20 bg-sky-500/5 dark:bg-[var(--icons-green)]/5 p-4 space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-[var(--icons-green)]">
                        Configuración de la oferta
                      </p>

                      {/* Valor */}
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                          Descuento · mín 10% · máx 90%
                        </p>
                        <div className="flex items-center gap-2">
                          <input type="number" min={10} max={90} step={1} value={o.valor}
                            onChange={(e) => {
                              const raw = parseInt(e.target.value) || 10;
                              setO({ valor: Math.max(10, Math.min(90, raw)) });
                            }}
                            className="w-20 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-sky-500/50 dark:focus:border-[var(--icons-green)]/50 rounded-xl px-3 py-2 text-sm font-black text-[var(--text-primary)] focus:outline-none transition-colors"
                          />
                          <span className="text-sm font-black text-sky-500 dark:text-[var(--icons-green)]">%</span>
                          <input type="range" min={10} max={90} value={o.valor}
                            onChange={(e) => setO({ valor: parseInt(e.target.value) })}
                            className="flex-1 accent-sky-500 dark:accent-[var(--icons-green)]" />
                        </div>
                      </div>

                      {/* Fechas */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Inicio</p>
                          <input type="date" value={o.inicio}
                            onChange={(e) => {
                              const newInicio = e.target.value;
                              const newMax = addMonthsFrom(newInicio, 3);
                              setO({ inicio: newInicio, fin: o.fin > newMax ? newMax : o.fin });
                            }}
                            className={inputCls(false)} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                            Fin <span className="normal-case font-normal">(máx. 3 meses)</span>
                          </p>
                          <input type="date" value={o.fin} min={o.inicio} max={maxFin}
                            onChange={(e) => setO({ fin: e.target.value })}
                            className={inputCls(false)} />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* EDICIÓN LIMITADA config */}
                {form.etiquetas.edicionLimitada && (() => {
                  const el = form.etiquetas.edicionLimitada!;
                  const setEl = (patch: Partial<EtiquetaEdicionData>) =>
                    set('etiquetas', { ...form.etiquetas, edicionLimitada: { ...el, ...patch } });
                  return (
                    <div className="rounded-2xl border border-sky-500/20 dark:border-[var(--icons-green)]/20 bg-sky-500/5 dark:bg-[var(--icons-green)]/5 p-4 space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-[var(--icons-green)]">
                        Período de edición limitada
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Inicio</p>
                          <input type="date" value={el.inicio}
                            onChange={(e) => setEl({ inicio: e.target.value })}
                            className={inputCls(false)} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Fin</p>
                          <input type="date" value={el.fin} min={el.inicio}
                            onChange={(e) => setEl({ fin: e.target.value })}
                            className={inputCls(false)} />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file || !file.type.startsWith('image/')) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const result = reader.result as string;
                      setImagenPreview(result);
                      set('imagen', result);
                    };
                    reader.readAsDataURL(file);
                  }}
                />

                {/* Denominación */}
                <Field label="Denominación del servicio" error={errors.denominacion}>
                  <input type="text" value={form.denominacion}
                    placeholder="ej. Consulta nutricional, Sesión de fisioterapia..."
                    onChange={(e) => set('denominacion', e.target.value)}
                    className={inputCls(!!errors.denominacion)} />
                </Field>

                {/* Descripción general */}
                <Field label="Descripción general del servicio" error={errors.descripcion}>
                  <textarea
                    value={form.descripcion}
                    placeholder="Describe en qué consiste el servicio, a quién va dirigido y qué puede esperar el cliente..."
                    onChange={(e) => set('descripcion', e.target.value.slice(0, 300))}
                    rows={4}
                    className={`${inputCls(!!errors.descripcion)} resize-none leading-relaxed`}
                  />
                  <p className="text-[9px] text-[var(--text-secondary)] font-semibold text-right">
                    {form.descripcion.length} / 300 caracteres
                  </p>
                </Field>

                {/* Características / beneficios */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                    Características / beneficios
                  </p>

                  {/* Lista compacta con scroll interno */}
                  <div className="max-h-28 overflow-y-auto pr-1">
                    <div className="grid grid-cols-2 gap-2">
                      {form.caracteristicas.map((item, idx) => (
                        <div
                          key={`${item}-${idx}`}
                          className="flex items-center gap-2 w-full rounded-full border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-1.5"
                        >
                          <div className="flex-shrink-0 w-4 h-4 rounded-md bg-sky-500/10 dark:bg-[#8FC3A1]/10 border border-sky-500/20 dark:border-[#8FC3A1]/20 flex items-center justify-center text-sky-500 dark:text-[#8FC3A1]">
                            <SvgCheck />
                          </div>

                          <span className="flex-1 text-[11px] text-[var(--text-primary)] truncate">
                            {item}
                          </span>

                          <button
                            type="button"
                            onClick={() => set('caracteristicas', form.caracteristicas.filter((_, i) => i !== idx))}
                            className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-rose-400 transition-colors"
                          >
                            <SvgTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Input único para agregar */}
                  {form.caracteristicas.length < 4 && (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={nuevaCaracteristica}
                        placeholder={`Agregar característica ${form.caracteristicas.length + 1}...`}
                        maxLength={35}
                        onChange={(e) => setNuevaCaracteristica(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            guardarCaracteristica();
                          }
                        }}
                        className={`flex-1 ${inputCls(false)}`}
                      />

                      <button
                        type="button"
                        onClick={guardarCaracteristica}
                        disabled={!nuevaCaracteristica.trim()}
                        className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border border-sky-500/20 bg-sky-500/10 text-sky-500 hover:bg-sky-500/15 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <SvgCheck />
                      </button>
                    </div>
                  )}

                  {form.caracteristicas.length === 0 && (
                    <p className="text-[9px] text-[var(--text-secondary)]/60 text-center pt-1">
                      Opcional · máximo 4
                    </p>
                  )}
                </div>

                {/* ── Categorías (3 niveles) ── */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                    Categoría
                  </p>

                  {/* L1 */}
                  <div className="space-y-1">
                    <select
                      value={form.categoriaL1}
                      onChange={(e) => {
                        const l1 = e.target.value;
                        set('categoriaL1', l1);
                        set('categoriaL2', '');
                        set('categoriaL3', '');
                      }}
                      className={inputCls(!!errors.categoriaL1)}
                    >
                      <option value="" disabled>1. Categoría principal...</option>
                      {CATEGORY_TREE.map((c) => (
                        <option key={c.label} value={c.label}>{c.label}</option>
                      ))}
                    </select>
                    {errors.categoriaL1 && (
                      <p className="text-[10px] text-rose-500 font-semibold">{errors.categoriaL1}</p>
                    )}
                  </div>

                  {/* L2 */}
                  {form.categoriaL1 && (() => {
                    const l1Node = CATEGORY_TREE.find((c) => c.label === form.categoriaL1);
                    return l1Node ? (
                      <div className="space-y-1 pl-3 border-l-2 border-sky-500/20 dark:border-[#8FC3A1]/20">
                        <select
                          value={form.categoriaL2}
                          onChange={(e) => {
                            set('categoriaL2', e.target.value);
                            set('categoriaL3', '');
                          }}
                          className={inputCls(!!errors.categoriaL2)}
                        >
                          <option value="" disabled>2. Subcategoría...</option>
                          {l1Node.children.map((c) => (
                            <option key={c.label} value={c.label}>{c.label}</option>
                          ))}
                        </select>
                        {errors.categoriaL2 && (
                          <p className="text-[10px] text-rose-500 font-semibold">{errors.categoriaL2}</p>
                        )}
                      </div>
                    ) : null;
                  })()}

                  {/* L3 */}
                  {form.categoriaL2 && (() => {
                    const l1Node = CATEGORY_TREE.find((c) => c.label === form.categoriaL1);
                    const l2Node = l1Node?.children.find((c) => c.label === form.categoriaL2);
                    return l2Node ? (
                      <div className="pl-6 border-l-2 border-sky-500/10 dark:border-[#8FC3A1]/10">
                        <select
                          value={form.categoriaL3}
                          onChange={(e) => set('categoriaL3', e.target.value)}
                          className={inputCls(false)}
                        >
                          <option value="">3. Especialización (opcional)...</option>
                          {l2Node.children.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    ) : null;
                  })()}

                  {/* Ruta visual */}
                  {form.categoriaL1 && (
                    <div className="flex items-center gap-1 flex-wrap px-1">
                      <span className="text-[10px] font-black text-sky-500 dark:text-[#8FC3A1]">{form.categoriaL1}</span>
                      {form.categoriaL2 && (<>
                        <span className="text-[10px] text-[var(--text-secondary)]">›</span>
                        <span className="text-[10px] font-black text-sky-500 dark:text-[#8FC3A1]">{form.categoriaL2}</span>
                      </>)}
                      {form.categoriaL3 && (<>
                        <span className="text-[10px] text-[var(--text-secondary)]">›</span>
                        <span className="text-[10px] font-black text-sky-500 dark:text-[#8FC3A1]">{form.categoriaL3}</span>
                      </>)}
                    </div>
                  )}
                </div>

                {/* Duración por sesión */}
                <Field label="Duración por sesión" error={errors.duracion}>
                  <DurationPicker
                    value={form.duracion}
                    onChange={(v) => set('duracion', v)}
                    min={1}
                  />
                </Field>

                {/* Margen entre sesiones */}
                <Field label="Tiempo de descanso entre citas">
                  <DurationPicker
                    value={bufferMinutos}
                    onChange={setBufferMinutos}
                    min={0}
                  />
                </Field>


                {/* Especialistas asignados */}
                <Field label="Especialistas asignados">
                  {assignableSpecialists.length === 0 ? (
                    <p className="text-xs text-[var(--text-secondary)] py-2">
                      No hay especialistas disponibles. Registra uno primero.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {assignableSpecialists.map((sp) => {
                        const selected = form.especialistasAsignados.some((a) => a.id === sp.id);
                        return (
                          <button key={sp.id} type="button" onClick={() => toggleSpecialist(sp.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all
                            ${selected
                                ? 'bg-sky-500/10 border-sky-500/40 dark:bg-[#8FC3A1]/10 dark:border-[#8FC3A1]/40'
                                : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] hover:border-sky-500/20 dark:hover:border-[#8FC3A1]/20'
                              }`}>
                            <div className="w-8 h-8 rounded-full bg-sky-500/20 dark:bg-[#8FC3A1]/20 border border-sky-500/30 dark:border-[#8FC3A1]/30 overflow-hidden flex-shrink-0 flex items-center justify-center text-sky-400 dark:text-[#8FC3A1]">
                              {sp.foto
                                ? <img src={sp.foto} alt="" className="w-full h-full object-cover" />
                                : <SvgUserSilhouette />
                              }
                            </div>
                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-black text-[var(--text-primary)]">
                                  {sp.nombres} {sp.apellidos}
                                </p>
                                {currentlyAssignedIds.includes(sp.id) && (
                                  <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                                    Ya asignado
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-[var(--text-secondary)]">{sp.especialidad}</p>
                            </div>
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0
                            ${selected ? 'bg-sky-500 dark:bg-[var(--brand-green)] border-sky-500 dark:border-[var(--brand-green)] text-white' : 'border-[var(--border-subtle)]'}`}>
                              {selected && <SvgCheck />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </Field>
              </div>
            )}

            {/* ════════════════ PASO 2: Horarios ════════════════ */}
            {step === 2 && (
              <div className="space-y-5 animate-fadeIn">

                <Field label="Días de atención" error={errors.diasAtencion}>
                  <div className="flex gap-2 flex-wrap">
                    {WEEK_DAYS.map((day) => {
                      const active = form.diasAtencion.some((d) => d.dia === day);
                      return (
                        <button key={day} type="button" onClick={() => toggleDay(day)}
                          className={`w-12 h-12 rounded-2xl text-[10px] font-black uppercase border transition-all
                          ${active
                              ? 'bg-sky-500/15 dark:bg-[#8FC3A1]/15 border-sky-500/50 dark:border-[#8FC3A1]/50 text-sky-500 dark:text-[#8FC3A1]'
                              : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-sky-500/30 dark:hover:border-[#8FC3A1]/50'
                            }`}>
                          {WEEK_DAY_SHORT[day]}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                {errors.bloques && (
                  <p className="text-[10px] text-rose-500 font-semibold">{errors.bloques}</p>
                )}

                {form.diasAtencion.length === 0 && (
                  <div className="rounded-[1.75rem] border border-dashed border-[var(--border-subtle)] p-6 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                      Selecciona al menos un día arriba
                    </p>
                  </div>
                )}

                {form.diasAtencion.map((dayEntry) => (
                  <div key={dayEntry.dia} className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/40 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-sky-500/15 dark:bg-[#8FC3A1]/15 border border-sky-500/30 dark:border-[#8FC3A1]/30 flex items-center justify-center text-[10px] font-black text-sky-500 dark:text-[#8FC3A1]">
                          {WEEK_DAY_SHORT[dayEntry.dia]}
                        </span>
                        <span className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest">
                          {dayEntry.dia}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[var(--text-secondary)] font-semibold">
                          {dayEntry.bloques.reduce((a, b) => a + calculateSessions(b, form.duracion).length, 0)} sesión(es)
                        </span>
                        <button type="button" onClick={() => addBlock(dayEntry.dia)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/10 dark:bg-[#8FC3A1]/10 border border-sky-500/20 dark:border-[#8FC3A1]/20 text-sky-500 dark:text-[#8FC3A1] text-[10px] font-black uppercase tracking-widest hover:bg-sky-500/20 dark:hover:bg-[#8FC3A1]/20 transition-colors">
                          <SvgPlus />
                          Bloque
                        </button>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      {dayEntry.bloques.map((block, bi) => {
                        const sessions = calculateSessions(block, form.duracion);
                        const invalid = block.inicio >= block.fin;
                        return (
                          <div key={bi} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className={`flex items-center gap-1 flex-1 bg-[var(--bg-primary)] rounded-xl border px-2 py-1.5 transition-colors
                              ${invalid ? 'border-rose-500/40' : 'border-[var(--border-subtle)]'}`}>
                                <input type="time" value={block.inicio}
                                  onChange={(e) => updateBlock(dayEntry.dia, bi, 'inicio', e.target.value)}
                                  className="w-[6.5rem] bg-transparent text-sm font-semibold text-[var(--text-primary)] focus:outline-none [color-scheme:light] dark:[color-scheme:dark] cursor-text" />
                                <span className="text-[var(--text-secondary)] flex-shrink-0 text-xs">→</span>
                                <input type="time" value={block.fin}
                                  onChange={(e) => updateBlock(dayEntry.dia, bi, 'fin', e.target.value)}
                                  className="w-[6.5rem] bg-transparent text-sm font-semibold text-[var(--text-primary)] focus:outline-none [color-scheme:light] dark:[color-scheme:dark] cursor-text" />
                              </div>
                              {dayEntry.bloques.length > 1 && (
                                <button type="button" onClick={() => removeBlock(dayEntry.dia, bi)}
                                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/20 transition-colors flex-shrink-0">
                                  <SvgTrash />
                                </button>
                              )}
                            </div>
                            {!invalid && sessions.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 px-1">
                                {sessions.map((s, si) => (
                                  <span key={si}
                                    className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                                    {s.inicio} – {s.fin}
                                  </span>
                                ))}
                              </div>
                            )}
                            {invalid && (
                              <p className="text-[10px] text-rose-500 font-semibold px-1">
                                El inicio debe ser anterior al fin
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {totalSessions > 0 && (
                  <div className="rounded-[1.75rem] border border-sky-500/20 dark:border-[#8FC3A1]/20 bg-sky-500/5 dark:bg-[#8FC3A1]/5 p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-sky-500 dark:text-[#8FC3A1]">
                        Total de sesiones automáticas
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        Duración {formatMin(form.duracion)} + {bufferMinutos} min margen
                      </p>
                    </div>
                    <span className="text-2xl font-black text-sky-500 dark:text-[#8FC3A1]">{totalSessions}</span>
                  </div>
                )}

                {/* ── Asignación de días y bloques por especialista ── */}
                {form.especialistasAsignados.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="text-sky-400 dark:text-[#8FC3A1]"><SvgUserSilhouette /></div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)]">
                          Horario por especialista
                        </p>
                        <p className="text-[9px] text-[var(--text-secondary)] mt-0.5">
                          Selecciona qué días y bloques cubre cada especialista
                        </p>
                      </div>
                    </div>

                    {form.diasAtencion.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-[var(--border-subtle)] p-4 text-center">
                        <p className="text-[10px] text-[var(--text-secondary)] font-semibold">
                          Configura los días de atención primero
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {form.especialistasAsignados.map((assignment) => {
                          const sp = specialists.find((s) => s.id === assignment.id);
                          if (!sp) return null;

                          const totalBlocksInService = form.diasAtencion.reduce((a, d) => a + d.bloques.length, 0);
                          const assignedBlocks = assignment.dias.reduce((a, d) => a + d.bloques.length, 0);
                          const allSelected = totalBlocksInService > 0 && assignedBlocks === totalBlocksInService;
                          const noneSelected = assignedBlocks === 0;

                          return (
                            <div key={assignment.id}
                              className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/40 overflow-hidden">

                              {/* Header especialista */}
                              <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)]">
                                <div className="w-7 h-7 rounded-full bg-sky-500/20 dark:bg-[#8FC3A1]/20 border border-sky-500/30 dark:border-[#8FC3A1]/30 overflow-hidden flex-shrink-0 flex items-center justify-center text-sky-400 dark:text-[#8FC3A1]">
                                  {sp.foto
                                    ? <img src={sp.foto} alt="" className="w-full h-full object-cover" />
                                    : <SvgUserSilhouette />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-black text-[var(--text-primary)] truncate">
                                    {sp.nombres} {sp.apellidos}
                                  </p>
                                  <p className="text-[9px] text-[var(--text-secondary)]">{sp.especialidad}</p>
                                </div>
                                {noneSelected ? (
                                  <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex-shrink-0">
                                    Sin bloques
                                  </span>
                                ) : (
                                  <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-sky-500/10 dark:bg-[#8FC3A1]/10 border border-sky-500/20 dark:border-[#8FC3A1]/20 text-sky-400 dark:text-[#8FC3A1] flex-shrink-0">
                                    {assignedBlocks} bloque{assignedBlocks !== 1 ? 's' : ''}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => toggleAllDaysForSpecialist(assignment.id)}
                                  className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-sky-500/30 dark:hover:border-[#8FC3A1] hover:text-sky-400 dark:hover:text-[#8FC3A1] transition-colors flex-shrink-0">
                                  {allSelected ? 'Ninguno' : 'Todos'}
                                </button>
                              </div>

                              {/* Días con sus bloques */}
                              <div className="divide-y divide-[var(--border-subtle)]">
                                {form.diasAtencion.map((dayEntry) => {
                                  const assignedDay = assignment.dias.find((d) => d.dia === dayEntry.dia);
                                  const dayActive = !!assignedDay;
                                  const assignedBlockCount = assignedDay?.bloques.length ?? 0;

                                  return (
                                    <div key={dayEntry.dia} className="p-3 space-y-2">
                                      {/* Fila del día */}
                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => toggleSpecialistDay(assignment.id, dayEntry.dia)}
                                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all flex-shrink-0
                                          ${dayActive
                                              ? 'bg-sky-500/10 dark:bg-[#8FC3A1]/10 border-sky-500/40 dark:border-[#8FC3A1]/40 text-sky-500 dark:text-[#8FC3A1]'
                                              : 'bg-[var(--bg-primary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-sky-500/20 dark:hover:border-[#8FC3A1]/20'
                                            }`}>
                                          <span className="text-[10px] font-black uppercase tracking-wider">
                                            {WEEK_DAY_SHORT[dayEntry.dia]}
                                          </span>
                                          <span className="text-[8px] opacity-70">
                                            {dayEntry.dia}
                                          </span>
                                        </button>
                                        {dayActive && (
                                          <span className="text-[9px] text-[var(--text-secondary)]">
                                            {assignedBlockCount}/{dayEntry.bloques.length} bloques
                                          </span>
                                        )}
                                      </div>

                                      {/* Bloques del día (solo si el día está activo) */}
                                      {dayActive && (
                                        <div className="flex flex-wrap gap-1.5 pl-1">
                                          {dayEntry.bloques.map((block, bi) => {
                                            const blockActive = assignedDay.bloques.includes(bi);
                                            const sessions = calculateSessions(block, form.duracion);
                                            const invalid = block.inicio >= block.fin;
                                            return (
                                              <button
                                                key={bi}
                                                type="button"
                                                disabled={invalid}
                                                onClick={() => toggleSpecialistBlock(assignment.id, dayEntry.dia, bi)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all
                                                ${invalid
                                                    ? 'opacity-40 cursor-not-allowed bg-[var(--bg-primary)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                                                    : blockActive
                                                      ? 'bg-sky-500/15 dark:bg-[#8FC3A1]/15 border-sky-500/50 dark:border-[#8FC3A1]/50 text-sky-500 dark:text-[#8FC3A1]'
                                                      : 'bg-[var(--bg-primary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-sky-500/20 dark:hover:border-[#8FC3A1]/20 hover:text-[var(--text-primary)]'
                                                  }`}>
                                                <span className="text-[9px] font-black">
                                                  {block.inicio}–{block.fin}
                                                </span>
                                                {!invalid && (
                                                  <span className={`text-[8px] font-semibold ${blockActive ? 'text-sky-400 dark:text-[#8FC3A1]' : 'opacity-60'}`}>
                                                    · {sessions.length} ses.
                                                  </span>
                                                )}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ════════════════ PASO 3: Precio, cupos y config ════════════════ */}
            {step === 3 && (
              <div className="space-y-5 animate-fadeIn">

                {/* Precio */}
                <Field label="Precio por sesión (S/.)" error={errors.precio}>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-[var(--text-secondary)]">
                      S/.
                    </span>
                    <input type="number" min={0} step={0.5} value={form.precio || ''}
                      onChange={(e) => set('precio', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className={`pl-10 ${inputCls(!!errors.precio)}`} />
                  </div>
                </Field>

                {/* Cupos */}
                <Field label="Cupos por sesión" error={errors.cupos}>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <button type="button" onClick={() => set('cupos', Math.max(1, form.cupos - 1))}
                        className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] hover:border-sky-500/30 dark:hover:border-[#8FC3A1]/50 transition-colors font-black text-lg select-none">
                        −
                      </button>
                      <div className="flex-1 text-center">
                        <span className="text-3xl font-black text-[var(--text-primary)]">{form.cupos}</span>
                        <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-1">
                          {form.cupos === 1 ? 'persona por sesión' : 'personas por sesión'}
                        </p>
                      </div>
                      <button type="button" onClick={() => set('cupos', Math.min(100, form.cupos + 1))}
                        className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] hover:border-sky-500/30 dark:hover:border-[#8FC3A1]/50 transition-colors font-black text-lg select-none">
                        +
                      </button>
                    </div>
                    <input type="range" min={1} max={100} value={form.cupos}
                      onChange={(e) => set('cupos', parseInt(e.target.value))}
                      className="w-full accent-sky-500 dark:accent-[#8FC3A1]" />
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                      <span>1 mín</span><span>100 máx</span>
                    </div>
                  </div>
                </Field>

                {/* ── Anticipación para reservar ── */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="text-[var(--text-secondary)]"><SvgClock /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)]">
                        Anticipación mínima para reservar
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {ANTICIPACION_OPTIONS.map((h) => {
                      const active = form.anticipacionReserva === h;
                      return (
                        <button key={h} type="button"
                          onClick={() => set('anticipacionReserva', h)}
                          className={`flex flex-col items-center py-4 px-3 rounded-2xl border transition-all
                          ${active
                              ? 'bg-sky-500/10 dark:bg-[#8FC3A1]/10 border-sky-500/40 dark:border-[#8FC3A1]/40 text-sky-500 dark:text-[#8FC3A1]'
                              : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-sky-500/20 dark:hover:border-[#8FC3A1]/50'
                            }`}>
                          <span className={`text-2xl font-black ${active ? 'text-sky-500 dark:text-[#8FC3A1]' : 'text-[var(--text-primary)]'}`}>
                            {h}
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-70">
                            horas antes
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Resumen */}
                <div className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/40 p-5 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                    Resumen del servicio
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <SummaryItem label="Denominación" value={form.denominacion || '—'} />
                    <SummaryItem label="Categoría"
                      value={[form.categoriaL1, form.categoriaL2, form.categoriaL3].filter(Boolean).join(' › ') || '—'} />
                    <SummaryItem label="Duración" value={formatMin(form.duracion)} />
                    <SummaryItem label="Sesiones totales" value={`${totalSessions}`} accent="sky" />
                    <SummaryItem label="Días de atención"
                      value={form.diasAtencion.map((d) => WEEK_DAY_SHORT[d.dia]).join(', ') || '—'} />
                    <SummaryItem label="Especialistas"
                      value={`${form.especialistasAsignados.length} asignado(s)`} />
                    <SummaryItem label="Precio"
                      value={form.precio > 0 ? `S/. ${form.precio.toFixed(2)}` : '—'} accent="emerald" />
                    <SummaryItem label="Cupos / sesión" value={`${form.cupos}`} accent="sky" />
                    <SummaryItem label="Anticipación" value={ANTICIPACION_LABELS[form.anticipacionReserva]} accent="sky" />
                  </div>
                  {form.descripcion && (
                    <div className="pt-3 border-t border-[var(--border-subtle)] space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Descripción</p>
                      <p className="text-xs text-[var(--text-primary)] leading-relaxed line-clamp-3">{form.descripcion}</p>
                    </div>
                  )}
                  {form.caracteristicas.length > 0 && (
                    <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                        Características ({form.caracteristicas.filter(Boolean).length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {form.caracteristicas.filter(Boolean).map((c, i) => (
                          <span key={i} className="text-[9px] font-bold px-2 py-1 rounded-lg bg-sky-500/10 dark:bg-[#8FC3A1]/10 border border-sky-500/20 dark:border-[#8FC3A1]/20 text-sky-600 dark:text-[#8FC3A1]">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Etiquetas en resumen */}
                  {(form.etiquetas.nuevo || form.etiquetas.descuento || form.etiquetas.oferta || form.etiquetas.edicionLimitada) && (
                    <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Etiquetas</p>
                      <div className="flex flex-wrap gap-1.5">
                        {form.etiquetas.nuevo && (
                          <span className="text-[9px] font-bold px-2 py-1 rounded-lg bg-sky-500/10 dark:bg-[var(--icons-green)]/10 border border-sky-500/20 dark:border-[var(--icons-green)]/20 text-sky-600 dark:text-[var(--icons-green)]">
                            Nuevo
                          </span>
                        )}
                        {form.etiquetas.descuento && (
                          <span className="text-[9px] font-bold px-2 py-1 rounded-lg bg-sky-500/10 dark:bg-[var(--icons-green)]/10 border border-sky-500/20 dark:border-[var(--icons-green)]/20 text-sky-600 dark:text-[var(--icons-green)]">
                            Desc. {form.etiquetas.descuento.valor}%{form.etiquetas.descuento.fin}
                          </span>
                        )}
                        {form.etiquetas.oferta && (
                          <span className="text-[9px] font-bold px-2 py-1 rounded-lg bg-sky-500/10 dark:bg-[var(--icons-green)]/10 border border-sky-500/20 dark:border-[var(--icons-green)]/20 text-rose-600 dark:text-[var(--icons-green)]">
                            Oferta {form.etiquetas.oferta.valor}%
                          </span>
                        )}
                        {form.etiquetas.edicionLimitada && (
                          <span className="text-[9px] font-bold px-2 py-1 rounded-lg bg-sky-500/10 dark:bg-[var(--icons-green)]/10 border border-purple-500/20 dark:border-[var(--icons-green)]/20 text-purple-600 dark:text-[var(--icons-green)]">
                            Ed. Limitada
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="pt-2 border-t border-[var(--border-subtle)]">
                    <p className="text-[10px] text-[var(--text-secondary)]">
                      El servicio se guardará como{' '}
                      <span className="font-black text-gray-700 dark:text-gray-300">Borrador</span>.
                      Podrás publicarlo desde el panel de servicios.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-5 border-t border-[var(--border-subtle)] flex-shrink-0">
            {step > 1 && (
              <BaseButton variant="ghost" type="button" onClick={prevStep} className="flex-1">
                Atrás
              </BaseButton>
            )}
            {step < 3 ? (
              <BaseButton variant="action" type="button" onClick={nextStep} className="flex-1">
                Siguiente
              </BaseButton>
            ) : (
              <BaseButton variant="action" type="button" onClick={handleSubmit} className="flex-1">
                {service ? 'Guardar cambios' : 'Guardar como borrador'}
              </BaseButton>
            )}
          </div>
        </div>
      </div>
    </>,
    modalRoot,
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">{label}</label>
      {children}
      {error && <p className="text-[10px] text-rose-500 font-semibold">{error}</p>}
    </div>
  );
}

function SummaryItem({ label, value, accent }: { label: string; value: string; accent?: 'sky' | 'emerald' | 'indigo' }) {
  const cls = accent ? { sky: 'text-sky-500 dark:text-[#8FC3A1]', emerald: 'text-emerald-500', indigo: 'text-indigo-500' }[accent] : 'text-[var(--text-primary)]';
  return (
    <div className="space-y-0.5">
      <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">{label}</p>
      <p className={`text-xs font-black ${cls}`}>{value}</p>
    </div>
  );
}

function TagTooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShow(true), 300);
  };
  const close = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShow(false);
  };

  return (
    <div className="relative" onMouseEnter={open} onMouseLeave={close}>
      {children}
      {show && (
        <div className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 z-50 w-52 px-3 py-2.5
          bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl
          text-[9px] text-[var(--text-secondary)] leading-relaxed pointer-events-none">
          {text}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0
            border-l-[5px] border-r-[5px] border-t-[5px]
            border-l-transparent border-r-transparent
            border-t-[var(--border-subtle)]" />
          <div className="absolute top-[calc(100%-1px)] left-1/2 -translate-x-1/2 w-0 h-0
            border-l-[4px] border-r-[4px] border-t-[4px]
            border-l-transparent border-r-transparent
            border-t-[var(--bg-primary)]" />
        </div>
      )}
    </div>
  );
}

function TagPreviewModal({
  isOpen,
  onClose,
  imagenPreview,
  etiquetas,
}: {
  isOpen: boolean;
  onClose: () => void;
  imagenPreview: string | null;
  etiquetas: EtiquetaConfig;
}) {
  if (!isOpen) return null;

  const hasAny = etiquetas.nuevo || etiquetas.descuento || etiquetas.oferta || etiquetas.edicionLimitada;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <div
        className="relative z-10 w-full max-w-[300px] rounded-3xl overflow-hidden shadow-2xl animate-fadeIn"
        style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Vista previa · cliente
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-lg transition-opacity hover:opacity-70"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }}
          >
            <SvgXSmall />
          </button>
        </div>

        {/* Image + tags */}
        <div className="relative w-full" style={{ aspectRatio: '3/3', background: '#1c1c1c' }}>
          {imagenPreview ? (
            <img src={imagenPreview} alt="" className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex flex-col items-center justify-center gap-2"
              style={{ color: 'rgba(255,255,255,0.12)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} className="w-10 h-10">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span className="text-[9px] font-bold uppercase tracking-widest">Sin imagen</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

          {/* Tags */}
          {hasAny && (
            <div className="absolute top-3 left-0 flex flex-col gap-1.5">
              {etiquetas.nuevo && (
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black tracking-wider"
                  style={{
                    background: '#ADEBB3',
                    color: '#0d3318',
                    borderRadius: '4px 999px 999px 4px',
                    boxShadow: '0 3px 14px rgba(173,235,179,0.6)',
                  }}
                >
                  Nuevo
                </div>
              )}
              {etiquetas.descuento && (
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black tracking-wider"
                  style={{
                    background: 'linear-gradient(135deg,#dc2626,#f87171)',
                    color: 'white',
                    borderRadius: '4px 999px 999px 4px',
                    boxShadow: '0 3px 14px rgba(220,38,38,0.65)',
                  }}
                >
                  -{etiquetas.descuento.valor}%
                </div>
              )}
              {etiquetas.oferta && (
                <div
                  className="inline-flex items-center gap-1.5 px-1.5 py-1.5 text-[9px] font-bold tracking-wider"
                  style={{
                    background: 'linear-gradient(135deg,#991b1b,#dc2626)',
                    color: 'white',
                    borderRadius: '4px 999px 999px 4px',
                    boxShadow: '0 3px 14px rgba(220,38,38,0.75)',
                  }}
                >
                   −{etiquetas.oferta.valor}%
                </div>
              )}
              {etiquetas.edicionLimitada && (
                <div
                  className="inline-flex items-center gap-1.5 px-1.5 py-1.5 text-[9px] font-bold tracking-wider"
                  style={{
                    background: '#59a6cb',
                    color: '#333333',
                    borderRadius: '4px 999px 999px 4px',
                  }}
                >
                  Ed. Limitada
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-4 py-3 text-center"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
        </div>
      </div>
    </div>
  );
}