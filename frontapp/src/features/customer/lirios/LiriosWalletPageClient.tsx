'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Leaf,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  Sparkles,
  TrendingUp,
  Coins,
  Eye,
  EyeOff,
} from 'lucide-react';
import Image from 'next/image';
import {
  liriosApi,
  type LiriosBalance,
  type LiriosTransaction,
} from '@/shared/lib/api/liriosRepository';

export default function LiriosWalletPageClient() {
  const [balance, setBalance] = useState<LiriosBalance | null>(null);
  const [transactions, setTransactions] = useState<LiriosTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);

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
    Promise.all([fetchBalance(), fetchTransactions()]).finally(() =>
      setLoading(false),
    );
  }, [fetchBalance, fetchTransactions]);

  return (
    <div className="space-y-8">
        {/* ── Floating header ── */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-teal-400/20 to-emerald-400/20 blur-3xl" />
          <div className="relative flex items-center justify-between bg-white/80 dark:bg-[var(--bg-card)] backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/50 dark:border-[var(--border-subtle)]">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 via-teal-400 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/30 overflow-hidden">
                <Image
                  src="/img/intro/Flor.png"
                  alt="Lirios"
                  fill
                  className="object-contain p-2"
                />
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  Mis Lirios
                </h1>
                <p className="text-sm text-gray-600 dark:text-[var(--text-muted)] flex items-center gap-1.5 mt-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Tus puntos de fidelidad — 1 Lirio = S/ 1 de descuento
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-100 to-teal-100 dark:from-cyan-900/30 dark:to-teal-900/30 rounded-full">
              <TrendingUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="text-xs font-bold text-teal-700 dark:text-teal-300">
                Activo
              </span>
            </div>
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Balance card */}
          <div className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500 shadow-2xl shadow-teal-500/30 dark:shadow-teal-900/50 p-5 sm:p-8 lg:p-10">
              {/* Animated blobs */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse delay-700" />
              </div>

              {/* Decorative flower corners */}
              <div className="absolute -top-6 -right-6 w-36 h-36 opacity-10 pointer-events-none">
                <Image
                  src="/img/intro/Flor.png"
                  alt=""
                  fill
                  className="object-contain"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 w-28 h-28 opacity-10 pointer-events-none">
                <Image
                  src="/img/intro/Flor.png"
                  alt=""
                  fill
                  className="object-contain"
                />
              </div>

              <div className="relative z-10 space-y-6">
                {/* Card top row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                    <Coins className="w-5 h-5 text-white" />
                    <span className="text-sm font-bold text-white tracking-wide uppercase">
                      Billetera Lirios
                    </span>
                  </div>

                  {/* Eye toggle button */}
                  <button
                    onClick={() => setHidden((h) => !h)}
                    aria-label={hidden ? 'Mostrar saldo' : 'Ocultar saldo'}
                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    {hidden ? (
                      <EyeOff className="w-5 h-5 text-white" />
                    ) : (
                      <Eye className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>

                {/* Balance display */}
                {loading ? (
                  <div className="flex items-center gap-4 py-8">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-white text-lg">
                      Cargando tu saldo...
                    </span>
                  </div>
                ) : error ? (
                  <div className="py-8">
                    <p className="text-white/90 text-lg">{error}</p>
                  </div>
                ) : (
                  <>
                    <div className="py-4">
                      {hidden ? (
                        <p className="text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-tight leading-none select-none">
                          ••••
                        </p>
                      ) : (
                        <p className="text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-tight leading-none">
                          {balance?.balance ?? 0}
                        </p>
                      )}
                      <p className="text-lg text-white/80 mt-3 font-semibold">
                        Lirios disponibles
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/30 grid grid-cols-2 gap-4">
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                        <p className="text-white/70 text-xs mb-1">
                          Valor en descuento
                        </p>
                        <p className="text-white text-2xl font-bold">
                          {hidden ? '••••' : `S/ ${balance?.balance ?? 0}.00`}
                        </p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                        <p className="text-white/70 text-xs mb-1">Conversión</p>
                        <p className="text-white text-2xl font-bold">1:1</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Quick info */}
            <div className="bg-gradient-to-br from-white to-cyan-50/50 dark:from-[var(--bg-card)] dark:to-cyan-900/20 rounded-3xl border border-cyan-200/50 dark:border-cyan-800/30 p-6 shadow-xl">
              <h3 className="text-sm font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Información rápida
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-[var(--text-muted)]">
                    Tasa de conversión
                  </span>
                  <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
                    1 Lirio = S/ 1
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-[var(--text-muted)]">
                    Descuento máximo
                  </span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    3% del total
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-[var(--text-muted)]">
                    Mínimo recomendado
                  </span>
                  <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                    S/ 2.00
                  </span>
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-900/30 rounded-3xl border-2 border-teal-300/50 dark:border-teal-700/30 p-6 shadow-lg">
              <h3 className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Leaf className="w-4 h-4" />
                ¿Cómo funciona?
              </h3>
              <ul className="space-y-2.5 text-xs text-teal-700 dark:text-teal-300/90 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 dark:text-teal-400 mt-0.5">
                    ●
                  </span>
                  <span>1 Lirio = S/ 1.00 gastado en la plataforma</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 dark:text-teal-400 mt-0.5">
                    ●
                  </span>
                  <span>
                    Puedes usar tus Lirios como descuento en el checkout
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 dark:text-teal-400 mt-0.5">
                    ●
                  </span>
                  <span>
                    El descuento máximo es 3% del valor venta (sin IGV)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 dark:text-teal-400 mt-0.5">
                    ●
                  </span>
                  <span>
                    Solo se recomienda usar Lirios si el descuento es ≥ S/ 2.00
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 dark:text-teal-400 mt-0.5">
                    ●
                  </span>
                  <span>
                    Se acreditan automáticamente después de cada compra pagada
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── Transaction history ── */}
        <div className="bg-white/80 dark:bg-[var(--bg-card)] backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-[var(--border-subtle)] overflow-hidden shadow-xl">
          <div className="px-6 py-5 border-b border-gray-200/70 dark:border-[var(--border-subtle)] bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
                  <History className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-[var(--text-primary)]">
                  Historial de transacciones
                </h2>
              </div>
              {!txLoading && (
                <span className="text-xs text-gray-500 dark:text-[var(--text-muted)] px-3 py-1.5 bg-white/60 dark:bg-[var(--bg-muted)] rounded-full font-medium">
                  {transactions.length} movimiento
                  {transactions.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {txLoading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-teal-200 dark:border-teal-800 border-t-teal-500 dark:border-t-teal-400 rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-500 dark:text-[var(--text-muted)] mt-4">
                Cargando historial...
              </p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-cyan-900/30 dark:to-teal-900/30 flex items-center justify-center">
                <Leaf className="w-10 h-10 text-teal-400 dark:text-teal-500" />
              </div>
              <p className="text-base font-semibold text-gray-600 dark:text-[var(--text-secondary)] mb-2">
                Aún no tienes movimientos de Lirios
              </p>
              <p className="text-sm text-gray-400 dark:text-[var(--text-muted)]">
                ¡Realiza tu primera compra para empezar a acumular!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-[var(--border-subtle)]">
              {transactions.map((tx, idx) => (
                <div
                  key={tx.id}
                  className="px-6 py-4 hover:bg-gradient-to-r hover:from-cyan-50/50 hover:to-teal-50/50 dark:hover:from-cyan-900/10 dark:hover:to-teal-900/10 transition-all duration-200"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                          tx.type === 'accrue'
                            ? 'bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 shadow-emerald-200/50 dark:shadow-emerald-900/20'
                            : 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 shadow-amber-200/50 dark:shadow-amber-900/20'
                        }`}
                      >
                        {tx.type === 'accrue' ? (
                          <ArrowDownLeft className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] truncate">
                          {tx.description ??
                            (tx.type === 'accrue' ? 'Compra' : 'Canje')}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-[var(--text-muted)] mt-1">
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
                    <div className="text-right shrink-0">
                      <span
                        className={`text-xl font-black ${
                          tx.type === 'accrue'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {tx.type === 'accrue' ? '+' : '-'}
                        {tx.amount}
                      </span>
                      <p className="text-xs text-gray-400 dark:text-[var(--text-muted)] mt-1">
                        Saldo:{' '}
                        <span className="font-bold">{tx.balance_after}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
}
