'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Leaf,
  History,
  Sparkles,
  TrendingUp,
  Coins,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Info,
  Table2,
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  liriosApi,
  type LiriosBalance,
  type LiriosTransaction,
} from '@/shared/lib/api/liriosRepository';

const CONVERSION_RATE = 100;

function lyriopuntosToSoles(pts: number): number {
  return pts / CONVERSION_RATE;
}

function buildConversionTable(balance: number): { pts: number; soles: number }[] {
  const steps = [100, 500, 1000, 2500, 5000, 10000];
  const table: { pts: number; soles: number }[] = [];
  for (const s of steps) {
    if (s <= balance || table.length === 0) {
      table.push({ pts: s, soles: lyriopuntosToSoles(s) });
    }
  }
  if (balance > 0 && !table.some((t) => t.pts === balance)) {
    const insertIdx = table.findIndex((t) => t.pts > balance);
    if (insertIdx === -1) {
      table.push({ pts: balance, soles: lyriopuntosToSoles(balance) });
    } else {
      table.splice(insertIdx, 0, { pts: balance, soles: lyriopuntosToSoles(balance) });
    }
  }
  return table;
}

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
      setError('No se pudo cargar tu saldo de Lyriopuntos.');
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setTxLoading(true);
    try {
      const res = await liriosApi.getTransactions();
      setTransactions(res.data?.data ?? []);
    } catch {
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

  const pts = balance?.balance ?? 0;
  const solesValue = lyriopuntosToSoles(pts);
  const conversionTable = useMemo(() => buildConversionTable(pts), [pts]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-400/20 via-emerald-400/20 to-sky-400/20 blur-3xl" />
        <div className="relative flex items-center justify-between bg-white/80 dark:bg-[var(--bg-card)] backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/50 dark:border-[var(--border-subtle)]">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 via-emerald-400 to-sky-400 flex items-center justify-center shadow-lg shadow-teal-500/30 overflow-hidden">
              <Image
                src="/img/intro/Flor.png"
                alt="Lyriopuntos"
                fill
                className="object-contain p-2"
              />
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-teal-600 via-emerald-600 to-sky-600 bg-clip-text text-transparent">
                Mis Lyriopuntos
              </h1>
              <p className="text-sm text-gray-600 dark:text-[var(--text-muted)] flex items-center gap-1.5 mt-1">
                <Sparkles className="w-3.5 h-3.5" />
                Tus puntos de fidelidad — 100 lyriopuntos = S/ 1 de descuento
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-100 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-900/30 rounded-full">
            <TrendingUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="text-xs font-bold text-teal-700 dark:text-teal-300">
              Activo
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-emerald-600 to-sky-500 shadow-2xl shadow-teal-500/30 dark:shadow-teal-900/50 p-8 sm:p-10">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse delay-700" />
            </div>

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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                  <Coins className="w-5 h-5 text-white" />
                  <span className="text-sm font-bold text-white tracking-wide uppercase">
                    Billetera Lyriopuntos
                  </span>
                </div>

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
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={hidden ? 'hidden' : 'visible'}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="py-4"
                    >
                      {hidden ? (
                        <p className="text-7xl sm:text-8xl font-black text-white tracking-tight leading-none select-none">
                          ••••
                        </p>
                      ) : (
                        <p className="text-7xl sm:text-8xl font-black text-white tracking-tight leading-none">
                          {pts.toLocaleString('es-PE')}
                        </p>
                      )}
                      <p className="text-lg text-white/80 mt-3 font-semibold">
                        lyriopuntos disponibles
                      </p>
                      {!hidden && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="text-sm text-white/60 mt-1"
                        >
                          = S/ {solesValue.toFixed(2)} de descuento
                        </motion.p>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  <div className="pt-4 border-t border-white/30 grid grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                      <p className="text-white/70 text-xs mb-1">
                        Valor de tus puntos
                      </p>
                      <p className="text-white text-2xl font-bold">
                        {hidden ? '••••' : `S/ ${solesValue.toFixed(2)}`}
                      </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                      <p className="text-white/70 text-xs mb-1">Conversión</p>
                      <p className="text-white text-2xl font-bold">100:1</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6">
          <div className="bg-gradient-to-br from-white to-teal-50/50 dark:from-[var(--bg-card)] dark:to-teal-900/20 rounded-3xl border border-teal-200/50 dark:border-teal-800/30 p-6 shadow-xl">
            <h3 className="text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Información rápida
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-[var(--text-muted)]">
                  Tasa de conversión
                </span>
                <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
                  100 lyriopuntos = S/ 1
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-[var(--text-muted)]">
                  Acumulación
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  1 lyriopunto por S/ 1
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
                <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
                  S/ 2.00
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-100 to-sky-100 dark:from-teal-900/30 dark:to-sky-900/30 rounded-3xl border-2 border-teal-300/50 dark:border-teal-700/30 p-6 shadow-lg">
            <h3 className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              ¿Cómo funciona?
            </h3>
            <ul className="space-y-2.5 text-xs text-teal-700 dark:text-teal-300/90 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-teal-500 dark:text-teal-400 mt-0.5">●</span>
                <span>Ganas 1 lyriopunto por cada S/ 1.00 gastado</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500 dark:text-teal-400 mt-0.5">●</span>
                <span>100 lyriopuntos equivalen a S/ 1.00 de descuento</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500 dark:text-teal-400 mt-0.5">●</span>
                <span>Puedes usarlos como descuento en el checkout</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500 dark:text-teal-400 mt-0.5">●</span>
                <span>El descuento máximo es 3% del valor venta (sin IGV)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500 dark:text-teal-400 mt-0.5">●</span>
                <span>Se acreditan automáticamente después de cada compra pagada</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <div className="bg-white/80 dark:bg-[var(--bg-card)] backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-[var(--border-subtle)] overflow-hidden shadow-xl">
          <div className="px-6 py-5 border-b border-gray-200/70 dark:border-[var(--border-subtle)] bg-gradient-to-r from-teal-50 to-sky-50 dark:from-teal-900/20 dark:to-sky-900/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
                <Table2 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-[var(--text-primary)]">
                Tabla de conversión
              </h2>
            </div>
          </div>

          {pts > 0 ? (
            <div className="p-6">
              <p className="text-xs text-gray-500 dark:text-[var(--text-muted)] mb-4 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                100 lyriopuntos = S/ 1.00
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {conversionTable.map((row) => (
                  <motion.div
                    key={row.pts}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`rounded-2xl p-4 text-center border transition-all ${
                      row.pts === pts
                        ? 'bg-gradient-to-br from-teal-500 to-emerald-500 text-white border-transparent shadow-lg shadow-teal-500/30 scale-105'
                        : 'bg-white dark:bg-[var(--bg-muted)] border-gray-200 dark:border-[var(--border-subtle)] hover:shadow-md'
                    }`}
                  >
                    <p
                      className={`text-lg font-black ${
                        row.pts === pts
                          ? 'text-white'
                          : 'text-gray-800 dark:text-[var(--text-primary)]'
                      }`}
                    >
                      {row.pts.toLocaleString('es-PE')}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        row.pts === pts
                          ? 'text-white/80'
                          : 'text-gray-500 dark:text-[var(--text-muted)]'
                      }`}
                    >
                      lyriopuntos
                    </p>
                    <div
                      className={`h-px my-2 ${
                        row.pts === pts
                          ? 'bg-white/30'
                          : 'bg-gray-200 dark:bg-[var(--border-subtle)]'
                      }`}
                    />
                    <p
                      className={`font-bold ${
                        row.pts === pts
                          ? 'text-white'
                          : 'text-teal-600 dark:text-teal-400'
                      }`}
                    >
                      S/ {row.soles.toFixed(2)}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-100 to-sky-100 dark:from-teal-900/30 dark:to-sky-900/30 flex items-center justify-center">
                <Coins className="w-10 h-10 text-teal-400 dark:text-teal-500" />
              </div>
              <p className="text-base font-semibold text-gray-600 dark:text-[var(--text-secondary)] mb-2">
                Aún no tienes Lyriopuntos
              </p>
              <p className="text-sm text-gray-400 dark:text-[var(--text-muted)]">
                ¡Realiza tu primera compra para empezar a acumular!
              </p>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="bg-white/80 dark:bg-[var(--bg-card)] backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-[var(--border-subtle)] overflow-hidden shadow-xl">
          <div className="px-6 py-5 border-b border-gray-200/70 dark:border-[var(--border-subtle)] bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
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
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-900/30 flex items-center justify-center">
                <Leaf className="w-10 h-10 text-teal-400 dark:text-teal-500" />
              </div>
              <p className="text-base font-semibold text-gray-600 dark:text-[var(--text-secondary)] mb-2">
                Aún no tienes movimientos de Lyriopuntos
              </p>
              <p className="text-sm text-gray-400 dark:text-[var(--text-muted)]">
                ¡Realiza tu primera compra para empezar a acumular!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-[var(--border-subtle)]">
              {transactions.map((tx, idx) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="px-6 py-4 hover:bg-gradient-to-r hover:from-teal-50/50 hover:to-emerald-50/50 dark:hover:from-teal-900/10 dark:hover:to-emerald-900/10 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                          tx.type === 'accrue'
                            ? 'bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 shadow-emerald-200/50 dark:shadow-emerald-900/20'
                            : 'bg-gradient-to-br from-sky-100 to-teal-100 dark:from-sky-900/30 dark:to-teal-900/30 shadow-sky-200/50 dark:shadow-sky-900/20'
                        }`}
                      >
                        {tx.type === 'accrue' ? (
                          <Plus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Minus className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-base font-bold text-gray-800 dark:text-[var(--text-primary)]">
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
                    <div className="text-right">
                      <span
                        className={`text-xl font-black ${
                          tx.type === 'accrue'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-sky-600 dark:text-sky-400'
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
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
