'use client';

/**
 * BillingInfo.tsx
 * ARCHIVO: src/features/public/checkout/components/step2/BillingInfo.tsx
 *
 * CORRECCIONES:
 *  - Bug: <div class="kr-smart-form" /> no tenía el atributo kr-card-form-expanded="true"
 *    Sin ese atributo el Smart Form no expande el formulario de tarjeta automáticamente.
 *  - Se agrega también <button class="kr-payment-button"> y <div class="kr-form-error">
 *    que el SDK necesita para renderizar correctamente (igual que el prototipo Node).
 */

import {
  ShieldCheck,
  Lock,
  CreditCard,
  Smartphone,
  Building2,
} from 'lucide-react';

export default function BillingInfo() {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/40 p-6 space-y-5">
      {/* Título */}
      <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <span className="w-7 h-7 rounded-full bg-sky-500 text-white text-xs font-black flex items-center justify-center">
          3
        </span>
        Método de pago
        <Lock className="w-4 h-4 text-emerald-500 ml-auto" />
      </h2>

      {/* Instrucción */}
      <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-xl border border-sky-100 dark:border-sky-800/40">
        <p className="text-sm text-sky-800 dark:text-sky-300 leading-relaxed">
          Haz clic en <span className="font-bold">"Realizar pedido"</span> para
          cargar el formulario seguro de pago aquí abajo.
        </p>
      </div>

      {/*
        ── Smart Form de Izipay ──────────────────────────────────────────────
        CRÍTICO: necesita los 3 elementos dentro:
          1. div.kr-smart-form con kr-card-form-expanded="true"
          2. button.kr-payment-button  → botón de pago que inyecta Krypton
          3. div.kr-form-error         → donde Krypton muestra errores inline

        Sin kr-card-form-expanded="true" el formulario de tarjeta NO se expande.
        Sin el button y el div de error el SDK puede fallar silenciosamente.
        ─────────────────────────────────────────────────────────────────────
      */}
      <div className="kr-smart-form" kr-card-form-expanded="true">
        <button className="kr-payment-button" />
        <div className="kr-form-error" />
      </div>

      {/* Métodos disponibles — informativo */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Métodos disponibles
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
            <CreditCard className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Tarjeta crédito / débito
            </span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
            <Smartphone className="w-4 h-4 text-violet-500 flex-shrink-0" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Yape / Plin
            </span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
            <Smartphone className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Billetera digital
            </span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
            <Building2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Banca móvil / Agente
            </span>
          </div>
        </div>
      </div>

      {/* Badge seguridad */}
      <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/40">
        <ShieldCheck className="w-8 h-8 text-emerald-500 flex-shrink-0" />
        <div>
          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
            Pago 100% seguro
          </p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
            Procesado por <span className="font-bold">Izipay</span>, respaldado
            por Banco BCP. Lyrium nunca almacena los datos de tu tarjeta.
          </p>
        </div>
      </div>
    </div>
  );
}
