'use client';

import { AlertTriangle, X, ShoppingCart } from 'lucide-react';
import Icon from '@/components/ui/Icon';
import { InventoryItem } from '../types';
import { getStockStatus } from '../hooks/useInventory';
import { StockBadge } from './StockBadge';

const SEVERITY: Record<string, number> = { out: 0, critical: 1, low: 2 };

interface Props {
    isOpen: boolean;
    alerts: InventoryItem[];
    onClose: () => void;
}

export function StockAlertsModal({ isOpen, alerts, onClose }: Props) {
    if (!isOpen) return null;

    const sorted = [...alerts].sort(
        (a, b) => SEVERITY[getStockStatus(a)] - SEVERITY[getStockStatus(b)]
    );

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="fixed inset-0 z-[70] bg-black/25 backdrop-blur-[2px] transition-opacity duration-200"
            />

            {/* Panel */}
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 pointer-events-none">
                <div className="w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[80vh]">

                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)] flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-sky-500/10 dark:bg-[#8FC3A1]/10 rounded-xl flex items-center justify-center border border-sky-500/20 dark:border-[#8FC3A1]/20 text-sky-500 dark:text-[#8FC3A1]">
                                <AlertTriangle className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">
                                    Alertas de Stock
                                </h3>
                                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">
                                    {alerts.length} producto{alerts.length !== 1 ? 's' : ''} requieren atención
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-y-auto flex-1">
                        <table className="w-full border-separate border-spacing-0">
                            <thead className="sticky top-0">
                                <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)]">
                                    {['SKU', 'Producto', 'Disponible', 'Estado'].map((h, i, arr) => (
                                        <th
                                            key={h}
                                            className={`px-4 py-2.5 text-left text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]
                                                ${i === 0 ? 'rounded-tl-2xl' : ''}
                                                ${i === arr.length - 1 ? 'rounded-tr-2xl' : ''}`}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sorted.map((item) => {
                                    const available = Math.max(0, item.stock - (item.reserved ?? 0));
                                    const status    = getStockStatus(item);
                                    return (
                                        <tr
                                            key={item.id}
                                            className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)] transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-[10px] font-bold text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded-lg border border-[var(--border-subtle)]">
                                                    {item.sku}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-[11px] font-bold text-[var(--text-primary)]">{item.name}</p>
                                                <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wide mt-0.5">{item.category}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`font-mono font-black text-sm ${
                                                    available === 0 ? 'text-gray-500 dark:text-gray-300' :
                                                    status === 'critical' ? 'text-sky-500 dark:text-[#8FC3A1]' : 'text-sky-400 dark:text-[#6A9B7B]'
                                                }`}>
                                                    {available}
                                                </span>
                                                <span className="text-[9px] font-bold text-[var(--text-secondary)] ml-1">uds.</span>
                                            </td>
                                            <td className="px-4 py-3">
                                             <div className={status === 'out' ? 'opacity-50' : ''}>
                                                <StockBadge status={status} />
                                             </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}