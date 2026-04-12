export const MOCK_FINANCE_DATA = {
    totalRevenue: 245600,
    growthPercentage: 12.5,
    netProfit: 18420,
    commissionRate: 7.5,
    topBuyers: [
        { id: '1', name: 'AgroIndustrias del Norte', clv: 45000, purchases: 12, lastPurchase: 'Hace 2 días' },
        { id: '2', name: 'Corporación Fénix', clv: 32000, purchases: 8, lastPurchase: 'Hace 1 semana' },
        { id: '3', name: 'Estancia La Victoria', clv: 28500, purchases: 15, lastPurchase: 'Hace 3 días' },
        { id: '4', name: 'Ferretería Central S.A.C', clv: 21000, purchases: 5, lastPurchase: 'Ayer' },
        { id: '5', name: 'Suministros Agrícolas SAC', clv: 18200, purchases: 22, lastPurchase: 'Hace 4 horas' }
    ],
    heatmap: [
        { day: 'Lun', hour: 10, value: 80 }, { day: 'Lun', hour: 15, value: 95 },
        { day: 'Mar', hour: 11, value: 70 }, { day: 'Mar', hour: 16, value: 110 },
        { day: 'Mie', hour: 10, value: 85 }, { day: 'Mie', hour: 14, value: 100 },
        { day: 'Jue', hour: 9, value: 60 }, { day: 'Jue', hour: 17, value: 120 },
        { day: 'Vie', hour: 11, value: 90 }, { day: 'Vie', hour: 15, value: 130 },
        { day: 'Sab', hour: 10, value: 40 }, { day: 'Dom', hour: 18, value: 25 }
    ]
};
