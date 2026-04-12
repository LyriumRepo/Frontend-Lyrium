import React from 'react';
import { OrderItem, ITEM_STATUS_LABELS, ItemStatus } from '@/features/seller/sales/types';
import Icon from '@/components/ui/Icon';

interface OrderItemListProps {
    items: OrderItem[];
    onConfirmItem?: (itemId: string) => void;
    onCancelItem?: (itemId: string) => void;
    onUpdateItemStatus?: (itemId: string, status: ItemStatus) => void;
}

const getStatusBadgeStyles = (status: ItemStatus) => {
    const styles: Record<ItemStatus, { bg: string; text: string; icon: string }> = {
        pending_seller: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', icon: 'Clock' },
        confirmed: { bg: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-700 dark:text-sky-400', icon: 'Check' },
        processing: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400', icon: 'Package' },
        shipped: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: 'Truck' },
        delivered: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', icon: 'CheckCircle' },
        cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: 'X' },
    };
    return styles[status] || styles.pending_seller;
};

export default function OrderItemList({ items, onConfirmItem, onCancelItem, onUpdateItemStatus }: OrderItemListProps) {
    return (
        <div className="space-y-px rounded-[2rem] overflow-hidden border border-[var(--border-subtle)]">
            {items.map((item, index) => {
                const itemKey = item.id || item.name || `item-${index}`;
                const statusStyle = getStatusBadgeStyles(item.status);
                return (
                <div
                    key={itemKey}
                    className="bg-[var(--bg-secondary)]/30 p-4 flex justify-between items-center group hover:bg-[var(--bg-card)] transition-all"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--bg-card)] rounded-xl flex items-center justify-center text-[10px] font-black text-[var(--text-secondary)] group-hover:text-emerald-500 transition-colors shadow-sm">
                            x{item.qty}
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="text-xs font-black text-[var(--text-primary)] uppercase leading-none">{item.name}</p>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${statusStyle.bg} ${statusStyle.text}`}>
                                <Icon name={statusStyle.icon} className="w-3 h-3" />
                                {ITEM_STATUS_LABELS[item.status]}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <p className="text-sm font-black text-[var(--text-primary)]">
                            S/ {(item.qty * item.price).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </p>
                        <div className="flex gap-1">
                            {item.can_confirm && onConfirmItem && (
                                <button
                                    onClick={() => onConfirmItem(item.id)}
                                    className="p-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                                    title="Confirmar item"
                                >
                                    <Icon name="Check" className="w-4 h-4" />
                                </button>
                            )}
                            {item.can_cancel && onCancelItem && (
                                <button
                                    onClick={() => onCancelItem(item.id)}
                                    className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                                    title="Cancelar item"
                                >
                                    <Icon name="X" className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                );
            })}
        </div>
    );
}
