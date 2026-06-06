/**
 * ShippingForm.tsx
 * ARCHIVO: src/features/public/checkout/components/step2/ShippingForm.tsx
 */

'use client';

import { useCheckoutStore } from '@/store/checkoutStore';
import {
  getDepartamentos,
  getProvincias,
  getDistritos,
} from '../../lib/ubigeo';
import CustomSelect from '../ui/CustomSelect';

const inputCls =
  'w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[var(--border-subtle)] ' +
  'bg-white dark:bg-[var(--bg-secondary)] text-gray-900 dark:text-[var(--text-primary)] text-sm ' +
  'focus:ring-2 focus:ring-[var(--brand-sky)]/30 focus:border-[var(--brand-sky)] outline-none transition';



const labelCls =
  'block text-xs font-medium text-gray-500 dark:text-[var(--text-secondary)] mb-1.5';

export default function ShippingForm() {
  const data = useCheckoutStore((s) => s.shippingData);
  const setData = useCheckoutStore((s) => s.setShippingData);

  const departamentos = getDepartamentos();
  const provincias = getProvincias(data.departamento);
  const distritos = getDistritos(data.departamento, data.provincia);

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

        {/* Guardar dirección */}
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
      </div>
    </div>
  );
}
