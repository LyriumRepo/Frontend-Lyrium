export interface SellerAnalytics {
    id: number;
    nombre: string;
    rubro: string;
    conversion: number;
    roi: number;
    crecimiento: number;
    ventas_totales: number;
}

export interface CatalogProduct {
    id: number;
    nombre: string;
    tipo: 'estrella' | 'hueso';
    ventas: number;
    rotacion: number;
}

export interface GeographicZone {
    zona: string;
    demanda: number;
    color: string;
}

export interface CustomerBehavior {
    retencion_mensual: { mes: string; retencion: number }[];
    demografia: GeographicZone[];
    frecuencia_segmentos: {
        VIP: number;
        Recurrente: number;
        Ocasional: number;
    };
}

export interface GlobalSummary {
    clv_promedio: number;
    tasa_retencion: number;
    conversion_media: number;
    frecuencia_compra: number;
}

export interface AnalyticsData {
    resumenGlobal: GlobalSummary;
    vendedoresAnalitica: SellerAnalytics[];
    catalogoRendimiento: CatalogProduct[];
    comportamientoClientes: CustomerBehavior;
}

export type AnalyticsPeriod = 'TODAY' | 'LAST_24H' | 'LAST_30' | 'LAST_90' | 'CAMPAÑA';
export type AnalyticsTab = 'vendedores' | 'clientes';

export interface AnalyticsFilters {
    period: AnalyticsPeriod;
    rubro: string | 'ALL';
}

export interface AnalyticsKPI {
    label: string;
    val: string;
    icon: string;
    color: string;
}
