'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseButton from '@/components/ui/BaseButton';
import BaseEmptyState from '@/components/ui/BaseEmptyState';
import BaseSkeleton from '@/components/ui/BaseSkeleton';
import {
  Leaf,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  Sparkles,
  Coins,
  Eye,
  EyeOff,
  Trophy,
  TrendingUp,
  Gift,
} from 'lucide-react';
import {
  liriosApi,
  type LiriosBalance,
  type LiriosTransaction,
} from '@/shared/lib/api/liriosRepository';
import LiriosMinigameModal from './components/LiriosMinigameModal';

/* ── Animated counter ── */
function AnimatedNumber({ value, isHidden }: { value: number; isHidden: boolean }) {
  const [displayed, setDisplayed] = useState(0);
  const frameRef = useRef(0);

  useEffect(() => {
    if (isHidden) return;
    const startTime = performance.now();
    const duration = 700;

    function animate(time: number) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * value));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    }

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, isHidden]);

  if (isHidden) return <span>••••</span>;
  return <span>{displayed.toLocaleString()}</span>;
}

/* ── Tier definitions ── */
const TIERS = [
  { min: 0,     label: 'Brote',        discount: '1%',   color: 'from-green-600 to-green-400' },
  { min: 200,   label: 'Retoño',       discount: '1%',   color: 'from-emerald-600 to-emerald-400' },
  { min: 500,   label: 'Hoja',         discount: '1.5%', color: 'from-teal-600 to-teal-400' },
  { min: 1000,  label: 'Flor',         discount: '2%',   color: 'from-cyan-600 to-cyan-400' },
  { min: 2000,  label: 'Ramo',         discount: '2.5%', color: 'from-sky-600 to-sky-400' },
  { min: 3500,  label: 'Jardín',       discount: '3%',   color: 'from-indigo-500 to-indigo-400' },
  { min: 5500,  label: 'Bosque',       discount: '3%',   color: 'from-violet-600 to-violet-400' },
  { min: 8000,  label: 'Lirio Épico',  discount: '3%',   color: 'from-amber-500 to-yellow-400' },
];

function getTier(balance: number) {
  let current = TIERS[0];
  for (const t of TIERS) {
    if (balance >= t.min) current = t;
  }
  return current;
}

function getTierProgress(balance: number) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (balance >= TIERS[i].min) {
      if (i === TIERS.length - 1) return 100;
      const next = TIERS[i + 1];
      return ((balance - TIERS[i].min) / (next.min - TIERS[i].min)) * 100;
    }
  }
  return 0;
}

function getNextTier(balance: number) {
  for (const t of TIERS) {
    if (balance < t.min) return t;
  }
  return null;
}

/* ── Inline decorative SVG (leaf/flower motif) ── */
function DecorativeFlower({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="100" cy="60" r="30" fill="currentColor" />
      <ellipse cx="60" cy="100" rx="30" ry="20" fill="currentColor" transform="rotate(-30 60 100)" />
      <ellipse cx="140" cy="100" rx="30" ry="20" fill="currentColor" transform="rotate(30 140 100)" />
      <ellipse cx="75" cy="140" rx="28" ry="18" fill="currentColor" transform="rotate(-60 75 140)" />
      <ellipse cx="125" cy="140" rx="28" ry="18" fill="currentColor" transform="rotate(60 125 140)" />
      <circle cx="100" cy="100" r="12" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

/* ================================================================ */
/*  MAIN COMPONENT                                                  */
/* ================================================================ */
export default function LiriosWalletPageClient() {
  const [balance, setBalance] = useState<LiriosBalance | null>(null);
  const [transactions, setTransactions] = useState<LiriosTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'accrue' | 'redeem'>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [txTotal, setTxTotal] = useState(0);
  const [animateIn, setAnimateIn] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);
  const [rewardToast, setRewardToast] = useState(false);

  const handleEarnLirios = useCallback((amount: number) => {
    setBalance((prev) => prev ? { balance: prev.balance + amount } : prev);
    setRewardToast(true);
    setTimeout(() => setRewardToast(false), 3000);
  }, []);

  const fetchBalance = useCallback(async () => {
    try {
      const data = await liriosApi.getBalance();
      setBalance(data);
      setTimeout(() => setAnimateIn(true), 100);
    } catch {
      setError('No se pudo cargar tu saldo de Lirios.');
    }
  }, []);

  const fetchTransactions = useCallback(async (pageNum = 1, append = false) => {
    setTxLoading(true);
    try {
      const res = await liriosApi.getTransactions(pageNum);
      const txns = res.data?.data ?? [];
      setTransactions((prev) => (append ? [...prev, ...txns] : txns));
      setTxTotal(res.data?.total ?? 0);
      setHasMore(pageNum < (res.data?.last_page ?? 1));
    } catch {
      /* silent */
    } finally {
      setTxLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchBalance(), fetchTransactions(1)]).finally(() => setLoading(false));
  }, [fetchBalance, fetchTransactions]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchTransactions(next, true);
  };

  /* ── Derived data ── */
  const bal = balance?.balance ?? 0;
  const tier = getTier(bal);
  const nextTier = getNextTier(bal);
  const tierProgress = getTierProgress(bal);

  const totalEarned = transactions
    .filter((t) => t.type === 'accrue')
    .reduce((s, t) => s + t.amount, 0);
  const totalRedeemed = transactions
    .filter((t) => t.type === 'redeem')
    .reduce((s, t) => s + t.amount, 0);

  const filteredTxs =
    filterTab === 'all'
      ? transactions
      : transactions.filter((tx) => tx.type === filterTab);

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="space-y-8">
        <ModuleHeader title="Mis Lirios" subtitle="Cargando..." icon={<><img src="/lirio-icon.png" alt="" className="w-6 h-6 sm:w-7 sm:h-7 object-contain dark:hidden" /><img src="/lirio-icon-night.png" alt="" className="w-6 h-6 sm:w-7 sm:h-7 object-contain hidden dark:block" /></>} />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="rounded-3xl bg-[var(--bg-secondary)] h-[320px] animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="rounded-3xl bg-[var(--bg-secondary)] h-[180px] animate-pulse" />
            <div className="rounded-3xl bg-[var(--bg-secondary)] h-[240px] animate-pulse" />
          </div>
        </div>
        <div className="rounded-3xl bg-[var(--bg-secondary)] h-[280px] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title="Mis Lirios"
        subtitle="Tus puntos de fidelidad — 1,000 Lirios = S/ 1 de descuento"
        icon={<><img src="/lirio-icon.png" alt="" className="w-6 h-6 sm:w-7 sm:h-7 object-contain dark:hidden" /><img src="/lirio-icon-night.png" alt="" className="w-6 h-6 sm:w-7 sm:h-7 object-contain hidden dark:block" /></>}
      />

      {/* ── Stats summary bar ── */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-sky-100 to-cyan-100 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-2xl border border-sky-200 dark:border-emerald-800/30 p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-500 dark:from-emerald-700 dark:to-teal-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <ArrowDownLeft className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-sky-600 dark:text-emerald-400 uppercase tracking-widest">Ganados</p>
              <p className="text-xl font-black text-sky-700 dark:text-emerald-300">+{totalEarned.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-sky-100 to-cyan-100 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-2xl border border-sky-200 dark:border-emerald-800/30 p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-500 dark:from-emerald-700 dark:to-teal-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <ArrowUpRight className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-sky-600 dark:text-emerald-400 uppercase tracking-widest">Canjeados</p>
              <p className="text-xl font-black text-sky-700 dark:text-emerald-300">-{totalRedeemed.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-sky-100 to-cyan-100 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-2xl border border-sky-200 dark:border-emerald-800/30 p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-500 dark:from-emerald-700 dark:to-teal-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-sky-600 dark:text-emerald-400 uppercase tracking-widest">Total transacciones</p>
              <p className="text-xl font-black text-sky-700 dark:text-emerald-300">{txTotal}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Main grid ── */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* ─── Balance Card ─── */}
        <div className="lg:col-span-2">
          <div
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-cyan-500 to-sky-600 dark:from-emerald-800 dark:via-teal-800 dark:to-emerald-900 shadow-2xl shadow-sky-500/30 dark:shadow-emerald-900/50 p-5 sm:p-6 transition-all duration-700 ${
              animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ backgroundSize: '200% 200%' }}
          >
            {/* Animated sheen that travels across the card */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none animate-gradient-shift" />

            {/* Decorative blobs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
              <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
            </div>

            {/* Decorative SVG flower */}
            <DecorativeFlower className="absolute -top-3 -right-3 w-24 h-24 text-white/10 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full">
                  <Coins className="w-4 h-4 text-white" />
                  <span className="text-xs font-bold text-white tracking-wide uppercase">
                    Billetera Lirios
                  </span>
                </div>
                <button
                  onClick={() => setHidden((h) => !h)}
                  aria-label={hidden ? 'Mostrar saldo' : 'Ocultar saldo'}
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all active:scale-90"
                >
                  {hidden ? (
                    <EyeOff className="w-5 h-5 text-white" />
                  ) : (
                    <Eye className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>

              {error ? (
                <div className="py-8">
                  <p className="text-white/90 text-lg">{error}</p>
                  <BaseButton variant="secondary" size="sm" className="mt-4" onClick={fetchBalance}>
                    Reintentar
                  </BaseButton>
                </div>
              ) : (
                <>
                  <div className="py-1">
                    <p className="text-5xl sm:text-7xl font-black text-white tracking-tight leading-none">
                      <AnimatedNumber value={bal} isHidden={hidden} />
                    </p>
                    <p className="text-sm text-white/80 mt-1.5 font-semibold flex items-center gap-1.5">
                      <Leaf className="w-4 h-4" />
                      Lirios disponibles
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/20 grid grid-cols-2 gap-2">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 hover:bg-white/15 transition-colors">
                      <p className="text-white/70 text-[10px] mb-0.5 font-medium">
                        Valor en descuento
                      </p>
                      <p className="text-white text-xl font-bold">
                        {hidden ? '••••' : `S/ ${(bal * 0.001).toFixed(2)}`}
                      </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 hover:bg-white/15 transition-colors">
                      <p className="text-white/70 text-[10px] mb-0.5 font-medium">Conversión</p>
                      <p className="text-white text-xl font-bold">1,000:1</p>
                    </div>
                  </div>

                  {/* Progress / Tier bar */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-cyan-200" />
                        <span className="text-xs font-bold text-white/90">
                          Nivel <span className="text-cyan-200">{tier.label}</span>
                        </span>
                      </div>
                      {nextTier ? (
                        <span className="text-[10px] text-white/70 font-medium">
                          {bal.toLocaleString()} / {nextTier.min.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-[10px] text-cyan-200 font-bold flex items-center gap-1">
                          <Gift className="w-3 h-3" />
                          ¡Nivel máximo!
                        </span>
                      )}
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-sky-500 transition-all duration-1000 ease-out"
                        style={{ width: `${Math.min(tierProgress, 100)}%` }}
                      />
                    </div>
                    {nextTier && (
                      <p className="text-[10px] text-white/60 mt-1 font-medium">
                        {nextTier.min - bal} Lirios para alcanzar nivel{' '}
                        <span className="font-bold text-white/80">{nextTier.label}</span> (hasta{' '}
                        <span className="font-bold text-white/80">{nextTier.discount}</span> descuento)
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ─── Tier info (right column, row 1) ─── */}
        <div className="bg-gradient-to-br from-white to-sky-50/30 dark:from-[var(--bg-card)] dark:to-emerald-950/20 rounded-3xl border border-sky-200/40 dark:border-emerald-800/20 p-5 shadow-lg">
          <h3 className="text-sm font-bold text-sky-700 dark:text-emerald-400 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Tu progreso
          </h3>
          <div className="space-y-2 max-h-[340px] overflow-y-auto overscroll-contain custom-scrollbar pr-1">
            {TIERS.map((t) => {
              const unlocked = bal >= t.min;
              const isCurrent = tier.label === t.label;
              return (
                <div
                  key={t.label}
                  className={`flex items-center justify-between p-2.5 rounded-2xl transition-all ${
                    unlocked
                      ? 'bg-gradient-to-r from-sky-600 to-sky-800/50 dark:from-emerald-700 dark:to-transparent text-white'
                      : 'bg-[var(--bg-muted)] opacity-50'
                  } ${isCurrent ? 'ring-2 ring-sky-400/50 dark:ring-emerald-500/30' : ''}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Trophy className="w-4 h-4" />
                    <span className={`text-sm font-bold ${unlocked ? 'text-white' : 'text-[var(--text-muted)]'}`}>
                      {t.label}
                    </span>
                  </div>
                  <span className={`text-[10px] font-black uppercase ${unlocked ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>
                    {t.discount}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Quick info (row 2, col 1) ─── */}
        <div className="bg-gradient-to-br from-white to-sky-50/50 dark:from-[var(--bg-card)] dark:to-emerald-950/20 rounded-3xl border border-sky-200/40 dark:border-emerald-800/20 p-5 shadow-lg">
          <h3 className="text-sm font-bold text-sky-600 dark:text-emerald-400 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Información rápida
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-[var(--text-muted)]">Tasa de conversión</span>
              <span className="text-sm font-bold text-sky-600 dark:text-emerald-400">1,000 Lirios = S/ 1</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-[var(--text-muted)]">Descuento máximo</span>
              <span className="text-sm font-bold text-sky-600 dark:text-emerald-400">3% del total</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-[var(--text-muted)]">Mínimo recomendado</span>
              <span className="text-sm font-bold text-sky-600 dark:text-emerald-400">S/ 2.00</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-[var(--text-muted)]">Nivel actual</span>
              <span className={`text-sm font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                {tier.label}
              </span>
            </div>
          </div>
        </div>

        {/* ─── How it works (row 2, col 2) ─── */}
        <div className="bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-3xl border-2 border-sky-300/40 dark:border-emerald-700/20 p-5 shadow-lg">
          <h3 className="text-xs font-bold text-sky-800 dark:text-emerald-300 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Leaf className="w-4 h-4" />
            ¿Cómo funciona?
          </h3>
          <ul className="space-y-2.5 text-xs text-sky-700 dark:text-emerald-300/90 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-sky-500 dark:text-emerald-400 mt-0.5 shrink-0">●</span>
              <span>10 Lirios por cada S/ 1.00 gastado en la plataforma</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sky-500 dark:text-emerald-400 mt-0.5 shrink-0">●</span>
              <span>Úsalos como descuento en tu próximo checkout</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sky-500 dark:text-emerald-400 mt-0.5 shrink-0">●</span>
              <span>Descuento máximo: {tier.discount} del valor venta (sin IGV)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sky-500 dark:text-emerald-400 mt-0.5 shrink-0">●</span>
              <span>Se acreditan automáticamente tras cada compra pagada</span>
            </li>
          </ul>
        </div>

        {/* ─── Minigame (row 2, col 3) ─── */}
        <div className="bg-gradient-to-br from-sky-100 to-cyan-100 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-3xl border-2 border-sky-300/40 dark:border-emerald-700/30 p-5 shadow-lg">
          <h3 className="text-xs font-bold text-sky-800 dark:text-emerald-300 uppercase tracking-wide mb-3 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Minijuego
          </h3>
          <p className="text-xs text-sky-700 dark:text-emerald-300/80 mb-4 leading-relaxed text-center">
            ¿Podrás vencer a la IA en el Tres en Raya?
          </p>
          <p className="text-[10px] text-sky-600 dark:text-emerald-400/80 mb-5 text-center font-medium">
            💎 Modo difícil: gana <span className="font-bold">+2 Lirios</span> por día
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => setGameOpen(true)}
              className="px-5 py-1.5 rounded-xl bg-sky-500 dark:bg-emerald-600 text-white text-sm font-bold hover:bg-sky-600 dark:hover:bg-emerald-700 transition active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Jugar ahora
            </button>
          </div>
        </div>
      </div>

      {rewardToast && (
        <div className="fixed top-4 right-4 z-[110] animate-fade-slide-in bg-sky-100 dark:bg-emerald-900/60 border border-sky-300 dark:border-emerald-700 text-sky-800 dark:text-emerald-200 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-bold">
          <Coins className="w-5 h-5 text-sky-500 dark:text-emerald-400" />
          ¡Has ganado 2 Lirios!
        </div>
      )}
      <LiriosMinigameModal open={gameOpen} onClose={() => setGameOpen(false)} onEarnLirios={handleEarnLirios} />

      {/* ─── Transaction History ─── */}
      <div className="bg-white/80 dark:bg-[var(--bg-card)] backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-[var(--border-subtle)] overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-gray-200/70 dark:border-[var(--border-subtle)] bg-gradient-to-r from-sky-50 to-cyan-50 dark:from-emerald-950/30 dark:to-teal-950/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
                <History className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-[var(--text-primary)]">
                Historial de transacciones
              </h2>
            </div>
            {!txLoading && (
              <span className="text-xs text-gray-500 dark:text-[var(--text-muted)] px-3 py-1.5 bg-white/60 dark:bg-[var(--bg-muted)] rounded-full font-medium shrink-0">
                {txTotal} movimiento{txTotal !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Filter tabs */}
          {!txLoading && transactions.length > 0 && (
            <div className="flex gap-1.5 mt-3">
              {(['all', 'accrue', 'redeem'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    filterTab === tab
                      ? 'bg-white dark:bg-[var(--bg-secondary)] text-sky-700 dark:text-emerald-300 shadow-sm border border-sky-200 dark:border-emerald-800/50'
                      : 'text-gray-500 dark:text-[var(--text-muted)] hover:text-sky-600 dark:hover:text-emerald-400 hover:bg-white/50 dark:hover:bg-[var(--bg-muted)]'
                  }`}
                >
                  {tab === 'all' ? 'Todos' : tab === 'accrue' ? 'Ganados' : 'Canjeados'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Content ── */}
        {txLoading && transactions.length === 0 ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <BaseSkeleton className="w-12 h-12 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <BaseSkeleton className="h-4 w-40" />
                  <BaseSkeleton className="h-3 w-24" />
                </div>
                <BaseSkeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : filteredTxs.length === 0 ? (
          <BaseEmptyState
            icon="Leaf"
            title={
              filterTab === 'all'
                ? 'Aún no tienes movimientos de Lirios'
                : filterTab === 'accrue'
                  ? 'No has ganado Lirios aún'
                  : 'No has canjeado Lirios aún'
            }
            description="¡Realiza tu primera compra para empezar a acumular!"
            actionLabel="Ir a la tienda"
            onAction={() => window.location.href = '/'}
            suggestion={
              filterTab !== 'all' ? 'Prueba cambiando el filtro' : undefined
            }
          />
        ) : (
          <>
            <div className="divide-y divide-gray-100 dark:divide-[var(--border-subtle)] max-h-[460px] overflow-y-auto overscroll-contain custom-scrollbar">
              {filteredTxs.map((tx, idx) => (
                <div
                  key={tx.id}
                  className="px-5 py-3.5 transition-all duration-300 hover:bg-gradient-to-r hover:from-sky-50/50 hover:to-cyan-50/50 dark:hover:from-emerald-950/20 dark:hover:to-teal-950/20 hover:pl-7"
                  style={{
                    animation: `fadeSlideUp 0.4s ease-out forwards`,
                    animationDelay: `${idx * 40}ms`,
                    opacity: 0,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform duration-300 group-hover/card:scale-110 ${
                          tx.type === 'accrue'
                            ? 'bg-gradient-to-br from-sky-100 to-cyan-100 dark:from-emerald-900/40 dark:to-teal-900/40 shadow-sky-200/50 dark:shadow-emerald-900/20'
                            : 'bg-gradient-to-br from-sky-100 to-cyan-100 dark:from-emerald-900/40 dark:to-teal-900/40 shadow-sky-200/50 dark:shadow-emerald-900/20'
                        }`}
                      >
                        {tx.type === 'accrue' ? (
                          <ArrowDownLeft className="w-4 h-4 text-sky-600 dark:text-emerald-400" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-sky-600 dark:text-emerald-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">
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
                        className={`text-lg font-black ${
                          tx.type === 'accrue'
                            ? 'text-sky-600 dark:text-emerald-400'
                            : 'text-sky-600 dark:text-emerald-400'
                        }`}
                      >
                        {tx.type === 'accrue' ? '+' : '-'}
                        {tx.amount}
                      </span>
                      <p className="text-[10px] text-gray-400 dark:text-[var(--text-muted)]">
                        Saldo: <span className="font-bold">{tx.balance_after}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {hasMore && (
              <div className="px-5 py-4 border-t border-gray-100 dark:border-[var(--border-subtle)] text-center">
                <BaseButton
                  variant="ghost"
                  size="sm"
                  onClick={handleLoadMore}
                  isLoading={txLoading}
                  leftIcon="ChevronDown"
                >
                  Cargar más
                </BaseButton>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
