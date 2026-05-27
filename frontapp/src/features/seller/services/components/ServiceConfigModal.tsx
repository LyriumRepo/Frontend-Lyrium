'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

<<<<<<< HEAD
const CATEGORIES = [
  'Salud y bienestar',
  'Nutrición',
  'Psicología',
  'Fisioterapia',
  'Medicina general',
  'Odontología',
  'Dermatología',
  'Veterinaria',
  'Educación',
  'Asesoría legal',
  'Consultoría',
  'Otro',
=======
type FormData = Omit<Service, 'id' | 'especialistasAsignados' | 'categoria'> & {
  categoriaL1: string;
  categoriaL2: string;
  categoriaL3: string;
  especialistasAsignados: SpecialistAssignment[];
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
>>>>>>> origin/rama-jere2
];

const ANTICIPACION_OPTIONS: AnticipacionReserva[] = [24, 48, 72];

const DEFAULT_FORM: FormData = {
  denominacion: '',
  categoriaL1: '',
  categoriaL2: '',
  categoriaL3: '',
  duracion: 30,
  diasAtencion: [],
  especialistasAsignados: [] as SpecialistAssignment[],
  cupos: 1,
  precio: 0,
  estado: 'borrador',
  domicilio: false,
  anticipacionReserva: 24,
};

const EMPTY_BLOCK: TimeBlock = { inicio: '08:00', fin: '10:00' };

const SvgCheck = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={3}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-3 h-3"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const SvgTrash = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-3.5 h-3.5"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const SvgPlus = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-3 h-3"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const SvgUserSilhouette = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const SvgHome = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const SvgClock = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const formatMin = (min: number) =>
  min < 60
    ? `${min} min`
    : `${Math.floor(min / 60)}h${min % 60 ? ` ${min % 60}min` : ''}`;

const isAssignable = (s: Specialist) => s.availability === 'Disponible';

const inputCls = (hasError: boolean) =>
  `w-full bg-[var(--bg-secondary)] border rounded-xl px-3 py-2.5 text-sm
   text-[var(--text-primary)] focus:outline-none transition-colors
<<<<<<< HEAD
   ${
     hasError
       ? 'border-rose-500/50 focus:border-rose-500'
       : 'border-[var(--border-subtle)] focus:border-sky-500/50'
=======
   ${hasError
     ? 'border-rose-500/50 focus:border-rose-500'
     : 'border-[var(--border-subtle)] focus:border-sky-500/50 dark:focus:border-[#8FC3A1]/70'
>>>>>>> origin/rama-jere2
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
  useEffect(() => {
    setHStr(String(computedH));
  }, [computedH]);
  useEffect(() => {
    setMStr(String(computedM));
  }, [computedM]);

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
          <span className="text-xs font-bold text-[var(--text-secondary)] flex-shrink-0">
            hrs
          </span>
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
          <span className="text-xs font-bold text-[var(--text-secondary)] flex-shrink-0">
            min
          </span>
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
  isOpen,
  service,
  specialists,
  onClose,
  onSave,
}: ServiceConfigModalProps) {
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [bufferMinutos, setBufferMinutos] = useState(10);

  const currentlyAssignedIds = service?.especialistasAsignados ?? [];
  const serviceCatPrefix = [form.categoriaL1, form.categoriaL2].filter(Boolean).join(' > ');
  const assignableSpecialists = specialists.filter((s) => {
    const categoryMatch = !serviceCatPrefix || s.categoria.startsWith(serviceCatPrefix);
    return categoryMatch && (isAssignable(s) || currentlyAssignedIds.includes(s.id));
  });

  // ── Sincronizar form ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    if (service) {
      const catParts = (service.categoria ?? '').split(' > ');
      setForm({
<<<<<<< HEAD
        denominacion: service.denominacion,
        categoria: service.categoria,
        duracion: service.duracion,
        diasAtencion: service.diasAtencion,
        especialistasAsignados: service.especialistasAsignados,
        cupos: service.cupos,
        precio: service.precio,
        estado: service.estado,
        domicilio: service.domicilio,
        anticipacionReserva: service.anticipacionReserva,
=======
        denominacion:           service.denominacion,
        categoriaL1:            catParts[0] ?? '',
        categoriaL2:            catParts[1] ?? '',
        categoriaL3:            catParts[2] ?? '',
        duracion:               service.duracion,
        diasAtencion:           service.diasAtencion,
        // Migrar number[] → SpecialistAssignment[]
        // Si el servicio tiene especialistaHorarios granulares los usa; si no, pre-puebla con todos los días/bloques
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
        cupos:                  service.cupos,
        precio:                 service.precio,
        estado:                 service.estado,
        domicilio:              service.domicilio,
        anticipacionReserva:    service.anticipacionReserva,
>>>>>>> origin/rama-jere2
      });
    } else {
      setForm(DEFAULT_FORM);
    }
    setStep(1);
    setErrors({});
    setBufferMinutos(10);
  }, [service, isOpen]);

  const set = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setForm((p) => ({ ...p, [key]: value }));
      setErrors((p) => ({ ...p, [key]: undefined }));
    },
    [],
  );

  const toggleDay = (day: WeekDay) => {
    const exists = form.diasAtencion.find((d) => d.dia === day);
    if (exists) {
<<<<<<< HEAD
      set(
        'diasAtencion',
        form.diasAtencion.filter((d) => d.dia !== day),
      );
=======
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
>>>>>>> origin/rama-jere2
    } else {
      const updated = [
        ...form.diasAtencion,
        { dia: day, bloques: [{ ...EMPTY_BLOCK }] } as AttendanceDay,
      ].sort((a, b) => WEEK_DAYS.indexOf(a.dia) - WEEK_DAYS.indexOf(b.dia));
      set('diasAtencion', updated);
    }
  };

  const addBlock = (day: WeekDay) =>
    set(
      'diasAtencion',
      form.diasAtencion.map((d) =>
        d.dia === day
          ? { ...d, bloques: [...d.bloques, { ...EMPTY_BLOCK }] }
          : d,
      ),
    );

<<<<<<< HEAD
  const removeBlock = (day: WeekDay, bi: number) =>
    set(
      'diasAtencion',
      form.diasAtencion.map((d) =>
        d.dia === day
          ? { ...d, bloques: d.bloques.filter((_, i) => i !== bi) }
          : d,
      ),
    );
=======
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
>>>>>>> origin/rama-jere2

  const updateBlock = (
    day: WeekDay,
    bi: number,
    field: keyof TimeBlock,
    val: string,
  ) =>
    set(
      'diasAtencion',
      form.diasAtencion.map((d) =>
        d.dia === day
          ? {
              ...d,
              bloques: d.bloques.map((b, i) =>
                i === bi ? { ...b, [field]: val } : b,
              ),
            }
          : d,
      ),
    );

  const toggleSpecialist = (id: number) => {
    const cur = form.especialistasAsignados;
<<<<<<< HEAD
    set(
      'especialistasAsignados',
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
    );
  };

  // ── Sesiones preview ──────────────────────────────────────────────────────
  const totalSessions = form.diasAtencion.reduce(
    (acc, d) =>
      acc +
      d.bloques.reduce(
        (a, b) => a + calculateSessions(b, form.duracion).length,
        0,
      ),
    0,
  );
=======
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
>>>>>>> origin/rama-jere2

  const validateStep = (s: 1 | 2 | 3): boolean => {
    const e: typeof errors = {};
    if (s === 1) {
      if (!form.denominacion.trim()) e.denominacion = 'Requerido';
      if (!form.categoriaL1) e.categoriaL1 = 'Selecciona una categoría';
      if (!form.categoriaL2) e.categoriaL2 = 'Selecciona una subcategoría';
    }
    if (s === 2) {
      if (form.diasAtencion.length === 0)
        e.diasAtencion = 'Selecciona al menos un día';
      if (
        form.diasAtencion.some((d) => d.bloques.some((b) => b.inicio >= b.fin))
      )
        e.bloques = 'Revisa los horarios: el inicio debe ser anterior al fin';
    }
    if (s === 3) {
      if (form.precio <= 0) e.precio = 'Ingresa un precio válido mayor a 0';
      if (form.cupos < 1 || form.cupos > 100)
        e.cupos = 'Los cupos deben estar entre 1 y 100';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 3) as 1 | 2 | 3);
  };
  const prevStep = () => setStep((s) => Math.max(s - 1, 1) as 1 | 2 | 3);

  const handleSubmit = () => {
    if (!validateStep(3)) return;
<<<<<<< HEAD
    const finalCat =
      form.categoria === 'Otro' ? customCategory : form.categoria;
    onSave(
      service
        ? { ...form, categoria: finalCat, id: service.id }
        : { ...form, categoria: finalCat },
    );
=======
    const categoria = [form.categoriaL1, form.categoriaL2, form.categoriaL3]
      .filter(Boolean).join(' > ');
    // Serializar SpecialistAssignment[] → number[] + persistir granularidad en especialistaHorarios
    const saveData = {
      ...form,
      categoria,
      especialistasAsignados: form.especialistasAsignados.map((a) => a.id),
      especialistaHorarios: form.especialistasAsignados.map<SpecialistHorario>((a) => ({
        id: a.id,
        dias: a.dias,
      })),
    };
    onSave(service ? { ...saveData, id: service.id } : saveData);
>>>>>>> origin/rama-jere2
    onClose();
  };

  if (!isOpen) return null;

  const STEP_LABELS = ['Información', 'Horarios', 'Precio y cupos'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

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
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors"
          >
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
<<<<<<< HEAD
                <div
                  className={`h-1 rounded-full transition-all ${done ? 'bg-sky-500' : active ? 'bg-sky-500/50' : 'bg-[var(--border-subtle)]'}`}
                />
                <p
                  className={`text-[9px] font-black uppercase tracking-widest transition-colors
                  ${active ? 'text-sky-500' : done ? 'text-[var(--text-secondary)]' : 'text-[var(--border-subtle)]'}`}
                >
=======
                <div className={`h-1 rounded-full transition-all ${done ? 'bg-sky-500 dark:bg-[#8FC3A1]' : active ? 'bg-sky-500/50 dark:bg-[#8FC3A1]/50' : 'bg-[var(--border-subtle)]'}`} />
                <p className={`text-[9px] font-black uppercase tracking-widest transition-colors
                  ${active ? 'text-sky-500 dark:text-[#8FC3A1]' : done ? 'text-[var(--text-secondary)]' : 'text-[var(--border-subtle)]'}`}>
>>>>>>> origin/rama-jere2
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
              {/* Denominación */}
              <Field
                label="Denominación del servicio"
                error={errors.denominacion}
              >
                <input
                  type="text"
                  value={form.denominacion}
                  placeholder="ej. Consulta nutricional, Sesión de fisioterapia..."
                  onChange={(e) => set('denominacion', e.target.value)}
                  className={inputCls(!!errors.denominacion)}
                />
              </Field>

<<<<<<< HEAD
              {/* Categoría */}
              <Field label="Categoría" error={errors.categoria}>
                <select
                  value={form.categoria}
                  onChange={(e) => {
                    set('categoria', e.target.value);
                    if (e.target.value !== 'Otro') setCustomCategory('');
                  }}
                  className={inputCls(!!errors.categoria)}
                >
                  <option value="" disabled>
                    Selecciona una categoría...
                  </option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {form.categoria === 'Otro' && (
                  <input
                    type="text"
                    value={customCategory}
                    placeholder="Escribe la categoría..."
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className={`mt-2 ${inputCls(false)}`}
                  />
=======
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
>>>>>>> origin/rama-jere2
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

              {/* ── Servicio a domicilio ── */}
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                  Modalidad de atención
                </p>
                <button
                  type="button"
                  onClick={() => set('domicilio', !form.domicilio)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all
<<<<<<< HEAD
                    ${
                      form.domicilio
                        ? 'bg-sky-500/10 border-sky-500/40'
                        : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] hover:border-sky-500/20'
                    }`}
                >
                  <div
                    className={`flex-shrink-0 transition-colors ${form.domicilio ? 'text-sky-500' : 'text-[var(--text-secondary)]'}`}
                  >
                    <SvgHome />
                  </div>
                  <div className="flex-1 text-left">
                    <p
                      className={`text-xs font-black uppercase tracking-widest transition-colors
                      ${form.domicilio ? 'text-sky-500' : 'text-[var(--text-primary)]'}`}
                    >
                      Disponible a domicilio
                    </p>
                  </div>
                  <div
                    className={`w-10 h-6 rounded-full border-2 flex items-center transition-all flex-shrink-0
                    ${
                      form.domicilio
                        ? 'bg-sky-500 border-sky-500 justify-end'
                        : 'bg-[var(--bg-primary)] border-[var(--border-subtle)] justify-start'
                    }`}
                  >
=======
                    ${form.domicilio
                      ? 'bg-sky-500/10 dark:bg-[#8FC3A1]/10 border-sky-500/40 dark:border-[#8FC3A1]/40'
                      : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] hover:border-sky-500/20 dark:hover:border-[#8FC3A1]/50'
                    }`}>
                  <div className={`flex-shrink-0 transition-colors ${form.domicilio ? 'text-sky-500 dark:text-[#8FC3A1]' : 'text-[var(--text-secondary)]'}`}>
                    <SvgHome />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-xs font-black uppercase tracking-widest transition-colors
                      ${form.domicilio ? 'text-sky-500 dark:text-[#8FC3A1]' : 'text-[var(--text-primary)]'}`}>
                      Disponible a domicilio
                    </p>
                  </div>
                  <div className={`w-10 h-6 rounded-full border-2 flex items-center transition-all flex-shrink-0
                    ${form.domicilio
                      ? 'bg-sky-500 dark:bg-[#8FC3A1] border-sky-500 dark:border-[#8FC3A1] justify-end'
                      : 'bg-[var(--bg-primary)] border-[var(--border-subtle)] justify-start'
                    }`}>
>>>>>>> origin/rama-jere2
                    <div className="w-4 h-4 bg-white rounded-full mx-0.5 shadow-sm" />
                  </div>
                </button>
              </div>

              {/* Especialistas asignados */}
              <Field label="Especialistas asignados">
                {assignableSpecialists.length === 0 ? (
                  <p className="text-xs text-[var(--text-secondary)] py-2">
                    No hay especialistas disponibles. Registra uno primero.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {assignableSpecialists.map((sp) => {
<<<<<<< HEAD
                      const selected = form.especialistasAsignados.includes(
                        sp.id,
                      );
=======
                      const selected = form.especialistasAsignados.some((a) => a.id === sp.id);
>>>>>>> origin/rama-jere2
                      return (
                        <button
                          key={sp.id}
                          type="button"
                          onClick={() => toggleSpecialist(sp.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all
<<<<<<< HEAD
                            ${
                              selected
                                ? 'bg-indigo-500/10 border-indigo-500/40'
                                : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] hover:border-indigo-500/20'
                            }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 overflow-hidden flex-shrink-0 flex items-center justify-center text-indigo-400">
                            {sp.foto ? (
                              <img
                                src={sp.foto}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <SvgUserSilhouette />
                            )}
=======
                            ${selected
                              ? 'bg-sky-500/10 border-sky-500/40 dark:bg-[#8FC3A1]/10 dark:border-[#8FC3A1]/40'
                              : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] hover:border-sky-500/20 dark:hover:border-[#8FC3A1]/20'
                            }`}>
                          <div className="w-8 h-8 rounded-full bg-sky-500/20 dark:bg-[#8FC3A1]/20 border border-sky-500/30 dark:border-[#8FC3A1]/30 overflow-hidden flex-shrink-0 flex items-center justify-center text-sky-400 dark:text-[#8FC3A1]">
                            {sp.foto
                              ? <img src={sp.foto} alt="" className="w-full h-full object-cover" />
                              : <SvgUserSilhouette />
                            }
>>>>>>> origin/rama-jere2
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
                            <p className="text-[10px] text-[var(--text-secondary)]">
                              {sp.especialidad}
                            </p>
                          </div>
<<<<<<< HEAD
                          <div
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0
                            ${selected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-[var(--border-subtle)]'}`}
                          >
=======
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0
                            ${selected ? 'bg-sky-500 dark:bg-[var(--brand-green)] border-sky-500 dark:border-[var(--brand-green)] text-white' : 'border-[var(--border-subtle)]'}`}>
>>>>>>> origin/rama-jere2
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
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`w-12 h-12 rounded-2xl text-[10px] font-black uppercase border transition-all
<<<<<<< HEAD
                          ${
                            active
                              ? 'bg-sky-500/15 border-sky-500/50 text-sky-500'
                              : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-sky-500/30'
                          }`}
                      >
=======
                          ${active
                            ? 'bg-sky-500/15 dark:bg-[#8FC3A1]/15 border-sky-500/50 dark:border-[#8FC3A1]/50 text-sky-500 dark:text-[#8FC3A1]'
                            : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-sky-500/30 dark:hover:border-[#8FC3A1]/50'
                          }`}>
>>>>>>> origin/rama-jere2
                        {WEEK_DAY_SHORT[day]}
                      </button>
                    );
                  })}
                </div>
              </Field>

              {errors.bloques && (
                <p className="text-[10px] text-rose-500 font-semibold">
                  {errors.bloques}
                </p>
              )}

              {form.diasAtencion.length === 0 && (
                <div className="rounded-[1.75rem] border border-dashed border-[var(--border-subtle)] p-6 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                    Selecciona al menos un día arriba
                  </p>
                </div>
              )}

              {form.diasAtencion.map((dayEntry) => (
                <div
                  key={dayEntry.dia}
                  className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/40 overflow-hidden"
                >
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
                        {dayEntry.bloques.reduce(
                          (a, b) =>
                            a + calculateSessions(b, form.duracion).length,
                          0,
                        )}{' '}
                        sesión(es)
                      </span>
<<<<<<< HEAD
                      <button
                        type="button"
                        onClick={() => addBlock(dayEntry.dia)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-500 text-[10px] font-black uppercase tracking-widest hover:bg-sky-500/20 transition-colors"
                      >
=======
                      <button type="button" onClick={() => addBlock(dayEntry.dia)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/10 dark:bg-[#8FC3A1]/10 border border-sky-500/20 dark:border-[#8FC3A1]/20 text-sky-500 dark:text-[#8FC3A1] text-[10px] font-black uppercase tracking-widest hover:bg-sky-500/20 dark:hover:bg-[#8FC3A1]/20 transition-colors">
>>>>>>> origin/rama-jere2
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
                            <TimeBlockPicker
                              inicio={block.inicio}
                              fin={block.fin}
                              onChangeInicio={(v) =>
                                updateBlock(dayEntry.dia, bi, 'inicio', v)
                              }
                              onChangeFin={(v) =>
                                updateBlock(dayEntry.dia, bi, 'fin', v)
                              }
                            />
                            {dayEntry.bloques.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeBlock(dayEntry.dia, bi)}
                                className="w-8 h-8 flex items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/20 transition-colors flex-shrink-0"
                              >
                                <SvgTrash />
                              </button>
                            )}
                          </div>
                          {!invalid && sessions.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 px-1">
                              {sessions.map((s, si) => (
                                <span
                                  key={si}
                                  className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                >
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
                      Duración {formatMin(form.duracion)} + {bufferMinutos} min
                      margen
                    </p>
                  </div>
<<<<<<< HEAD
                  <span className="text-2xl font-black text-sky-500">
                    {totalSessions}
                  </span>
=======
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
>>>>>>> origin/rama-jere2
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
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={form.precio || ''}
                    onChange={(e) =>
                      set('precio', parseFloat(e.target.value) || 0)
                    }
                    placeholder="0.00"
                    className={`pl-10 ${inputCls(!!errors.precio)}`}
                  />
                </div>
              </Field>

              {/* Cupos */}
              <Field label="Cupos por sesión" error={errors.cupos}>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
<<<<<<< HEAD
                    <button
                      type="button"
                      onClick={() => set('cupos', Math.max(1, form.cupos - 1))}
                      className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] hover:border-sky-500/30 transition-colors font-black text-lg select-none"
                    >
=======
                    <button type="button" onClick={() => set('cupos', Math.max(1, form.cupos - 1))}
                      className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] hover:border-sky-500/30 dark:hover:border-[#8FC3A1]/50 transition-colors font-black text-lg select-none">
>>>>>>> origin/rama-jere2
                      −
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-3xl font-black text-[var(--text-primary)]">
                        {form.cupos}
                      </span>
                      <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-1">
                        {form.cupos === 1
                          ? 'persona por sesión'
                          : 'personas por sesión'}
                      </p>
                    </div>
<<<<<<< HEAD
                    <button
                      type="button"
                      onClick={() =>
                        set('cupos', Math.min(100, form.cupos + 1))
                      }
                      className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] hover:border-sky-500/30 transition-colors font-black text-lg select-none"
                    >
=======
                    <button type="button" onClick={() => set('cupos', Math.min(100, form.cupos + 1))}
                      className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] hover:border-sky-500/30 dark:hover:border-[#8FC3A1]/50 transition-colors font-black text-lg select-none">
>>>>>>> origin/rama-jere2
                      +
                    </button>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={form.cupos}
                    onChange={(e) => set('cupos', parseInt(e.target.value))}
<<<<<<< HEAD
                    className="w-full accent-sky-500"
                  />
=======
                    className="w-full accent-sky-500 dark:accent-[#8FC3A1]" />
>>>>>>> origin/rama-jere2
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                    <span>1 mín</span>
                    <span>100 máx</span>
                  </div>
                </div>
              </Field>

              {/* ── Anticipación para reservar ── */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="text-[var(--text-secondary)]">
                    <SvgClock />
                  </div>
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
                      <button
                        key={h}
                        type="button"
                        onClick={() => set('anticipacionReserva', h)}
                        className={`flex flex-col items-center py-4 px-3 rounded-2xl border transition-all
<<<<<<< HEAD
                          ${
                            active
                              ? 'bg-sky-500/10 border-sky-500/40 text-sky-500'
                              : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-sky-500/20'
                          }`}
                      >
                        <span
                          className={`text-2xl font-black ${active ? 'text-sky-500' : 'text-[var(--text-primary)]'}`}
                        >
=======
                          ${active
                            ? 'bg-sky-500/10 dark:bg-[#8FC3A1]/10 border-sky-500/40 dark:border-[#8FC3A1]/40 text-sky-500 dark:text-[#8FC3A1]'
                            : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-sky-500/20 dark:hover:border-[#8FC3A1]/50'
                          }`}>
                        <span className={`text-2xl font-black ${active ? 'text-sky-500 dark:text-[#8FC3A1]' : 'text-[var(--text-primary)]'}`}>
>>>>>>> origin/rama-jere2
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
<<<<<<< HEAD
                  <SummaryItem
                    label="Denominación"
                    value={form.denominacion || '—'}
                  />
                  <SummaryItem
                    label="Categoría"
                    value={
                      form.categoria === 'Otro'
                        ? customCategory || '—'
                        : form.categoria || '—'
                    }
                  />
                  <SummaryItem
                    label="Duración"
                    value={formatMin(form.duracion)}
                  />
                  <SummaryItem
                    label="Sesiones totales"
                    value={`${totalSessions}`}
                    accent="sky"
                  />
                  <SummaryItem
                    label="Días de atención"
                    value={
                      form.diasAtencion
                        .map((d) => WEEK_DAY_SHORT[d.dia])
                        .join(', ') || '—'
                    }
                  />
                  <SummaryItem
                    label="Especialistas"
                    value={`${form.especialistasAsignados.length} asignado(s)`}
                  />
                  <SummaryItem
                    label="Precio"
                    value={
                      form.precio > 0 ? `S/. ${form.precio.toFixed(2)}` : '—'
                    }
                    accent="emerald"
                  />
                  <SummaryItem
                    label="Cupos / sesión"
                    value={`${form.cupos}`}
                    accent="sky"
                  />
                  <SummaryItem
                    label="A domicilio"
                    value={form.domicilio ? 'Sí' : 'No'}
                  />
                  <SummaryItem
                    label="Anticipación"
                    value={ANTICIPACION_LABELS[form.anticipacionReserva]}
                    accent="sky"
                  />
=======
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
                  <SummaryItem label="A domicilio" value={form.domicilio ? 'Sí' : 'No'} />
                  <SummaryItem label="Anticipación" value={ANTICIPACION_LABELS[form.anticipacionReserva]} accent="sky" />
>>>>>>> origin/rama-jere2
                </div>
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
            <BaseButton
              variant="ghost"
              type="button"
              onClick={prevStep}
              className="flex-1"
            >
              Atrás
            </BaseButton>
          )}
          {step < 3 ? (
            <BaseButton
              variant="action"
              type="button"
              onClick={nextStep}
              className="flex-1"
            >
              Siguiente
            </BaseButton>
          ) : (
            <BaseButton
              variant="action"
              type="button"
              onClick={handleSubmit}
              className="flex-1"
            >
              {service ? 'Guardar cambios' : 'Guardar como borrador'}
            </BaseButton>
          )}
        </div>
      </div>
    </div>
  );
}

<<<<<<< HEAD
// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
=======
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
>>>>>>> origin/rama-jere2
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-[10px] text-rose-500 font-semibold">{error}</p>
      )}
    </div>
  );
}

<<<<<<< HEAD
function SummaryItem({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'sky' | 'emerald' | 'indigo';
}) {
  const cls = accent
    ? {
        sky: 'text-sky-500',
        emerald: 'text-emerald-500',
        indigo: 'text-indigo-500',
      }[accent]
    : 'text-[var(--text-primary)]';
=======
function SummaryItem({ label, value, accent }: { label: string; value: string; accent?: 'sky' | 'emerald' | 'indigo' }) {
  const cls = accent ? { sky: 'text-sky-500 dark:text-[#8FC3A1]', emerald: 'text-emerald-500', indigo: 'text-indigo-500' }[accent] : 'text-[var(--text-primary)]';
>>>>>>> origin/rama-jere2
  return (
    <div className="space-y-0.5">
      <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
        {label}
      </p>
      <p className={`text-xs font-black ${cls}`}>{value}</p>
    </div>
  );
}

function generateTimeOptions(stepMin = 30): string[] {
  const options: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += stepMin) {
      options.push(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
      );
    }
  }
  return options;
}

const TIME_OPTIONS = generateTimeOptions(10); // cada 10 min — ajusta a gusto

function SvgChevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3 h-3 pointer-events-none"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function SvgClock2() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5 flex-shrink-0"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

/** Selector de una sola hora con ícono de reloj y flecha */
function TimeSelect({
  value,
  onChange,
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  hasError?: boolean;
}) {
  return (
    <div className="relative flex items-center">
      {/* Ícono reloj */}
      <span className="absolute left-2.5 text-sky-500 pointer-events-none z-10">
        <SvgClock2 />
      </span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          appearance-none w-full pl-8 pr-7
          bg-[var(--bg-primary)] rounded-xl border px-3 py-2
          text-sm font-semibold text-[var(--text-primary)]
          focus:outline-none transition-colors cursor-pointer
          ${
            hasError
              ? 'border-rose-500/40 focus:border-rose-500'
              : 'border-[var(--border-subtle)] focus:border-sky-500/50 hover:border-sky-500/30'
          }
        `}
      >
        {TIME_OPTIONS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      {/* Flecha dropdown */}
      <span className="absolute right-2.5 text-[var(--text-secondary)] pointer-events-none">
        <SvgChevron />
      </span>
    </div>
  );
}
export function TimeBlockPicker({
  inicio,
  fin,
  onChangeInicio,
  onChangeFin,
}: {
  inicio: string;
  fin: string;
  onChangeInicio: (v: string) => void;
  onChangeFin: (v: string) => void;
}) {
  const invalid = inicio >= fin;

  return (
    <div
      className={`
        flex items-center gap-2 flex-1
        bg-[var(--bg-primary)] rounded-xl border px-3 py-2 transition-colors
        ${invalid ? 'border-rose-500/40' : 'border-[var(--border-subtle)]'}
      `}
    >
      <TimeSelect value={inicio} onChange={onChangeInicio} hasError={invalid} />

      <span className="text-[var(--text-secondary)] font-bold flex-shrink-0 text-sm">
        →
      </span>

      <TimeSelect value={fin} onChange={onChangeFin} hasError={invalid} />
    </div>
  );
}
