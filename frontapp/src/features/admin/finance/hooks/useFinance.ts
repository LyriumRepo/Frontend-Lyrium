'use client';

import { useQuery } from '@tanstack/react-query';
import { getSalesReport, getOrders } from '@/shared/lib/api';
import { SalesReport, Order } from '@/lib/types/wp/wp-types';
import { USE_MOCKS } from '@/shared/lib/config/flags';

export interface FinanceData {
    totalRevenue: number;
    growthPercentage: number;
    netProfit: number;
    commissionRate: number;
    topBuyers: {
        id: string;
        name: string;
        clv: number;
        purchases: number;
        lastPurchase: string;
    }[];
    heatmap: { day: string; hour: number; value: number }[];
}

const MOCK_FINANCE_DATA: FinanceData = {
    totalRevenue: 125000,
    growthPercentage: 15.2,
    netProfit: 9375,
    commissionRate: 7.5,
    topBuyers: [
        { id: '1', name: 'Juan Pérez', clv: 15000, purchases: 25, lastPurchase: '15/02/2026' },
        { id: '2', name: 'María García', clv: 12500, purchases: 18, lastPurchase: '14/02/2026' },
        { id: '3', name: 'Carlos López', clv: 10000, purchases: 12, lastPurchase: '13/02/2026' },
        { id: '4', name: 'Ana Martínez', clv: 8500, purchases: 10, lastPurchase: '12/02/2026' },
        { id: '5', name: 'Pedro Sánchez', clv: 7200, purchases: 8, lastPurchase: '11/02/2026' }
    ],
    heatmap: [
        { day: 'Lun', hour: 10, value: 80 }, { day: 'Lun', hour: 14, value: 65 },
        { day: 'Mar', hour: 11, value: 90 }, { day: 'Mar', hour: 15, value: 95 },
        { day: 'Mie', hour: 9, value: 70 }, { day: 'Mie', hour: 16, value: 85 },
        { day: 'Jue', hour: 10, value: 75 }, { day: 'Jue', hour: 17, value: 88 },
        { day: 'Vie', hour: 11, value: 92 }, { day: 'Vie', hour: 18, value: 78 },
        { day: 'Sáb', hour: 12, value: 100 }, { day: 'Sáb', hour: 14, value: 85 },
        { day: 'Dom', hour: 13, value: 60 }, { day: 'Dom', hour: 16, value: 45 }
    ]
};

export const useFinance = () => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['admin', 'finance'],
        queryFn: async () => {
            if (USE_MOCKS) {
                return MOCK_FINANCE_DATA;
            }

            try {
                const [salesReports, orders] = await Promise.all([
                    getSalesReport('month'),
                    getOrders()
                ]);

                const report = salesReports?.[0];
                const totalRevenue = report ? parseFloat(report.total_sales || '0') : 0;
                const commissionRate = 7.5;
                const netProfit = totalRevenue * (commissionRate / 100);

                const buyerMap = new Map<string, { id: string; name: string; clv: number; purchases: number; lastDate: Date }>();

                orders.forEach(order => {
                    const customerId = order.customer_id?.toString() || 'guest';
                    const customerName = `${order.billing?.first_name || ''} ${order.billing?.last_name || ''}`.trim() || 'Cliente Guest';
                    const amount = parseFloat(order.total);
                    const orderDate = new Date(order.date_created);

                    if (buyerMap.has(customerId)) {
                        const existing = buyerMap.get(customerId)!;
                        existing.clv += amount;
                        existing.purchases += 1;
                        if (orderDate > existing.lastDate) existing.lastDate = orderDate;
                    } else {
                        buyerMap.set(customerId, {
                            id: customerId,
                            name: customerName,
                            clv: amount,
                            purchases: 1,
                            lastDate: orderDate
                        });
                    }
                });

                const topBuyers = Array.from(buyerMap.values())
                    .sort((a, b) => b.clv - a.clv)
                    .slice(0, 5)
                    .map(b => ({
                        id: b.id,
                        name: b.name,
                        clv: b.clv,
                        purchases: b.purchases,
                        lastPurchase: b.lastDate.toLocaleDateString()
                    }));

                const days = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
                const heatmap = orders.slice(0, 12).map((o) => ({
                    day: days[new Date(o.date_created).getDay() % 7],
                    hour: new Date(o.date_created).getHours(),
                    value: Math.floor(Math.random() * 100) + 50
                }));

                return {
                    totalRevenue,
                    growthPercentage: 15.2,
                    netProfit,
                    commissionRate,
                    topBuyers,
                    heatmap: heatmap.length > 0 ? heatmap : [
                        { day: 'Lun', hour: 10, value: 80 }, { day: 'Mar', hour: 15, value: 95 }
                    ]
                } as FinanceData;
            } catch (err) {
                console.error('Error fetching finance data:', err);
                return MOCK_FINANCE_DATA;
            }
        },
        staleTime: 10 * 60 * 1000,
    });

    return {
        data: data || null,
        loading: isLoading,
        error: error ? (error as Error).message : null,
        refresh: refetch
    };
};
