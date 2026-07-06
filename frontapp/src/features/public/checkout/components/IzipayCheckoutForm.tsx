'use client';

import { useState, useEffect } from 'react';
import { izipayPaymentApi, type IzipayInitResponse } from '@/shared/lib/api/paymentRepository';
import { Loader2, CheckCircle, XCircle, Shield, CreditCard } from 'lucide-react';

interface Props {
    orderId: string;
    onSuccess: (result: { transactionId: string; invoicesCreadas: number }) => void;
    onError: (error: string) => void;
    onCancel: () => void;
}

export default function IzipayCheckoutForm({ orderId, onSuccess, onError, onCancel }: Props) {
    const [initData, setInitData] = useState<IzipayInitResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);
    const [initError, setInitError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function init() {
            setLoading(true);
            setInitError(null);
            try {
                const data = await izipayPaymentApi.init(orderId);
                if (!cancelled) setInitData(data);
            } catch (err) {
                if (!cancelled) setInitError(err instanceof Error ? err.message : 'Error al iniciar pago');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        init();
        return () => { cancelled = true; };
    }, [orderId]);

    const handleConfirm = async () => {
        setConfirming(true);
        try {
            const result = await izipayPaymentApi.confirm(orderId);
            onSuccess({
                transactionId: result.transaction_id,
                invoicesCreadas: result.invoices_creadas,
            });
        } catch (err) {
            onError(err instanceof Error ? err.message : 'Error al confirmar pago');
        } finally {
            setConfirming(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="w-10 h-10 text-sky-500 dark:text-emerald-400 animate-spin" />
                <p className="text-sm font-medium text-gray-500">Inicializando pago seguro...</p>
            </div>
        );
    }

    if (initError) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
                <XCircle className="w-12 h-12 text-red-400" />
                <p className="text-sm font-medium text-red-500 text-center max-w-xs">{initError}</p>
                <button
                    onClick={onCancel}
                    className="px-6 py-2 rounded-xl bg-gray-100 text-gray-600 font-bold text-xs uppercase tracking-wider hover:bg-gray-200 transition-colors"
                >
                    Volver
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {initData?.mode === 'izipay' ? (
                <div id="izipayFormContainer" className="min-h-[300px]" />
            ) : (
                <div className="text-center space-y-6 py-4">
                    <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto border border-sky-100 dark:border-emerald-800/30">
                        <CreditCard className="w-8 h-8 text-sky-500 dark:text-emerald-400" />
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-black text-gray-900 dark:text-[var(--text-primary)]">
                            Pago de Prueba
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-[var(--text-muted)] max-w-sm mx-auto">
                            Modo simulado — confirma el pago para generar el comprobante electrónico
                            y validar el flujo completo de facturación.
                        </p>
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/30">
                        <Shield className="w-4 h-4 text-amber-500" />
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                            Modo MOCK — Sin conexión real a Izipay
                        </span>
                    </div>

                    <div className="flex gap-3 justify-center pt-2">
                        <button
                            onClick={onCancel}
                            className="px-6 py-3 rounded-2xl border-2 border-gray-100 dark:border-[var(--border-subtle)] text-gray-500 dark:text-[var(--text-muted)] font-bold text-xs uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-[var(--bg-muted)] transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={confirming}
                            className="px-8 py-3 rounded-2xl bg-gray-900 dark:bg-[var(--bg-secondary)] text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-sky-600 dark:hover:bg-emerald-600 transition-all shadow-xl shadow-gray-200 dark:shadow-gray-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {confirming ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Confirmando...</>
                            ) : (
                                <><CheckCircle className="w-4 h-4" /> Confirmar Pago</>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
