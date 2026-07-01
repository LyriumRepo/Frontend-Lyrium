'use client';

import Icon from '@/components/ui/Icon';
import { InventoryFilters } from '../types';

const STATUS_OPTIONS: { value: InventoryFilters['status']; label: string }[] = [
    { value: 'all',      label: 'Todos'      },
    { value: 'ok',       label: 'Disponible' },
    { value: 'low',      label: 'Bajo'       },
    { value: 'critical', label: 'Crítico'    },
    { value: 'out',      label: 'Agotado'    },
];

interface Props {
    filters: InventoryFilters;
    categories: string[];
    onSearch: (v: string) => void;
    onStatus: (v: InventoryFilters['status']) => void;
    onCategory: (v: string) => void;
}

export function InventoryFiltersBar({ filters, categories, onSearch, onStatus, onCategory }: Props) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            {/* Status tabs — una sola línea, centrada, cabe en cualquier móvil desde 320 px */}
            <div className="flex justify-center sm:justify-start w-full sm:w-auto">
                <div className="flex items-center gap-0.5 sm:gap-1 bg-[var(--bg-secondary)] rounded-xl p-1 border border-[var(--border-subtle)]">
                    {STATUS_OPTIONS.map(({ value, label }) => (
                        <button
                            key={value}
                            onClick={() => onStatus(value)}
                            className={`px-2 sm:px-3 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                filters.status === value
                                    ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm border border-[var(--border-subtle)]'
                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                {/* Search */}
                <div className="relative w-full sm:w-auto">
                    <Icon name="Search" className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-secondary)] pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o SKU…"
                        value={filters.search}
                        onChange={(e) => onSearch(e.target.value)}
                        className="pl-8 pr-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[11px] font-bold text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-sky-500/50 dark:focus:border-[#8FC3A1]/50 transition-colors w-full sm:w-48"
                    />
                </div>

                {/* Category */}
                <div className="relative w-full sm:w-auto">
                    <select
                        value={filters.category}
                        onChange={(e) => onCategory(e.target.value)}
                        className="appearance-none w-full sm:w-auto pl-3 pr-7 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] focus:outline-none focus:border-sky-500/50 dark:focus:border-[#8FC3A1]/50 transition-colors cursor-pointer"
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat === 'all' ? 'Todas las categorías' : cat}
                            </option>
                        ))}
                    </select>
                    <Icon name="ChevronDown" className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-secondary)] pointer-events-none" />
                </div>
            </div>
        </div>
    );
}