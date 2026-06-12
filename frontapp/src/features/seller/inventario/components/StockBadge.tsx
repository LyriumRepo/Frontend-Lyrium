import { StockStatus } from '../types';

const CONFIG: Record<StockStatus, { label: string; className: string }> = {
    ok:       { label: 'Disponible', className: 'bg-sky-700/10 text-sky-700 border-sky-700/20 dark:bg-emerald-500/10 dark:text-emerald-500 dark:border-emerald-500/20'  },
    low:      { label: 'Stock bajo', className: 'bg-sky-300/10 text-sky-400 border-sky-300/20 dark:bg-[#6A9B7B]/10 dark:text-[#6A9B7B] dark:border-[#6A9B7B]'   },
    critical: { label: 'Crítico',    className: 'bg-sky-500/10 text-sky-500 border-sky-500/20 dark:bg-[#8FC3A1]/10 dark:text-[#8FC3A1] dark:border-[#8FC3A1]'   },
    out:      { label: 'Agotado',    className: 'bg-gray-500/10 text-gray-700 border-gray-500/50 dark:bg-gray-200/10 dark:text-gray-200 dark:border-gray-200'   },
};

export function StockBadge({ status }: { status: StockStatus }) {
    const { label, className } = CONFIG[status];
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-widest ${className}`}>
            {label}
        </span>
    );
}