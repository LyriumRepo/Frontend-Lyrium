'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import Icon from '@/components/ui/Icon';
import { InventoryItem } from '../types';
import { getStockStatus } from '../hooks/useInventory';
import { StockBadge } from './StockBadge';

interface Props {
    items: InventoryItem[];
    onUpdateStock: (id: string, stock: number) => void;
}

const HEADERS = ['SKU', 'Producto', 'Categoría', 'Stock', 'Disponible', 'Estado', 'Editar Stock'];

export function InventoryTable({ items, onUpdateStock }: Props) {
    const [editing, setEditing] = useState<{ id: string; value: string } | null>(null);

    const startEdit  = (item: InventoryItem) => setEditing({ id: item.id, value: String(item.stock) });
    const cancelEdit = () => setEditing(null);
    const confirmEdit = (item: InventoryItem) => {
        const val = parseInt(editing?.value ?? '', 10);
        if (!isNaN(val) && val >= 0) onUpdateStock(item.id, val);
        setEditing(null);
    };

    if (items.length === 0) {
        return (
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] py-16 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                    Sin resultados para los filtros aplicados
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden">
            <table className="w-full border-separate border-spacing-0">
                <thead>
                    <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)]">
                        {HEADERS.map((h, i, arr) => (
                            <th
                                key={i}
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
                    {items.map((item) => {
                        const available = Math.max(0, item.stock - (item.reserved ?? 0));
                        const status    = getStockStatus(item);
                        const isEditing = editing?.id === item.id;

                        return (
                            <tr
                                key={item.id}
                                className={`border-b border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)] transition-colors ${
                                    status === 'out' ? 'opacity-50' : ''
                                }`}
                            >
                                {/* SKU */}
                                <td className="px-4 py-3">
                                    <span className="font-mono text-[10px] font-bold text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded-lg border border-[var(--border-subtle)]">
                                        {item.sku}
                                    </span>
                                </td>

                                {/* Name */}
                                <td className="px-4 py-3">
                                    <p className="text-[11px] font-bold text-[var(--text-primary)]">{item.name}</p>
                                </td>

                                {/* Category */}
                                <td className="px-4 py-3">
                                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">{item.category}</p>
                                </td>

                                {/* Stock — editable */}
                                <td className="px-4 py-3">
                                    {isEditing ? (
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="number"
                                                min={0}
                                                autoFocus
                                                value={editing.value}
                                                onChange={(e) => setEditing({ id: item.id, value: e.target.value })}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter')  confirmEdit(item);
                                                    if (e.key === 'Escape') cancelEdit();
                                                }}
                                                className="w-16 px-2 py-1 text-[11px] font-mono font-bold rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:border-sky-500/50 dark:focus:border-[#8FC3A1]/50"
                                            />
                                            <button onClick={() => confirmEdit(item)} className="w-6 h-6 flex items-center justify-center rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-colors">
                                                <Check className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={cancelEdit} className="w-6 h-6 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="font-mono text-[11px] font-bold text-[var(--text-primary)]">{item.stock}</span>
                                    )}
                                </td>

                                {/* Available */}
                                <td className="px-4 py-3">
                                    <span className={`font-mono text-[11px] font-black ${
                                        available === 0   ? 'text-gray-700 dark:text-gray-300'    :
                                        status === 'critical' ? 'text-sky-500 dark:text-[#8FC3A1]' :
                                        status === 'low'      ? 'text-sky-400 dark:text-[#6A9B7B]'  :
                                        'text-sky-700 dark:text-emerald-500'
                                    }`}>
                                        {available}
                                    </span>
                                </td>

                                {/* Status */}
                                <td className="px-4 py-3">
                                    <StockBadge status={status} />
                                </td>

                                {/* Edit action */}
                                <td className="px-4 py-3">
                                    {!isEditing && (
                                        <button
                                            onClick={() => startEdit(item)}
                                            className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors border border-transparent hover:border-[var(--border-subtle)]"
                                            title="Editar stock"
                                        >
                                            <Icon name="Pencil" className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}