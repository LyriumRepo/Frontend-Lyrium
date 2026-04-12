export interface TopBuyer {
    id: string;
    name: string;
    clv: number;
    purchases: number;
    lastPurchase: string;
    avatar?: string;
}

export interface HeatmapData {
    day: string;
    hour: number;
    value: number;
}

export interface FinanceStats {
    totalRevenue: number;
    growthPercentage: number;
    netProfit: number;
    commissionRate: number;
    topBuyers: TopBuyer[];
    heatmap: HeatmapData[];
}
