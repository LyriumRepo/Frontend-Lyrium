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

type FormData = Omit<Service, 'id'>;

const CATEGORIES = [
  'Salud y bienestar', 'Nutrición', 'Psicología', 'Fisioterapia',
  'Medicina general', 'Odontología', 'Dermatología', 'Veterinaria',
  'Educación', 'Asesoría legal', 'Consultoría', 'Otro',
];

const ANTICIPACION_OPTIONS: AnticipacionReserva[] = [24, 48, 72];

const DEFAULT_FORM: FormData = {
  denominacion: '',
  categoria: '',
  duracion: 30,
  diasAtencion: [],
  especialistasAsignados: [],
  cupos: 1,
  precio: 0,
  estado: 'borrador',
  domicilio: false,
  anticipacionReserva: 24,
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
const SvgHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const SvgClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
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
     : 'border-[var(--border-subtle)] focus:border-sky-500/50'
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

  // Keep display in sync when value changes from outside (± buttons, form reset).
  const computedH = Math.floor(value / 60);
  const computedM = value % 60;
  useEffect(() => { setHStr(String(computedH)); }, [computedH]);
  useEffect(() => { setMStr(String(computedM)); }, [computedM]);

  /** Push a validated total to the parent. */
  const commit = (h: string | number, m: string | number) => {
    const hours = Math.max(0, Number(h) || 0);
    const mins  = Math.max(0, Math.min(59, Number(m) || 0));
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function ServiceConfigModal({
  isOpen, service, specialists, onClose, onSave,
}: ServiceConfigModalProps) {
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [customCategory, setCustomCategory] = useState('');
  const [bufferMinutos, setBufferMinutos] = useState(10);

  const currentlyAssignedIds = service?.especialistasAsignados ?? [];
  const assignableSpecialists = specialists.filter(
    (s) => isAssignable(s) || currentlyAssignedIds.includes(s.id),
  );

  // ── Sincronizar form ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    if (service) {
      setForm({
        denominacion:           service.denominacion,
        categoria:              service.categoria,
        duracion:               service.duracion,
        diasAtencion:           service.diasAtencion,
        especialistasAsignados: service.especialistasAsignados,
        cupos:                  service.cupos,
        precio:                 service.precio,
        estado:                 service.estado,
        domicilio:              service.domicilio,
        anticipacionReserva:    service.anticipacionReserva,
      });
    } else {
      setForm(DEFAULT_FORM);
    }
    setStep(1);
    setErrors({});
    setCustomCategory('');
    setBufferMinutos(10);
  }, [service, isOpen]);

  const set = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  }, []);

  // ── Gestión de días ───────────────────────────────────────────────────────
  const toggleDay = (day: WeekDay) => {
    const exists = form.diasAtencion.find((d) => d.dia === day);
    if (exists) {
      set('diasAtencion', form.diasAtencion.filter((d) => d.dia !== day));
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

  const removeBlock = (day: WeekDay, bi: number) =>
    set('diasAtencion', form.diasAtencion.map((d) =>
      d.dia === day ? { ...d, bloques: d.bloques.filter((_, i) => i !== bi) } : d));

  const updateBlock = (day: WeekDay, bi: number, field: keyof TimeBlock, val: string) =>
    set('diasAtencion', form.diasAtencion.map((d) =>
      d.dia === day
        ? { ...d, bloques: d.bloques.map((b, i) => (i === bi ? { ...b, [field]: val } : b)) }
        : d));

  // ── Especialistas ─────────────────────────────────────────────────────────
  const toggleSpecialist = (id: number) => {
    const cur = form.especialistasAsignados;
    set('especialistasAsignados', cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  };

  // ── Sesiones preview ──────────────────────────────────────────────────────
  const totalSessions = form.diasAtencion.reduce((acc, d) =>
    acc + d.bloques.reduce((a, b) => a + calculateSessions(b, form.duracion).length, 0), 0);

  // ── Validación por paso ───────────────────────────────────────────────────
  const validateStep = (s: 1 | 2 | 3): boolean => {
    const e: typeof errors = {};
    if (s === 1) {
      if (!form.denominacion.trim()) e.denominacion = 'Requerido';
      const cat = form.categoria === 'Otro' ? customCategory : form.categoria;
      if (!cat.trim()) e.categoria = 'Selecciona o escribe una categoría';
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

  const nextStep = () => { if (validateStep(step)) setStep((s) => Math.min(s + 1, 3) as 1 | 2 | 3); };
  const prevStep = () => setStep((s) => Math.max(s - 1, 1) as 1 | 2 | 3);

  const handleSubmit = () => {
    if (!validateStep(3)) return;
    const finalCat = form.categoria === 'Otro' ? customCategory : form.categoria;
    onSave(service
      ? { ...form, categoria: finalCat, id: service.id }
      : { ...form, categoria: finalCat });
    onClose();
  };

  if (!isOpen) return null;

  const STEP_LABELS = ['Información', 'Horarios', 'Precio y cupos'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[var(--bg-primary)] rounded-[2rem] border border-[var(--border-subtle)] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fadeIn">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-subtle)] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-500/10 rounded-2xl flex items-center justify-center border border-sky-500/20 text-sky-500">
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
                <div className={`h-1 rounded-full transition-all ${done ? 'bg-sky-500' : active ? 'bg-sky-500/50' : 'bg-[var(--border-subtle)]'}`} />
                <p className={`text-[9px] font-black uppercase tracking-widest transition-colors
                  ${active ? 'text-sky-500' : done ? 'text-[var(--text-secondary)]' : 'text-[var(--border-subtle)]'}`}>
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
              <Field label="Denominación del servicio" error={errors.denominacion}>
                <input type="text" value={form.denominacion}
                  placeholder="ej. Consulta nutricional, Sesión de fisioterapia..."
                  onChange={(e) => set('denominacion', e.target.value)}
                  className={inputCls(!!errors.denominacion)} />
              </Field>

              {/* Categoría */}
              <Field label="Categoría" error={errors.categoria}>
                <select
                  value={form.categoria}
                  onChange={(e) => { set('categoria', e.target.value); if (e.target.value !== 'Otro') setCustomCategory(''); }}
                  className={inputCls(!!errors.categoria)}
                >
                  <option value="" disabled>Selecciona una categoría...</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {form.categoria === 'Otro' && (
                  <input type="text" value={customCategory} placeholder="Escribe la categoría..."
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className={`mt-2 ${inputCls(false)}`} />
                )}
              </Field>

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
                <button type="button" onClick={() => set('domicilio', !form.domicilio)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all
                    ${form.domicilio
                      ? 'bg-sky-500/10 border-sky-500/40'
                      : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] hover:border-sky-500/20'
                    }`}>
                  <div className={`flex-shrink-0 transition-colors ${form.domicilio ? 'text-sky-500' : 'text-[var(--text-secondary)]'}`}>
                    <SvgHome />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-xs font-black uppercase tracking-widest transition-colors
                      ${form.domicilio ? 'text-sky-500' : 'text-[var(--text-primary)]'}`}>
                      Disponible a domicilio
                    </p>
                  </div>
                  <div className={`w-10 h-6 rounded-full border-2 flex items-center transition-all flex-shrink-0
                    ${form.domicilio
                      ? 'bg-sky-500 border-sky-500 justify-end'
                      : 'bg-[var(--bg-primary)] border-[var(--border-subtle)] justify-start'
                    }`}>
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
                      const selected = form.especialistasAsignados.includes(sp.id);
                      return (
                        <button key={sp.id} type="button" onClick={() => toggleSpecialist(sp.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all
                            ${selected
                              ? 'bg-indigo-500/10 border-indigo-500/40'
                              : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] hover:border-indigo-500/20'
                            }`}>
                          <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 overflow-hidden flex-shrink-0 flex items-center justify-center text-indigo-400">
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
                              {sp.availability === 'Ocupado' && (
                                <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500">
                                  Ya asignado
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-[var(--text-secondary)]">{sp.especialidad}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0
                            ${selected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-[var(--border-subtle)]'}`}>
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
                            ? 'bg-sky-500/15 border-sky-500/50 text-sky-500'
                            : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-sky-500/30'
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
                      <span className="w-7 h-7 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-[10px] font-black text-sky-500">
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
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-500 text-[10px] font-black uppercase tracking-widest hover:bg-sky-500/20 transition-colors">
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
                            <div className={`flex items-center gap-2 flex-1 bg-[var(--bg-primary)] rounded-xl border px-3 py-2 transition-colors
                              ${invalid ? 'border-rose-500/40' : 'border-[var(--border-subtle)]'}`}>
                              <input type="time" value={block.inicio}
                                onChange={(e) => updateBlock(dayEntry.dia, bi, 'inicio', e.target.value)}
                                className="bg-transparent text-sm font-semibold text-[var(--text-primary)] focus:outline-none" />
                              <span className="text-[var(--text-secondary)]">→</span>
                              <input type="time" value={block.fin}
                                onChange={(e) => updateBlock(dayEntry.dia, bi, 'fin', e.target.value)}
                                className="bg-transparent text-sm font-semibold text-[var(--text-primary)] focus:outline-none" />
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
                <div className="rounded-[1.75rem] border border-sky-500/20 bg-sky-500/5 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-sky-500">
                      Total de sesiones automáticas
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      Duración {formatMin(form.duracion)} + {bufferMinutos} min margen
                    </p>
                  </div>
                  <span className="text-2xl font-black text-sky-500">{totalSessions}</span>
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
                      className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] hover:border-sky-500/30 transition-colors font-black text-lg select-none">
                      −
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-3xl font-black text-[var(--text-primary)]">{form.cupos}</span>
                      <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-1">
                        {form.cupos === 1 ? 'persona por sesión' : 'personas por sesión'}
                      </p>
                    </div>
                    <button type="button" onClick={() => set('cupos', Math.min(100, form.cupos + 1))}
                      className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] hover:border-sky-500/30 transition-colors font-black text-lg select-none">
                      +
                    </button>
                  </div>
                  <input type="range" min={1} max={100} value={form.cupos}
                    onChange={(e) => set('cupos', parseInt(e.target.value))}
                    className="w-full accent-sky-500" />
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
                            ? 'bg-sky-500/10 border-sky-500/40 text-sky-500'
                            : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-sky-500/20'
                          }`}>
                        <span className={`text-2xl font-black ${active ? 'text-sky-500' : 'text-[var(--text-primary)]'}`}>
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
                  <SummaryItem label="Categoría" value={form.categoria === 'Otro' ? customCategory || '—' : form.categoria || '—'} />
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
                </div>
                <div className="pt-2 border-t border-[var(--border-subtle)]">
                  <p className="text-[10px] text-[var(--text-secondary)]">
                    El servicio se guardará como{' '}
                    <span className="font-black text-[#99F6E4]">Borrador</span>.
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
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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
  const cls = accent ? { sky: 'text-sky-500', emerald: 'text-emerald-500', indigo: 'text-indigo-500' }[accent] : 'text-[var(--text-primary)]';
  return (
    <div className="space-y-0.5">
      <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">{label}</p>
      <p className={`text-xs font-black ${cls}`}>{value}</p>
    </div>
  );
}