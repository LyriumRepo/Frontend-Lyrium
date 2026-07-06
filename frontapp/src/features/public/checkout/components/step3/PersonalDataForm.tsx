'use client';

import { useCheckoutStore } from '@/store/checkoutStore';

const DOC_TYPES = [
  { value: 'DNI', label: 'DNI' },
  { value: 'CE', label: 'Carné de Extranjería' },
  { value: 'PAS', label: 'Pasaporte' },
];

const inputCls =
  'w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[var(--border-subtle)] ' +
  'bg-white dark:bg-[var(--bg-secondary)] text-gray-900 dark:text-[var(--text-primary)] text-sm ' +
  'focus:ring-2 focus:ring-[var(--brand-sky)]/30 focus:border-[var(--brand-sky)] dark:focus:ring-[var(--brand-green)]/30 dark:focus:border-[var(--brand-green)] outline-none transition';

const labelCls =
  'block text-xs font-medium text-gray-500 dark:text-[var(--text-secondary)] mb-1.5';

export default function PersonalDataForm() {
  const data = useCheckoutStore((s) => s.personalData);
  const setData = useCheckoutStore((s) => s.setPersonalData);

  return (
    <div
      className="rounded-2xl border border-gray-200 dark:border-[var(--border-default)]
      bg-white dark:bg-[var(--bg-card)] p-6 space-y-5 shadow-sm"
    >
      <h2 className="font-bold text-gray-900 dark:text-[var(--text-primary)] flex items-center gap-2">
        <span
          className="w-7 h-7 rounded-full bg-[var(--brand-sky)] dark:bg-[var(--brand-green)] text-white text-xs
          font-black flex items-center justify-center"
        >
          1
        </span>
        Datos personales
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tipo de documento */}
        <div className="sm:col-span-2">
          <label className={labelCls}>
            Tipo de documento <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {DOC_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() =>
                  setData({ docType: t.value as 'DNI' | 'CE' | 'PAS' })
                }
                className={`px-3 py-2 sm:px-4 rounded-xl text-sm font-medium border transition
                  ${
                    data.docType === t.value
                      ? 'bg-[var(--brand-sky)] dark:bg-[var(--brand-green)] text-white border-[var(--brand-sky)] dark:border-[var(--brand-green)]'
                      : 'bg-white dark:bg-[var(--bg-secondary)] text-gray-600 dark:text-[var(--text-secondary)] border-gray-200 dark:border-[var(--border-subtle)] hover:border-[var(--brand-sky)] dark:hover:border-[var(--brand-green)]'
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Número de documento */}
        <div>
          <label className={labelCls}>
            Número de documento <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.docNumber}
            onChange={(e) => setData({ docNumber: e.target.value })}
            maxLength={data.docType === 'DNI' ? 8 : 12}
            placeholder={data.docType === 'DNI' ? '12345678' : '000123456'}
            className={inputCls}
          />
        </div>

        {/* Nombres */}
        <div>
          <label className={labelCls}>
            Nombres <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => setData({ name: e.target.value })}
            placeholder="Carlos Alberto"
            className={inputCls}
          />
        </div>

        {/* Apellido paterno */}
        <div>
          <label className={labelCls}>
            Apellido paterno <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.apellidoPaterno}
            onChange={(e) => setData({ apellidoPaterno: e.target.value })}
            placeholder="García"
            className={inputCls}
          />
        </div>

        {/* Apellido materno */}
        <div>
          <label className={labelCls}>
            Apellido materno
          </label>
          <input
            type="text"
            value={data.apellidoMaterno}
            onChange={(e) => setData({ apellidoMaterno: e.target.value })}
            placeholder="López"
            className={inputCls}
          />
        </div>

        {/* Celular */}
        <div>
          <label className={labelCls}>
            Celular <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <span
              className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-[var(--border-subtle)]
              bg-gray-50 dark:bg-[var(--bg-muted)] text-gray-500 dark:text-[var(--text-secondary)] text-sm select-none"
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
              className={inputCls}
            />
          </div>
        </div>

        {/* Teléfono fijo */}
        <div>
          <label className={labelCls}>
            Teléfono fijo
          </label>
          <div className="flex gap-2">
            <span
              className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-[var(--border-subtle)]
              bg-gray-50 dark:bg-[var(--bg-muted)] text-gray-500 dark:text-[var(--text-secondary)] text-sm select-none"
            >
              01
            </span>
            <input
              type="tel"
              value={data.telefonofijo}
              onChange={(e) =>
                setData({ telefonofijo: e.target.value.replace(/\D/g, '') })
              }
              maxLength={7}
              placeholder="1234567"
              className={inputCls}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className={labelCls}>
            Correo electrónico <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => setData({ email: e.target.value })}
            placeholder="correo@ejemplo.com"
            className={inputCls}
          />
          <p className="text-[11px] text-gray-400 mt-1">
            Recibirás la confirmación de tu pedido en este correo.
          </p>
        </div>

      </div>
    </div>
  );
}
