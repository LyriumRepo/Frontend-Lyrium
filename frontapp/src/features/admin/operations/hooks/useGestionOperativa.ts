import { useState, useCallback, useMemo, useEffect } from 'react';
import { OperationalData, OperationalTab, OperationalKPI, ProviderFilters, ExpenseFilters, Provider } from '@/lib/types/admin/operations';

import { MOCK_OPERATIONS_DATA } from '@/lib/mocks/operationsData';

export const useGestionOperativa = () => {
    const [data, setData] = useState<OperationalData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<OperationalTab>('proveedores');
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [pending2FAAction, setPending2FAAction] = useState<(() => void) | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Simulación de llamada al endpoint (fetch)
            await new Promise(resolve => setTimeout(resolve, 600));

            // En un futuro cambiar a: const response = await fetch('/api/admin/operations');
            // const apiData = await response.json();

            setData(MOCK_OPERATIONS_DATA);
            setError(null);
        } catch (err: unknown) {
            setError('Error de conexión al endpoint de Gestión Operativa');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const [providerFilters, setProviderFilters] = useState<ProviderFilters>({
        query: '',
        type: 'ALL',
        status: 'ALL'
    });

    const [expenseFilters, setExpenseFilters] = useState<ExpenseFilters>({
        category: 'ALL',
        provider: 'ALL',
        amount: 'ALL',
        time: 'ALL'
    });

    const kpis = useMemo((): OperationalKPI[] => {
        if (!data) return [];
        const totalGastado = data.gastos.reduce((acc, g) => acc + g.monto, 0);
        const provActivos = data.proveedores.filter(p => p.estado === 'Activo').length;
        const provSuspendidos = data.proveedores.filter(p => p.estado === 'Suspendido').length;
        const recibosPendientes = data.gastos.filter(g => g.estado === 'Pendiente').length;

        return [
            { label: 'Inversión Total', val: `S/ ${totalGastado.toLocaleString()}`, icon: 'Coins', color: 'indigo' },
            { label: 'Proveedores Activos', val: provActivos, icon: 'UserCheck', color: 'emerald' },
            { label: 'En Pausa / Suspendidos', val: provSuspendidos, icon: 'UserMinus', color: 'orange' },
            { label: 'Recibos Pendientes', val: recibosPendientes, icon: 'Receipt', color: 'blue' }
        ];
    }, [data]);

    const filteredProviders = useMemo(() => {
        if (!data) return [];
        return data.proveedores.filter(p => {
            const matchQuery = !providerFilters.query ||
                p.nombre.toLowerCase().includes(providerFilters.query.toLowerCase()) ||
                p.ruc.includes(providerFilters.query);
            const matchType = providerFilters.type === 'ALL' || p.tipo === providerFilters.type;
            const matchStatus = providerFilters.status === 'ALL' || p.estado === providerFilters.status;
            return matchQuery && matchType && matchStatus;
        });
    }, [data, providerFilters]);

    const filteredExpenses = useMemo(() => {
        if (!data) return [];
        return data.gastos.filter(g => {
            const matchCat = expenseFilters.category === 'ALL' || g.categoria === expenseFilters.category;
            const matchProv = expenseFilters.provider === 'ALL' || g.proveedor_id === expenseFilters.provider;

            let matchAmount = true;
            if (expenseFilters.amount === 'LOW') matchAmount = g.monto < 3000;
            if (expenseFilters.amount === 'MID') matchAmount = g.monto >= 3000 && g.monto <= 6000;
            if (expenseFilters.amount === 'HIGH') matchAmount = g.monto > 6000;

            let matchTime = true;
            if (expenseFilters.time === 'FEBRUARY') matchTime = g.fecha.includes('-02-');
            if (expenseFilters.time === 'Q1') matchTime = ['-01-', '-02-', '-03-'].some(m => g.fecha.includes(m));

            return matchCat && matchProv && matchAmount && matchTime;
        });
    }, [data, expenseFilters]);

    const totalInvestment = useMemo(() => {
        return filteredExpenses.reduce((acc, g) => acc + g.monto, 0);
    }, [filteredExpenses]);

    const request2FA = useCallback((onSuccess: () => void) => {
        setPending2FAAction(() => onSuccess);
        setShow2FAModal(true);
    }, []);

    const verify2FA = useCallback((code: string) => {
        if (code === '123456') {
            setShow2FAModal(false);
            if (pending2FAAction) {
                pending2FAAction();
                setPending2FAAction(null);
            }
            return true;
        }
        return false;
    }, [pending2FAAction]);

    const close2FAModal = useCallback(() => {
        setShow2FAModal(false);
        setPending2FAAction(null);
    }, []);

    const saveProvider = useCallback(async (provider: Partial<Provider>) => {
        if (!data) return;
        try {
            setLoading(true);
            const newData = { ...data };
            if (provider.id) {
                const index = newData.proveedores.findIndex(p => p.id === provider.id);
                if (index !== -1) {
                    newData.proveedores[index] = { ...newData.proveedores[index], ...provider };
                }
                newData.auditLogs.unshift({
                    action: 'PROV_UPDATE_SUCCESS',
                    entity: `PROV-${provider.id}`,
                    user: 'Admin-Auth',
                    reason: 'Actualización de ficha técnica autorizada vía 2FA',
                    timestamp: new Date().toISOString().substring(0, 16).replace('T', ' ')
                });
            } else {
                const newId = Math.max(...newData.proveedores.map(p => p.id)) + 1;
                const newProvider = { ...provider, id: newId } as Provider;
                newData.proveedores.unshift(newProvider);
                newData.auditLogs.unshift({
                    action: 'PROV_CREATE_SUCCESS',
                    entity: 'NEW_PROVIDER',
                    user: 'Admin-Auth',
                    reason: 'Nuevo proveedor registrado',
                    timestamp: new Date().toISOString().substring(0, 16).replace('T', ' ')
                });
            }
            setData(newData);
            setSelectedProvider(null);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al procesar proveedor');
        } finally {
            setLoading(false);
        }
    }, [data]);

    const deleteProvider = useCallback(async (provider: Provider) => {
        if (!data) return;
        if (!confirm(`¿Estás seguro de eliminar al proveedor "${provider.nombre}"? Esta acción no se puede deshacer.`)) return;
        
        try {
            setLoading(true);
            const newData = { ...data };
            newData.proveedores = newData.proveedores.filter(p => p.id !== provider.id);
            newData.auditLogs.unshift({
                action: 'PROV_DELETE_SUCCESS',
                entity: `PROV-${provider.id}`,
                user: 'Admin-Auth',
                reason: `Eliminación de proveedor: ${provider.nombre} (RUC: ${provider.ruc})`,
                timestamp: new Date().toISOString().substring(0, 16).replace('T', ' ')
            });
            setData(newData);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al eliminar proveedor');
        } finally {
            setLoading(false);
        }
    }, [data]);

    return {
        state: {
            data,
            loading,
            error,
            activeTab,
            kpis,
            filteredProviders,
            filteredExpenses,
            totalInvestment,
            selectedProvider,
            show2FAModal,
            providerFilters,
            expenseFilters
        },
        actions: {
            setActiveTab,
            setProviderFilters,
            setExpenseFilters,
            setSelectedProvider,
            request2FA,
            verify2FA,
            close2FAModal,
            saveProvider,
            deleteProvider
        }
    };
};
