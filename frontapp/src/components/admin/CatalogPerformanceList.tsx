'use client';

import React, { useEffect, useState } from 'react';
import { getProducts, getOrders } from '@/shared/lib/api';
import { Product, Order, OrderLineItem } from '@/lib/types/wp/wp-types';
import Icon from '@/components/ui/Icon';

export default function CatalogPerformanceList() {
    const [performance, setPerformance] = useState<{ stars: any[], bones: any[] }>({ stars: [], bones: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const analyzeCatalog = async () => {
            try {
                setLoading(true);
                const [products, orders] = await Promise.all([getProducts(), getOrders()]);

                // Contar ventas por producto
                const productSales: { [key: number]: number } = {};
                orders.forEach((order: Order) => {
                    order.line_items.forEach((item: OrderLineItem) => {
                        productSales[item.product_id] = (productSales[item.product_id] || 0) + item.quantity;
                    });
                });

                // Clasificar
                const starProducts = products
                    .map(p => ({ ...p, sales: productSales[p.id] || 0 }))
                    .sort((a, b) => b.sales - a.sales)
                    .slice(0, 3);

                const boneProducts = products
                    .filter(p => (productSales[p.id] || 0) === 0)
                    .slice(0, 3);

                setPerformance({ stars: starProducts, bones: boneProducts });
            } catch (error) {
                console.error('Error analyzing catalog:', error);
            } finally {
                setLoading(false);
            }
        };

        analyzeCatalog();
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-4 animate-pulse">
                {[1, 2, 3, 4].map((i) => <div key={`catalog-skel-${i}`} className="h-12 bg-gray-50 rounded-2xl w-full"></div>)}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col transition-all hover:shadow-md h-full">
            <h3 className="text-gray-900 font-black uppercase tracking-widest text-xs mb-6">Desempeño del Catálogo</h3>

            <div className="space-y-6">
                {/* Estrellas */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Icon name="Star" className="text-amber-500 w-3 h-3 fill-amber-500" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Productos Estrella</span>
                    </div>
                    {performance.stars.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-3 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl">
                            <span className="text-[10px] font-black text-emerald-700 uppercase truncate max-w-[120px]">{p.name}</span>
                            <span className="text-[9px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-lg">{p.sales} Vendidos</span>
                        </div>
                    ))}
                </div>

                <div className="h-px bg-gray-50"></div>

                {/* Huesos (Bajo movimiento) */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Icon name="TrendingDown" className="text-rose-500 w-3 h-3" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Baja Rotación (Fuga ROI)</span>
                    </div>
                    {performance.bones.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-3 bg-rose-50/50 border border-rose-100/50 rounded-2xl">
                            <span className="text-[10px] font-black text-rose-700 uppercase truncate max-w-[120px]">{p.name}</span>
                            <span className="text-[9px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-lg">0 Ventas</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
