'use client';

import { useEffect, useState, useCallback } from 'react';
import { Leaf, ArrowUpRight, ArrowDownLeft, History, Wallet } from 'lucide-react';
import Image from 'next/image';
import { liriosApi, type LiriosBalance, type LiriosTransaction } from '@/shared/lib/api/liriosRepository';

export default function LiriosWalletPageClient() {
    const [balance, setBalance] = useState<LiriosBalance | null>(null);
    const [transactions, setTransactions] = useState<LiriosTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [txLoading, setTxLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBalance = useCallback(async () => {
        try {
            const data = await liriosApi.getBalance();
            setBalance(data);
        } catch {
            setError('No se pudo cargar tu saldo de Lirios.');
        }
    }, []);

    const fetchTransactions = useCallback(async () => {
        setTxLoading(true);
        try {
            const res = await liriosApi.getTransactions();
            setTransactions(res.data?.data ?? []);
        } catch {
            // silently fail
        } finally {
            setTxLoading(false);
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        Promise.all([fetchBalance(), fetchTransactions()])
            .finally(() => setLoading(false));
    }, [fetchBalance, fetchTransactions]);

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header con flor */}
            <div className="flex items-center gap-4">
                <div className="relative w-12 h-12">
                    <Image
                        src="/img/intro/Flor.png"
                        alt="Lirios"
                        fill
                        className="object-contain"
                    />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-[var(--text-primary)]">
                        Mis Lirios
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-[var(--text-muted)]">
                        Tus puntos de fidelidad — 1 Lirio = S/ 1 de descuento
                    </p>
                </div>
            </div>

            {/* Tarjeta de saldo tipo billetera */}
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-500 via-emerald-400 to-teal-400 shadow-xl shadow-emerald-200/50 dark:shadow-emerald-900/30 p-6 sm:p-8">
                {/* Decorative flower */}
                <div className="absolute -top-6 -right-6 w-32 h-32 opacity-10">
                    <Image
                        src="/img/intro/Flor.png"
                        alt=""
                        fill
                        className="object-contain"
                    />
                </div>
                <div className="absolute -bottom-4 -left-4 w-24 h-24 opacity-10">
                    <Image
                        src="/img/intro/Flor.png"
                        alt=""
                        fill
                        className="object-contain"
                    />
                </div>

                <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-white/80" />
                            <span className="text-sm font-semibold text-white/80 tracking-wide uppercase">
                                Billetera Lirios
                            </span>
                        </div>
                        <div className="relative w-8 h-8">
                            <Image
                                src="/img/intro/Flor.png"
                                alt=""
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            <span className="text-white/70 text-sm">Cargando...</span>
                        </div>
                    ) : error ? (
                        <p className="text-white/80 text-sm">{error}</p>
                    ) : (
                        <>
                            <div>
                                <p className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                                    {balance?.balance ?? 0}
                                </p>
                                <p className="text-sm text-white/70 mt-1 font-medium">
                                    Lirios disponibles
                                </p>
                            </div>

                            <div className="pt-2 border-t border-white/20 flex items-center gap-2 text-white/70 text-xs">
                                <Leaf className="w-3.5 h-3.5" />
                                <span>1 Lirio = S/ 1.00 de descuento en tu próxima compra</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Historial de transacciones */}
            <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl border border-gray-200 dark:border-[var(--border-subtle)] overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-[var(--border-subtle)] flex items-center gap-2">
                    <History className="w-4 h-4 text-gray-400" />
                    <h2 className="text-sm font-bold text-gray-700 dark:text-[var(--text-primary)]">
                        Historial de transacciones
                    </h2>
                </div>

                {txLoading ? (
                    <div className="p-8 text-center">
                        <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto" />
                        <p className="text-xs text-gray-400 mt-3">Cargando historial...</p>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="p-8 text-center">
                        <Leaf className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
                        <p className="text-sm text-gray-400 dark:text-[var(--text-muted)]">
                            Aún no tienes movimientos de Lirios.
                        </p>
                        <p className="text-xs text-gray-300 dark:text-[var(--text-muted)] mt-1">
                            ¡Realiza tu primera compra para empezar a acumular!
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-[var(--border-subtle)]">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="px-5 py-3.5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                        tx.type === 'accrue'
                                            ? 'bg-emerald-50 dark:bg-emerald-900/20'
                                            : 'bg-amber-50 dark:bg-amber-900/20'
                                    }`}>
                                        {tx.type === 'accrue' ? (
                                            <ArrowDownLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        ) : (
                                            <ArrowUpRight className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-[var(--text-primary)]">
                                            {tx.description ?? (tx.type === 'accrue' ? 'Compra' : 'Canje')}
                                        </p>
                                        <p className="text-[10px] text-gray-400 dark:text-[var(--text-muted)] mt-0.5">
                                            {new Date(tx.created_at).toLocaleDateString('es-PE', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-sm font-black ${
                                        tx.type === 'accrue'
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-amber-600 dark:text-amber-400'
                                    }`}>
                                        {tx.type === 'accrue' ? '+' : '-'}{tx.amount}
                                    </span>
                                    <p className="text-[10px] text-gray-400 dark:text-[var(--text-muted)] mt-0.5">
                                        Saldo: {tx.balance_after}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Info card */}
            <div className="bg-sky-50 dark:bg-sky-900/20 rounded-2xl border border-sky-100 dark:border-sky-800/40 p-5">
                <h3 className="text-xs font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wide mb-2">
                    ¿Cómo funciona?
                </h3>
                <ul className="space-y-1.5 text-xs text-sky-700 dark:text-sky-300/80 leading-relaxed">
                    <li>• 1 Lirio = S/ 1.00 gastado en la plataforma</li>
                    <li>• Puedes usar tus Lirios como descuento en el checkout</li>
                    <li>• El descuento máximo es 3% del valor venta (precio sin IGV)</li>
                    <li>• Solo se recomienda usar Lirios si el descuento es ≥ S/ 2.00</li>
                    <li>• Los Lirios se acreditan automáticamente después de cada compra pagada</li>
                </ul>
            </div>
        </div>
    );
}
