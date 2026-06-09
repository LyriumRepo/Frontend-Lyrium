import { FinanceData } from './types';

export const MOCK_FINANCE_DATA: FinanceData = {
    ingresosBrutos: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        data: [12000, 15000, 14000, 18000, 22000, 25000, 28000, 26000, 30000, 32000, 35000, 40000],
        trend: '+15%'
    },
    ingresosNetos: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        data: [9000, 11000, 10500, 13500, 16500, 19000, 21000, 19500, 22500, 24000, 26500, 30000],
        trend: '+12%'
    },
    ingresosReales: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        data: [8500, 10500, 9800, 12800, 15500, 18000, 19800, 18500, 21000, 22500, 25000, 28500],
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
        labels: ['Camp 1', 'Camp 2', 'Camp 3', 'Camp 4', 'Camp 5'],
        data: [150, 200, 180, 220, 250]
    },
    cuotaMercado: {
        labels: ['Tu Tienda', 'Competencia A', 'Competencia B', 'Otros'],
        data: [35, 25, 20, 20]
    },
    ltv: {
        labels: ['2020', '2021', '2022', '2023', '2024'],
        data: [500, 600, 750, 900, 1200]
    },
    categories: {
        labels: ['Ropa', 'Electrónica', 'Hogar', 'Juguetes'],
        data: [40, 25, 20, 15]
    },
    leadTime: {
        labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
        data: [5.2, 4.8, 4.5, 4.2]
    },
    defectuosos: {
        labels: ['ENE', 'FEB', 'MAR'],
        data: [2.5, 1.8, 1.5]
    },
    tiempoRespuesta: {
        labels: ['S1', 'S2', 'S3', 'S4'],
        data: [15, 14, 12, 10]
    },
    stockRotacion: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        data: [1.8, 2.0, 2.2, 2.4]
    },
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
