'use client';
import type { ButtonColors } from '@/features/seller/plans/types';

interface Props {
  colors: ButtonColors;
  onChange: (key: keyof ButtonColors, value: string) => void;
  onSave: () => void;
  onReset: () => void;
}

const COLOR_FIELDS: { id: keyof ButtonColors; label: string; section: string }[] = [
  { id: 'subscribeBg',    label: 'Fondo botón',     section: 'Botones de Suscripción — Normal' },
  { id: 'subscribeColor', label: 'Texto botón',      section: '' },
  { id: 'currentBg',      label: 'Fondo (activo)',   section: 'Botones de Suscripción — Plan Actual' },
  { id: 'currentColor',   label: 'Texto (activo)',   section: '' },
  { id: 'lockedBg',       label: 'Fondo bloqueado',  section: 'Botones — Bloqueado / Ya Reclamado' },
  { id: 'lockedColor',    label: 'Texto bloqueado',  section: '' },
  { id: 'warningColor',   label: 'Color del texto',  section: 'Texto de Advertencia / Bloqueo' },
];

export default function UISettingsPanel({ colors: c, onChange, onSave, onReset }: Props) {
  const sections = COLOR_FIELDS.reduce<{ section: string; fields: typeof COLOR_FIELDS }[]>((acc, f) => {
    if (f.section) acc.push({ section: f.section, fields: [] });
    acc[acc.length - 1].fields.push(f);
    return acc;
  }, []);

  return (
    <>
      <div className="mb-5">
        <h2 className="text-xl font-extrabold text-[var(--text-primary)] mb-1">Apariencia del Panel de Usuario</h2>
        <p className="text-sm text-[var(--text-secondary)]">Personaliza los colores de los botones de suscripción</p>
      </div>

      <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-subtle)]">
        {sections.map(s => (
          <div key={s.section}>
            <h3 className="text-xs font-bold text-[var(--text-secondary)] mt-5 mb-1 uppercase tracking-widest">{s.section}</h3>
            {s.section === 'Texto de Advertencia / Bloqueo' && (
              <p className="text-xs text-[var(--text-secondary)] mb-3">Texto que aparece debajo del botón bloqueado (ej: "⚠ Este plan solo puede reclamarse una vez")</p>
            )}
            <div className="flex gap-5 flex-wrap mb-2">
              {s.fields.map(f => (
                <div key={f.id} className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">{f.label}</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={c[f.id] ?? '#ffffff'} onChange={e => onChange(f.id, e.target.value)}
                      className="w-10 h-10 border border-[var(--border-subtle)] rounded-xl cursor-pointer p-1 bg-transparent" />
                    <div className="w-8 h-8 rounded-lg border border-[var(--border-subtle)]" style={{ background: c[f.id] ?? '#ffffff' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Vista previa */}
        <div className="mt-6 pt-5 border-t border-[var(--border-subtle)]">
          <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-3">Vista previa</p>
          <div className="flex gap-2.5 flex-wrap">
            <button className="px-5 py-2.5 rounded-xl text-[13px] font-bold cursor-default" style={{ pointerEvents: 'none', background: c.subscribeBg, color: c.subscribeColor }}>Suscribirse</button>
            <button className="px-5 py-2.5 rounded-xl text-[13px] font-bold cursor-default" style={{ pointerEvents: 'none', background: c.currentBg, color: c.currentColor }}>Plan Actual</button>
            <button className="px-5 py-2.5 rounded-xl text-[13px] font-bold cursor-default" style={{ pointerEvents: 'none', background: c.lockedBg, color: c.lockedColor }}>Ya reclaman</button>
          </div>
          <p className="text-xs font-semibold mt-3 transition-colors" style={{ color: c.warningColor }}>⚠ Este plan solo puede ser reclamos una única vez.</p>
        </div>

        {/* Acciones */}
        <div className="mt-5 flex gap-3 pt-5 border-t border-[var(--border-subtle)]">
          <button
            className="px-6 py-2.5 bg-[var(--brand-teal)] text-white rounded-xl text-sm font-bold cursor-pointer transition-all hover:opacity-90 hover:-translate-y-0.5"
            onClick={onSave}>Guardar Colores</button>
          <button
            className="px-6 py-2.5 border border-[var(--border-subtle)] bg-transparent text-[var(--text-secondary)] rounded-xl text-sm font-semibold cursor-pointer transition-all hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]"
            onClick={onReset}>Restablecer</button>
        </div>
      </div>
    </>
  );
}
