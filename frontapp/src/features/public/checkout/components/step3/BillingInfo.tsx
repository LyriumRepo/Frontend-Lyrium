'use client';

import {
  ShieldCheck,
  Lock,
  CreditCard,
  Smartphone,
  Building2,
} from 'lucide-react';
import Image from 'next/image';

export default function BillingInfo() {
  return (
    <div
      className="rounded-2xl border border-gray-200 dark:border-[var(--border-default)]
      bg-white dark:bg-[var(--bg-card)] p-6 space-y-5 shadow-sm"
    >
      {/* Título */}
      <h2 className="font-bold text-gray-900 dark:text-[var(--text-primary)] flex items-center gap-2">
        <span className="w-7 h-7 rounded-full bg-[var(--brand-sky)] dark:bg-[var(--brand-green)] text-white text-xs font-black flex items-center justify-center">
          3
        </span>
        Método de pago
        <Lock className="w-4 h-4 text-emerald-500 ml-auto" />
      </h2>

      {/* Izipay branding */}
      <div className="flex items-center gap-3 p-4 bg-sky-50 dark:bg-emerald-900/20 rounded-xl border border-sky-100 dark:border-emerald-800/40">
        <div className="relative w-20 h-8 shrink-0">
          <Image
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS82g5FrC0YFl2vLYDBioVuYkTPKSMR9qyqHQ&s"
            alt="Izipay"
            fill
            className="object-contain"
            unoptimized
          />
        </div>
        <p className="text-sm text-sky-800 dark:text-emerald-300 leading-relaxed">
          Haz clic en <span className="font-bold">&quot;Realizar pedido&quot;</span> y el
          formulario seguro de pago de Izipay se abrirá en una ventana emergente.
        </p>
      </div>

      {/* Métodos disponibles */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-500 dark:text-[var(--text-secondary)] uppercase tracking-wide">
          Métodos disponibles
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40">
            <CreditCard className="w-4 h-4 text-[var(--brand-sky)] dark:text-[var(--brand-green)] flex-shrink-0" />
            <span className="text-xs font-medium text-gray-700 dark:text-[var(--text-primary)]">
              Tarjeta crédito / débito
            </span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/40">
            <Smartphone className="w-4 h-4 text-violet-500 flex-shrink-0" />
            <span className="text-xs font-medium text-gray-700 dark:text-[var(--text-primary)]">
              Yape / Plin
            </span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-sky-50 dark:bg-emerald-900/20 border border-sky-100 dark:border-emerald-800/40">
            <Smartphone className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="text-xs font-medium text-gray-700 dark:text-[var(--text-primary)]">
              Billetera digital
            </span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40">
            <Building2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span className="text-xs font-medium text-gray-700 dark:text-[var(--text-primary)]">
              Banca móvil / Agente
            </span>
          </div>
        </div>
      </div>

      {/* Badge seguridad con Izipay */}
      <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/40">
        <div className="relative w-14 h-8 shrink-0">
          <Image
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS82g5FrC0YFl2vLYDBioVuYkTPKSMR9qyqHQ&s"
            alt="Izipay"
            fill
            className="object-contain"
            unoptimized
          />
        </div>
        <div>
          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            Pago 100% seguro con Izipay
          </p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
            Respaldado por Banco BCP. Lyrium nunca almacena los datos de tu tarjeta.
          </p>
        </div>
      </div>
    </div>
  );
}
