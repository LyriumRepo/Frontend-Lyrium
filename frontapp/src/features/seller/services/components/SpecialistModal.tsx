'use client';

import React, { useState, useEffect, useRef } from 'react';
import BaseButton from '@/components/ui/BaseButton';
import Icon from '@/components/ui/Icon';
import {
  Specialist,
  DocumentType,
  AvailabilityStatus,
  DOCUMENT_TYPE_LABELS,
} from '@/features/seller/services/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SpecialistModalProps {
  isOpen: boolean;
  specialist: Specialist | null;
  onClose: () => void;
  onSave: (data: Omit<Specialist, 'id'> & { id?: number }) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DOCUMENT_TYPES = Object.entries(DOCUMENT_TYPE_LABELS) as [DocumentType, string][];

/**
 * Solo Disponible e Indispuesto son editables manualmente.
 * "Ocupado" se asigna automáticamente cuando el especialista
 * está asignado a al menos un servicio.
 */
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
    activeClass: 'bg-rose-500/15 border-rose-500/50 text-rose-500',
    dotClass: 'bg-rose-500',
  },
];

const DEFAULT_FORM: Omit<Specialist, 'id'> = {
  nombres: '',
  apellidos: '',
  tipoDocumento: 'dni',
  numeroDocumento: '',
  especialidad: '',
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

const SvgXTiny = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}
    strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getDocumentMaxLength = (type: DocumentType): number => {
  switch (type) {
    case 'dni':                return 8;
    case 'ruc':                return 11;
    case 'carnet_extranjeria': return 12;
    case 'pasaporte':          return 12;
  }
};

const inputCls = (hasError: boolean) =>
  `w-full bg-[var(--bg-secondary)] border rounded-xl px-3 py-2.5 text-sm
   text-[var(--text-primary)] focus:outline-none transition-colors
   ${hasError
     ? 'border-rose-500/50 focus:border-rose-500'
     : 'border-[var(--border-subtle)] focus:border-indigo-500/50'
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

  useEffect(() => {
    if (!isOpen) return;
    if (specialist) {
      setForm({
        nombres:         specialist.nombres,
        apellidos:       specialist.apellidos,
        tipoDocumento:   specialist.tipoDocumento,
        numeroDocumento: specialist.numeroDocumento,
        especialidad:    specialist.especialidad,
        foto:            specialist.foto,
        // Si llega como "Ocupado" (asignado automáticamente),
        // lo mostramos como Disponible en el form — el seller no lo edita.
        availability: specialist.availability === 'Ocupado' ? 'Disponible' : specialist.availability,
      });
      setFotoPreview(specialist.foto ?? null);
    } else {
      setForm(DEFAULT_FORM);
      setFotoPreview(null);
    }
    setErrors({});
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
    const maxLen = getDocumentMaxLength(form.tipoDocumento);
    if (!form.numeroDocumento.trim()) {
      e.numeroDocumento = 'Requerido';
    } else if (form.numeroDocumento.length !== maxLen) {
      e.numeroDocumento = `Debe tener ${maxLen} caracteres`;
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

  if (!isOpen) return null;

  const maxLen = getDocumentMaxLength(form.tipoDocumento);
  const isOccupied = specialist?.availability === 'Ocupado';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[var(--bg-primary)] rounded-[2rem] border border-[var(--border-subtle)] shadow-2xl overflow-hidden animate-fadeIn">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 text-indigo-500">
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
              <div onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-full bg-[var(--bg-secondary)] border-2 border-dashed border-[var(--border-subtle)] hover:border-indigo-500/50 transition-all cursor-pointer overflow-hidden flex items-center justify-center shadow-sm text-[var(--text-secondary)]">
                {fotoPreview
                  ? <img src={fotoPreview} alt="Foto" className="w-full h-full object-cover" />
                  : <SvgUserSilhouette />
                }
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
              <input type="text" value={form.nombres} placeholder="Juan"
                onChange={(e) => set('nombres', e.target.value)}
                className={inputCls(!!errors.nombres)} />
            </Field>
            <Field label="Apellidos" error={errors.apellidos}>
              <input type="text" value={form.apellidos} placeholder="Pérez"
                onChange={(e) => set('apellidos', e.target.value)}
                className={inputCls(!!errors.apellidos)} />
            </Field>
          </div>

          {/* Tipo / N° documento */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tipo de documento">
              <select value={form.tipoDocumento}
                onChange={(e) => { set('tipoDocumento', e.target.value as DocumentType); set('numeroDocumento', ''); }}
                className={inputCls(false)}>
                {DOCUMENT_TYPES.map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </Field>
            <Field label={`N° Documento (${maxLen} díg.)`} error={errors.numeroDocumento}>
              <input type="text" value={form.numeroDocumento} maxLength={maxLen}
                placeholder={'0'.repeat(maxLen)}
                onChange={(e) => set('numeroDocumento', e.target.value.replace(/\D/g, ''))}
                className={inputCls(!!errors.numeroDocumento)} />
            </Field>
          </div>

          {/* Especialidad */}
          <Field label="Especialidad" error={errors.especialidad}>
            <input type="text" value={form.especialidad}
              placeholder="ej. Nutricionista, Psicólogo, Fisioterapeuta..."
              onChange={(e) => set('especialidad', e.target.value)}
              className={inputCls(!!errors.especialidad)} />
          </Field>

          {/* Disponibilidad */}
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
              Estado de disponibilidad
            </p>

            {/* Banner informativo si está ocupado */}
            {isOccupied && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                <p className="text-[10px] font-bold text-amber-500">
                  Este especialista está <strong>Ocupado</strong> porque fue asignado a un servicio.
                  Su estado volverá a Disponible si lo desasignas de todos los servicios.
                </p>
              </div>
            )}

            {/* Solo 2 opciones editables: Disponible e Indispuesto */}
            <div className="flex gap-2">
              {AVAILABILITY_OPTIONS.map((opt) => {
                const active = form.availability === opt.value;
                return (
                  <button key={opt.value} type="button"
                    onClick={() => !isOccupied && set('availability', opt.value)}
                    disabled={isOccupied}
                    className={`flex-1 flex flex-col items-center py-3 px-2 rounded-xl
                      text-[10px] font-black uppercase tracking-widest border transition-all
                      ${isOccupied
                        ? 'opacity-40 cursor-not-allowed bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                        : active
                          ? opt.activeClass
                          : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-indigo-500/20'
                      }`}>
                    <span className={`w-2 h-2 rounded-full mb-1.5 ${active && !isOccupied ? opt.dotClass : 'bg-[var(--text-secondary)]/30'}`} />
                    {opt.label}
                    <span className="text-[8px] font-bold normal-case tracking-normal mt-0.5 opacity-60">
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Nota aclaratoria */}
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
    </div>
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