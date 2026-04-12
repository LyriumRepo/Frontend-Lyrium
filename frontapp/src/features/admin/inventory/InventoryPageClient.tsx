'use client';

import React, { useState } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseButton from '@/components/ui/BaseButton';
import Skeleton from '@/components/ui/Skeleton';
import Icon from '@/components/ui/Icon';
import ModalsPortal from '@/components/layout/shared/ModalsPortal';
import { useInventory } from '@/features/admin/inventory/hooks/useInventory';
import { InventoryTable } from '@/components/admin/inventory/InventoryTable';
import { Search, Package, Activity, AlertCircle, ShoppingBag, X, Eye, Download, RefreshCw } from 'lucide-react';
import { InventoryItem } from '@/lib/types/admin/inventory';

const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
};

interface InventoryPageClientProps {
    // TODO Tarea 3
}

export function InventoryPageClient(_props: InventoryPageClientProps) {
    const { items, loading, error, stats, sellers, filters, setFilters, updateProductDetails, refresh } = useInventory();

    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);

    const handleExport = () => {
        if (!items.length) return;
        const headers = ['ID', 'Nombre', 'SKU', 'Tipo', 'Vendedor', 'Categoria', 'Precio', 'Stock', 'Estado'];
        const csvContent = [
            headers.join(','),
            ...items.map(i => [
                i.id,
                `"${i.name}"`,
                i.sku,
                i.type,
                `"${i.seller.name}"`,
                `"${i.category}"`,
                i.price,
                i.stock,
                i.status
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const dateStr = new Date().toISOString().split('T')[0];
        link.setAttribute('href', url);
        link.setAttribute('download', `inventario-maestro-${dateStr}.csv`);
        link.click();
    };

    return (
        <div className="space-y-8 animate-fadeIn font-industrial pb-20">
            <ModuleHeader
                title="Gestión de Inventario"
                subtitle="Control Maestro de Stock y Oferta de Servicios WP (RF-04, RF-10)"
                icon="Package"
                actions={
                    <div className="flex gap-3">
                        <BaseButton
                            onClick={() => refresh()}
                            variant="ghost"
                            size="md"
                            className="bg-white border border-gray-100 shadow-sm"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </BaseButton>
                        <BaseButton
                            onClick={handleExport}
                            variant="primary"
                            leftIcon="Download"
                            size="md"
                        >
                            Exportar Data-Sheet
                        </BaseButton>
                    </div>
                }
            />

            {error && (
                <div className="p-6 bg-rose-50 border border-rose-100 rounded-[2rem] flex items-center gap-4 text-rose-600 font-bold text-sm">
                    <Icon name="AlertTriangle" className="w-5 h-5" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Unidades en Sistema', val: stats.totalItems, icon: <Package />, color: 'blue' },
                    { label: 'Riesgo de Quiebre', val: stats.lowStockCount, icon: <AlertCircle />, color: 'amber' },
                    { label: 'Agotados (Stock Out)', val: stats.outOfStockCount, icon: <Activity />, color: 'rose' },
                    { label: 'Servicios de Terceros', val: stats.activeServices, icon: <ShoppingBag />, color: 'emerald' }
                ].map((s) => (
                    <div key={s.label} className={`bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-4 ${colorClasses[s.color]} rounded-2xl`}>
                                {s.icon}
                            </div>
                            <span className="text-3xl font-black text-gray-900 tracking-tighter">
                                {loading ? <Skeleton className="h-8 w-12" /> : s.val}
                            </span>
                        </div>
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors italic">{s.label}</h3>
                    </div>
                ))}
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-end">
                    <div className="lg:col-span-1 space-y-2 w-full">
                        <label htmlFor="filter-search" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Radar de Filtros</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                id="filter-search"
                                type="text"
                                placeholder="Nombre, SKU o Ticket Ref..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-xs font-black focus:ring-2 focus:ring-blue-500/10 font-industrial transition-all"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="filter-seller" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Vendedor / Nodo</label>
                        <select
                            id="filter-seller"
                            value={filters.seller}
                            onChange={(e) => setFilters(prev => ({ ...prev, seller: e.target.value }))}
                            className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl text-[10px] font-black uppercase text-gray-700 font-industrial cursor-pointer"
                            disabled={loading}
                        >
                            <option value="ALL">Todas las Entidades</option>
                            {sellers.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="filter-type" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Clasificación</label>
                        <select
                            id="filter-type"
                            value={filters.type}
                            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
                            className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl text-[10px] font-black uppercase text-gray-700 font-industrial cursor-pointer"
                            disabled={loading}
                        >
                            <option value="ALL">Todo Tipo</option>
                            <option value="PRODUCT">Producto Físico</option>
                            <option value="SERVICE">Servicio Digital</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="filter-status" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Estado Operativo</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                            className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl text-[10px] font-black uppercase text-gray-700 font-industrial cursor-pointer"
                            disabled={loading}
                        >
                            <option value="ALL">Cualquier Estado</option>
                            <option value="IN_STOCK">En Existencia</option>
                            <option value="LOW_STOCK">Riesgo Alto</option>
                            <option value="OUT_OF_STOCK">Sin Existencias</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading && items.length === 0 ? (
                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden p-10 space-y-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={`inv-skel-${i}`} className="flex items-center gap-6">
                            <Skeleton className="h-16 w-16 rounded-2xl" />
                            <div className="flex-1 space-y-3">
                                <Skeleton className="h-4 w-1/3 rounded" />
                                <Skeleton className="h-3 w-1/4 rounded" />
                            </div>
                            <Skeleton className="h-10 w-24 rounded-xl" />
                        </div>
                    ))}
                </div>
            ) : (
                <InventoryTable
                    items={items}
                    onUpdateStock={(id, ns) => updateProductDetails(id, ns, items.find(i => i.id === id)?.price || 0)}
                    onEdit={(item) => setSelectedItem(item)}
                    onViewHistory={(item) => setHistoryItem(item)}
                />
            )}

            {selectedItem && (
                <ModalsPortal>
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md animate-fadeIn" onClick={() => setSelectedItem(null)} role="presentation" aria-hidden="true" />
                        <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative overflow-hidden p-12 animate-scaleUp font-industrial">
                            <div className="h-3 w-full absolute top-0 left-0 bg-indigo-600"></div>
                            <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic mb-2">Protocolo de Edición</h3>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-10 italic">Ref: {selectedItem.sku} | Vendedor: {selectedItem.seller.name}</p>
                            <div className="space-y-8">
                                <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Item Identificado</p>
                                    <p className="text-lg font-black text-gray-900 uppercase italic opacity-80">{selectedItem.name}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="edit-stock" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Stock Operativo</label>
                                        <input type="number" defaultValue={selectedItem.stock} id="edit-stock" className="w-full p-5 bg-gray-50 border-none rounded-2xl text-xl font-black text-indigo-600 focus:ring-2 focus:ring-indigo-500/10" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="edit-price" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Valor Unitario (S/)</label>
                                        <input type="number" step="0.01" defaultValue={selectedItem.price} id="edit-price" className="w-full p-5 bg-gray-50 border-none rounded-2xl text-xl font-black text-gray-900 focus:ring-2 focus:ring-indigo-500/10" />
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <BaseButton onClick={async () => {
                                        const ns = (document.getElementById('edit-stock') as HTMLInputElement).value;
                                        const np = (document.getElementById('edit-price') as HTMLInputElement).value;
                                        await updateProductDetails(selectedItem.id, parseInt(ns), parseFloat(np));
                                        setSelectedItem(null);
                                    }} variant="primary" className="flex-1 h-16 rounded-2xl shadow-xl shadow-indigo-100">
                                        Comprometer Cambios
                                    </BaseButton>
                                    <BaseButton onClick={() => setSelectedItem(null)} variant="ghost" className="w-16 h-16 rounded-2xl bg-gray-50 p-0">
                                        <X className="w-5 h-5" />
                                    </BaseButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalsPortal>
            )}

            {historyItem && (
                <ModalsPortal>
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-fadeIn" onClick={() => setHistoryItem(null)} role="presentation" aria-hidden="true" />
                        <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl relative overflow-hidden p-12 animate-scaleUp font-industrial">
                            <div className="h-3 w-full absolute top-0 left-0 bg-emerald-500"></div>
                            <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic mb-2">Forensics & Trazabilidad</h3>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-10">Auditoría de Movimientos: {historyItem.name}</p>
                            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-4 custom-scrollbar">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={`history-${i}`} className="flex items-center gap-6 p-6 border-l-4 border-emerald-400 bg-gray-50/50 rounded-r-[2rem]">
                                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0">
                                            {i === 1 ? <Activity className="w-6 h-6 text-emerald-600" /> : <Eye className="w-6 h-6 text-blue-600" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <p className="text-[11px] font-black text">Ajuste de-gray-900 uppercase Existencias</p>
                                                <p className="text-[9px] text-gray-400 font-black uppercase">21 FEB 2026</p>
                                            </div>
                                            <p className="text-[11px] text-gray-500 mt-1 font-medium italic opacity-70">Operación autorizada por Sistema Central Lyrium.</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <BaseButton onClick={() => setHistoryItem(null)} variant="primary" className="w-full mt-10 h-16 rounded-2xl bg-gray-900 hover:bg-black">
                                Cerrar Bitácora
                            </BaseButton>
                        </div>
                    </div>
                </ModalsPortal>
            )}
        </div>
    );
}
