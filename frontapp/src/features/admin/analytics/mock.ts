import { AnalyticsData } from './types';

export const MOCK_ANALYTICS_DATA: AnalyticsData = {
    resumenGlobal: {
        clv_promedio: 1450.50,
        tasa_retencion: 42.5,
        conversion_media: 3.8,
        frecuencia_compra: 3.2
    },
    vendedoresAnalitica: [
        { id: 1, nombre: 'ElectroHogar S.A.C', rubro: 'Insumos', conversion: 4.5, roi: 120, crecimiento: 15, ventas_totales: 45000 },
        { id: 2, nombre: 'AgroInversiones Norte', rubro: 'Insumos', conversion: 2.1, roi: 80, crecimiento: -5, ventas_totales: 21000 },
        { id: 3, nombre: 'Ferretería Industrial', rubro: 'Herramientas', conversion: 5.2, roi: 150, crecimiento: 25, ventas_totales: 85000 },
        { id: 4, nombre: 'Agrícola del Sur', rubro: 'Insumos', conversion: 3.8, roi: 95, crecimiento: 10, ventas_totales: 34000 },
        { id: 5, nombre: 'Maquinarias Pesadas LTDA', rubro: 'Herramientas', conversion: 1.5, roi: 60, crecimiento: -12, ventas_totales: 150000 }
    ],
    catalogoRendimiento: [
        { id: 101, nombre: 'Tractor Agrícola 50HP', tipo: 'estrella', ventas: 12, rotacion: 85 },
        { id: 102, nombre: 'Fertilizante NPK 50kg', tipo: 'estrella', ventas: 450, rotacion: 92 },
        { id: 103, nombre: 'Motosierra Básica 18"', tipo: 'hueso', ventas: 3, rotacion: 5 },
        { id: 104, nombre: 'Semillas de Maíz Híbrido', tipo: 'estrella', ventas: 890, rotacion: 95 },
        { id: 105, nombre: 'Tubo PVC Especial 10"', tipo: 'hueso', ventas: 1, rotacion: 2 }
    ],
    comportamientoClientes: {
        retencion_mensual: [
            { mes: 'Mes 1', retencion: 100 },
            { mes: 'Mes 2', retencion: 65 },
            { mes: 'Mes 3', retencion: 45 },
            { mes: 'Mes 4', retencion: 38 },
            { mes: 'Mes 5', retencion: 35 },
            { mes: 'Mes 6', retencion: 30 }
        ],
        demografia: [
            { zona: 'Costa (Lima / Piura)', demanda: 520, color: '#0ea5e9' },
            { zona: 'Sierra (Cusco / Arequipa)', demanda: 310, color: '#f59e0b' },
            { zona: 'Selva (San Martín / Loreto)', demanda: 180, color: '#10b981' },
            { zona: 'Extranjero (Export)', demanda: 50, color: '#8b5cf6' }
        ],
        frecuencia_segmentos: {
            VIP: 8,
            Recurrente: 25,
            Ocasional: 60
        }
    }
};
