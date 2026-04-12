import { useState, useCallback, useEffect, useMemo } from 'react';
import { TreasuryData, TreasuryTab, CashInStatus, CashOutStatus, TreasuryFilters, CashInPayment, CashOutPayment } from '@/lib/types/admin/treasury';
import { MOCK_TREASURY_DATA } from '@/lib/mocks/treasuryData';

export const useTreasury = () => {
    const [data, setData] = useState<TreasuryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TreasuryTab>('balance');
    const [selectedPayment, setSelectedPayment] = useState<CashInPayment | CashOutPayment | null>(null);

    const [filters, setFilters] = useState<TreasuryFilters>({
        status: 'ALL',
        search: ''
    });

    const fetchTreasury = useCallback(async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 600)); // Simulando API
            if (!data) {
                setData(MOCK_TREASURY_DATA);
            }
            setError(null);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error cargando información de Tesorería');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!data) fetchTreasury();
    }, [fetchTreasury]);

    const kpis = useMemo(() => {
        if (!data) return [];
        return [
            { label: 'Utilidad Neta del Mes', val: `S/ ${data.resumen.utilidad_neta.toLocaleString()}`, color: 'emerald', icon: 'ChartLineUp' },
            { label: 'Pagos Pendientes (Cash-In)', val: data.cashIn.filter(p => p.status === 'PENDING_VALIDATION').length.toString(), color: 'amber', icon: 'Clock' },
            { label: 'Liquidaciones (Cash-Out)', val: data.cashOut.filter(p => p.status === 'SCHEDULED' || p.status === 'PROCESSING').length.toString(), color: 'indigo', icon: 'ArrowsLeftRight' },
            { label: 'Disputas Activas', val: data.cashOut.filter(p => p.status === 'DISPUTED').length.toString(), color: 'red', icon: 'WarningCircle' }
        ];
    }, [data]);

    const filteredCashIn = useMemo(() => {
        if (!data) return [];
        return data.cashIn.filter(p => {
            const matchStatus = filters.status === 'ALL' || p.status === filters.status;
            const matchSearch = !filters.search ||
                p.id.toLowerCase().includes(filters.search.toLowerCase()) ||
                p.customer.name.toLowerCase().includes(filters.search.toLowerCase());
            return matchStatus && matchSearch;
        });
    }, [data, filters]);

    const filteredCashOut = useMemo(() => {
        if (!data) return [];
        return data.cashOut.filter(p => {
            const matchStatus = filters.status === 'ALL' || p.status === filters.status;
            const matchSearch = !filters.search ||
                p.id.toLowerCase().includes(filters.search.toLowerCase()) ||
                p.seller.name.toLowerCase().includes(filters.search.toLowerCase());
            return matchStatus && matchSearch;
        });
    }, [data, filters]);

    // Máquina de estados para Cash-In
    const validateCashIn = async (id: string, action: 'VALIDATE' | 'REJECT') => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 500));
            if (!data) return;

            const index = data.cashIn.findIndex(p => p.id === id);
            if (index !== -1) {
                const newData = { ...data };
                const newStatus = action === 'VALIDATE' ? CashInStatus.VALIDATED : CashInStatus.REJECTED;
                newData.cashIn[index] = { ...newData.cashIn[index], status: newStatus };
                setData(newData);
                setSelectedPayment(null);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al procesar Cash-In');
        } finally {
            setLoading(false);
        }
    };

    // FSM Para Cash-Out
    const processCashOut = async (id: string, action: 'PAY' | 'FAIL' | 'RESCHEDULE') => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 500));
            if (!data) return;

            const index = data.cashOut.findIndex(p => p.id === id);
            if (index !== -1) {
                const newData = { ...data };
                let newStatus = CashOutStatus.SCHEDULED;
                if (action === 'PAY') newStatus = CashOutStatus.PAID;
                if (action === 'FAIL') newStatus = CashOutStatus.FAILED;

                newData.cashOut[index] = { ...newData.cashOut[index], status: newStatus };
                setData(newData);
                setSelectedPayment(null);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al procesar Cash-Out');
        } finally {
            setLoading(false);
        }
    };


    return {
        state: {
            data,
            loading,
            error,
            activeTab,
            filters,
            kpis,
            filteredCashIn,
            filteredCashOut,
            selectedPayment
        },
        actions: {
            setActiveTab,
            setFilters,
            setSelectedPayment,
            validateCashIn,
            processCashOut
        }
    };
};
