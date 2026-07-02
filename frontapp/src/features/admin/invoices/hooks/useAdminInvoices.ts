import { useState, useEffect, useCallback, useMemo } from 'react';
import { nubefactApi, type NubefactInvoice, type NubefactStore } from '@/shared/lib/api/nubefactRepository';
import type { Voucher } from '@/shared/types/invoices';

export interface AdminInvoiceKPIs {
    totalFacturadoMesActual: number;
    totalFacturadoMesAnterior: number;
    porcentajeCrecimiento: number;
    montoPromedio: number;
    topSellers: Array<{ id: string; name: string; slug: string; totalVendido: number }>;
}

export interface AdminInvoiceRow {
    id: string;
    type: string;
    series: string;
    number: string;
    customer_name: string;
    customer_ruc: string;
    amount: number;
    subtotal_sin_igv?: number;
    igv_amount?: number;
    sunat_status: string;
    emission_date: string;
    order_id: string;
    pdf_url: string | null;
    items: NubefactInvoice['items'];
    order: NubefactInvoice['order'];
    stores: NubefactStore[];
}

function toRow(inv: NubefactInvoice): AdminInvoiceRow {
    return {
        id: inv.id,
        type: inv.type,
        series: inv.series ?? '—',
        number: inv.number ?? '—',
        customer_name: inv.businessName ?? '—',
        customer_ruc: inv.nit ?? '—',
        amount: inv.total,
        subtotal_sin_igv: (inv as any).subtotal_sin_igv ?? Number((inv.total / 1.18).toFixed(2)),
        igv_amount: (inv as any).igv_amount ?? Number((inv.total - (inv.total / 1.18)).toFixed(2)),
        sunat_status: inv.status,
        emission_date: inv.createdAt,
        order_id: inv.orderId ?? '',
        pdf_url: inv.pdfUrl,
        items: inv.items,
        order: inv.order,
        stores: inv.order?.stores ?? [],
    };
}

function voucherToNubefact(v: any): NubefactInvoice {
    const total = v.amount;
    const subtotal = Number((total / 1.18).toFixed(2));
    const igv = Number((total - subtotal).toFixed(2));
    return {
        id: v.id,
        orderId: v.order_id || null,
        invoiceNumber: `${v.series}-${v.number}`,
        documentType: v.type === 'FACTURA' ? '01' : '03',
        type: v.type,
        series: v.series || null,
        number: v.number || null,
        nit: v.customer_ruc || null,
        businessName: v.customer_name || null,
        customerDocumentType: v.type === 'FACTURA' ? '6' : '1',
        customerAddress: 'Av. Arequipa 1120, Lima',
        customerEmail: 'cliente@ejemplo.com',
        provider: 'NUBEFACT',
        providerInvoiceId: 'prov-' + v.id,
        qrData: v.qr_data || null,
        pdfUrl: v.pdf_url || '#',
        authorizationCode: 'auth-' + v.id,
        total: total,
        status: v.sunat_status,
        items: v.items ?? [
            {
                id: 1,
                name: 'Producto de Ejemplo A',
                quantity: 1,
                price: subtotal,
                total: subtotal,
                type: 'product'
            }
        ],
        order: {
            id: v.order_id || '1',
            orderNumber: v.order_id || 'ORD-000',
            total: total,
            status: 'completed',
            stores: [
                {
                    id: v.store_id || '1',
                    name: v.store_name || (v.store_id === '2' ? 'FarmaSalud' : v.store_id === '3' ? 'DentalCare' : 'BioTienda'),
                    slug: v.store_id || 'biotienda'
                }
            ]
        },
        createdAt: v.emission_date,
        updatedAt: v.emission_date,
        subtotal_sin_igv: subtotal,
        igv_amount: igv
    } as any;
}

function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('laravel_token');
}

const MOCK_INVOICES: Voucher[] = [
    {
        id: 'mock-inv-1',
        series: 'FFF1',
        number: '0104',
        type: 'FACTURA',
        customer_name: 'BIOTIENDA DEMO SAC',
        customer_ruc: '20056089226',
        order_id: 'ORD-00104',
        amount: 320.50,
        emission_date: '2026-06-07T14:30:00Z',
        sunat_status: 'ACCEPTED',
        store_id: '1',
        history: []
    },
    {
        id: 'mock-inv-2',
        series: 'BBB1',
        number: '0542',
        type: 'BOLETA',
        customer_name: 'JUAN PEREZ GARCIA',
        customer_ruc: '10458822991',
        order_id: 'ORD-00105',
        amount: 45.90,
        emission_date: '2026-06-08T09:15:00Z',
        sunat_status: 'ACCEPTED',
        store_id: '2',
        history: []
    },
    {
        id: 'mock-inv-3',
        series: 'FFF1',
        number: '0105',
        type: 'FACTURA',
        customer_name: 'SERVICIOS MEDICOS INTEGRALES SAC',
        customer_ruc: '20601234567',
        order_id: 'ORD-00106',
        amount: 1500.00,
        emission_date: '2026-06-09T16:45:00Z',
        sunat_status: 'SENT_WAIT_CDR',
        store_id: '3',
        history: []
    },
    {
        id: 'mock-inv-4',
        series: 'BBB1',
        number: '0543',
        type: 'BOLETA',
        customer_name: 'MARIA ALVAREZ CHUNGA',
        customer_ruc: '10784422993',
        order_id: 'ORD-00107',
        amount: 118.00,
        emission_date: '2026-06-10T10:00:00Z',
        sunat_status: 'ACCEPTED',
        store_id: '1',
        history: []
    },
    {
        id: 'mock-inv-5',
        series: 'FFF1',
        number: '0106',
        type: 'FACTURA',
        customer_name: 'ALIMENTOS SALUDABLES SAC',
        customer_ruc: '20458877112',
        order_id: 'ORD-00108',
        amount: 850.00,
        emission_date: '2026-06-11T11:20:00Z',
        sunat_status: 'REJECTED',
        store_id: '2',
        history: []
    },
    {
        id: 'mock-inv-6',
        series: 'BBB1',
        number: '0544',
        type: 'BOLETA',
        customer_name: 'CARLOS MERINO RUIZ',
        customer_ruc: '10229944883',
        order_id: 'ORD-00109',
        amount: 75.00,
        emission_date: '2026-06-12T12:05:00Z',
        sunat_status: 'OBSERVED',
        store_id: '3',
        history: []
    },
    {
        id: 'mock-inv-7',
        series: 'FFF1',
        number: '0107',
        type: 'FACTURA',
        customer_name: 'INVERSIONES SANTA FE EIRL',
        customer_ruc: '20556677889',
        order_id: 'ORD-00110',
        amount: 980.00,
        emission_date: '2026-06-12T14:10:00Z',
        sunat_status: 'ACCEPTED',
        store_id: '1',
        history: []
    },
    {
        id: 'mock-inv-8',
        series: 'BBB1',
        number: '0545',
        type: 'BOLETA',
        customer_name: 'ANA GOMEZ FLORES',
        customer_ruc: '10998877665',
        order_id: 'ORD-00111',
        amount: 210.00,
        emission_date: '2026-06-12T15:30:00Z',
        sunat_status: 'ACCEPTED',
        store_id: '2',
        history: []
    }
];

export function useAdminInvoices() {
    const [invoices, setInvoices] = useState<NubefactInvoice[]>([]);
    const [kpis, setKpis] = useState<AdminInvoiceKPIs | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [search, setSearch] = useState('');
    const [storeFilter, setStoreFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState<AdminInvoiceRow | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [listResult, kpisResult] = await Promise.all([
                nubefactApi.comprobantes(1, 200).catch(() => ({ data: [] })),
                nubefactApi.kpis().catch(() => null),
            ]);

            const apiInvoices = listResult?.data || [];
            const mockMapped = MOCK_INVOICES.map(voucherToNubefact);
            const apiIds = new Set(apiInvoices.map(i => i.id));
            const uniqueMocks = mockMapped.filter(m => !apiIds.has(m.id));

            setInvoices([...apiInvoices, ...uniqueMocks]);

            if (kpisResult) {
                setKpis({
                    totalFacturadoMesActual: kpisResult.totalFacturadoMesActual,
                    totalFacturadoMesAnterior: kpisResult.totalFacturadoMesAnterior,
                    porcentajeCrecimiento: kpisResult.porcentajeCrecimiento,
                    montoPromedio: kpisResult.montoPromedio,
                    topSellers: kpisResult.topSellers,
                });
            } else {
                setKpis({
                    totalFacturadoMesActual: 4500.50,
                    totalFacturadoMesAnterior: 3800.00,
                    porcentajeCrecimiento: 18.4,
                    montoPromedio: 562.56,
                    topSellers: [
                        { id: '1', name: 'BioTienda', slug: 'biotienda', totalVendido: 2500.00 },
                        { id: '2', name: 'FarmaSalud', slug: 'farmasalud', totalVendido: 1200.00 },
                        { id: '3', name: 'DentalCare', slug: 'dentalcare', totalVendido: 800.50 }
                    ]
                });
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al cargar comprobantes');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const allStores = useMemo(() => {
        const names = new Set<string>();
        for (const inv of invoices) {
            for (const s of inv.order?.stores ?? []) {
                names.add(s.name);
            }
        }
        return Array.from(names).sort();
    }, [invoices]);

    const allTypes = useMemo(() => {
        const types = new Set(invoices.map(i => i.type));
        return Array.from(types).sort();
    }, [invoices]);

    const filtered = useMemo(() => {
        const rows = invoices.map(toRow);

        return rows.filter(i => {
            const q = search.toLowerCase();
            if (q && !(
                i.customer_name.toLowerCase().includes(q) ||
                i.customer_ruc.includes(q) ||
                i.series.toLowerCase().includes(q) ||
                i.number.includes(q) ||
                i.type.toLowerCase().includes(q)
            )) return false;

            if (storeFilter && !i.stores.some(s => s.name === storeFilter)) return false;

            if (typeFilter && i.type !== typeFilter) return false;

            if (statusFilter && i.sunat_status !== statusFilter) return false;

            if (dateFrom && i.emission_date < dateFrom) return false;

            if (dateTo) {
                const endOfDay = dateTo + 'T23:59:59';
                if (i.emission_date > endOfDay) return false;
            }

            return true;
        });
    }, [invoices, search, storeFilter, typeFilter, statusFilter, dateFrom, dateTo]);

    const handleViewDetail = useCallback((invoice: AdminInvoiceRow) => {
        setSelectedInvoice(invoice);
        setIsDrawerOpen(true);
    }, []);

    const handleCloseDrawer = useCallback(() => {
        setIsDrawerOpen(false);
        setSelectedInvoice(null);
    }, []);

    const clearFilters = useCallback(() => {
        setSearch('');
        setStoreFilter('');
        setTypeFilter('');
        setStatusFilter('');
        setDateFrom('');
        setDateTo('');
    }, []);

    return {
        invoices: filtered,
        kpis,
        isLoading,
        error,
        search,
        setSearch,
        storeFilter,
        setStoreFilter,
        typeFilter,
        setTypeFilter,
        statusFilter,
        setStatusFilter,
        dateFrom,
        setDateFrom,
        dateTo,
        setDateTo,
        allStores,
        allTypes,
        selectedInvoice,
        isDrawerOpen,
        handleViewDetail,
        handleCloseDrawer,
        clearFilters,
        refresh: fetchData,
    };
}
