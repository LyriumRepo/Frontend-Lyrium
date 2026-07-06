'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Contract, ContractFilters, ContractKPI, ContractStatus } from '@/lib/types/admin/contracts';
import { contractApi } from '@/shared/lib/api/contractRepository';

export const useContratos = () => {
    const queryClient = useQueryClient();
    const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
    const [tempNewContract, setTempNewContract] = useState<Contract | null>(null);

    const [filters, setFilters] = useState<ContractFilters>({
        query: '',
        modality: 'ALL',
        status: 'ALL',
        dateType: 'SIGNATURE',
        dateLimit: ''
    });

    const TEMP_NEW_ID = '__new__';

    // --- Query: Fetch Contracts ---
    const { data, isLoading, error } = useQuery({
        queryKey: ['admin', 'contracts', filters],
        queryFn: async () => {
            const result = await contractApi.list({
                query: filters.query || undefined,
                status: filters.status === 'ALL' ? undefined : filters.status,
                modality: filters.modality === 'ALL' ? undefined : filters.modality,
            });
            return result;
        },
        staleTime: 5 * 60 * 1000,
    });

    const contracts = data?.contracts ?? [];
    const kpiData = data?.kpis ?? { total: 0, active: 0, pending: 0, expired: 0 };

    // --- Mutations ---
    const saveContractMutation = useMutation({
        mutationFn: async ({ id, status, updatedInfo }: { id: string, status: ContractStatus, updatedInfo: Partial<Contract> }) => {
            const finalInfo = { ...updatedInfo, type: updatedInfo.type || updatedInfo.plan || 'Standard' };
            if (id === TEMP_NEW_ID) {
                return contractApi.create({ ...finalInfo, status });
            }
            return contractApi.updateStatus(id, status, finalInfo);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'contracts'] });
            setTempNewContract(null);
            setSelectedContractId(null);
        }
    });

    const createContractMutation = useMutation({
        mutationFn: async () => {
            const newContract: Contract = {
                id: TEMP_NEW_ID,
                dbId: 0,
                company: '',
                ruc: '',
                rep: '',
                dni: '',
                direccion: '',
                admin_name: '',
                admin_phone: '',
                admin_email: '',
                plan: '',
                type: '',
                modality: 'VIRTUAL',
                status: 'PENDING',
                start: '',
                end: '',
                storage_path: 'pendiente_de_carga.pdf',
            };
            return newContract;
        },
        onSuccess: (newContract) => {
            setTempNewContract(newContract);
            setSelectedContractId(newContract.id);
        }
    });

    const selectedContract = useMemo(() => {
        if (selectedContractId === TEMP_NEW_ID) return tempNewContract;
        return contracts.find(c => c.id === selectedContractId) || null;
    }, [contracts, selectedContractId, tempNewContract]);

    const filteredContracts = useMemo(() => {
        const now = new Date();
        const fifteenDaysFromNow = new Date();
        fifteenDaysFromNow.setDate(now.getDate() + 15);

        return contracts.map(c => {
            let urgency: 'normal' | 'warning' | 'critical' = 'normal';
            if (c.end) {
                const expiryDate = new Date(c.end);
                if (expiryDate < now) urgency = 'critical';
                else if (expiryDate <= fifteenDaysFromNow) urgency = 'warning';
            }
            return { ...c, expiryUrgency: urgency };
        });
    }, [contracts]);

    const kpis = useMemo((): ContractKPI[] => {
        return [
            { label: 'Total Contratos', val: kpiData.total, color: 'indigo', icon: 'Files' },
            { label: 'Vigentes (Activos)', val: kpiData.active, color: 'emerald', icon: 'CheckCircle' },
            { label: 'Por Validar', val: kpiData.pending, color: 'amber', icon: 'Hourglass' },
            { label: 'Vencidos / Exp.', val: kpiData.expired, color: 'red', icon: 'AlertOctagon' }
        ];
    }, [kpiData]);

    const openTemplates = () => {
        window.open('/admin/contracts/templates', '_blank');
    };

    return {
        state: {
            contracts: filteredContracts,
            kpis,
            loading: isLoading || saveContractMutation.isPending || createContractMutation.isPending,
            error: error ? (error as Error).message : null,
            filters,
            selectedContract
        },
        actions: {
            setFilters,
            setSelectedContract: (c: Contract | null) => {
                setSelectedContractId(c?.id || null);
                if (c === null) {
                    setTempNewContract(null);
                    queryClient.setQueryData(['admin', 'contracts'], (old: any) => {
                        if (!old?.contracts) return old;
                        return {
                            ...old,
                            contracts: old.contracts.filter((item: Contract) => !(item.company === '' && item.ruc === ''))
                        };
                    });
                }
            },
            validateContract: (id: string, updatedInfo: Partial<Contract>) =>
                saveContractMutation.mutateAsync({ id, status: 'ACTIVE', updatedInfo }),
            invalidateContract: (id: string, updatedInfo: Partial<Contract>) =>
                saveContractMutation.mutateAsync({ id, status: 'EXPIRED', updatedInfo }),
            updateContractStatus: (id: string, status: ContractStatus, updatedInfo: Partial<Contract>) =>
                saveContractMutation.mutateAsync({ id, status, updatedInfo }),
            createNew: () => createContractMutation.mutateAsync(),
            fetchContracts: () => queryClient.invalidateQueries({ queryKey: ['admin', 'contracts'] }),
            openTemplates
        }
    };
};
