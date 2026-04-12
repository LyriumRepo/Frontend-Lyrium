import React from 'react';
import { InventoryItem, ItemStatus } from '@/lib/types/admin/inventory';
import { Globe, AlertTriangle, CheckCircle2, XCircle, MoreVertical, Edit2, History } from 'lucide-react';

const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    gray: 'bg-gray-50 text-gray-400 border-gray-100',
};

const StatusBadge: React.FC<{ status: ItemStatus }> = ({ status }) => {
    const config: Record<ItemStatus, { label: string, color: string, icon: React.ReactNode }> = {
        'IN_STOCK': { label: 'En Stock', color: 'emerald', icon: <CheckCircle2 className="w-3 h-3" /> },
        'LOW_STOCK': { label: 'Bajo Stock', color: 'amber', icon: <AlertTriangle className="w-3 h-3" /> },
        'OUT_OF_STOCK': { label: 'Agotado', color: 'rose', icon: <XCircle className="w-3 h-3" /> },
        'ACTIVE': { label: 'Activo', color: 'blue', icon: <Globe className="w-3 h-3" /> },
        'INACTIVE': { label: 'Inactivo', color: 'gray', icon: <XCircle className="w-3 h-3" /> },
    };

    const { label, color, icon } = config[status] || config['INACTIVE'];

    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border font-industrial ${colorMap[color]}`}>
            {icon} {label}
        </span>
    );
};

export const InventoryTable: React.FC<{
    items: InventoryItem[],
    onUpdateStock: (id: string, newStock: number) => void,
    onEdit?: (item: InventoryItem) => void,
    onViewHistory?: (item: InventoryItem) => void
}> = ({ items, onUpdateStock, onEdit, onViewHistory }) => {
    return (
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden font-industrial">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left font-industrial">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                            <th className="px-10 py-6">Identificador / SKU</th>
                            <th className="px-8 py-6">Entidad Vendedora</th>
                            <th className="px-8 py-6">Clasificación</th>
                            <th className="px-8 py-6 text-right">Valoración</th>
                            <th className="px-8 py-6 text-center">Unidades Disp.</th>
                            <th className="px-8 py-6">Estatus</th>
                            <th className="px-10 py-6 text-right">Gestión</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {items.map(item => (
                            <tr key={item.id} className="hover:bg-indigo-50/20 transition-all group">
                                <td className="px-10 py-7">
                                    <p className="text-xs font-black text-gray-900 uppercase group-hover:text-indigo-600 transition-colors">{item.name}</p>
                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1">REF: {item.sku || '---'}</p>
                                </td>
                                <td className="px-8 py-7">
                                    <p className="text-xs font-black text-gray-700 uppercase tracking-tight">{item.seller.name}</p>
                                    <p className="text-[9px] text-gray-400 font-black uppercase italic">ID Nodo {item.seller.id}</p>
                                </td>
                                <td className="px-8 py-7">
                                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider ${item.type === 'PRODUCT' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                                        {item.type === 'PRODUCT' ? 'Producto Físico' : 'Servicio Digital'}
                                    </span>
                                </td>
                                <td className="px-8 py-7 text-right">
                                    <span className="text-xs font-black text-gray-900 tracking-tighter italic">S/ {item.price.toLocaleString()}</span>
                                </td>
                                <td className="px-8 py-7 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className={`text-sm font-black italic ${item.stock < 5 ? 'text-rose-500' : 'text-gray-900'}`}>{item.stock}</span>
                                        <div className="flex gap-1.5 translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                                            <button
                                                onClick={() => onUpdateStock(item.id, Math.max(0, item.stock - 1))}
                                                className="w-6 h-6 flex items-center justify-center bg-white border border-gray-100 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-lg text-[10px] font-black shadow-sm transition-all active:scale-90"
                                            >-</button>
                                            <button
                                                onClick={() => onUpdateStock(item.id, item.stock + 1)}
                                                className="w-6 h-6 flex items-center justify-center bg-white border border-gray-100 hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 rounded-lg text-[10px] font-black shadow-sm transition-all active:scale-90"
                                            >+</button>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-7">
                                    <StatusBadge status={item.status} />
                                </td>
                                <td className="px-10 py-7 text-right">
                                    <div className="flex items-center justify-end gap-3 translate-x-2 opacity-60 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                                        <button
                                            onClick={() => onEdit?.(item)}
                                            className="p-3 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all active:scale-90 shadow-sm"
                                            title="Protocolo de Edición"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onViewHistory?.(item)}
                                            className="p-3 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-white border border-transparent hover:border-gray-100 rounded-2xl transition-all active:scale-90 shadow-sm"
                                            title="Trazabilidad Focal"
                                        >
                                            <History className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
