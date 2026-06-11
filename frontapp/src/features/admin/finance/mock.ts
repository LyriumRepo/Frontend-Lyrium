import { FinanceData } from './types';

export const MOCK_FINANCE_DATA: FinanceData = {
    ingresosBrutos: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        data: [12000, 15000, 14000, 18000, 22000, 25000],
        trend: '+15%'
    },
    ingresosNetos: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        data: [9000, 11000, 10500, 13500, 16500, 19000],
        trend: '+12%'
    },
    ingresosReales: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        data: [8500, 10500, 9800, 12800, 15500, 18000],
        trend: '+10%'
    },
    ventasTotales: {
        labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
        data: [150, 200, 180, 220],
        trend: '+5%'
    },
    ticketPromedio: {
        labels: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
        data: [85, 90, 88, 92, 95, 110, 105],
        trend: '+2%'
    },
    chartProxPago: {
        labels: ['Recaudado', 'Restante'],
        data: [7250.25, 2749.75]
    },
    roi: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        data: [150, 200, 180, 220, 250, 260]
    },
    cuotaMercado: {
        labels: ['Tu Tienda', 'Otras Tiendas'],
        data: [35, 65]
    },
    ltv: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        data: [500, 600, 750, 900, 1200, 1250]
    },
    categories: {
        labels: ['Ropa', 'Electrónica', 'Hogar', 'Juguetes'],
        data: [40, 25, 20, 15]
    },
    leadTime: {
        labels: ['0-12h', '12-24h', '24-48h', '48-72h', '72h+'],
        data: [5, 15, 22, 10, 3]
    },
    defectuosos: {
        labels: ['Sin Defectos', 'Defectuosos'],
        data: [98.5, 1.5]
    },
    tiempoRespuesta: {
        labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
        data: [15, 14, 12, 10]
    },
    stockRotacion: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        data: [1.8, 2.0, 2.2, 2.4]
    },
    csat: {
        labels: ['CSAT'],
        data: [94]
    },
    desgloseFinanciero: {
        totalConIgv: 420000,
        totalIgv: 64000,
        totalCommission: 35000,
        totalNeto: 321000,
        totalPending: 7250.25,
        totalCompleted: 313749.75,
        pendingCount: 5,
        completedCount: 95
    },
    comprobantesRecientes: [
        { id: '1', series: 'F001', number: '000234', type: 'Factura', sunat_status: 'PAID', total: 1250.00, emission_date: '2026-06-08' },
        { id: '2', series: 'B001', number: '001509', type: 'Boleta', sunat_status: 'PAID', total: 450.00, emission_date: '2026-06-07' },
        { id: '3', series: 'F001', number: '000233', type: 'Factura', sunat_status: 'PAID', total: 3200.00, emission_date: '2026-06-06' },
        { id: '4', series: 'F001', number: '000232', type: 'Factura', sunat_status: 'PAID', total: 850.00, emission_date: '2026-06-05' },
        { id: '5', series: 'B001', number: '001508', type: 'Boleta', sunat_status: 'PAID', total: 120.00, emission_date: '2026-06-04' }
    ],
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
