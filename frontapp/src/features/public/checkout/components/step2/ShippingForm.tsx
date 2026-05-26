'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapPin, Home, Plus } from 'lucide-react';
import { useCheckoutStore } from '@/store/checkoutStore';
import { addressApi } from '@/shared/lib/api/addressRepository';
import { DEPARTAMENTOS, PROVINCIAS, DISTRITOS } from '@/shared/lib/data/ubigeo';

type SavedAddress = {
  id: number;
  etiqueta: string;
  destinatario: string;
  departamento: string;
  provincia: string;
  distrito: string;
  avenida: string;
  numero: string;
  piso_lote: string | null;
  referencia: string | null;
};

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

    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [useNewAddress, setUseNewAddress] = useState(false);

    const isPAS = docType === 'PAS';

    const provincias = data.departamento ? PROVINCIAS[data.departamento] ?? [] : [];
    const distritos = data.provincia ? DISTRITOS[data.provincia] ?? [] : [];

    useEffect(() => {
        addressApi.list()
            .then((addrs) => setSavedAddresses(addrs as unknown as SavedAddress[]))
            .catch(() => {})
            .finally(() => setLoadingAddresses(false));
    }, []);

    const fillFromSaved = useCallback((addr: SavedAddress) => {
        setSelectedAddressId(addr.id);
        setUseNewAddress(false);
        setShippingData({
            departamento: addr.departamento,
            provincia: addr.provincia,
            distrito: addr.distrito,
            urbanizacion: '',
            avenida: addr.avenida,
            numero: addr.numero,
            pisoLote: addr.piso_lote ?? '',
            referencia: addr.referencia ?? '',
            pais: 'Perú',
            ciudadPas: '', zipCode: '', hotelName: '', direccionPas: '',
            saveAddress: false,
        });
    }, [setShippingData]);

    const useNewAddressForm = useCallback(() => {
        setSelectedAddressId(null);
        setUseNewAddress(true);
        setShippingData({
            departamento: '', provincia: '', distrito: '',
            urbanizacion: '', avenida: '', numero: '', pisoLote: '', referencia: '',
            pais: 'Perú',
            ciudadPas: '', zipCode: '', hotelName: '', direccionPas: '',
            saveAddress: false,
        });
    }, [setShippingData]);

    const showSavedPicker = !useNewAddress && savedAddresses.length > 0 && !isPAS;
    const showForm = isPAS || useNewAddress || savedAddresses.length === 0;

    return (
        <div className="bg-white dark:bg-[var(--bg-card)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-2xl shadow-sm">
            <div className="px-5 py-4 bg-gradient-to-r from-sky-500 to-sky-400 flex items-center gap-2 rounded-t-2xl">
                <MapPin className="w-6 h-6 text-white" />
                <h3 className="font-bold text-white">Datos de Envío</h3>
            </div>

            <div className="p-5 space-y-5">
                {/* Saved addresses picker */}
                {!isPAS && (
                    <div>
                        {loadingAddresses ? (
                            <div className="flex items-center gap-2 text-xs text-gray-400 animate-pulse">
                                <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
                                Cargando direcciones guardadas...
                            </div>
                        ) : savedAddresses.length > 0 && !useNewAddress ? (
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                    Tus direcciones guardadas
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {savedAddresses.map((addr) => (
                                        <button
                                            key={addr.id}
                                            type="button"
                                            onClick={() => fillFromSaved(addr)}
                                            className={`text-left p-3 rounded-xl border-2 transition-all ${
                                                selectedAddressId === addr.id
                                                    ? 'border-sky-500 bg-sky-50 dark:border-[var(--icons-green)] dark:bg-[#1A3A32]'
                                                    : 'border-gray-200 dark:border-[var(--border-subtle)] hover:border-sky-300 dark:hover:border-[var(--brand-green)]'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <Home className="w-3.5 h-3.5 text-sky-500 dark:text-[var(--icons-green)]" />
                                                <span className="text-xs font-bold text-gray-800 dark:text-[var(--text-primary)] uppercase">
                                                    {addr.etiqueta}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-gray-500 dark:text-[var(--text-muted)] leading-relaxed">
                                                {addr.avenida} {addr.numero}, {addr.distrito}, {addr.provincia}, {addr.departamento}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={useNewAddressForm}
                                        className="text-[11px] font-bold text-sky-600 dark:text-[var(--icons-green)] hover:underline flex items-center gap-1"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Usar otra dirección
                                    </button>
                                </div>
                            </div>
                        ) : savedAddresses.length > 0 && useNewAddress ? (
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    Nueva dirección
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setUseNewAddress(false);
                                        setSelectedAddressId(null);
                                        setShippingData({
                                            departamento: '', provincia: '', distrito: '',
                                            urbanizacion: '', avenida: '', numero: '', pisoLote: '', referencia: '',
                                            pais: 'Perú',
                                            ciudadPas: '', zipCode: '', hotelName: '', direccionPas: '',
                                            saveAddress: false,
                                        });
                                    }}
                                    className="text-[11px] font-bold text-sky-600 dark:text-[var(--icons-green)] hover:underline"
                                >
                                    Volver a mis direcciones
                                </button>
                            </div>
                        ) : null}
                    </div>
                )}

                {showForm && (
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
                                    <select
                                        value={data.departamento}
                                        onChange={(e) => setShippingData({ departamento: e.target.value, provincia: '', distrito: '' })}
                                        className={inputCls}
                                    >
                                        <option value="">Seleccionar departamento</option>
                                        {DEPARTAMENTOS.map((d) => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </Field>
                                <Field label="Provincia" required>
                                    <select
                                        value={data.provincia}
                                        onChange={(e) => setShippingData({ provincia: e.target.value, distrito: '' })}
                                        disabled={!data.departamento}
                                        className={`${inputCls} disabled:opacity-50`}
                                    >
                                        <option value="">Seleccionar provincia</option>
                                        {provincias.map((p) => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </Field>
                                <Field label="Distrito" required>
                                    <select
                                        value={data.distrito}
                                        onChange={(e) => setShippingData({ distrito: e.target.value })}
                                        disabled={!data.provincia}
                                        className={`${inputCls} disabled:opacity-50`}
                                    >
                                        <option value="">Seleccionar distrito</option>
                                        {distritos.map((d) => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </Field>
                                <Field label="Urbanización / Barrio">
                                    <input type="text" placeholder="Ej: Urb. Los Olivos" value={data.urbanizacion} onChange={(e) => setShippingData({ urbanizacion: e.target.value })} className={inputCls} />
                                </Field>
                                <Field label="Av. / Calle / Jirón" required>
                                    <input type="text" placeholder="Ej: Av. El Sol" value={data.avenida} onChange={(e) => setShippingData({ avenida: e.target.value })} className={inputCls} />
                                </Field>
                                <Field label="Número / Mz. y Lote" required>
                                    <input type="text" placeholder="Ej: 450 o Mz A Lt 5" value={data.numero} onChange={(e) => setShippingData({ numero: e.target.value })} className={inputCls} />
                                </Field>
                                <Field label="Piso / Dpto / Interior">
                                    <input type="text" placeholder="Ej: Piso 2 - Dpto 201" value={data.pisoLote} onChange={(e) => setShippingData({ pisoLote: e.target.value })} className={inputCls} />
                                </Field>
                                <Field label="Referencia">
                                    <textarea rows={1} placeholder="Ej: Frente al parque central, casa azul..." value={data.referencia} onChange={(e) => setShippingData({ referencia: e.target.value })} className={`${inputCls} resize-none`} />
                                </Field>
                            </>
                        )}
                    </div>
                )}

                {/* Save address toggle (solo para direcciones nuevas nacionales) */}
                {!isPAS && showForm && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
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
                )}
            </div>
        </div>
    );
}
