'use client';

import { useMemo } from 'react';
import { Leaf, Sprout, Sun, Wind } from 'lucide-react';

const ECO_MESSAGES = [
  { icon: Sprout, text: 'La naturaleza se toma su tiempo — algo bueno está creciendo aquí.' },
  { icon: Leaf, text: 'Cada gran cosecha empieza con paciencia. Vuelve pronto.' },
  { icon: Sun, text: 'Cultivando algo especial para ti, con calma y a conciencia.' },
  { icon: Wind, text: 'Un espacio fresco, listo para florecer muy pronto.' },
];

export default function EmptyStoreState() {
  const { icon: Icon, text } = useMemo(
    () => ECO_MESSAGES[Math.floor(Math.random() * ECO_MESSAGES.length)],
    []
  );

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-slate-100 dark:border-[var(--border-subtle)] bg-gradient-to-br from-emerald-50 via-sky-50 to-white dark:from-[var(--bg-card)] dark:via-[var(--bg-secondary)] dark:to-[var(--bg-card)] min-h-[280px] sm:min-h-[380px] flex items-center justify-center px-6 text-center">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-sky-400/10 dark:from-[var(--brand-green)]/10 dark:to-[var(--icons-green)]/10 pointer-events-none" />

      <div className="relative flex flex-col items-center gap-5">
        <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-emerald-400 to-sky-400 dark:from-[var(--brand-green)] dark:to-[var(--icons-green)] shadow-lg shadow-sky-500/20 dark:shadow-[#8FC3A1]/40 flex items-center justify-center">
          <img src="/img/iconologo.png" alt="Lyrium" className="w-11 h-11 sm:w-16 sm:h-16 object-contain" />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-[var(--bg-card)] border-2 border-white dark:border-[var(--bg-card)] shadow-md flex items-center justify-center">
            <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-emerald-500 dark:text-[var(--icons-green)]" />
          </div>
        </div>

        <p className="text-base sm:text-lg font-semibold text-slate-700 dark:text-[var(--text-primary)] max-w-sm leading-relaxed">
          {text}
        </p>

        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-[var(--icons-green)] bg-white/70 dark:bg-[var(--bg-card)]/70 border border-emerald-100 dark:border-[var(--border-subtle)] px-3 py-1.5 rounded-full">
          <Leaf className="w-3 h-3" /> Lyrium
        </span>
      </div>
    </div>
  );
}
