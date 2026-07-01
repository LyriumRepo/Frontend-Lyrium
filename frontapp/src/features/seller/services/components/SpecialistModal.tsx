'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import BaseButton from '@/components/ui/BaseButton';
import Icon from '@/components/ui/Icon';
import {
  Specialist,
  AvailabilityStatus,
} from '@/features/seller/services/types';

// ── Árbol de categorías para especialistas (L1 + L2) ─────────────────────────
type SpecCatL1 = { label: string; children: string[] };

const SPECIALIST_CATEGORY_TREE: SpecCatL1[] = [
  {
    label: 'Servicios médicos',
    children: [
      'Cardiología',
      'Radiología',
      'Dermatología',
      'Medicina general',
      'Endocrinología',
      'Enfermería',
      'Gastroenterología',
      'Geriatría',
      'Ginecología',
      'Laboratorio clínico',
      'Medicina física y rehabilitación',
      'Neumología',
      'Neurología',
      'Nutriología',
      'Odontología',
      'Oftalmología',
      'Oncología',
      'Pediatría',
      'Psicología',
      'Psiquiatría',
      'Reumatología',
    ],
  },
  { label: 'Belleza', children: ['Peluquerías', 'Spas', 'Otros'] },
  { label: 'Deportes', children: ['Gimnasios'] },
  { label: 'Servicios sociales', children: ['Otro'] },
  { label: 'Servicios para animales', children: ['Otro'] },
  { label: 'Servicio de medicina natural', children: ['Otro'] },
  { label: 'Alojamiento ecológico', children: ['Otro'] },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface SpecialistModalProps {
  isOpen: boolean;
  specialist: Specialist | null;
  onClose: () => void;
  onSave: (data: Omit<Specialist, 'id'> & { id?: number }) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const AVAILABILITY_OPTIONS: {
  value: Exclude<AvailabilityStatus, 'Ocupado'>;
  label: string;
  activeClass: string;
  dotClass: string;
}[] = [
  {
    value: 'Disponible',
    label: 'Disponible',
    activeClass: 'bg-emerald-500/15 border-emerald-500/50 text-emerald-500',
    dotClass: 'bg-emerald-500 animate-pulse',
  },
  {
    value: 'Indispuesto',
    label: 'Indispuesto',
    activeClass:
      'bg-gray-500/15 border-gray-500/50 text-gray-500 dark:bg-gray-300/15 dark:border-gray-300/50 dark:text-gray-300',
    dotClass: 'bg-gray-500 dark:bg-gray-300',
  },
];

const EXPERIENCIA_OPTIONS = [
  ...Array.from({ length: 29 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} año${i + 1 !== 1 ? 's' : ''}`,
  })),
  { value: 30, label: '30+ años' },
];

const DEFAULT_FORM: Omit<Specialist, 'id'> = {
  nombres: '',
  apellidos: '',
  dni: '',
  email: '',
  especialidad: '',
  subEspecialidad: '',
  aniosExperiencia: undefined,
  categoria: '',
  numeroColegiatura: '',
  foto: undefined,
  availability: 'Disponible',
};

// ─── Inline SVGs ──────────────────────────────────────────────────────────────

const SvgUserSilhouette = ({ className = 'w-7 h-7' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
    strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const SvgInfo = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}
    strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="8.01" strokeWidth={3} />
    <line x1="12" y1="12" x2="12" y2="16" />
  </svg>
);

const SvgXTiny = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}
    strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputCls = (hasError: boolean) =>
  `w-full bg-[var(--bg-secondary)] border rounded-xl px-3 py-2.5 text-sm
    text-[var(--text-primary)] focus:outline-none transition-colors
   ${
     hasError
       ? 'border-rose-500/50 focus:border-rose-500'
       : 'border-[var(--border-subtle)] focus:border-sky-500/50 dark:focus:border-[#8FC3A1]/50'
   }`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function SpecialistModal({
  isOpen,
  specialist,
  onClose,
  onSave,
}: SpecialistModalProps) {
  const [form, setForm] = useState<Omit<Specialist, 'id'>>(DEFAULT_FORM);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof Specialist, string>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [catL1, setCatL1] = useState('');
  const [catL2, setCatL2] = useState('');
  const [showCatInfo, setShowCatInfo] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    if (specialist) {
      const parts = (specialist.categoria ?? '').split(' > ');
      setCatL1(parts[0] ?? '');
      setCatL2(parts[1] ?? '');
      setForm({
        nombres: specialist.nombres,
        apellidos: specialist.apellidos,
        dni: specialist.dni,
        email: specialist.email,
        especialidad: specialist.especialidad,
        subEspecialidad: specialist.subEspecialidad ?? '',
        aniosExperiencia: specialist.aniosExperiencia,
        categoria: specialist.categoria,
        numeroColegiatura: specialist.numeroColegiatura ?? '',
        foto: specialist.foto,
        availability:
          specialist.availability === 'Ocupado'
            ? 'Disponible'
            : specialist.availability,
      });
      setFotoPreview(specialist.foto ?? null);
    } else {
      setCatL1('');
      setCatL2('');
      setForm(DEFAULT_FORM);
      setFotoPreview(null);
    }
    setErrors({});
    setShowCatInfo(false);
  }, [specialist, isOpen]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFotoPreview(result);
      setForm((p) => ({ ...p, foto: result }));
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFotoPreview(null);
    setForm((p) => ({ ...p, foto: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.nombres.trim())      e.nombres = 'Requerido';
    if (!form.apellidos.trim())    e.apellidos = 'Requerido';
    if (!form.especialidad.trim()) e.especialidad = 'Requerido';
    if (!catL1) e.categoria = 'Selecciona una categoría';
    if (!form.dni.trim()) {
      e.dni = 'Requerido';
    } else if (form.dni.length !== 8) {
      e.dni = 'Debe tener 8 dígitos';
    }
    if (!form.email.trim()) {
      e.email = 'Requerido';
    } else if (!EMAIL_REGEX.test(form.email)) {
      e.email = 'Email inválido';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    onSave(specialist ? { ...form, id: specialist.id } : form);
    onClose();
  };

  if (!isOpen || !mounted) return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  const isOccupied = specialist?.availability === 'Ocupado';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[var(--bg-primary)] rounded-[2rem] border border-[var(--border-subtle)] shadow-2xl overflow-hidden animate-fadeIn">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-500/10 dark:bg-[#8FC3A1]/10 rounded-2xl flex items-center justify-center border border-sky-500/20 text-sky-500 dark:border-[#8FC3A1]/20 dark:text-[#8FC3A1]">
              <Icon name="Users" className="w-5 h-5 stroke-[2.5px]" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">
                {specialist ? 'Editar Especialista' : 'Nuevo Especialista'}
              </h2>
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">
                Datos del profesional
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors">
            <Icon name="X" className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">

          {/* Foto */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative group">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-full bg-[var(--bg-secondary)] border-2 border-dashed border-[var(--border-subtle)] hover:border-sky-500/50 dark:hover:border-[#8FC3A1]/50 transition-all cursor-pointer overflow-hidden flex items-center justify-center shadow-sm text-[var(--text-secondary)]"
              >
                {fotoPreview ? (
                  <img
                    src={fotoPreview}
                    alt="Foto"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <SvgUserSilhouette />
                )}
              </div>
              {fotoPreview && (
                <button type="button" onClick={removePhoto}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow">
                  <SvgXTiny />
                </button>
              )}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
              {fotoPreview ? 'Cambiar foto' : 'Foto (opcional)'}
            </p>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </div>

          {/* Nombres / Apellidos */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombres" error={errors.nombres}>
              <input
                type="text"
                value={form.nombres}
                placeholder="....."
                onChange={(e) => set('nombres', e.target.value)}
                className={inputCls(!!errors.nombres)} />
            </Field>
            <Field label="Apellidos" error={errors.apellidos}>
              <input
                type="text"
                value={form.apellidos}
                placeholder="....."
                onChange={(e) => set('apellidos', e.target.value)}
                className={inputCls(!!errors.apellidos)} />
            </Field>
          </div>

          {/* DNI / Email */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="DNI · 8 dígitos" error={errors.dni}>
              <input
                type="text"
                value={form.dni}
                placeholder="....."
                maxLength={8}
                onChange={(e) => set('dni', e.target.value.replace(/\D/g, ''))}
                className={inputCls(!!errors.dni)}
              />
            </Field>
            <Field label="Email" error={errors.email}>
              <input
                type="email"
                value={form.email}
                placeholder="....."
                onChange={(e) => set('email', e.target.value)}
                className={inputCls(!!errors.email)}
              />
            </Field>
          </div>

          {/* Especialidad / Sub-especialidad */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Especialidad" error={errors.especialidad}>
              <input
                type="text"
                value={form.especialidad}
                placeholder="....."
                onChange={(e) => set('especialidad', e.target.value)}
                className={inputCls(!!errors.especialidad)}
              />
            </Field>
            <Field label="Sub-especialidad (opci..)">
              <input
                type="text"
                value={form.subEspecialidad ?? ''}
                placeholder="....."
                onChange={(e) => set('subEspecialidad', e.target.value)}
                className={inputCls(false)}
              />
            </Field>
          </div>

          {/* Categoría (2 niveles) */}
          <div className="space-y-3">

            {/* Label + ícono de ayuda */}
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                Categoría
              </p>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCatInfo((v) => !v)}
                  className="w-5 h-5 flex items-center justify-center rounded-full
                    text-sky-500 dark:text-[#8FC3A1]
                    border border-sky-500/40 dark:border-[#8FC3A1]/40
                    hover:bg-sky-500/10 dark:hover:bg-[#8FC3A1]/10
                    transition-colors"
                >
                  <SvgInfo className="w-3 h-3" />
                </button>

                {showCatInfo && (
                  <>
                    {/* Overlay invisible para cerrar al clickar fuera */}
                    <div className="fixed inset-0 z-10" onClick={() => setShowCatInfo(false)} />

                    <div className="absolute left-0 top-7 z-20 w-72
                      bg-[var(--bg-primary)] border border-sky-500/20 dark:border-[#8FC3A1]/20
                      rounded-2xl shadow-xl p-4 space-y-2 animate-fadeIn">
                      <p className="text-[11px] font-black uppercase tracking-widest
                        text-sky-500 dark:text-[#8FC3A1]">
                        ¿Qué categoría elegir?
                      </p>
                      <p className="text-[11px] leading-relaxed text-[var(--text-secondary)]">
                        Selecciona según la{' '}
                        <strong className="text-[var(--text-primary)]">especialidad</strong> del
                        profesional y al tipo de{' '}
                        <strong className="text-[var(--text-primary)]">servicio</strong> al que
                        será asignado.
                      </p>
                      <p className="text-[11px] text-[var(--text-secondary)]/70 italic">
                        Ej.: la categoría  de un cardiólogo debe ser → «Servicios médicos › Cardiología».
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* L1 */}
            <div className="space-y-1">
              <select
                value={catL1}
                onChange={(e) => {
                  const l1 = e.target.value;
                  setCatL1(l1);
                  setCatL2('');
                  set('categoria', l1);
                  setErrors((p) => ({ ...p, categoria: undefined }));
                }}
                className={inputCls(!!errors.categoria)}
              >
                <option value="" disabled>
                  1. Categoría principal...
                </option>
                {SPECIALIST_CATEGORY_TREE.map((c) => (
                  <option key={c.label} value={c.label}>
                    {c.label}
                  </option>
                ))}
              </select>
              {errors.categoria && (
                <p className="text-[10px] text-rose-500 font-semibold">
                  {errors.categoria}
                </p>
              )}
            </div>

            {/* L2 */}
            {catL1 &&
              (() => {
                const l1Node = SPECIALIST_CATEGORY_TREE.find(
                  (c) => c.label === catL1,
                );
                return l1Node ? (
                  <div className="pl-3 border-l-2 border-sky-500/20 dark:border-[#8FC3A1]/20">
                    <select
                      value={catL2}
                      onChange={(e) => {
                        const l2 = e.target.value;
                        setCatL2(l2);
                        set('categoria', l2 ? `${catL1} > ${l2}` : catL1);
                        setErrors((p) => ({ ...p, categoria: undefined }));
                      }}
                      className={inputCls(false)}
                    >
                      <option value="" disabled>
                        2. Subcategoría...
                      </option>
                      {l1Node.children.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null;
              })()}

            {/* Ruta visual */}
            {catL1 && (
              <div className="flex items-center gap-1 flex-wrap px-1">
                <span className="text-[10px] font-black text-sky-500 dark:text-[#8FC3A1]">
                  {catL1}
                </span>
                {catL2 && (
                  <>
                    <span className="text-[10px] text-[var(--text-secondary)]">
                      ›
                    </span>
                    <span className="text-[10px] font-black text-sky-500 dark:text-[#8FC3A1]">
                      {catL2}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* N° Colegiatura / Años de experiencia */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="N° Colegiatura (opcional)">
              <input
                type="text"
                value={form.numeroColegiatura ?? ''}
                placeholder="....."
                onChange={(e) => set('numeroColegiatura', e.target.value)}
                className={inputCls(false)}
              />
            </Field>
            <Field label="Años de experiencia (opci..)">
              <select
                value={form.aniosExperiencia ?? ''}
                onChange={(e) =>
                  set(
                    'aniosExperiencia',
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className={inputCls(false)}
              >
                <option value="">—</option>
                {EXPERIENCIA_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Disponibilidad */}
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
              Estado de disponibilidad
            </p>

            {isOccupied && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-sky-500/10 dark:bg-[#8FC3A1]/10 border border-sky-500/20 dark:border-[#8FC3A1]/20">
                <span className="w-2 h-2 rounded-full bg-sky-500 dark:bg-[#8FC3A1] flex-shrink-0" />
                <p className="text-[10px] font-bold text-sky-500 dark:text-[#8FC3A1]">
                  Este especialista está <strong>Ocupado</strong> porque fue
                  asignado a un servicio. Su estado volverá a Disponible si lo
                  desasignas de todos los servicios.
                </p>
              </div>
            )}

            <div className="flex gap-2">
              {AVAILABILITY_OPTIONS.map((opt) => {
                const active = form.availability === opt.value;
                return (
                  <button key={opt.value} type="button"
                    onClick={() => !isOccupied && set('availability', opt.value)}
                    disabled={isOccupied}
                    className={`flex-1 flex flex-col items-center py-3 px-2 rounded-xl
                      text-[10px] font-black uppercase tracking-widest border transition-all
                      ${
                        isOccupied
                          ? 'opacity-40 cursor-not-allowed bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                          : active
                            ? opt.activeClass
                            : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-sky-500/20 dark:hover:border-[#8FC3A1]/20'
                      }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mb-1.5 ${active && !isOccupied ? opt.dotClass : 'bg-[var(--text-secondary)]/30'}`}
                    />
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <p className="text-[9px] text-[var(--text-secondary)] px-1">
              El estado <strong>Ocupado</strong> se asigna automáticamente al agregar el especialista a un servicio.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <BaseButton variant="ghost" type="button" onClick={onClose} className="flex-1">
              Cancelar
            </BaseButton>
            <BaseButton variant="action" type="submit" className="flex-1">
              {specialist ? 'Guardar cambios' : 'Registrar especialista'}
            </BaseButton>
          </div>
        </form>
      </div>
    </div>,
    modalRoot,
  );
}

// ─── Sub-component ────────────────────────────────────────────────────────────

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
        {label}
      </label>
      {children}
      {error && <p className="text-[10px] text-rose-500 font-semibold">{error}</p>}
    </div>
  );
}