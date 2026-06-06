'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { useInventory } from './hooks/useInventory';
import { StockAlertsModal } from './components/StockAlertsModal';
import { InventoryFiltersBar } from './components/InventoryFiltersBar';
import { InventoryTable } from './components/InventoryTable';
import { InventoryStatsBar } from './components/InventoryStatsBar';

export function InventoryPageClient() {
    const { filtered, alerts, stats, filters, categories, setFilter, updateStock } = useInventory();
    const [alertsOpen, setAlertsOpen] = useState(false);

    const headerActions = alerts.length > 0 ? (
        <button
            onClick={() => setAlertsOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-3xl border border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-card)] text-[var(--text-primary)] font-black text-xs 
            hover:bg-[var(--bg-card)] hover:text-[var(--brand-sky)] dark:hover:text-[var(--icons-green)] transition-colors"
        >
            <AlertTriangle className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Alertas</span>
            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-sky-500 dark:bg-[var(--icons-green)] text-white text-[9px] font-black">
                {alerts.length}
            </span>
        </button>
    ) : null;

    return (
        <div className="space-y-8 animate-fadeIn pb-20">

            <ModuleHeader
                title="Inventario"
                subtitle="Control de existencias y alertas de stock."
                icon="Boxes"
                actions={headerActions}
            />

            <InventoryStatsBar stats={stats} />

            <div className="space-y-4">
                <InventoryFiltersBar
                    filters={filters}
                    categories={categories}
                    onSearch={(v) => setFilter('search', v)}
                    onStatus={(v) => setFilter('status', v)}
                    onCategory={(v) => setFilter('category', v)}
                />

                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest px-1">
                    {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
                </p>

                <InventoryTable items={filtered} onUpdateStock={updateStock} />
            </div>

            <StockAlertsModal
                isOpen={alertsOpen}
                alerts={alerts}
                onClose={() => setAlertsOpen(false)}
            />
        </div>
    );
}