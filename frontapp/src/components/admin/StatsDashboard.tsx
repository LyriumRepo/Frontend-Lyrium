'use client';

import React, { useEffect, useState } from 'react';
import { getSalesReport, getStores, getOrders } from '@/shared/lib/api';
import { Order } from '@/shared/types/wp/wp-types';
import BaseStatCard from '@/components/ui/BaseStatCard';

interface DashboardStats {
    totalSales: string;
    totalOrders: number;
    totalStores: number;
    pendingOrders: number;
    orderCount?: number;
    storeCount?: number;
    netSales?: string;
}

export default function StatsDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllStats = async () => {
            try {
                setLoading(true);
                const [reports, stores, orders] = await Promise.all([
                    getSalesReport('month'),
                    getStores(),
                    getOrders()
                ]);

                // Agregamos los totales de los reportes (WC envía un array de periodos)
                let mainReport = reports[0];

                setStats({
                    totalSales: mainReport?.total_sales || '0.00',
                    orderCount: mainReport?.total_orders || orders.length || 0,
                    storeCount: stores.length || 0,
                    totalOrders: orders.length || 0,
                    netSales: mainReport?.net_sales || '0.00',
                    totalStores: stores.length || 0,
                    pendingOrders: 0
                });
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllStats();
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <BaseStatCard
                label="Ventas Netas"
                value={`S/ ${stats?.netSales}`}
                icon="DollarSign"
                color="sky"
                isLoading={loading}
                description="Periodo Actual"
            />

            <BaseStatCard
                label="Tiendas Activas"
                value={stats?.storeCount || 0}
                icon="Store"
                color="violet"
                isLoading={loading}
                description="Sincronizado vía Dokan"
            />

            <BaseStatCard
                label="Pedidos Totales"
                value={stats?.orderCount || 0}
                icon="ShoppingCart"
                color="emerald"
                isLoading={loading}
                description="Últimos 30 días"
            />

            <BaseStatCard
                label="Soporte Activo"
                value="12"
                icon="MessageSquare"
                color="rose"
                isLoading={loading}
                description="Tickets Pendientes"
            />
        </div>
    );
}
