import { InventoryStats } from '../types';

const CARDS = [
    { key: 'total'    as const, label: 'Total',       color: 'text-[var(--text-primary)]',          bg: 'bg-[var(--bg-secondary)] border-[var(--border-subtle)]' },
    { key: 'ok'       as const, label: 'Disponibles', color: 'text-emerald-500',                    bg: 'bg-emerald-500/5 border-emerald-500/20'                  },
    { key: 'low'      as const, label: 'Stock bajo',  color: 'text-sky-400 dark:text-[#6A9B7B]',    bg: 'bg-sky-300/5 dark:bg-[#6A9B7B]/5 border-sky-300/20 dark:border-[#6A9B7B]/20'                      },
    { key: 'critical' as const, label: 'Críticos',    color: 'text-sky-500 dark:text-[#8FC3A1]',    bg: 'bg-sky-500/5 dark:bg-[#8FC3A1]/5 border-sky-500/20 dark:border-[#8FC3A1]/30'                    },
    { key: 'out'      as const, label: 'Agotados',    color: 'text-gray-500 dark:text-gray-400',    bg: 'bg-gray-500/5 dark:bg-gray-300/5 border-gray-500/20 dark:border-gray-300/20'                          },
];

export function InventoryStatsBar({ stats }: { stats: InventoryStats }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {CARDS.map(({ key, label, color, bg }) => (
                <div key={key} className={`rounded-2xl border px-4 py-3.5 ${bg}`}>
                    <p className={`text-2xl font-black font-mono tracking-tight ${color}`}>{stats[key]}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mt-0.5">{label}</p>
                </div>
            ))}
        </div>
    );
}