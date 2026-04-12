'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnalyticsData, AnalyticsTab, AnalyticsFilters } from '@/features/admin/analytics/types';
import { MOCK_ANALYTICS_DATA } from '@/features/admin/analytics/mock';
import { USE_MOCKS } from '@/shared/lib/config/flags';
import { getErrorMessage } from '@/shared/lib/utils/error-utils';

export const useAnalytics = () => {
    const [activeTab, setActiveTab] = useState<AnalyticsTab>('vendedores');
    const [filters, setFilters] = useState<AnalyticsFilters>({
        period: 'LAST_30',
        rubro: 'ALL'
    });

    // --- Query: Fetch Analytics ---
    const { data: analyticsData, isLoading, error, refetch } = useQuery({
        queryKey: ['admin', 'analytics', filters],
        queryFn: async () => {
            if (USE_MOCKS) {
                let filteredSellers = MOCK_ANALYTICS_DATA.vendedoresAnalitica;
                if (filters.rubro !== 'ALL') {
                    filteredSellers = filteredSellers.filter(s => s.rubro === filters.rubro);
                }

                return {
                    ...MOCK_ANALYTICS_DATA,
                    vendedoresAnalitica: filteredSellers
                } as AnalyticsData;
            }

            try {
                // TODO Tarea 3: Conectar endpoint real de analytics
                return MOCK_ANALYTICS_DATA as AnalyticsData;
            } catch (e) {
                console.warn('FALLBACK: Analytics pendiente');
                return MOCK_ANALYTICS_DATA as AnalyticsData;
            }
        },
        staleTime: 15 * 60 * 1000, // Analytics duran 15 min (Big Data)
    });

    const kpis = useMemo(() => {
        if (!analyticsData) return [];
        return [
            { label: 'Customer Lifetime Value', val: `S/ ${analyticsData.resumenGlobal.clv_promedio.toLocaleString()}`, color: 'indigo', icon: 'TrendingUp' },
            { label: 'Tasa de Retención', val: `${analyticsData.resumenGlobal.tasa_retencion}%`, color: 'emerald', icon: 'History' },
            { label: 'Conversión Media', val: `${analyticsData.resumenGlobal.conversion_media}%`, color: 'sky', icon: 'BarChart' },
            { label: 'Frecuencia de Compra', val: `${analyticsData.resumenGlobal.frecuencia_compra} ped/mes`, color: 'amber', icon: 'RefreshCw' }
        ];
    }, [analyticsData]);

    const topSellers = useMemo(() => {
        if (!analyticsData) return [];
        return [...analyticsData.vendedoresAnalitica].sort((a, b) => b.roi - a.roi).slice(0, 4);
    }, [analyticsData]);

    return {
        state: {
            data: analyticsData || null,
            loading: isLoading,
            error: getErrorMessage(error),
            activeTab,
            filters,
            kpis,
            topSellers
        },
        actions: {
            setActiveTab,
            setFilters,
            refresh: refetch
        }
    };
};
