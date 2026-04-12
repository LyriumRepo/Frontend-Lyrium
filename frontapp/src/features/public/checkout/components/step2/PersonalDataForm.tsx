'use client';

import { useCheckoutStore } from '@/store/checkoutStore';
import type { DocType } from '@/store/checkoutStore';

const DOC_OPTIONS: { value: DocType; label: string }[] = [
    { value: 'DNI', label: 'DNI' },
    { value: 'CE', label: 'CE' },
    { value: 'PAS', label: 'PAS' },
];

const PHONE_PREFIXES = ['+51', '+58', '+57', '+54', '+56', '+591', '+55', '+1', '+34'];

const PAISES = ['Perú', 'Venezuela', 'Colombia', 'Argentina', 'Chile', 'Ecuador', 'Bolivia', 'Brasil', 'EE.UU.', 'España', 'Otro'];
const CE_CALIDAD = ['TRABAJADOR', 'RESIDENTE', 'FAMILIAR', 'ESTUDIANTE', 'ESPECIAL'];

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-600 dark:text-[var(--text-secondary)] uppercase tracking-wide">{label}</label>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-tighter ${required ? 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20' : 'text-gray-400 dark:text-[var(--text-muted)] bg-gray-100 dark:bg-[var(--bg-muted)]'}`}>
                    {required ? 'Requerido *' : 'Opcional'}
                </span>
            </div>
            {children}
        </div>
    );
}

const inputCls = "w-full px-4 py-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-muted)] focus:bg-white dark:focus:bg-[var(--bg-card)] focus:border-sky-400 dark:focus:border-[var(--brand-sky)] focus:outline-none focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-900/20 transition-all text-gray-800 dark:text-[var(--text-primary)]";

export default function PersonalDataForm() {
    const data = useCheckoutStore((s) => s.personalData);
    const setPersonalData = useCheckoutStore((s) => s.setPersonalData);

    const isCE = data.docType === 'CE';
    const isPAS = data.docType === 'PAS';

    return (
        <div className="bg-white dark:bg-[var(--bg-card)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-2xl shadow-sm">
            <div className="px-5 py-4 bg-gradient-to-r from-sky-500 to-sky-400 flex items-center gap-2 rounded-t-2xl">
                <span className="text-white text-2xl">👤</span>
                <h3 className="font-bold text-white">Datos Personales</h3>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Document type + number */}
                <div className="md:col-span-2">
                    <Field label="Documento de Identidad" required={isCE || isPAS}>
                        <div className="flex gap-2">
                            <select
                                value={data.docType}
                                onChange={(e) => setPersonalData({ docType: e.target.value as DocType })}
                                className="w-28 px-3 py-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-muted)] focus:bg-white dark:focus:bg-[var(--bg-card)] focus:border-sky-400 dark:focus:border-[var(--brand-sky)] focus:outline-none transition-all font-bold text-gray-700 dark:text-[var(--text-primary)]"
                            >
                                {DOC_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                            <input
                                type="text"
                                placeholder={data.docType === 'DNI' ? '8 dígitos' : 'Número de documento'}
                                value={data.docNumber}
                                onChange={(e) => setPersonalData({ docNumber: e.target.value })}
                                className={`flex-1 ${inputCls}`}
                            />
                        </div>
                    </Field>
                </div>

                {/* CE extra fields */}
                {isCE && (
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-sky-50/50 dark:bg-sky-900/10 rounded-2xl border-2 border-dashed border-sky-100 dark:border-sky-800/30">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wide">Nacionalidad</label>
                            <select value={data.ceNacionalidad} onChange={(e) => setPersonalData({ ceNacionalidad: e.target.value })} className={inputCls}>
                                <option value="">Selecciona país</option>
                                {PAISES.map((p) => <option key={p}>{p}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wide">Vencimiento CE</label>
                            <input type="date" value={data.ceVencimiento} onChange={(e) => setPersonalData({ ceVencimiento: e.target.value })} className={inputCls} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wide">Calidad Migratoria</label>
                            <select value={data.ceCalidad} onChange={(e) => setPersonalData({ ceCalidad: e.target.value })} className={inputCls}>
                                {CE_CALIDAD.map((c) => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                )}

                {/* Names */}
                <Field label="Nombres" required>
                    <input type="text" placeholder="Ej: Juan Andrés" value={data.name} onChange={(e) => setPersonalData({ name: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Apellido Paterno" required>
                    <input type="text" placeholder="Ej: Pérez" value={data.apellidoPaterno} onChange={(e) => setPersonalData({ apellidoPaterno: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Apellido Materno" required>
                    <input type="text" placeholder="Ej: García" value={data.apellidoMaterno} onChange={(e) => setPersonalData({ apellidoMaterno: e.target.value })} className={inputCls} />
                </Field>

                {/* Phone */}
                <Field label="Celular Principal" required>
                    <div className="flex gap-2">
                        {isPAS && (
                            <select value={data.celularPrefix} onChange={(e) => setPersonalData({ celularPrefix: e.target.value })} className="w-24 px-3 py-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-muted)] focus:border-sky-400 dark:focus:border-[var(--brand-sky)] focus:outline-none transition-all text-center font-bold text-sky-600 dark:text-[var(--brand-sky)]">
                                {PHONE_PREFIXES.map((p) => <option key={p}>{p}</option>)}
                            </select>
                        )}
                        <input type="text" placeholder="985 624 789" value={data.celular} onChange={(e) => setPersonalData({ celular: e.target.value })} className={`flex-1 ${inputCls}`} />
                    </div>
                </Field>
                <Field label="Celular Secundario">
                    <input type="text" placeholder="Opcional: 985 000 000" value={data.celular2} onChange={(e) => setPersonalData({ celular2: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Teléfono Fijo">
                    <input type="text" placeholder="Opcional: 014 000 000" value={data.telefonofijo} onChange={(e) => setPersonalData({ telefonofijo: e.target.value })} className={inputCls} />
                </Field>

                {/* Email */}
                <Field label="Correo Principal" required>
                    <input type="email" placeholder="Ej: juan@ejemplo.com" value={data.email} onChange={(e) => setPersonalData({ email: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Correo Secundario">
                    <input type="email" placeholder="Opcional: secundario@ejemplo.com" value={data.email2} onChange={(e) => setPersonalData({ email2: e.target.value })} className={inputCls} />
                </Field>
            </div>
        </div>
    );
}
