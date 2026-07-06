'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseLoading from '@/components/ui/BaseLoading';
import Icon from '@/components/ui/Icon';
import { useInventory } from './hooks/useInventory';
import { exportInventoryToExcel, exportInventoryToPdf } from './export';
import { StockAlertsModal } from './components/StockAlertsModal';
import { InventoryFiltersBar } from './components/InventoryFiltersBar';
import { InventoryTable } from './components/InventoryTable';
import { InventoryStatsBar } from './components/InventoryStatsBar';

export function InventoryPageClient() {
    const {
        pagedItems, currentPage, totalPages, totalItems,
        alerts, stats, filters, categories, isLoading, error,
        setFilter, updateStock, goToPage, nextPage, prevPage,
    } = useInventory();
    const [alertsOpen, setAlertsOpen] = useState(false);

    const headerActions = (
        <div className="flex items-center gap-2">
            {alerts.length > 0 && (
                <button
                    onClick={() => setAlertsOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-3xl border border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-card)] text-[var(--text-primary)] font-black text-xs hover:bg-[var(--bg-card)] hover:text-[var(--brand-sky)] dark:hover:text-[var(--icons-green)] transition-colors"
                >
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Alertas</span>
                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-sky-500 dark:bg-[var(--icons-green)] text-white text-[9px] font-black">
                        {alerts.length}
                    </span>
                </button>
            )}
            <button
                onClick={() => exportInventoryToExcel(pagedItems).catch(console.error)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-primary)] font-bold text-xs border border-[var(--border-subtle)] hover:text-[#5AAFE6] hover:border-[#69BEEB]/30 transition-all shadow-sm"
            >
                <Icon name="FileSpreadsheet" className="text-xl" />
                <span className="hidden sm:inline">Excel</span>
            </button>
            <button
                onClick={() => exportInventoryToPdf(pagedItems).catch(console.error)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-primary)] font-bold text-xs border border-[var(--border-subtle)] hover:text-[#5AAFE6] hover:border-[#69BEEB]/30 transition-all shadow-sm"
            >
                <Icon name="FileText" className="text-xl" />
                <span className="hidden sm:inline">PDF</span>
            </button>
        </div>
    );

    if (isLoading) {
        return (
            <div className="space-y-8 animate-fadeIn pb-20">
                <ModuleHeader
                    title="Inventario"
                    subtitle="Control de existencias y alertas de stock."
                    icon="Boxes"
                />
                <BaseLoading message="Cargando inventario..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-8 animate-fadeIn pb-20">
                <ModuleHeader
                    title="Inventario"
                    subtitle="Control de existencias y alertas de stock."
                    icon="Boxes"
                />
                <div className="rounded-2xl border border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-800/30 py-12 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-500">
                        {error}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-200 dark:border-red-800/30 hover:bg-red-500/20 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn pb-20">

            <ModuleHeader
                title="Inventario"
                subtitle="Control de existencias y alertas de stock."
                icon="Boxes"
            />

            <InventoryStatsBar stats={stats} />

            <div className="space-y-4">
                <InventoryFiltersBar
                    filters={filters}
                    categories={categories}
                    onSearch={(v) => setFilter('search', v)}
                    onStatus={(v) => setFilter('status', v)}
                    onCategory={(v) => setFilter('category', v)}
                    actions={headerActions}
                />

                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest px-1">
                    {totalItems} producto{totalItems !== 1 ? 's' : ''}
                    {totalPages > 1 && (
                        <span className="text-[var(--text-secondary)] font-normal normal-case tracking-normal">
                            {' · Página '}{currentPage} de {totalPages}
                        </span>
                    )}
                </p>

                <InventoryTable items={pagedItems} onUpdateStock={updateStock} />

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-1 pt-1">
                        <div />
                        <div className="flex items-center gap-1">
                            <button
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                className="w-7 h-7 flex items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <Icon name="ChevronLeft" className="w-3.5 h-3.5" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => goToPage(page)}
                                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-black transition-colors
                                        ${currentPage === page
                                            ? 'bg-sky-500/20 dark:bg-[#8FC3A1]/20 text-sky-500 dark:text-[#8FC3A1] border border-sky-500/30 dark:border-[#8FC3A1]/30'
                                            : 'border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={nextPage}
                                disabled={currentPage === totalPages}
                                className="w-7 h-7 flex items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <Icon name="ChevronRight" className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <StockAlertsModal
                isOpen={alertsOpen}
                alerts={alerts}
                onClose={() => setAlertsOpen(false)}
            />
        </div>
    );
}
