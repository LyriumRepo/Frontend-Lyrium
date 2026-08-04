'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';
import { formatCurrency } from '@/shared/lib/utils/formatters';
import type { InvoiceOrderItem } from './types';

interface Props {
    items?: InvoiceOrderItem[] | null;
}

function itemTypeStyles(itemType: InvoiceOrderItem['itemType']): { bg: string; text: string } {
    return itemType === 'Servicio'
        ? { bg: 'bg-violet-100 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-300' }
        : { bg: 'bg-emerald-100 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-300' };
}

/**
 * "Ítems de la Orden Original" — productos y servicios del pedido que originó
 * el comprobante, con la tienda de cada uno. Se oculta si el pedido no trae ítems.
 */
export default function InvoiceOrderItemsSection({ items }: Props) {
    if (!items || items.length === 0) return null;

    return (
        <div className="space-y-2">
            <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                <Icon name="ShoppingBag" className="w-4 h-4" /> Ítems de la Orden Original
            </h3>
            <div className="border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)]">
                                <th className="text-left px-4 py-2.5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Producto / Servicio</th>
                                <th className="text-center px-3 py-2.5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Tienda</th>
                                <th className="text-center px-3 py-2.5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Cant.</th>
                                <th className="text-right px-3 py-2.5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">P. Unit.</th>
                                <th className="text-right px-4 py-2.5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => {
                                const unitPrice = item.unitPrice > 0
                                    ? item.unitPrice
                                    : (item.quantity > 0 ? item.lineTotal / item.quantity : 0);

                                return (
                                    <tr key={`${item.productName}-${idx}`} className="border-b border-[var(--border-subtle)] last:border-b-0">
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-[var(--text-primary)]">{item.productName || '—'}</p>
                                            {item.itemType && (
                                                <span className={`inline-block mt-1 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${itemTypeStyles(item.itemType).bg} ${itemTypeStyles(item.itemType).text}`}>
                                                    {item.itemType}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-3 py-3 text-center text-xs font-semibold text-teal-600 dark:text-teal-300">{item.storeName ?? '—'}</td>
                                        <td className="px-3 py-3 text-center text-[var(--text-secondary)]">{item.quantity}</td>
                                        <td className="px-3 py-3 text-right text-[var(--text-secondary)]">{formatCurrency(unitPrice)}</td>
                                        <td className="px-4 py-3 text-right font-bold text-[var(--text-primary)]">{formatCurrency(item.lineTotal)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
