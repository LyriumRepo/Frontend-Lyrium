import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/ui/Icon';

interface StoreStatus {
    storeId: number;
    storeName: string;
    isOwn: boolean;
    confirmed: boolean;
}

interface MultiStoreStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    stores: StoreStatus[];
}

export default function MultiStoreStatusModal({ isOpen, onClose, stores }: MultiStoreStatusModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    if (!isOpen || !mounted) return null;

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    return createPortal(
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xl z-[100000] flex justify-center items-center p-4 animate-fadeIn"
            onClick={onClose}
            onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
        >
            <div
                className="bg-white dark:bg-[var(--bg-secondary)] w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-white/20 relative flex flex-col"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-[var(--turquesa-500)] to-[var(--verde-500)] px-5 py-4 text-white flex-shrink-0 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                            <Icon name="Store" className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-black leading-none">Pedido de varias tiendas</h3>
                            <p className="text-[9px] font-semibold text-emerald-100 uppercase tracking-widest mt-0.5">
                                Estado por tienda
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-all"
                    >
                        <Icon name="X" className="w-4 h-4 text-white" />
                    </button>
                </div>

                <div className="p-5 space-y-3">
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                        Este pedido incluye productos de otras tiendas. El seguimiento de tu parte avanza de forma
                        independiente, pero puede que aún esperes a que las demás confirmen la suya.
                    </p>

                    <div className="space-y-2">
                        {stores.map((store) => (
                            <div
                                key={store.storeId}
                                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)]/40"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <Icon name="Store" className="w-3.5 h-3.5 text-[var(--text-secondary)] flex-shrink-0" />
                                    <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                                        {store.storeName}{store.isOwn ? ' (tú)' : ''}
                                    </span>
                                </div>
                                <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                                    store.confirmed
                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                }`}>
                                    <Icon name={store.confirmed ? 'CheckCircle' : 'Clock'} className="w-3 h-3" />
                                    {store.confirmed ? 'Confirmado' : 'Pendiente'}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center pt-1">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-[var(--bg-muted)] text-slate-700 dark:text-[var(--text-primary)] font-bold text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-[#2A3F33] transition-all"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        modalRoot,
    );
}
