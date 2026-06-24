/**
 * ShippingForm.tsx
 * ARCHIVO: src/features/public/checkout/components/step2/ShippingForm.tsx
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCheckoutStore } from '@/store/checkoutStore';
import {
  getDepartamentos,
  getProvincias,
  getDistritos,
} from '../../lib/ubigeo';
import CustomSelect from '../ui/CustomSelect';
import { addressApi, type Address } from '@/shared/lib/api/addressRepository';
import { useAuth } from '@/shared/lib/context/AuthContext';

const inputCls =
  'w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[var(--border-subtle)] ' +
  'bg-white dark:bg-[var(--bg-secondary)] text-gray-900 dark:text-[var(--text-primary)] text-sm ' +
  'focus:ring-2 focus:ring-[var(--brand-sky)]/30 focus:border-[var(--brand-sky)] outline-none transition';

const labelCls =
  'block text-xs font-medium text-gray-500 dark:text-[var(--text-secondary)] mb-1.5';

export default function ShippingForm() {
  const data = useCheckoutStore((s) => s.shippingData);
  const setData = useCheckoutStore((s) => s.setShippingData);
  const { isAuthenticated } = useAuth();

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  const departamentos = getDepartamentos();
  const provincias = getProvincias(data.departamento);
  const distritos = getDistritos(data.departamento, data.provincia);

  // carga direcciones guardadas del dashboard
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoadingAddresses(true);
        const list = await addressApi.list();
        if (!cancelled) {
          setSavedAddresses(list);
          // auto-seleccionar la dirección predeterminada si existe
          const defaultAddr = list.find((a) => a.is_default);
          if (defaultAddr) {
            setData({
              pais: defaultAddr.pais,
              departamento: defaultAddr.departamento,
              provincia: defaultAddr.provincia,
              distrito: defaultAddr.distrito,
              urbanizacion: '',
              avenida: defaultAddr.avenida,
              numero: defaultAddr.numero,
              pisoLote: defaultAddr.piso_lote ?? '',
              referencia: defaultAddr.referencia ?? '',
              ciudadPas: '',
              zipCode: '',
              hotelName: '',
              direccionPas: '',
              saveAddress: false,
            });
            setSelectedAddressId(defaultAddr.id);
          }
        }
      } catch {
        // not authenticated — ignore
      } finally {
        if (!cancelled) setLoadingAddresses(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSelectSaved(address: Address) {
    setData({
      pais: address.pais,
      departamento: address.departamento,
      provincia: address.provincia,
      distrito: address.distrito,
      urbanizacion: '',
      avenida: address.avenida,
      numero: address.numero,
      pisoLote: address.piso_lote ?? '',
      referencia: address.referencia ?? '',
      ciudadPas: '',
      zipCode: '',
      hotelName: '',
      direccionPas: '',
      saveAddress: false,
    });
  }

  function handleDepartamento(value: string) {
    setData({ departamento: value, provincia: '', distrito: '' });
  }

  function handleProvincia(value: string) {
    setData({ provincia: value, distrito: '' });
  }

  return (
    <div
      className="rounded-2xl border border-gray-200 dark:border-[var(--border-default)]
      bg-white dark:bg-[var(--bg-card)] p-6 space-y-5 shadow-sm"
    >
      <h2 className="font-bold text-gray-900 dark:text-[var(--text-primary)] flex items-center gap-2">
        <span
          className="w-7 h-7 rounded-full bg-[var(--brand-sky)] text-white text-xs
          font-black flex items-center justify-center"
        >
          2
        </span>
        Dirección de envío
      </h2>

      {/* Saved addresses selector */}
      {!loadingAddresses && savedAddresses.length > 0 && (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Usar una dirección guardada
          </label>
          <select
            value={selectedAddressId ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              if (!val) {
                setSelectedAddressId(null);
                return;
              }
              const addr = savedAddresses.find((a) => a.id === Number(val));
              if (addr) {
                handleSelectSaved(addr);
                setSelectedAddressId(addr.id);
              }
            }}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm
              focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
          >
            <option value="">Seleccionar dirección...</option>
            {savedAddresses.map((a) => (
              <option key={a.id} value={a.id}>
                {a.etiqueta === 'casa' ? '🏠' : a.etiqueta === 'trabajo' ? '💼' : '📍'} {a.avenida} {a.numero} — {a.distrito}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Departamento */}
        <div>
          <label className={labelCls}>
            Departamento <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            value={data.departamento}
            onChange={handleDepartamento}
            options={departamentos}
            placeholder="Seleccionar..."
          />
        </div>

        {/* Provincia */}
        <div>
          <label className={labelCls}>
            Provincia <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            value={data.provincia}
            onChange={handleProvincia}
            options={provincias}
            placeholder="Seleccionar..."
            disabled={!data.departamento}
          />
        </div>

        {/* Distrito */}
        <div>
          <label className={labelCls}>
            Distrito <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            value={data.distrito}
            onChange={(v) => setData({ distrito: v })}
            options={distritos}
            placeholder="Seleccionar..."
            disabled={!data.provincia}
          />
        </div>

        {/* Urbanización */}
        <div>
          <label className={labelCls}>
            Urbanización / Zona
          </label>
          <input
            type="text"
            value={data.urbanizacion}
            onChange={(e) => setData({ urbanizacion: e.target.value })}
            placeholder="Urb. Los Pinos"
            className={inputCls}
          />
        </div>

        {/* Avenida / Calle */}
        <div className="sm:col-span-2">
          <label className={labelCls}>
            Avenida / Calle / Jirón <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.avenida}
            onChange={(e) => setData({ avenida: e.target.value })}
            placeholder="Av. Larco"
            className={inputCls}
          />
        </div>

        {/* Número */}
        <div>
          <label className={labelCls}>
            Número
          </label>
          <input
            type="text"
            value={data.numero}
            onChange={(e) => setData({ numero: e.target.value })}
            placeholder="456"
            className={inputCls}
          />
        </div>

        {/* Piso / Dpto / Lote */}
        <div>
          <label className={labelCls}>
            Piso / Dpto / Lote
          </label>
          <input
            type="text"
            value={data.pisoLote}
            onChange={(e) => setData({ pisoLote: e.target.value })}
            placeholder="Piso 3, Dpto 301"
            className={inputCls}
          />
        </div>

        {/* Referencia */}
        <div className="sm:col-span-2">
          <label className={labelCls}>
            Referencia
          </label>
          <input
            type="text"
            value={data.referencia}
            onChange={(e) => setData({ referencia: e.target.value })}
            placeholder="Frente al parque, casa color azul..."
            className={inputCls}
          />
        </div>

        {/* Guardar dirección — solo para usuarios autenticados */}
        {isAuthenticated && (
          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={data.saveAddress}
                onChange={(e) => setData({ saveAddress: e.target.checked })}
                className="w-4 h-4 rounded accent-[var(--brand-sky)]"
              />
              <span className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                Guardar esta dirección para futuras compras
              </span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
