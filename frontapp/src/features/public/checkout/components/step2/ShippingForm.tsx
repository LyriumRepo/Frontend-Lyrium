'use client';

import { MapPin } from 'lucide-react';
import { useCheckoutStore } from '@/store/checkoutStore';

const DEPARTAMENTOS = ['Lima', 'Arequipa', 'La Libertad', 'Piura', 'Cusco', 'Junín', 'Puno', 'Callao', 'Lambayeque', 'Áncash'];
const inputCls = "w-full px-4 py-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl text-sm bg-gray-50 dark:bg-[var(--bg-muted)] focus:bg-white dark:focus:bg-[var(--bg-card)] focus:border-sky-400 dark:focus:border-[var(--brand-sky)] focus:outline-none focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-900/20 transition-all text-gray-800 dark:text-[var(--text-primary)]";

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

export default function ShippingForm() {
    const data = useCheckoutStore((s) => s.shippingData);
    const setShippingData = useCheckoutStore((s) => s.setShippingData);
    const docType = useCheckoutStore((s) => s.personalData.docType);

    const isPAS = docType === 'PAS';

    return (
        <div className="bg-white dark:bg-[var(--bg-card)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-2xl shadow-sm">
            <div className="px-5 py-4 bg-gradient-to-r from-sky-500 to-sky-400 flex items-center gap-2 rounded-t-2xl">
                <MapPin className="w-6 h-6 text-white" />
                <h3 className="font-bold text-white">Datos de Envío</h3>
            </div>

            <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* País */}
                    <Field label="País">
                        <input type="text" value="Perú" readOnly className="w-full px-4 py-3 border-2 border-gray-100 dark:border-[var(--border-subtle)] rounded-xl text-sm bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-500 dark:text-[var(--text-muted)] cursor-not-allowed" />
                    </Field>

                    {/* PAS: ciudad libre */}
                    {isPAS ? (
                        <>
                            <Field label="Ciudad / Distrito" required>
                                <input type="text" placeholder="Ej: Miraflores, Lima / Miami" value={data.ciudadPas} onChange={(e) => setShippingData({ ciudadPas: e.target.value })} className={inputCls} />
                            </Field>
                            <Field label="Código Postal / Zip Code">
                                <input type="text" placeholder="Ej: 15001" value={data.zipCode} onChange={(e) => setShippingData({ zipCode: e.target.value })} className={inputCls} />
                            </Field>
                            <Field label="Nombre del Hotel / Alojamiento">
                                <input type="text" placeholder="Ej: Hotel Westin, Hilton..." value={data.hotelName} onChange={(e) => setShippingData({ hotelName: e.target.value })} className={inputCls} />
                            </Field>
                            <div className="md:col-span-2">
                                <Field label="Dirección Completa / Street Address" required>
                                    <div className="relative group">
                                        <input type="text" placeholder="Ej: Calle Las Flores 123, Habitación 402" value={data.direccionPas} onChange={(e) => setShippingData({ direccionPas: e.target.value })} className={`${inputCls} pr-12`} />
                                        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors shadow-sm" title="Ubicar en mapa">
                                            <MapPin className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="mt-1 text-[10px] text-gray-400 dark:text-[var(--text-muted)] italic pl-1">¿No conoces la dirección? Usa el mapa para ubicarnos.</p>
                                </Field>
                            </div>
                        </>
                    ) : (
                        <>
                            <Field label="Departamento" required>
                                <select value={data.departamento} onChange={(e) => setShippingData({ departamento: e.target.value, provincia: '', distrito: '' })} className={inputCls}>
                                    <option value="">Seleccionar departamento</option>
                                    {DEPARTAMENTOS.map((d) => <option key={d}>{d}</option>)}
                                </select>
                            </Field>
                            <Field label="Provincia" required>
                                <select value={data.provincia} onChange={(e) => setShippingData({ provincia: e.target.value, distrito: '' })} disabled={!data.departamento} className={`${inputCls} disabled:opacity-50`}>
                                    <option value="">Seleccionar provincia</option>
                                    {/* Provinces would be loaded dynamically from API */}
                                </select>
                            </Field>
                            <Field label="Distrito" required>
                                <select value={data.distrito} onChange={(e) => setShippingData({ distrito: e.target.value })} disabled={!data.provincia} className={`${inputCls} disabled:opacity-50`}>
                                    <option value="">Seleccionar distrito</option>
                                </select>
                            </Field>
                            <Field label="Urbanización / Barrio">
                                <input type="text" placeholder="Ej: Urb. Los Olivos" value={data.urbanizacion} onChange={(e) => setShippingData({ urbanizacion: e.target.value })} className={inputCls} />
                            </Field>
                            <Field label="Av. / Calle / Jirón">
                                <input type="text" placeholder="Ej: Av. El Sol" value={data.avenida} onChange={(e) => setShippingData({ avenida: e.target.value })} className={inputCls} />
                            </Field>
                            <Field label="Número / Mz. y Lote">
                                <input type="text" placeholder="Ej: 450 o Mz A Lt 5" value={data.numero} onChange={(e) => setShippingData({ numero: e.target.value })} className={inputCls} />
                            </Field>
                            <Field label="Piso / Dpto / Interior">
                                <input type="text" placeholder="Ej: Piso 2 - Dpto 201" value={data.pisoLote} onChange={(e) => setShippingData({ pisoLote: e.target.value })} className={inputCls} />
                            </Field>
                            <Field label="Referencia" required>
                                <textarea rows={1} placeholder="Ej: Frente al parque central, casa azul..." value={data.referencia} onChange={(e) => setShippingData({ referencia: e.target.value })} className={`${inputCls} resize-none`} />
                            </Field>
                        </>
                    )}
                </div>

                {/* Save address toggle */}
                <div className="mt-5 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                    <label className="flex items-center gap-3 cursor-pointer group select-none">
                        <div className="relative inline-flex items-center">
                            <input type="checkbox" checked={data.saveAddress} onChange={(e) => setShippingData({ saveAddress: e.target.checked })} className="sr-only peer" />
                            <div className="w-10 h-6 bg-gray-200 dark:bg-[var(--bg-muted)] rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full transition-all" />
                        </div>
                        <span className="text-xs font-bold text-emerald-800/70 dark:text-emerald-400/80 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                            💾 Guardar esta dirección en mi perfil
                        </span>
                    </label>
                </div>
            </div>
        </div>
    );
}
