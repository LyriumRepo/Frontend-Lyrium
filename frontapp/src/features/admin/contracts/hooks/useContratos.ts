'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Contract, ContractFilters, ContractKPI, ContractStatus } from '@/lib/types/admin/contracts';
import { MOCK_CONTRACTS_DATA } from '@/lib/mocks/contractsData';

export const useContratos = () => {
    const queryClient = useQueryClient();
    const [selectedContractId, setSelectedContractId] = useState<string | null>(null);

    const [filters, setFilters] = useState<ContractFilters>({
        query: '',
        modality: 'ALL',
        status: 'ALL',
        dateType: 'SIGNATURE',
        dateLimit: ''
    });

    const { data: contracts = [], isLoading, error } = useQuery({
        queryKey: ['admin', 'contracts'],
        queryFn: async () => {
            await new Promise(resolve => setTimeout(resolve, 600));
            if (typeof window !== 'undefined') {
                const stored = localStorage.getItem('lyrium_contracts');
                if (stored) {
                    try {
                        return JSON.parse(stored) as Contract[];
                    } catch (e) {
                    }
                }
            }
            return MOCK_CONTRACTS_DATA as Contract[];
        },
        staleTime: 5 * 60 * 1000,
    });

    const updateContractMutation = useMutation({
        mutationFn: async ({ id, status, updatedInfo }: { id: string, status: ContractStatus, updatedInfo: Partial<Contract> }) => {
            return { id, status, updatedInfo };
        },
        onSuccess: (variables) => {
            queryClient.setQueryData(['admin', 'contracts'], (old: Contract[] | undefined) => {
                if (!old) return old;
                const next = old.map(c => {
                    if (c.id === variables.id) {
                        return {
                            ...c,
                            ...variables.updatedInfo,
                            status: variables.status,
                            auditTrail: [
                                ...(c.auditTrail || []),
                                {
                                    timestamp: new Date().toISOString(),
                                    action: `Estado actualizado a ${variables.status}`,
                                    user: 'Admin (System)'
                                }
                            ]
                        };
                    }
                    return c;
                });
                if (typeof window !== 'undefined') {
                    localStorage.setItem('lyrium_contracts', JSON.stringify(next));
                }
                return next;
            });
            setSelectedContractId(null);
        }
    });

    const createContractMutation = useMutation({
        mutationFn: async () => {
            const nextId = `CTR-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`;
            return {
                id: nextId,
                company: '',
                ruc: '',
                rep: '',
                plan: 'Plan emprende',
                modality: 'VIRTUAL',
                status: 'PENDING',
                start: '',
                end: '',
                storage_path: 'pendiente_de_carga.pdf',
                phone: '',
                email: '',
                address: '',
                dni: '',
                auditTrail: [
                    { timestamp: new Date().toISOString(), action: 'Contrato Borrador Creado', user: 'Admin' }
                ]
            };
        },
        onSuccess: (newContract) => {
            queryClient.setQueryData(['admin', 'contracts'], (old: Contract[] | undefined) => {
                const next = old ? [newContract, ...old] : [newContract];
                if (typeof window !== 'undefined') {
                    localStorage.setItem('lyrium_contracts', JSON.stringify(next));
                }
                return next;
            });
            setSelectedContractId(newContract.id);
        }
    });

    const selectedContract = useMemo(() =>
        contracts.find(c => c.id === selectedContractId) || null
        , [contracts, selectedContractId]);

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
        }).filter(c => {
            const matchQuery = !filters.query ||
                c.company.toLowerCase().includes(filters.query.toLowerCase()) ||
                c.ruc.includes(filters.query) ||
                c.id.toLowerCase().includes(filters.query.toLowerCase());

            const matchStatus = filters.status === 'ALL' || c.status === filters.status;
            const matchModality = filters.modality === 'ALL' || c.modality === filters.modality;

            let matchDate = true;
            if (filters.dateLimit) {
                const targetDate = filters.dateType === 'SIGNATURE' ? c.start : c.end;
                matchDate = targetDate <= filters.dateLimit;
            }

            return matchQuery && matchStatus && matchModality && matchDate;
        });
    }, [contracts, filters]);

    const kpis = useMemo((): ContractKPI[] => {
        return [
            { label: 'Total Contratos', val: contracts.length, color: 'indigo', icon: 'Files' },
            { label: 'Vigentes (Activos)', val: contracts.filter(c => c.status === 'ACTIVE').length, color: 'emerald', icon: 'CheckCircle' },
            { label: 'Por Validar', val: contracts.filter(c => c.status === 'PENDING').length, color: 'amber', icon: 'Hourglass' },
            { label: 'Vencidos / Exp.', val: contracts.filter(c => c.status === 'EXPIRED').length, color: 'red', icon: 'AlertOctagon' }
        ];
    }, [contracts]);

    const openTemplates = () => {
        console.log('[Contracts] Abriendo repositorio de plantillas legas');
        window.open('https://docs.google.com/viewer?url=https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank');
    };

    return {
        state: {
            contracts: filteredContracts,
            kpis,
            loading: isLoading || updateContractMutation.isPending || createContractMutation.isPending,
            error: error ? (error as Error).message : null,
            filters,
            selectedContract
        },
        actions: {
            setFilters,
            setSelectedContract: (c: Contract | null) => {
                setSelectedContractId(c?.id || null);
                if (c === null) {
                    queryClient.setQueryData(['admin', 'contracts'], (old: Contract[] | undefined) => {
                        if (!old) return old;
                        const filtered = old.filter(item => !(item.company === '' && item.ruc === ''));
                        if (typeof window !== 'undefined') {
                            localStorage.setItem('lyrium_contracts', JSON.stringify(filtered));
                        }
                        return filtered;
                    });
                }
            },
            validateContract: (id: string, updatedInfo: Partial<Contract>) =>
                updateContractMutation.mutateAsync({ id, status: 'ACTIVE', updatedInfo }),
            invalidateContract: (id: string, updatedInfo: Partial<Contract>) =>
                updateContractMutation.mutateAsync({ id, status: 'EXPIRED', updatedInfo }),
            updateContractStatus: (id: string, status: ContractStatus, updatedInfo: Partial<Contract>) =>
                updateContractMutation.mutateAsync({ id, status, updatedInfo }),
            createNew: () => createContractMutation.mutateAsync(),
            fetchContracts: () => queryClient.invalidateQueries({ queryKey: ['admin', 'contracts'] }),
            openTemplates
        }
    };
};
