'use client';

import { ShieldCheck, Lock } from 'lucide-react';

export default function BillingInfo() {
    return (
        <div className="bg-white dark:bg-[var(--bg-card)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-sky-500 to-sky-400 flex items-center gap-2">
                <span className="text-white text-2xl">🧾</span>
                <h3 className="font-bold text-white">Datos de Facturación</h3>
                <span className="px-2 py-0.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs rounded-full font-bold ml-auto">
                    IZIPAY
                </span>
            </div>

            <div className="p-5">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-2xl border border-blue-200 dark:border-blue-800/30 flex items-start gap-3">
                    <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-bold text-gray-800 dark:text-[var(--text-primary)] mb-1">Pago Seguro con Izipay</p>
                        <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mb-2">
                            El procesamiento del pago se realizará de forma segura a través de{' '}
                            <strong>Izipay Online</strong>.
                        </p>
                        <p className="text-xs text-gray-500 dark:text-[var(--text-muted)] flex items-center gap-1">
                            <Lock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            Conexión cifrada SSL/TLS · Estándares PCI-DSS
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
