'use client';
import type { ButtonColors } from '@/features/seller/plans/types';

interface Props {
  colors: ButtonColors;
  onChange: (key: keyof ButtonColors, value: string) => void;
  onSave: () => void;
  onReset: () => void;
}

const COLOR_FIELDS: { id: keyof ButtonColors; label: string; section: string }[] = [
  { id:'subscribeBg',    label:'Fondo botón',     section:'Botones de Suscripción — Normal' },
  { id:'subscribeColor', label:'Texto botón',      section:'' },
  { id:'currentBg',      label:'Fondo (activo)',   section:'Botones de Suscripción — Plan Actual' },
  { id:'currentColor',   label:'Texto (activo)',   section:'' },
  { id:'lockedBg',       label:'Fondo bloqueado',  section:'Botones — Bloqueado / Ya Reclamado' },
  { id:'lockedColor',    label:'Texto bloqueado',  section:'' },
  { id:'warningColor',   label:'Color del texto',  section:'Texto de Advertencia / Bloqueo' },
];

export default function UISettingsPanel({ colors: c, onChange, onSave, onReset }: Props) {
  const sections = COLOR_FIELDS.reduce<{ section: string; fields: typeof COLOR_FIELDS }[]>((acc, f) => {
    if (f.section) acc.push({ section: f.section, fields: [] });
    acc[acc.length - 1].fields.push(f);
    return acc;
  }, []);

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Apariencia del Panel de Usuario</h2>
        <p className="text-sm text-gray-400">Personaliza los colores de los botones de suscripción</p>
      </div>
      <div className="bg-white rounded-2xl p-7 border border-gray-200">
        {sections.map(s => (
          <div key={s.section}>
            <h3 className="text-sm font-bold text-gray-800 mt-5 mb-4 uppercase tracking-wide">{s.section}</h3>
            {s.section === 'Texto de Advertencia / Bloqueo' && (
              <p className="text-xs text-gray-400 mb-3">Es el texto que aparece debajo del botón bloqueado (ej: "⚠ Este plan solo puede reclamarse una vez")</p>
            )}
            <div className="flex gap-5 flex-wrap mb-4">
              {s.fields.map(f => (
                <div key={f.id} className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{f.label}</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={c[f.id] ?? '#ffffff'} onChange={e => onChange(f.id, e.target.value)}
                      className="w-11 h-11 border-2 border-gray-200 rounded-lg cursor-pointer p-1" />
                    <div className="w-8 h-8 rounded-lg" style={{ background: c[f.id] ?? '#ffffff', border: f.id === 'subscribeColor' ? '1px solid #e5e7eb' : undefined }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-5 pt-5 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-400 mb-3">Vista previa de botones:</p>
          <div className="flex gap-2.5 flex-wrap mt-2">
            <button className="px-5 py-2.5 rounded-lg text-[13px] font-bold cursor-default" style={{ pointerEvents:'none', background:c.subscribeBg, color:c.subscribeColor }}>Suscribirse</button>
            <button className="px-5 py-2.5 rounded-lg text-[13px] font-bold cursor-default" style={{ pointerEvents:'none', background:c.currentBg, color:c.currentColor }}>Plan Actual</button>
            <button className="px-5 py-2.5 rounded-lg text-[13px] font-bold cursor-default" style={{ pointerEvents:'none', background:c.lockedBg, color:c.lockedColor }}>Ya reclaman</button>
          </div>
          <p className="text-xs font-semibold mt-2.5 transition-colors duration-300" style={{ color:c.warningColor }}>⚠ Este plan solo puede ser reclamos una única vez.</p>
        </div>

        <div className="mt-5 flex gap-3">
          <button className="px-6 py-3 border-none bg-blue-500 text-white rounded-xl text-sm font-bold cursor-pointer transition-all duration-300 hover:bg-blue-600 hover:-translate-y-0.5"
            onClick={onSave}>Guardar Colores</button>
          <button className="px-6 py-3 border-2 border-gray-200 bg-transparent text-gray-400 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 hover:border-gray-800 hover:text-gray-800"
            onClick={onReset}>Restablecer</button>
        </div>
      </div>
    </>
  );
}
