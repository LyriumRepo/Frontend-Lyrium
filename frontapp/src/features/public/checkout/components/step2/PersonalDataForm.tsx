/**
 * PersonalDataForm.tsx
 * ARCHIVO: src/features/public/checkout/components/step2/PersonalDataForm.tsx
 */

'use client';

import { useCheckoutStore } from '@/store/checkoutStore';

const DOC_TYPES = [
  { value: 'DNI', label: 'DNI' },
  { value: 'CE', label: 'Carné de Extranjería' },
  { value: 'PAS', label: 'Pasaporte' },
];

export default function PersonalDataForm() {
  const data = useCheckoutStore((s) => s.personalData);
  const setData = useCheckoutStore((s) => s.setPersonalData);

  return (
    <div
      className="rounded-2xl border border-gray-100 dark:border-gray-800
      bg-white dark:bg-gray-900/40 p-6 space-y-5"
    >
      <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <span
          className="w-7 h-7 rounded-full bg-sky-500 text-white text-xs
          font-black flex items-center justify-center"
        >
          1
        </span>
        Datos personales
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tipo de documento */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Tipo de documento <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            {DOC_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() =>
                  setData({ docType: t.value as 'DNI' | 'CE' | 'PAS' })
                }
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition
                  ${
                    data.docType === t.value
                      ? 'bg-sky-500 text-white border-sky-500'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-sky-300'
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Número de documento */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Número de documento <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.docNumber}
            onChange={(e) => setData({ docNumber: e.target.value })}
            maxLength={data.docType === 'DNI' ? 8 : 12}
            placeholder={data.docType === 'DNI' ? '12345678' : '000123456'}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm
              focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Nombres */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Nombres <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => setData({ name: e.target.value })}
            placeholder="Carlos Alberto"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm
              focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Apellido paterno */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Apellido paterno <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.apellidoPaterno}
            onChange={(e) => setData({ apellidoPaterno: e.target.value })}
            placeholder="García"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm
              focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Apellido materno */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Apellido materno
          </label>
          <input
            type="text"
            value={data.apellidoMaterno}
            onChange={(e) => setData({ apellidoMaterno: e.target.value })}
            placeholder="López"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm
              focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Celular */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Celular <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <span
              className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
              bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm select-none"
            >
              +51
            </span>
            <input
              type="tel"
              value={data.celular}
              onChange={(e) =>
                setData({ celular: e.target.value.replace(/\D/g, '') })
              }
              maxLength={9}
              placeholder="987654321"
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm
                focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        {/* Email */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Correo electrónico <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => setData({ email: e.target.value })}
            placeholder="correo@ejemplo.com"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm
              focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
          />
          <p className="text-[11px] text-gray-400 mt-1">
            Recibirás la confirmación de tu pedido en este correo.
          </p>
        </div>
      </div>
    </div>
  );
}
